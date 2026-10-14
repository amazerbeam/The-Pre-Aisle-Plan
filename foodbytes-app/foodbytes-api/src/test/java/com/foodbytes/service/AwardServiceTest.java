package com.foodbytes.service;

import com.foodbytes.dto.AwardStatusDTO;
import com.foodbytes.dto.FirstStatusDTO;
import com.foodbytes.dto.HabitStatusDTO;
import com.foodbytes.dto.NextMilestoneDTO;
import com.foodbytes.dto.PetAwardsDTO;
import com.foodbytes.model.FirstKey;
import com.foodbytes.model.Habit;
import com.foodbytes.model.PetAward;
import com.foodbytes.model.PetHabitDay;
import com.foodbytes.model.StreakType;
import com.foodbytes.repository.PetAwardRepository;
import com.foodbytes.repository.PetHabitDayRepository;
import com.foodbytes.service.StreakRuns.Run;
import com.foodbytes.service.StreakRuns.Summary;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.Clock;
import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

/**
 * MPP-22 AC 4 / AC 5: crossing day 30 into 31, re-earning after a lapse, idempotent sync, habit
 * awards from the MPP-20 day log, and the response shape.
 */
@ExtendWith(MockitoExtension.class)
class AwardServiceTest {

    private static final Long USER_ID = 2L;
    private static final LocalDate TODAY = LocalDate.of(2026, 10, 13);
    private static final Clock CLOCK = Clock.fixed(Instant.parse("2026-10-13T12:00:00Z"), HabitStreakPolicy.ZONE);

    @Mock private PlanStreakService planStreakService;
    @Mock private HabitStreakService habitStreakService;
    @Mock private PetHabitDayRepository habitDayRepository;
    @Mock private PetAwardRepository awardRepository;
    @Mock private PetFirstService petFirstService;

    private AwardService service;

    @BeforeEach
    void setUp() {
        service = new AwardService(planStreakService, habitStreakService, habitDayRepository, awardRepository, CLOCK, petFirstService);
    }

    private static LocalDate d(int dayOfOctober) {
        return LocalDate.of(2026, 10, dayOfOctober);
    }

    private static HabitStatusDTO habit(Habit habit, int current, int best) {
        return new HabitStatusDTO(habit, current, best, null, true, TODAY);
    }

    private static Map<Integer, Integer> counts(int c1, int c3, int c5, int c7, int c14, int c21, int c30) {
        return Map.of(1, c1, 3, c3, 5, c5, 7, c7, 14, c14, 21, c21, 30, c30);
    }

    /** Plan as given; both habits never answered; ledger as given. */
    private void stub(Summary plan, List<PetAward> ledger) {
        when(planStreakService.planStreak(USER_ID, TODAY)).thenReturn(plan);
        when(habitStreakService.getHabits(USER_ID))
                .thenReturn(List.of(habit(Habit.SNACK, 0, 0), habit(Habit.ALCOHOL, 0, 0)));
        when(habitDayRepository.findByUserIdAndHabitOrderByDayAsc(USER_ID, Habit.SNACK)).thenReturn(List.of());
        when(habitDayRepository.findByUserIdAndHabitOrderByDayAsc(USER_ID, Habit.ALCOHOL)).thenReturn(List.of());
        when(awardRepository.findByUserId(USER_ID)).thenReturn(ledger);
    }

    private static AwardStatusDTO status(List<AwardStatusDTO> all, StreakType type) {
        return all.stream().filter(s -> s.getStreakType() == type).findFirst().orElseThrow();
    }

    @Test
    void nothingEarned_returnsThreeZeroStatusesInOrder_andWritesNothing() {
        stub(Summary.EMPTY, List.of());

        List<AwardStatusDTO> result = service.getAwards(USER_ID);

        assertThat(result).extracting(AwardStatusDTO::getStreakType)
                .containsExactly(StreakType.PLAN, StreakType.SNACK, StreakType.ALCOHOL);
        assertThat(result).allSatisfy(s -> {
            assertThat(s.getCurrent()).isZero();
            assertThat(s.getBest()).isZero();
            assertThat(s.getCounts()).containsExactlyInAnyOrderEntriesOf(counts(0, 0, 0, 0, 0, 0, 0));
            assertThat(s.getCounts().keySet()).containsExactly(1, 3, 5, 7, 14, 21, 30);
            assertThat(s.getNext()).isEqualTo(new NextMilestoneDTO(1, 1));
        });
        verify(awardRepository, never()).insertIfAbsent(anyLong(), anyString(), anyInt(), any(), anyInt());
    }

    /** AC 5: crossing day 30 into day 31 re-earns the 1-day award (cycle 1). */
    @Test
    void crossingDay30IntoDay31_countsTheOneDayAwardTwice() {
        LocalDate start = LocalDate.of(2026, 9, 13);
        stub(new Summary(List.of(new Run(start, 31)), 31, 31), List.of());

        AwardStatusDTO plan = status(service.getAwards(USER_ID), StreakType.PLAN);

        verify(awardRepository, times(8)).insertIfAbsent(anyLong(), anyString(), anyInt(), any(), anyInt());
        verify(awardRepository).insertIfAbsent(USER_ID, "PLAN", 1, start, 1);
        assertThat(plan.getCounts()).containsExactlyInAnyOrderEntriesOf(counts(2, 1, 1, 1, 1, 1, 1));
        assertThat(plan.getCurrent()).isEqualTo(31);
        assertThat(plan.getNext()).isEqualTo(new NextMilestoneDTO(3, 2));
    }

    /** AC 5: a lapse ends the run; the next run re-earns from day 1 under its own start date. */
    @Test
    void reEarningAfterALapse_addsANewRunsAwards() {
        stub(new Summary(List.of(new Run(d(1), 3), new Run(d(5), 1)), 1, 3), List.of());

        AwardStatusDTO plan = status(service.getAwards(USER_ID), StreakType.PLAN);

        verify(awardRepository).insertIfAbsent(USER_ID, "PLAN", 1, d(1), 0);
        verify(awardRepository).insertIfAbsent(USER_ID, "PLAN", 3, d(1), 0);
        verify(awardRepository).insertIfAbsent(USER_ID, "PLAN", 1, d(5), 0);
        assertThat(plan.getCounts()).containsExactlyInAnyOrderEntriesOf(counts(2, 1, 0, 0, 0, 0, 0));
        assertThat(plan.getBest()).isEqualTo(3);
    }

    /** AC 5: awards already in the ledger are not written again, and still count. */
    @Test
    void secondSync_isIdempotent() {
        stub(new Summary(List.of(new Run(d(1), 3)), 3, 3), List.of(
                new PetAward(1L, USER_ID, StreakType.PLAN, 1, d(1), 0, null),
                new PetAward(2L, USER_ID, StreakType.PLAN, 3, d(1), 0, null)));

        AwardStatusDTO plan = status(service.getAwards(USER_ID), StreakType.PLAN);

        verify(awardRepository, never()).insertIfAbsent(anyLong(), anyString(), anyInt(), any(), anyInt());
        assertThat(plan.getCounts()).containsExactlyInAnyOrderEntriesOf(counts(1, 1, 0, 0, 0, 0, 0));
    }

    /** Habit awards come from the MPP-20 day log; current/best from HabitStreakService. */
    @Test
    void habitAwards_comeFromTheDayLog() {
        when(planStreakService.planStreak(USER_ID, TODAY)).thenReturn(Summary.EMPTY);
        when(habitStreakService.getHabits(USER_ID))
                .thenReturn(List.of(habit(Habit.SNACK, 1, 3), habit(Habit.ALCOHOL, 0, 0)));
        when(habitDayRepository.findByUserIdAndHabitOrderByDayAsc(USER_ID, Habit.SNACK)).thenReturn(List.of(
                new PetHabitDay(1L, USER_ID, Habit.SNACK, d(1), true),
                new PetHabitDay(2L, USER_ID, Habit.SNACK, d(2), true),
                new PetHabitDay(3L, USER_ID, Habit.SNACK, d(3), true),
                new PetHabitDay(4L, USER_ID, Habit.SNACK, d(4), false),
                new PetHabitDay(5L, USER_ID, Habit.SNACK, d(5), true)));
        when(habitDayRepository.findByUserIdAndHabitOrderByDayAsc(USER_ID, Habit.ALCOHOL)).thenReturn(List.of());
        when(awardRepository.findByUserId(USER_ID)).thenReturn(List.of());

        AwardStatusDTO snack = status(service.getAwards(USER_ID), StreakType.SNACK);

        verify(awardRepository).insertIfAbsent(USER_ID, "SNACK", 1, d(1), 0);
        verify(awardRepository).insertIfAbsent(USER_ID, "SNACK", 3, d(1), 0);
        verify(awardRepository).insertIfAbsent(USER_ID, "SNACK", 1, d(5), 0);
        assertThat(snack.getCurrent()).isEqualTo(1);
        assertThat(snack.getBest()).isEqualTo(3);
        assertThat(snack.getCounts()).containsExactlyInAnyOrderEntriesOf(counts(2, 1, 0, 0, 0, 0, 0));
        assertThat(snack.getNext()).isEqualTo(new NextMilestoneDTO(3, 2));
    }

    @Test
    void getCabinet_carriesTheStreaksAndTheCallersFirsts() {
        stub(new Summary(List.of(), 0, 0), List.of());
        List<FirstStatusDTO> firsts = List.of(
                new FirstStatusDTO(FirstKey.MAKE_TEMPLATE, Instant.parse("2026-10-12T08:00:00Z")),
                new FirstStatusDTO(FirstKey.GENERATE_SHOPPING_LIST, null),
                new FirstStatusDTO(FirstKey.PLAN_FULL_WEEK, null),
                new FirstStatusDTO(FirstKey.COOK_HOMEMADE_EXTRA, null));
        when(petFirstService.getFirsts(USER_ID)).thenReturn(firsts);

        PetAwardsDTO cabinet = service.getCabinet(USER_ID);

        assertThat(cabinet.getStreaks()).extracting(AwardStatusDTO::getStreakType)
                .containsExactly(StreakType.PLAN, StreakType.SNACK, StreakType.ALCOHOL);
        assertThat(cabinet.getFirsts()).isEqualTo(firsts);
    }
}
