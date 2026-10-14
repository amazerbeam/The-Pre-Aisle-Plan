package com.foodbytes.service;

import com.foodbytes.dto.HabitAnswerRequest;
import com.foodbytes.dto.HabitFirstAnswerRequest;
import com.foodbytes.dto.HabitStatusDTO;
import com.foodbytes.model.Habit;
import com.foodbytes.model.PetHabitDay;
import com.foodbytes.model.PetHabitStreak;
import com.foodbytes.model.StreakType;
import com.foodbytes.repository.PetHabitDayRepository;
import com.foodbytes.repository.PetHabitStreakRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Captor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.Clock;
import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.SortedMap;
import java.util.TreeMap;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.assertj.core.api.Assertions.tuple;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

/**
 * MPP-20 AC 5: clean, skip-then-clean, lapse today, backdated lapse and repeat answers. Habits are
 * keyed by the caller's own id; there is no meal-plan-owner lookup to make.
 */
@ExtendWith(MockitoExtension.class)
class HabitStreakServiceTest {

    private static final Long USER_ID = 2L;
    private static final LocalDate TODAY = LocalDate.of(2026, 10, 13);
    private static final Clock CLOCK = Clock.fixed(Instant.parse("2026-10-13T12:00:00Z"), HabitStreakPolicy.ZONE);

    @Mock private PetHabitStreakRepository streakRepository;
    @Mock private PetHabitDayRepository dayRepository;
    @Captor private ArgumentCaptor<List<PetHabitDay>> daysCaptor;

    private HabitStreakService service;

    @BeforeEach
    void setUp() {
        service = new HabitStreakService(streakRepository, dayRepository, CLOCK);
    }

    private static LocalDate d(int dayOfOctober) {
        return LocalDate.of(2026, 10, dayOfOctober);
    }

    /** The row findForUpdate hands back after ensureRow. */
    private PetHabitStreak stubRow(LocalDate streakStart, int best, LocalDate lastAnswered) {
        PetHabitStreak row = new PetHabitStreak(10L, USER_ID, Habit.SNACK, streakStart, best, lastAnswered);
        when(streakRepository.findForUpdate(USER_ID, Habit.SNACK)).thenReturn(Optional.of(row));
        return row;
    }

    private List<PetHabitDay> savedDays() {
        verify(dayRepository).saveAll(daysCaptor.capture());
        return daysCaptor.getValue();
    }

    private static HabitAnswerRequest clean() {
        return new HabitAnswerRequest(true, null);
    }

    private static HabitAnswerRequest lapse(LocalDate on) {
        return new HabitAnswerRequest(false, on);
    }

    @Test
    void clean_firstEverAnswer_creditsTodayOnly() {
        PetHabitStreak row = stubRow(null, 0, null);

        HabitStatusDTO dto = service.answer(USER_ID, Habit.SNACK, clean());

        verify(streakRepository).ensureRow(USER_ID, "SNACK");
        assertThat(savedDays()).extracting(PetHabitDay::getUserId, PetHabitDay::getHabit, PetHabitDay::getDay, PetHabitDay::getClean)
                .containsExactly(tuple(USER_ID, Habit.SNACK, TODAY, true));
        assertThat(row.getStreakStart()).isEqualTo(TODAY);
        assertThat(row.getLastAnsweredDate()).isEqualTo(TODAY);
        assertThat(dto).isEqualTo(new HabitStatusDTO(Habit.SNACK, 1, 1, TODAY, false, TODAY.plusDays(1)));
        verify(streakRepository).save(row);
    }

    @Test
    void clean_afterSkippedDays_creditsEveryDaySinceTheLastAnswer() {
        // 5-day streak 6–10 Oct, then "Not now" on 11 and 12
        PetHabitStreak row = stubRow(d(6), 5, d(10));

        HabitStatusDTO dto = service.answer(USER_ID, Habit.SNACK, clean());

        assertThat(savedDays()).extracting(PetHabitDay::getDay, PetHabitDay::getClean)
                .containsExactly(tuple(d(11), true), tuple(d(12), true), tuple(d(13), true));
        assertThat(row.getStreakStart()).isEqualTo(d(6));
        assertThat(dto.getCurrent()).isEqualTo(8);
        assertThat(dto.getBest()).isEqualTo(8);
    }

    @Test
    void lapseToday_restartsAtZero_andKeepsBest() {
        // 10-day streak 3–12 Oct, best 12 from an earlier run
        PetHabitStreak row = stubRow(d(3), 12, d(12));

        HabitStatusDTO dto = service.answer(USER_ID, Habit.SNACK, lapse(TODAY));

        assertThat(savedDays()).extracting(PetHabitDay::getDay, PetHabitDay::getClean)
                .containsExactly(tuple(d(13), false));
        assertThat(row.getStreakStart()).isEqualTo(d(14));
        assertThat(dto.getCurrent()).isZero();
        assertThat(dto.getBest()).isEqualTo(12);
        assertThat(dto.isAskToday()).isFalse();
    }

    @Test
    void backdatedLapse_creditsCleanDaysBeforeAndAfter_andRaisesBestWithTheDaysBefore() {
        // 9-day streak 1–9 Oct (best 9); skipped 10–12; today: "yes, on the 11th"
        PetHabitStreak row = stubRow(d(1), 9, d(9));

        HabitStatusDTO dto = service.answer(USER_ID, Habit.SNACK, lapse(d(11)));

        assertThat(savedDays()).extracting(PetHabitDay::getDay, PetHabitDay::getClean)
                .containsExactly(tuple(d(10), true), tuple(d(11), false), tuple(d(12), true), tuple(d(13), true));
        assertThat(row.getStreakStart()).isEqualTo(d(12));
        assertThat(dto.getCurrent()).isEqualTo(2);
        assertThat(dto.getBest()).isEqualTo(10); // 1–10 Oct reached 10 before the lapse
    }

    @Test
    void clean_answeredTwiceToday_isANoOp() {
        PetHabitStreak row = stubRow(d(9), 5, TODAY);

        HabitStatusDTO dto = service.answer(USER_ID, Habit.SNACK, clean());

        verify(dayRepository, never()).saveAll(any());
        verify(streakRepository, never()).save(any());
        assertThat(row.getStreakStart()).isEqualTo(d(9));
        assertThat(dto).isEqualTo(new HabitStatusDTO(Habit.SNACK, 5, 5, TODAY, false, TODAY.plusDays(1)));
    }

    @Test
    void lapse_afterAnsweringToday_isRejected() {
        stubRow(d(9), 5, TODAY);

        assertThatThrownBy(() -> service.answer(USER_ID, Habit.SNACK, lapse(TODAY)))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessage("Already answered through 2026-10-13");
        verify(dayRepository, never()).saveAll(any());
    }

    @Test
    void lapse_beforeCoversFrom_isRejected() {
        stubRow(d(1), 10, d(10));

        assertThatThrownBy(() -> service.answer(USER_ID, Habit.SNACK, lapse(d(10))))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessage("lapseDate must be between 2026-10-11 and 2026-10-13");
        verify(dayRepository, never()).saveAll(any());
    }

    @Test
    void lapse_inTheFuture_isRejected() {
        stubRow(d(1), 10, d(10));

        assertThatThrownBy(() -> service.answer(USER_ID, Habit.SNACK, lapse(d(14))))
                .isInstanceOf(IllegalArgumentException.class);
        verify(dayRepository, never()).saveAll(any());
    }

    @Test
    void getHabits_neverAnswered_returnsBothHabitsFresh_withoutWriting() {
        when(streakRepository.findByUserId(USER_ID)).thenReturn(List.of());

        List<HabitStatusDTO> habits = service.getHabits(USER_ID);

        assertThat(habits).containsExactly(
                new HabitStatusDTO(Habit.SNACK, 0, 0, null, true, TODAY),
                new HabitStatusDTO(Habit.ALCOHOL, 0, 0, null, true, TODAY));
        verify(streakRepository, never()).ensureRow(any(), any());
    }

    @Test
    void getHabits_reportsEachHabitFromItsOwnRow() {
        when(streakRepository.findByUserId(USER_ID)).thenReturn(List.of(
                new PetHabitStreak(11L, USER_ID, Habit.ALCOHOL, d(1), 20, TODAY),
                new PetHabitStreak(10L, USER_ID, Habit.SNACK, d(9), 4, d(12))));

        List<HabitStatusDTO> habits = service.getHabits(USER_ID);

        // Order follows Habit.values(), not row order; best is the stored value, not recomputed
        assertThat(habits).containsExactly(
                new HabitStatusDTO(Habit.SNACK, 4, 4, d(12), true, TODAY),
                new HabitStatusDTO(Habit.ALCOHOL, 13, 20, TODAY, false, TODAY.plusDays(1)));
    }

    private static HabitFirstAnswerRequest lastOn(LocalDate day) {
        return new HabitFirstAnswerRequest(day);
    }

    @Test
    void firstAnswer_cantRemember_startsTheStreakToday() {
        PetHabitStreak row = stubRow(null, 0, null);

        HabitStatusDTO dto = service.firstAnswer(USER_ID, Habit.SNACK, lastOn(null));

        verify(streakRepository).ensureRow(USER_ID, "SNACK");
        assertThat(savedDays()).extracting(PetHabitDay::getDay, PetHabitDay::getClean)
                .containsExactly(tuple(TODAY, true));
        assertThat(row.getStreakStart()).isEqualTo(TODAY);
        assertThat(dto).isEqualTo(new HabitStatusDTO(Habit.SNACK, 1, 1, TODAY, false, TODAY.plusDays(1)));
        verify(streakRepository).save(row);
    }

    @Test
    void firstAnswer_today_logsTodayAsTheLapse() {
        PetHabitStreak row = stubRow(null, 0, null);

        HabitStatusDTO dto = service.firstAnswer(USER_ID, Habit.SNACK, lastOn(TODAY));

        assertThat(savedDays()).extracting(PetHabitDay::getDay, PetHabitDay::getClean)
                .containsExactly(tuple(TODAY, false));
        assertThat(row.getStreakStart()).isEqualTo(TODAY.plusDays(1));
        assertThat(dto).isEqualTo(new HabitStatusDTO(Habit.SNACK, 0, 0, TODAY, false, TODAY.plusDays(1)));
    }

    @Test
    void firstAnswer_fiveDaysAgo_logsTheLapseThenFiveCleanDays() {
        PetHabitStreak row = stubRow(null, 0, null);

        HabitStatusDTO dto = service.firstAnswer(USER_ID, Habit.SNACK, lastOn(d(8)));

        assertThat(savedDays()).extracting(PetHabitDay::getDay, PetHabitDay::getClean)
                .containsExactly(tuple(d(8), false), tuple(d(9), true), tuple(d(10), true),
                        tuple(d(11), true), tuple(d(12), true), tuple(d(13), true));
        assertThat(row.getStreakStart()).isEqualTo(d(9));
        assertThat(dto).isEqualTo(new HabitStatusDTO(Habit.SNACK, 5, 5, TODAY, false, TODAY.plusDays(1)));
    }

    @Test
    void firstAnswer_thirtyDayFloor_capsTheRunAtThirtyCleanDaysWithNoLapseRow() {
        PetHabitStreak row = stubRow(null, 0, null);

        HabitStatusDTO dto = service.firstAnswer(USER_ID, Habit.SNACK, lastOn(TODAY.minusDays(30)));

        List<PetHabitDay> days = savedDays();
        assertThat(days).hasSize(30).allMatch(day -> Boolean.TRUE.equals(day.getClean()));
        assertThat(days.get(0).getDay()).isEqualTo(TODAY.minusDays(29));
        assertThat(row.getStreakStart()).isEqualTo(TODAY.minusDays(29));
        assertThat(dto.getCurrent()).isEqualTo(30);
        assertThat(dto.getBest()).isEqualTo(30);
    }

    @Test
    void firstAnswer_thirtyDayFloor_earnsAtMostOneAwardLadderCycle() {
        stubRow(null, 0, null);

        service.firstAnswer(USER_ID, Habit.SNACK, lastOn(TODAY.minusDays(30)));

        SortedMap<LocalDate, StreakRuns.DayOutcome> log = new TreeMap<>();
        savedDays().forEach(day -> log.put(day.getDay(),
                Boolean.TRUE.equals(day.getClean()) ? StreakRuns.DayOutcome.COUNTS : StreakRuns.DayOutcome.BREAKS));
        List<AwardLadder.AwardKey> awards = StreakRuns.summarise(log).runs().stream()
                .flatMap(run -> AwardLadder.awardsFor(StreakType.SNACK, run).stream())
                .toList();
        assertThat(awards).extracting(AwardLadder.AwardKey::cycleIndex).containsOnly(0);
        assertThat(awards).extracting(AwardLadder.AwardKey::milestone).containsExactlyInAnyOrderElementsOf(AwardLadder.MILESTONES);
    }

    @Test
    void firstAnswer_olderThanThirtyDays_isRejectedAndWritesNothing() {
        stubRow(null, 0, null);

        assertThatThrownBy(() -> service.firstAnswer(USER_ID, Habit.SNACK, lastOn(TODAY.minusDays(31))))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessage("lastDate must be on or after " + TODAY.minusDays(30));
        verify(dayRepository, never()).saveAll(any());
        verify(streakRepository, never()).save(any());
    }

    @Test
    void firstAnswer_future_isRejected() {
        stubRow(null, 0, null);

        assertThatThrownBy(() -> service.firstAnswer(USER_ID, Habit.SNACK, lastOn(TODAY.plusDays(1))))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessage("lastDate cannot be in the future");
        verify(dayRepository, never()).saveAll(any());
    }

    @Test
    void firstAnswer_onceAnswered_isRefused() {
        stubRow(d(10), 3, d(12));

        assertThatThrownBy(() -> service.firstAnswer(USER_ID, Habit.SNACK, lastOn(null)))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessage("SNACK has already been answered");
        verify(dayRepository, never()).saveAll(any());
        verify(streakRepository, never()).save(any());
    }
}
