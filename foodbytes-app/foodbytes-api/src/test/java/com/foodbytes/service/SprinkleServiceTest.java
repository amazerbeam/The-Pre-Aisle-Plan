package com.foodbytes.service;

import com.foodbytes.model.Meal;
import com.foodbytes.model.MealPlanEntry;
import com.foodbytes.model.MealPlanEntryEaten;
import com.foodbytes.model.SprinkleSource;
import com.foodbytes.model.User;
import com.foodbytes.repository.MealPlanEntryEatenRepository;
import com.foodbytes.repository.MealPlanEntryRepository;
import com.foodbytes.repository.PetFirstRepository;
import com.foodbytes.repository.PetSprinkleRepository;
import com.foodbytes.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.springframework.dao.DataIntegrityViolationException;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.Clock;
import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.IntStream;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.doThrow;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.lenient;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

/** MPP-25: each earning rule, the re-tick case, two linked users, and the full-week payout. */
@ExtendWith(MockitoExtension.class)
class SprinkleServiceTest {

    private static final LocalDate TODAY = LocalDate.of(2026, 10, 14);   // Wednesday
    private static final LocalDate MON = LocalDate.of(2026, 10, 12);

    @Mock private PetSprinkleRepository sprinkles;
    @Mock private MealPlanEntryRepository entries;
    @Mock private MealPlanEntryEatenRepository ticks;
    @Mock private PetFirstRepository firsts;
    @Mock private UserRepository users;
    @Mock private ExtraChoiceService extraChoiceService;

    private SprinkleService service;

    @BeforeEach
    void setUp() {
        Clock clock = Clock.fixed(Instant.parse("2026-10-14T12:00:00Z"), HabitStreakPolicy.ZONE);
        service = new SprinkleService(sprinkles, entries, ticks, firsts, users, extraChoiceService, clock);
    }

    private MealPlanEntry entry(long id, LocalDate date, String mealKey) {
        Meal meal = new Meal();
        meal.setKey(mealKey);
        MealPlanEntry e = new MealPlanEntry();
        e.setId(id);
        e.setPlanDate(date);
        e.setMeal(meal);
        return e;
    }

    private MealPlanEntryEaten tick(long entryId, long userId, String utc) {
        MealPlanEntryEaten t = new MealPlanEntryEaten();
        t.setMealPlanEntryId(entryId);
        t.setUserId(userId);
        t.setEatenAt(LocalDateTime.parse(utc));
        return t;
    }

    /** A lunch on today, ticked by user 1 at the given UTC time, no earlier payout. */
    private void givenLunchTick(String utc) {
        when(entries.findById(50L)).thenReturn(Optional.of(entry(50L, TODAY, "lunch")));
        when(sprinkles.existsByUserIdAndSourceTypeAndSourceId(1L, SprinkleSource.MEAL_EATEN, 50L)).thenReturn(false);
        when(ticks.findByMealPlanEntryIdAndUserId(50L, 1L)).thenReturn(Optional.of(tick(50L, 1L, utc)));
        lenient().when(users.findById(1L)).thenReturn(Optional.of(new User()));
    }

    private void verifyNoInsert() {
        verify(sprinkles, never()).insertIfAbsent(anyLong(), anyString(), anyLong(), anyInt());
    }

    @Test
    void firstTick_ofMainMeal_pays10() {
        givenLunchTick("2026-10-14T16:00:00");   // 17:00 IST, late
        when(firsts.countHomemadeExtras(50L)).thenReturn(0L);

        service.mealEaten(1L, 50L);

        verify(sprinkles).insertIfAbsent(1L, "MEAL_EATEN", 50L, 10);
        verify(sprinkles, never()).insertIfAbsent(anyLong(), eq("MEAL_ON_TIME"), anyLong(), anyInt());
        verify(sprinkles, never()).insertIfAbsent(anyLong(), eq("HOMEMADE_EXTRA"), anyLong(), anyInt());
    }

    @Test
    void tickByMealTime_paysOnTimeBonus() {
        givenLunchTick("2026-10-14T13:00:00");   // 14:00 IST, before the 15:00 default
        when(firsts.countHomemadeExtras(50L)).thenReturn(0L);

        service.mealEaten(1L, 50L);

        verify(sprinkles).insertIfAbsent(1L, "MEAL_EATEN", 50L, 10);
        verify(sprinkles).insertIfAbsent(1L, "MEAL_ON_TIME", 50L, 5);
    }

    @Test
    void homemadeExtra_paysHomemadeBonus() {
        givenLunchTick("2026-10-14T16:00:00");
        when(firsts.countHomemadeExtras(50L)).thenReturn(1L);

        service.mealEaten(1L, 50L);

        verify(sprinkles).insertIfAbsent(1L, "MEAL_EATEN", 50L, 10);
        verify(sprinkles).insertIfAbsent(1L, "HOMEMADE_EXTRA", 50L, 5);
    }

    @Test
    void reTick_afterUntick_paysNothing() {
        when(entries.findById(50L)).thenReturn(Optional.of(entry(50L, TODAY, "lunch")));
        when(sprinkles.existsByUserIdAndSourceTypeAndSourceId(1L, SprinkleSource.MEAL_EATEN, 50L)).thenReturn(true);

        service.mealEaten(1L, 50L);

        verifyNoInsert();
        verifyNoInteractions(firsts);
    }

    @Test
    void snackTick_paysNothing() {
        when(entries.findById(50L)).thenReturn(Optional.of(entry(50L, TODAY, "snacks")));

        service.mealEaten(1L, 50L);

        verifyNoInsert();
    }

    @Test
    void futureDatedTick_paysNothing_andWritesNoRow() {
        when(entries.findById(50L)).thenReturn(Optional.of(entry(50L, TODAY.plusDays(1), "lunch")));

        service.mealEaten(1L, 50L);

        verifyNoInsert();
        verify(sprinkles, never()).existsByUserIdAndSourceTypeAndSourceId(any(), any(), any());
    }

    @Test
    void untickedBeforeListenerRan_paysNothing() {
        when(entries.findById(50L)).thenReturn(Optional.of(entry(50L, TODAY, "lunch")));
        when(sprinkles.existsByUserIdAndSourceTypeAndSourceId(1L, SprinkleSource.MEAL_EATEN, 50L)).thenReturn(false);
        when(ticks.findByMealPlanEntryIdAndUserId(50L, 1L)).thenReturn(Optional.empty());

        service.mealEaten(1L, 50L);

        verifyNoInsert();
    }

    @Test
    void deletedEntry_paysNothing() {
        when(entries.findById(50L)).thenReturn(Optional.empty());

        service.mealEaten(1L, 50L);

        verifyNoInsert();
    }

    @Test
    void twoLinkedUsers_tickingSameEntry_eachEarnTheirOwn() {
        when(entries.findById(50L)).thenReturn(Optional.of(entry(50L, TODAY, "lunch")));
        for (long userId : new long[] {1L, 2L}) {
            when(sprinkles.existsByUserIdAndSourceTypeAndSourceId(userId, SprinkleSource.MEAL_EATEN, 50L)).thenReturn(false);
            when(ticks.findByMealPlanEntryIdAndUserId(50L, userId))
                    .thenReturn(Optional.of(tick(50L, userId, "2026-10-14T16:00:00")));
            when(users.findById(userId)).thenReturn(Optional.of(new User()));
        }
        when(firsts.countHomemadeExtras(50L)).thenReturn(0L);

        service.mealEaten(1L, 50L);
        service.mealEaten(2L, 50L);

        verify(sprinkles).insertIfAbsent(1L, "MEAL_EATEN", 50L, 10);
        verify(sprinkles).insertIfAbsent(2L, "MEAL_EATEN", 50L, 10);
    }

    private List<LocalDate> days(LocalDate from, int count) {
        return IntStream.range(0, count).mapToObj(from::plusDays).toList();
    }

    @Test
    void fullWeek_paysEveryPlanMember() {
        when(extraChoiceService.resolveOwnerId(2L)).thenReturn(1L);
        when(entries.findFullyPlannedDates(1L, PlanStreakPolicy.MAIN_MEAL_KEYS, MON, MON.plusDays(6), 3L))
                .thenReturn(days(MON, 7));
        when(users.findPlanMemberIds(1L)).thenReturn(List.of(1L, 2L));

        service.planned(2L, MON.plusDays(2), MON.plusDays(2));

        verify(sprinkles).insertIfAbsent(1L, "FULL_WEEK", MON.toEpochDay(), 20);
        verify(sprinkles).insertIfAbsent(2L, "FULL_WEEK", MON.toEpochDay(), 20);
    }

    @Test
    void partWeek_paysNothing() {
        when(extraChoiceService.resolveOwnerId(1L)).thenReturn(1L);
        when(entries.findFullyPlannedDates(1L, PlanStreakPolicy.MAIN_MEAL_KEYS, MON, MON.plusDays(6), 3L))
                .thenReturn(days(MON, 6));

        service.planned(1L, MON, MON.plusDays(6));

        verifyNoInsert();
        verify(users, never()).findPlanMemberIds(anyLong());
    }

    @Test
    void copyWeekAcrossTwoWeeks_checksEachMonday() {
        LocalDate nextMon = MON.plusDays(7);
        when(extraChoiceService.resolveOwnerId(1L)).thenReturn(1L);
        when(entries.findFullyPlannedDates(1L, PlanStreakPolicy.MAIN_MEAL_KEYS, MON, MON.plusDays(6), 3L))
                .thenReturn(days(MON, 7));
        when(entries.findFullyPlannedDates(1L, PlanStreakPolicy.MAIN_MEAL_KEYS, nextMon, nextMon.plusDays(6), 3L))
                .thenReturn(List.of());
        when(users.findPlanMemberIds(1L)).thenReturn(List.of(1L));

        service.planned(1L, MON.plusDays(6), nextMon);

        verify(sprinkles, times(1)).insertIfAbsent(anyLong(), eq("FULL_WEEK"), anyLong(), anyInt());
        verify(sprinkles).insertIfAbsent(1L, "FULL_WEEK", MON.toEpochDay(), 20);
    }

    @Test
    void balance_isTheLedgerSum() {
        when(sprinkles.sumAmountByUserId(1L)).thenReturn(135L);

        assertThat(service.balance(1L)).isEqualTo(135L);
    }

    @Test
    void noRuleRewardsVariety() {
        // Earning sources only; STATION_UPGRADE (MPP-26) and DECOR_PURCHASE (MPP-27) are spends, not rewards.
        assertThat(SprinkleSource.values()).containsExactly(
                SprinkleSource.MEAL_EATEN, SprinkleSource.MEAL_ON_TIME,
                SprinkleSource.FULL_WEEK, SprinkleSource.HOMEMADE_EXTRA,
                SprinkleSource.STATION_UPGRADE, SprinkleSource.DECOR_PURCHASE);
    }

    // ---- MPP-26: spending ----

    private static final Long USER = 1L;

    @Test
    void lockWallet_locksTheCallersOwnRow() {
        when(users.lockById(USER)).thenReturn(Optional.of(new User()));

        service.lockWallet(USER);

        verify(users).lockById(USER);
    }

    @Test
    void lockWallet_unknownUser_throws() {
        when(users.lockById(USER)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.lockWallet(USER)).isInstanceOf(IllegalArgumentException.class);
    }

    @Test
    void spend_balanceCoversCost_insertsOneNegativeRow() {
        when(sprinkles.sumAmountByUserId(USER)).thenReturn(700L);

        service.spend(USER, SprinkleSource.STATION_UPGRADE, 23L, 600);

        verify(sprinkles).insertDebit(USER, "STATION_UPGRADE", 23L, -600);
    }

    @Test
    void spend_exactBalance_isAllowed() {
        when(sprinkles.sumAmountByUserId(USER)).thenReturn(300L);

        service.spend(USER, SprinkleSource.STATION_UPGRADE, 12L, 300);

        verify(sprinkles).insertDebit(USER, "STATION_UPGRADE", 12L, -300);
    }

    @Test
    void spend_tooFewSprinkles_rejectsWithTheNumbersAndWritesNothing() {
        when(sprinkles.sumAmountByUserId(USER)).thenReturn(240L);

        assertThatThrownBy(() -> service.spend(USER, SprinkleSource.STATION_UPGRADE, 12L, 300))
                .isInstanceOf(PetShopException.class)
                .hasMessage("Not enough sprinkles: you have 240, this costs 300.")
                .extracting(e -> ((PetShopException) e).getReason())
                .isEqualTo(PetShopException.Reason.NOT_ENOUGH_SPRINKLES);
        verify(sprinkles, never()).insertDebit(any(), any(), any(), anyInt());
    }

    @Test
    void spend_duplicateSource_isAlreadyOwned() {
        when(sprinkles.sumAmountByUserId(USER)).thenReturn(5000L);
        doThrow(new DataIntegrityViolationException("uk_pet_sprinkles"))
                .when(sprinkles).insertDebit(USER, "STATION_UPGRADE", 12L, -300);

        assertThatThrownBy(() -> service.spend(USER, SprinkleSource.STATION_UPGRADE, 12L, 300))
                .isInstanceOf(PetShopException.class)
                .extracting(e -> ((PetShopException) e).getReason())
                .isEqualTo(PetShopException.Reason.ALREADY_OWNED);
    }
}
