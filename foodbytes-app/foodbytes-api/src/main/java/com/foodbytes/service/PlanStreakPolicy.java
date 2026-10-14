package com.foodbytes.service;

import com.foodbytes.service.StreakRuns.DayOutcome;

import java.util.List;

/**
 * MPP-22: what "followed the plan" means for one day. The single place to change the definition
 * (the ticket leaves it open in the spec).
 */
public final class PlanStreakPolicy {

    /** meals.key values that make up a plan day; snacks and extras don't count. */
    public static final List<String> MAIN_MEAL_KEYS = List.of("breakfast", "lunch", "dinner");

    private PlanStreakPolicy() {
    }

    /**
     * A day counts when the caller ticked every breakfast/lunch/dinner planned that day on the shared
     * plan, and breaks when they didn't. A day with nothing planned is neutral, and so is today until
     * it's complete, so an un-ticked dinner at noon doesn't break the streak.
     */
    public static DayOutcome dayOutcome(int planned, int eatenByCaller, boolean isToday) {
        if (planned == 0) {
            return DayOutcome.NEUTRAL;
        }
        if (eatenByCaller >= planned) {
            return DayOutcome.COUNTS;
        }
        return isToday ? DayOutcome.NEUTRAL : DayOutcome.BREAKS;
    }
}
