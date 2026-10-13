package com.foodbytes.service;

import com.foodbytes.dto.HabitStatusDTO;
import com.foodbytes.model.Habit;
import com.foodbytes.model.PetHabitStreak;

import java.time.Clock;
import java.time.LocalDate;
import java.time.ZoneId;
import java.time.temporal.ChronoUnit;

/**
 * MPP-20: the single owner of the check-in date rules (the PetPolicy / MealTimesPolicy pattern).
 * Pure and static, so the rules are tested without storage; HabitStreakService applies them.
 *
 * "Today" is the Europe/Dublin date until a per-user zone exists. An answer covers every day from
 * coversFrom (the day after the last answer, or today for a first answer) up to today, so a
 * skipped day is never a lapse.
 */
public final class HabitStreakPolicy {

    public static final ZoneId ZONE = ZoneId.of("Europe/Dublin");

    private HabitStreakPolicy() {
    }

    public static LocalDate today(Clock clock) {
        return LocalDate.now(clock.withZone(ZONE));
    }

    /** First day the next answer covers: the day after the last answer, or today if never answered. */
    public static LocalDate coversFrom(LocalDate lastAnswered, LocalDate today) {
        return lastAnswered == null ? today : lastAnswered.plusDays(1);
    }

    /** Running streak length, both ends inclusive; 0 with no streak or right after a lapse today. */
    public static int current(LocalDate streakStart, LocalDate lastAnswered) {
        if (streakStart == null || lastAnswered == null || streakStart.isAfter(lastAnswered)) {
            return 0;
        }
        return (int) ChronoUnit.DAYS.between(streakStart, lastAnswered) + 1;
    }

    /** A lapse must fall in the days this answer covers: coversFrom ≤ lapse ≤ today. */
    public static void requireLapseInWindow(LocalDate lapse, LocalDate coversFrom, LocalDate today) {
        if (coversFrom.isAfter(today)) {
            throw new IllegalArgumentException("Already answered through " + today);
        }
        if (lapse.isBefore(coversFrom) || lapse.isAfter(today)) {
            throw new IllegalArgumentException("lapseDate must be between " + coversFrom + " and " + today);
        }
    }

    /** Status for one habit; row is null when the caller has never answered it. */
    public static HabitStatusDTO toDTO(Habit habit, PetHabitStreak row, LocalDate today) {
        if (row == null) {
            return new HabitStatusDTO(habit, 0, 0, null, true, today);
        }
        LocalDate last = row.getLastAnsweredDate();
        return new HabitStatusDTO(
                habit,
                current(row.getStreakStart(), last),
                row.getBest(),
                last,
                last == null || last.isBefore(today),
                coversFrom(last, today));
    }
}
