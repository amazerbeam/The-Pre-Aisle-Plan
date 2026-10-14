package com.foodbytes.service;

import com.foodbytes.dto.HabitStatusDTO;
import com.foodbytes.model.Habit;
import com.foodbytes.model.PetHabitStreak;
import org.junit.jupiter.api.Test;

import java.time.Clock;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneOffset;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatCode;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

/** MPP-20: the date rules behind Pip's check-in, independent of storage. */
class HabitStreakPolicyTest {

    private static final LocalDate TODAY = LocalDate.of(2026, 10, 13);

    @Test
    void today_isTheDublinDate_evenWhenTheClockIsUtc() {
        // 23:30 UTC on 13 Oct is 00:30 IST on 14 Oct
        Clock utc = Clock.fixed(Instant.parse("2026-10-13T23:30:00Z"), ZoneOffset.UTC);
        assertThat(HabitStreakPolicy.today(utc)).isEqualTo(LocalDate.of(2026, 10, 14));
    }

    @Test
    void coversFrom_neverAnswered_isToday() {
        assertThat(HabitStreakPolicy.coversFrom(null, TODAY)).isEqualTo(TODAY);
    }

    @Test
    void coversFrom_isTheDayAfterTheLastAnswer() {
        assertThat(HabitStreakPolicy.coversFrom(LocalDate.of(2026, 10, 10), TODAY))
                .isEqualTo(LocalDate.of(2026, 10, 11));
    }

    @Test
    void current_countsBothEndsInclusive() {
        assertThat(HabitStreakPolicy.current(LocalDate.of(2026, 10, 9), TODAY)).isEqualTo(5);
        assertThat(HabitStreakPolicy.current(TODAY, TODAY)).isEqualTo(1);
    }

    @Test
    void current_isZero_whenNoStreakOrStartIsAfterLastAnswer() {
        assertThat(HabitStreakPolicy.current(null, TODAY)).isZero();
        assertThat(HabitStreakPolicy.current(TODAY, null)).isZero();
        assertThat(HabitStreakPolicy.current(TODAY.plusDays(1), TODAY)).isZero(); // lapse today
    }

    @Test
    void requireLapseInWindow_acceptsBothEnds() {
        LocalDate from = LocalDate.of(2026, 10, 11);
        assertThatCode(() -> HabitStreakPolicy.requireLapseInWindow(from, from, TODAY)).doesNotThrowAnyException();
        assertThatCode(() -> HabitStreakPolicy.requireLapseInWindow(TODAY, from, TODAY)).doesNotThrowAnyException();
    }

    @Test
    void requireLapseInWindow_rejectsOutsideTheWindow() {
        LocalDate from = LocalDate.of(2026, 10, 11);
        assertThatThrownBy(() -> HabitStreakPolicy.requireLapseInWindow(LocalDate.of(2026, 10, 10), from, TODAY))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessage("lapseDate must be between 2026-10-11 and 2026-10-13");
        assertThatThrownBy(() -> HabitStreakPolicy.requireLapseInWindow(TODAY.plusDays(1), from, TODAY))
                .isInstanceOf(IllegalArgumentException.class);
    }

    @Test
    void requireLapseInWindow_rejectsWhenTodayIsAlreadyAnswered() {
        assertThatThrownBy(() -> HabitStreakPolicy.requireLapseInWindow(TODAY, TODAY.plusDays(1), TODAY))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessage("Already answered through 2026-10-13");
    }

    @Test
    void toDTO_noRow_isAFreshHabit() {
        HabitStatusDTO dto = HabitStreakPolicy.toDTO(Habit.SNACK, null, TODAY);

        assertThat(dto).isEqualTo(new HabitStatusDTO(Habit.SNACK, 0, 0, null, true, TODAY));
    }

    @Test
    void toDTO_answeredToday_doesNotAsk() {
        PetHabitStreak row = new PetHabitStreak(1L, 7L, Habit.ALCOHOL, LocalDate.of(2026, 10, 4), 12, TODAY);

        HabitStatusDTO dto = HabitStreakPolicy.toDTO(Habit.ALCOHOL, row, TODAY);

        assertThat(dto).isEqualTo(new HabitStatusDTO(Habit.ALCOHOL, 10, 12, TODAY, false, TODAY.plusDays(1)));
    }

    @Test
    void firstAnswerEarliest_isThirtyDaysBack() {
        assertThat(HabitStreakPolicy.firstAnswerEarliest(TODAY)).isEqualTo(TODAY.minusDays(30));
    }

    @Test
    void requireFirstAnswerInWindow_acceptsTodayAndTheThirtyDayFloor() {
        HabitStreakPolicy.requireFirstAnswerInWindow(TODAY, TODAY);
        HabitStreakPolicy.requireFirstAnswerInWindow(TODAY.minusDays(30), TODAY);
    }

    @Test
    void requireFirstAnswerInWindow_rejectsFuture() {
        assertThatThrownBy(() -> HabitStreakPolicy.requireFirstAnswerInWindow(TODAY.plusDays(1), TODAY))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessage("lastDate cannot be in the future");
    }

    @Test
    void requireFirstAnswerInWindow_rejectsOlderThanThirtyDays() {
        assertThatThrownBy(() -> HabitStreakPolicy.requireFirstAnswerInWindow(TODAY.minusDays(31), TODAY))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessage("lastDate must be on or after " + TODAY.minusDays(30));
    }

    @Test
    void firstAnswerLogFrom_isTheLapseInsideTheWindow_elseTheWindowStart() {
        assertThat(HabitStreakPolicy.firstAnswerLogFrom(TODAY.minusDays(5), TODAY)).isEqualTo(TODAY.minusDays(5));
        assertThat(HabitStreakPolicy.firstAnswerLogFrom(TODAY.minusDays(29), TODAY)).isEqualTo(TODAY.minusDays(29));
        assertThat(HabitStreakPolicy.firstAnswerLogFrom(TODAY.minusDays(30), TODAY)).isEqualTo(TODAY.minusDays(29));
    }
}
