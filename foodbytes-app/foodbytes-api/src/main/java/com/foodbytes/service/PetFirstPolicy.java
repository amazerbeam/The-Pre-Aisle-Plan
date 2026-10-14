package com.foodbytes.service;

import java.time.LocalDate;
import java.util.Collection;
import java.util.TreeSet;

/**
 * MPP-24: what "plan a full week" means. A full week is FULL_WEEK_DAYS consecutive calendar days,
 * each with breakfast, lunch and dinner planned (PlanStreakPolicy.MAIN_MEAL_KEYS) - a rolling
 * window, not a Monday-Sunday week. The migration's backfill 3/4 applies the same rule in SQL.
 */
public final class PetFirstPolicy {

    public static final int FULL_WEEK_DAYS = 7;

    private PetFirstPolicy() {
    }

    /** Earliest start of a 7-day window that includes {@code from}. */
    static LocalDate scanFrom(LocalDate from) {
        return from.minusDays(FULL_WEEK_DAYS - 1);
    }

    /** Latest end of a 7-day window that includes {@code to}. */
    static LocalDate scanTo(LocalDate to) {
        return to.plusDays(FULL_WEEK_DAYS - 1);
    }

    /** True when the fully planned dates contain FULL_WEEK_DAYS consecutive days. */
    static boolean containsFullWeek(Collection<LocalDate> fullyPlannedDates) {
        LocalDate previous = null;
        int run = 0;
        for (LocalDate day : new TreeSet<>(fullyPlannedDates)) {
            run = previous != null && previous.plusDays(1).equals(day) ? run + 1 : 1;
            if (run >= FULL_WEEK_DAYS) return true;
            previous = day;
        }
        return false;
    }
}
