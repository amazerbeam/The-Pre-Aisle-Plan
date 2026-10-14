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
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.mockito.junit.jupiter.MockitoSettings;
import org.mockito.quality.Strictness;

import java.time.Clock;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.ZonedDateTime;
import java.util.ArrayList;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

/**
 * MPP-31 AC 1–4: growth is per person (the caller's ticks and check-ins, the owner's planned slots),
 * recomputed from the logs every read, and Basilisk is recorded once and never lost.
 */
@ExtendWith(MockitoExtension.class)
@MockitoSettings(strictness = Strictness.LENIENT)
class PetGrowthServiceTest {

    private static final Long OWNER = 1L;
    private static final Long PARTNER = 2L;
    private static final LocalDate TODAY = LocalDate.of(2026, 11, 20);
    private static final Clock CLOCK = Clock.fixed(
            ZonedDateTime.of(2026, 11, 20, 12, 0, 0, 0, HabitStreakPolicy.ZONE).toInstant(), HabitStreakPolicy.ZONE);

    @Mock private PetHabitDayRepository habitDayRepository;
    @Mock private ExtraChoiceService extraChoiceService;
    @Mock private MealPlanEntryRepository mealPlanEntryRepository;
    @Mock private MealPlanEntryEatenRepository eatenRepository;
    @Mock private UserRepository userRepository;

    private PetGrowthService service;

    @BeforeEach
    void setUp() {
        service = new PetGrowthService(habitDayRepository, extraChoiceService, mealPlanEntryRepository,
                eatenRepository, userRepository, CLOCK);
        when(extraChoiceService.resolveOwnerId(anyLong())).thenReturn(OWNER);
    }

    private static User user(Long id) {
        User u = new User();
        u.setId(id);
        return u;
    }

    /** `count` days ending yesterday. */
    private static LocalDate firstOf(int count) {
        return TODAY.minusDays(count);
    }

    private static PlannedMealSlot slot(long id, LocalDate day) {
        return new PlannedMealSlot() {
            @Override public Long getId() { return id; }
            @Override public LocalDate getPlanDate() { return day; }
        };
    }

    /** One planned breakfast per day, id = 100 + offset from the first day. */
    private static List<PlannedMealSlot> oneMealPerDay(LocalDate from, int count) {
        List<PlannedMealSlot> slots = new ArrayList<>();
        for (int i = 0; i < count; i++) {
            slots.add(slot(100 + i, from.plusDays(i)));
        }
        return slots;
    }

    private static List<Long> ids(LocalDate from, int count) {
        List<Long> ids = new ArrayList<>();
        for (int i = 0; i < count; i++) {
            ids.add(100L + i);
        }
        return ids;
    }

    /** Both habits answered for every day in [from, from + count); lapseOffset (or -1) is a snack lapse. */
    private static List<PetHabitDay> answers(Long userId, LocalDate from, int count, int lapseOffset) {
        List<PetHabitDay> rows = new ArrayList<>();
        for (int i = 0; i < count; i++) {
            LocalDate day = from.plusDays(i);
            rows.add(new PetHabitDay(null, userId, Habit.SNACK, day, i != lapseOffset));
            rows.add(new PetHabitDay(null, userId, Habit.ALCOHOL, day, true));
        }
        return rows;
    }

    private void stub(Long userId, List<PetHabitDay> answers, List<PlannedMealSlot> slots, List<Long> ticked) {
        LocalDate from = answers.isEmpty() ? null : answers.get(0).getDay();
        when(habitDayRepository.findByUserIdAndDayBeforeOrderByDayAsc(userId, TODAY)).thenReturn(answers);
        when(mealPlanEntryRepository.findMainMealSlots(OWNER, PlanStreakPolicy.MAIN_MEAL_KEYS, from, TODAY.minusDays(1)))
                .thenReturn(slots);
        when(eatenRepository.findEatenEntryIdsInRange(userId, from, TODAY.minusDays(1))).thenReturn(ticked);
    }

    @Test
    void noCheckInsYet_isAnEmptySeed_andSkipsThePlanReads() {
        when(habitDayRepository.findByUserIdAndDayBeforeOrderByDayAsc(OWNER, TODAY)).thenReturn(List.of());

        PetGrowthDTO growth = service.growth(user(OWNER));

        assertThat(growth.getPoints()).isZero();
        assertThat(growth.getForm()).isEqualTo(1);
        assertThat(growth.getBarSize()).isEqualTo(15);
        verifyNoInteractions(mealPlanEntryRepository, eatenRepository);
    }

    /** AC 4: two linked users on one shared plan get different forms from their own ticks. */
    @Test
    void twoLinkedUsers_getDifferentForms() {
        LocalDate from = firstOf(6);
        stub(OWNER, answers(OWNER, from, 6, -1), oneMealPerDay(from, 6), ids(from, 6));   // 6 perfect = 18
        stub(PARTNER, answers(PARTNER, from, 6, -1), oneMealPerDay(from, 6), List.of());  // 6 slips → 0

        assertThat(service.growth(user(OWNER)).getForm()).isEqualTo(2);
        assertThat(service.growth(user(PARTNER)).getForm()).isEqualTo(1);
        assertThat(service.growth(user(PARTNER)).getLastDayScore()).isEqualTo(-3);
    }

    /** AC 1: a backdated lapse (MPP-20 catch-up) re-scores that day on the next read. */
    @Test
    void backdatedAnswer_reScoresTheDay() {
        LocalDate from = firstOf(5);
        stub(OWNER, answers(OWNER, from, 5, -1), oneMealPerDay(from, 5), ids(from, 5));
        assertThat(service.growth(user(OWNER)).getPoints()).isEqualTo(15);

        stub(OWNER, answers(OWNER, from, 5, 4), oneMealPerDay(from, 5), ids(from, 5));    // day 5 now a lapse
        PetGrowthDTO growth = service.growth(user(OWNER));
        assertThat(growth.getPoints()).isEqualTo(9);
        assertThat(growth.getForm()).isEqualTo(1);
    }

    /** AC 1: days the check-in hasn't covered, and clean days with nothing planned, score 0. */
    @Test
    void unscoredDays_addNothing() {
        LocalDate from = firstOf(4);
        List<PetHabitDay> onlyFirstTwoAnswered = answers(OWNER, from, 2, -1);
        // days 3–4: no plan and no answers; day 2: answered clean with nothing planned
        stub(OWNER, onlyFirstTwoAnswered, List.of(slot(100, from)), List.of(100L));

        PetGrowthDTO growth = service.growth(user(OWNER));
        assertThat(growth.getPoints()).isEqualTo(3);
        assertThat(growth.getLastScoredDate()).isEqualTo(from);
    }

    @Test
    void firstReachingNinety_recordsFullyGrownOnce() {
        LocalDate from = firstOf(30);
        stub(OWNER, answers(OWNER, from, 30, -1), oneMealPerDay(from, 30), ids(from, 30)); // 90

        PetGrowthDTO growth = service.growth(user(OWNER));

        assertThat(growth.getForm()).isEqualTo(5);
        assertThat(growth.isFullyGrown()).isTrue();
        assertThat(growth.getBarSize()).isNull();
        verify(userRepository).markPetFullyGrown(eq(OWNER), eq(LocalDateTime.now(CLOCK)));
    }

    /** AC 3: Basilisk never de-evolves, however far the total falls afterwards. */
    @Test
    void basilisk_neverDeEvolves() {
        LocalDate from = firstOf(20);
        User grown = user(OWNER);
        grown.setPetFullyGrownAt(LocalDateTime.of(2026, 10, 30, 9, 0));
        stub(OWNER, answers(OWNER, from, 20, -1), oneMealPerDay(from, 20), ids(from, 10)); // 10 up, 10 down → 0

        PetGrowthDTO growth = service.growth(grown);

        assertThat(growth.getPoints()).isZero();
        assertThat(growth.getForm()).isEqualTo(5);
        assertThat(growth.isFullyGrown()).isTrue();
        verify(userRepository, never()).markPetFullyGrown(anyLong(), any());
    }

    /** Touching 90 between visits and slipping back still locks Basilisk in. */
    @Test
    void peakOfNinety_thenSlips_stillRecordsFullyGrown() {
        LocalDate from = firstOf(32);
        stub(OWNER, answers(OWNER, from, 32, -1), oneMealPerDay(from, 32), ids(from, 30)); // 90 then 84

        PetGrowthDTO growth = service.growth(user(OWNER));

        assertThat(growth.getPoints()).isEqualTo(84);
        assertThat(growth.getForm()).isEqualTo(5);
        verify(userRepository).markPetFullyGrown(eq(OWNER), any());
    }
}
