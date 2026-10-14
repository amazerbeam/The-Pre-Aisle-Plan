package com.foodbytes.service;

import com.foodbytes.dto.PetGrowthDTO;
import com.foodbytes.model.Habit;
import com.foodbytes.model.PetHabitDay;
import com.foodbytes.model.User;
import com.foodbytes.repository.MealPlanEntryEatenRepository;
import com.foodbytes.repository.MealPlanEntryRepository;
import com.foodbytes.repository.MealPlanEntryRepository.PlannedMealSlot;
import com.foodbytes.repository.PetHabitDayRepository;
import com.foodbytes.repository.UserRepository;
import com.foodbytes.service.PetGrowthPolicy.Replay;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Clock;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.EnumMap;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.SortedMap;
import java.util.TreeMap;
import java.util.stream.Collectors;

/**
 * MPP-31: the caller's own Pip growth, recomputed from the logs on every read so a late tick or a
 * backdated check-in answer corrects history (AC 2). Check-ins and ticks are always the caller's
 * (per-person Pip, MPP-33); the planned slots come from the shared plan's owner, as in
 * PlanStreakService. Rules live in PetGrowthPolicy.
 *
 * History starts at the caller's first check-in answer: every earlier day is unscored by rule, so
 * a leading run of zeros can't change the floored total.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class PetGrowthService {

    private final PetHabitDayRepository habitDayRepository;
    private final ExtraChoiceService extraChoiceService;
    private final MealPlanEntryRepository mealPlanEntryRepository;
    private final MealPlanEntryEatenRepository eatenRepository;
    private final UserRepository userRepository;
    private final Clock clock;

    /**
     * Writes at most once per user, ever: the first time the replayed total has reached 90 it
     * records users.pet_fully_grown_at, which keeps the form at Basilisk for good (AC 3).
     */
    @Transactional
    public PetGrowthDTO growth(User user) {
        LocalDate today = HabitStreakPolicy.today(clock);
        Replay replay = replay(user.getId(), today);
        boolean fullyGrown = user.getPetFullyGrownAt() != null;
        if (!fullyGrown && PetGrowthPolicy.reachedBasilisk(replay)) {
            if (userRepository.markPetFullyGrown(user.getId(), LocalDateTime.now(clock)) == 1) {
                log.info("Pip fully grown (Basilisk) recorded for user {}", user.getId());
            }
            fullyGrown = true;
        }
        return PetGrowthPolicy.toDTO(replay, fullyGrown);
    }

    private Replay replay(Long userId, LocalDate today) {
        List<PetHabitDay> answers = habitDayRepository.findByUserIdAndDayBeforeOrderByDayAsc(userId, today);
        if (answers.isEmpty()) {
            return Replay.EMPTY;
        }
        LocalDate from = answers.get(0).getDay();
        LocalDate to = today.minusDays(1);

        Map<LocalDate, Map<Habit, Boolean>> cleanByDay = new HashMap<>();
        answers.forEach(a -> cleanByDay.computeIfAbsent(a.getDay(), d -> new EnumMap<>(Habit.class))
                .put(a.getHabit(), a.getClean()));

        Long ownerId = extraChoiceService.resolveOwnerId(userId);
        Map<LocalDate, List<Long>> slotsByDay = mealPlanEntryRepository
                .findMainMealSlots(ownerId, PlanStreakPolicy.MAIN_MEAL_KEYS, from, to).stream()
                .collect(Collectors.groupingBy(PlannedMealSlot::getPlanDate,
                        Collectors.mapping(PlannedMealSlot::getId, Collectors.toList())));
        Set<Long> eaten = new HashSet<>(eatenRepository.findEatenEntryIdsInRange(userId, from, to));

        SortedMap<LocalDate, Integer> scores = new TreeMap<>();
        for (LocalDate day = from; !day.isAfter(to); day = day.plusDays(1)) {
            List<Long> slots = slotsByDay.getOrDefault(day, List.of());
            int eatenCount = (int) slots.stream().filter(eaten::contains).count();
            Map<Habit, Boolean> clean = cleanByDay.getOrDefault(day, Map.of());
            scores.put(day, PetGrowthPolicy.dayScore(slots.size(), eatenCount,
                    clean.get(Habit.SNACK), clean.get(Habit.ALCOHOL), !day.isBefore(today)));
        }
        return PetGrowthPolicy.replay(scores);
    }
}
