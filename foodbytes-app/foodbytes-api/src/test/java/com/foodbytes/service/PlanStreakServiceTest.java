package com.foodbytes.service;

import com.foodbytes.repository.MealPlanEntryEatenRepository;
import com.foodbytes.repository.MealPlanEntryRepository;
import com.foodbytes.repository.MealPlanEntryRepository.PlannedMealSlot;
import com.foodbytes.service.StreakRuns.Run;
import com.foodbytes.service.StreakRuns.Summary;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

/**
 * MPP-22 AC 2 / AC 5: the plan streak is per person. Linked users share the owner's planned slots
 * but each is scored on their own ticks only.
 */
@ExtendWith(MockitoExtension.class)
class PlanStreakServiceTest {

    private static final Long OWNER = 1L;
    private static final Long PARTNER = 2L;
    private static final Long OTHER_PARTNER = 3L;
    private static final LocalDate TODAY = LocalDate.of(2026, 10, 13);

    @Mock private ExtraChoiceService extraChoiceService;
    @Mock private MealPlanEntryRepository mealPlanEntryRepository;
    @Mock private MealPlanEntryEatenRepository eatenRepository;

    private PlanStreakService service;

    @BeforeEach
    void setUp() {
        service = new PlanStreakService(extraChoiceService, mealPlanEntryRepository, eatenRepository);
    }

    private static LocalDate d(int dayOfOctober) {
        return LocalDate.of(2026, 10, dayOfOctober);
    }

    private static PlannedMealSlot slot(long id, LocalDate day) {
        return new PlannedMealSlot() {
            @Override public Long getId() { return id; }
            @Override public LocalDate getPlanDate() { return day; }
        };
    }

    private static List<Long> ticks(Long... entryIds) {
        return Arrays.asList(entryIds);
    }

    private void stubUser(Long userId, LocalDate firstTick, List<PlannedMealSlot> slots,
                          List<Long> ticks) {
        when(eatenRepository.findEarliestEatenPlanDate(userId)).thenReturn(Optional.of(firstTick));
        when(extraChoiceService.resolveOwnerId(userId)).thenReturn(OWNER);
        when(mealPlanEntryRepository.findMainMealSlots(OWNER, PlanStreakPolicy.MAIN_MEAL_KEYS, firstTick, TODAY))
                .thenReturn(slots);
        when(eatenRepository.findEatenEntryIdsInRange(userId, firstTick, TODAY)).thenReturn(ticks);
    }

    @Test
    void noTicksEver_isEmpty_andSkipsThePlanRead() {
        when(eatenRepository.findEarliestEatenPlanDate(PARTNER)).thenReturn(Optional.empty());

        assertThat(service.planStreak(PARTNER, TODAY)).isEqualTo(Summary.EMPTY);
        verifyNoInteractions(mealPlanEntryRepository, extraChoiceService);
    }

    /** AC 5: two linked users with different eaten ticks get different plan streaks. */
    @Test
    void linkedUsersWithDifferentTicks_getDifferentPlanStreaks() {
        List<PlannedMealSlot> shared = List.of(
                slot(101, d(10)), slot(102, d(10)), slot(103, d(10)),
                slot(111, d(11)), slot(112, d(11)), slot(113, d(11)),
                slot(121, d(12)));
        stubUser(PARTNER, d(10), shared, ticks(101L, 102L, 103L, 111L, 112L, 113L, 121L));
        stubUser(OTHER_PARTNER, d(10), shared, ticks(101L, 102L, 103L, 111L, 113L, 121L));

        Summary partner = service.planStreak(PARTNER, TODAY);
        Summary other = service.planStreak(OTHER_PARTNER, TODAY);

        assertThat(partner.runs()).containsExactly(new Run(d(10), 3));
        assertThat(partner.current()).isEqualTo(3);
        assertThat(other.runs()).containsExactly(new Run(d(10), 1), new Run(d(12), 1));
        assertThat(other.current()).isEqualTo(1);
        assertThat(other.best()).isEqualTo(1);
    }

    @Test
    void todayIncomplete_neitherCountsNorBreaks() {
        stubUser(PARTNER, d(12),
                List.of(slot(201, d(12)), slot(202, TODAY), slot(203, TODAY)),
                ticks(201L, 202L));

        Summary s = service.planStreak(PARTNER, TODAY);

        assertThat(s.runs()).containsExactly(new Run(d(12), 1));
        assertThat(s.current()).isEqualTo(1);
    }
}
