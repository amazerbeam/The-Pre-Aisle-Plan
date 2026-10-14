package com.foodbytes.service;

import org.junit.jupiter.api.Test;

import static com.foodbytes.service.StreakRuns.DayOutcome.BREAKS;
import static com.foodbytes.service.StreakRuns.DayOutcome.COUNTS;
import static com.foodbytes.service.StreakRuns.DayOutcome.NEUTRAL;
import static org.assertj.core.api.Assertions.assertThat;

/** MPP-22 AC 2: the plan-day definition. */
class PlanStreakPolicyTest {

    @Test
    void nothingPlanned_isNeutral() {
        assertThat(PlanStreakPolicy.dayOutcome(0, 0, false)).isEqualTo(NEUTRAL);
    }

    @Test
    void everyPlannedMealEaten_counts() {
        assertThat(PlanStreakPolicy.dayOutcome(3, 3, false)).isEqualTo(COUNTS);
        assertThat(PlanStreakPolicy.dayOutcome(3, 3, true)).isEqualTo(COUNTS);
    }

    @Test
    void pastDayWithAMissedMeal_breaks() {
        assertThat(PlanStreakPolicy.dayOutcome(3, 2, false)).isEqualTo(BREAKS);
    }

    @Test
    void pastDayWithNothingTicked_breaks() {
        assertThat(PlanStreakPolicy.dayOutcome(2, 0, false)).isEqualTo(BREAKS);
    }

    @Test
    void todayStillInProgress_isNeutral() {
        assertThat(PlanStreakPolicy.dayOutcome(3, 1, true)).isEqualTo(NEUTRAL);
    }
}
