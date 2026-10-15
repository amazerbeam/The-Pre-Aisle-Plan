package com.foodbytes.service;

import com.foodbytes.model.MealPlanEntry;
import com.foodbytes.model.MealPlanEntryEaten;
import com.foodbytes.model.ShoppingList;
import com.foodbytes.model.SprinkleSource;
import com.foodbytes.repository.MealPlanEntryEatenRepository;
import com.foodbytes.repository.MealPlanEntryRepository;
import com.foodbytes.repository.PetFirstRepository;
import com.foodbytes.repository.PetSprinkleRepository;
import com.foodbytes.repository.ShoppingListItemRepository;
import com.foodbytes.repository.ShoppingListRepository;
import com.foodbytes.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.time.Clock;
import java.time.LocalDate;
import java.util.Optional;

/**
 * MPP-25: pays sprinkles and reads the balance. Each source pays each person once ever
 * (uk_pet_sprinkles); nothing here deletes, so un-ticking never refunds (AC 3). Ticks pay the
 * person who ticked; a full week pays everyone on the shared plan (per-person Pip, MPP-33).
 * MPP-26: lockWallet + spend - the one locked debit path every purchase uses. MPP-42: the weekly shopping-list payouts.
 */
@Service
@RequiredArgsConstructor
public class SprinkleService {

    private final PetSprinkleRepository petSprinkleRepository;
    private final MealPlanEntryRepository mealPlanEntryRepository;
    private final MealPlanEntryEatenRepository mealPlanEntryEatenRepository;
    private final PetFirstRepository petFirstRepository;
    private final UserRepository userRepository;
    private final ExtraChoiceService extraChoiceService;
    private final Clock clock;
    private final ShoppingListRepository shoppingListRepository;           // MPP-42
    private final ShoppingListItemRepository shoppingListItemRepository;   // MPP-42

    /**
     * A person ticked an entry eaten. Pays MEAL_EATEN plus the on-time and homemade bonuses, decided
     * once on the first paid tick: a re-tick pays nothing, even if the extra choice changed since.
     * REQUIRES_NEW: runs from SprinkleRecorder after the tick has committed.
     */
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void mealEaten(Long userId, Long entryId) {
        Optional<MealPlanEntry> found = mealPlanEntryRepository.findById(entryId);
        if (found.isEmpty()) return;
        MealPlanEntry entry = found.get();
        String mealKey = entry.getMeal().getKey();
        if (!SprinklePolicy.isMainMeal(mealKey)) return;
        if (!SprinklePolicy.isPayable(entry.getPlanDate(), HabitStreakPolicy.today(clock))) return;
        if (petSprinkleRepository.existsByUserIdAndSourceTypeAndSourceId(userId, SprinkleSource.MEAL_EATEN, entryId)) return;
        Optional<MealPlanEntryEaten> tick = mealPlanEntryEatenRepository.findByMealPlanEntryIdAndUserId(entryId, userId);
        if (tick.isEmpty()) return; // un-ticked before this ran

        pay(userId, SprinkleSource.MEAL_EATEN, entryId, SprinklePolicy.MEAL_EATEN);
        boolean onTime = userRepository.findById(userId)
                .flatMap(user -> MealTimesPolicy.byTime(user, mealKey))
                .map(byTime -> SprinklePolicy.isOnTime(tick.get().getEatenAt(), entry.getPlanDate(), byTime))
                .orElse(false);
        if (onTime) pay(userId, SprinkleSource.MEAL_ON_TIME, entryId, SprinklePolicy.ON_TIME_BONUS);
        if (petFirstRepository.countHomemadeExtras(entryId) > 0) {
            pay(userId, SprinkleSource.HOMEMADE_EXTRA, entryId, SprinklePolicy.HOMEMADE_BONUS);
        }
    }

    /**
     * A plan write touched [from, to]. Every Monday-Sunday week in that range that is now fully
     * planned pays FULL_WEEK to every member of the plan, whoever planned it.
     */
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void planned(Long actorId, LocalDate from, LocalDate to) {
        Long ownerId = extraChoiceService.resolveOwnerId(actorId);
        for (LocalDate monday : SprinklePolicy.mondaysCovering(from, to)) {
            int fullDays = mealPlanEntryRepository.findFullyPlannedDates(
                    ownerId,
                    PlanStreakPolicy.MAIN_MEAL_KEYS,
                    monday,
                    monday.plusDays(SprinklePolicy.WEEK_DAYS - 1),
                    PlanStreakPolicy.MAIN_MEAL_KEYS.size()).size();
            if (fullDays < SprinklePolicy.WEEK_DAYS) continue;
            payPlan(ownerId, SprinkleSource.FULL_WEEK, monday.toEpochDay(), SprinklePolicy.FULL_WEEK);
        }
    }

    /**
     * MPP-42 AC 10: a shopping list was generated. Pays SHOPPING_LIST_GENERATED to every member of the
     * plan, keyed by this Dublin week's Monday - a regenerate in the same week hits uk_pet_sprinkles.
     */
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void shoppingListGenerated(Long actorId) {
        Long ownerId = extraChoiceService.resolveOwnerId(actorId);
        Optional<ShoppingList> list = shoppingListRepository.findByUserId(ownerId);
        if (list.isEmpty() || shoppingListItemRepository.countByShoppingListId(list.get().getId()) == 0) return;
        payPlan(ownerId, SprinkleSource.SHOPPING_LIST_GENERATED, thisWeek(), SprinklePolicy.SHOPPING_LIST_GENERATED);
    }

    /**
     * MPP-42 AC 11: an item was checked. Re-reads the plan's list after that commit (never trusting the
     * client's optimistic state): >= 1 item and none unchecked pays SHOPPING_LIST_COMPLETED to every
     * member, once per week.
     */
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void shoppingListCompleted(Long actorId) {
        Long ownerId = extraChoiceService.resolveOwnerId(actorId);
        Optional<ShoppingList> list = shoppingListRepository.findByUserId(ownerId);
        if (list.isEmpty()) return;
        Long listId = list.get().getId();
        if (shoppingListItemRepository.countByShoppingListId(listId) == 0) return;
        if (shoppingListItemRepository.countUnchecked(listId) > 0) return;
        payPlan(ownerId, SprinkleSource.SHOPPING_LIST_COMPLETED, thisWeek(), SprinklePolicy.SHOPPING_LIST_COMPLETED);
    }

    /** The person's own balance (MPP-25 AC 4). */
    @Transactional(readOnly = true)
    public long balance(Long userId) {
        return petSprinkleRepository.sumAmountByUserId(userId);
    }

    /**
     * MPP-26: SELECT … FOR UPDATE on the caller's users row. Every purchase takes it first, so one
     * person's spends run one at a time and the balance can't be overdrawn by two taps or devices.
     * MANDATORY: the lock lives as long as the caller's transaction.
     */
    @Transactional(propagation = Propagation.MANDATORY)
    public void lockWallet(Long userId) {
        userRepository.lockById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found: " + userId));
    }

    /**
     * MPP-26: one spend - checks the balance and writes one negative ledger row. The caller holds
     * lockWallet. Earnings never lock and only add, so the check can't go stale before commit.
     */
    @Transactional(propagation = Propagation.MANDATORY)
    public void spend(Long userId, SprinkleSource source, long sourceId, int cost) {
        long balance = petSprinkleRepository.sumAmountByUserId(userId);
        if (balance < cost) {
            throw new PetShopException(PetShopException.Reason.NOT_ENOUGH_SPRINKLES,
                    "Not enough sprinkles: you have " + balance + ", this costs " + cost + ".");
        }
        try {
            petSprinkleRepository.insertDebit(userId, source.name(), sourceId, -cost);
        } catch (DataIntegrityViolationException e) {
            throw new PetShopException(PetShopException.Reason.ALREADY_OWNED, "You already have that.");
        }
    }

    /** Shared work (MPP-33): pays everyone on the owner's plan, whoever did it. */
    private void payPlan(Long ownerId, SprinkleSource source, long sourceId, int amount) {
        for (Long memberId : userRepository.findPlanMemberIds(ownerId)) {
            pay(memberId, source, sourceId, amount);
        }
    }

    /** This Dublin week's Monday as an epoch day - the once-per-week key. */
    private long thisWeek() {
        return SprinklePolicy.weekOf(HabitStreakPolicy.today(clock)).toEpochDay();
    }

    private void pay(Long userId, SprinkleSource source, Long sourceId, int amount) {
        petSprinkleRepository.insertIfAbsent(userId, source.name(), sourceId, amount);
    }
}
