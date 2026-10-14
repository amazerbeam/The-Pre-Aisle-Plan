package com.foodbytes.model;

import java.util.Optional;

/**
 * MPP-22: the three streaks that share Pip's milestone ladder. SNACK and ALCOHOL mirror
 * {@link Habit} (MPP-20); PLAN is derived from the caller's own eaten ticks.
 */
public enum StreakType {
    PLAN, SNACK, ALCOHOL;

    public static StreakType of(Habit habit) {
        return valueOf(habit.name());
    }

    /** The MPP-20 habit behind this streak; empty for PLAN, which has none. */
    public Optional<Habit> habit() {
        return this == PLAN ? Optional.empty() : Optional.of(Habit.valueOf(name()));
    }
}
