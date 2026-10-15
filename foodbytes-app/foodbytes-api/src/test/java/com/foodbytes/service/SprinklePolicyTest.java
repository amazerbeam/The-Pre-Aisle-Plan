package com.foodbytes.service;

import org.junit.jupiter.api.Test;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

import static org.assertj.core.api.Assertions.assertThat;

/** MPP-25 AC 2: the pure earning rules. */
class SprinklePolicyTest {

    private static final LocalDate MON = LocalDate.of(2026, 10, 12);   // a Monday (IST, UTC+1)
    private static final LocalTime LUNCH_BY = LocalTime.of(15, 0);

    @Test
    void amounts_matchTheTicket() {
        assertThat(SprinklePolicy.MEAL_EATEN).isEqualTo(10);
        assertThat(SprinklePolicy.ON_TIME_BONUS).isEqualTo(5);
        assertThat(SprinklePolicy.FULL_WEEK).isEqualTo(20);
        assertThat(SprinklePolicy.HOMEMADE_BONUS).isEqualTo(5);
    }

    @Test
    void onlyMainMealsPay() {
        assertThat(SprinklePolicy.isMainMeal("breakfast")).isTrue();
        assertThat(SprinklePolicy.isMainMeal("lunch")).isTrue();
        assertThat(SprinklePolicy.isMainMeal("dinner")).isTrue();
        assertThat(SprinklePolicy.isMainMeal("snacks")).isFalse();
        assertThat(SprinklePolicy.isMainMeal("extras")).isFalse();
    }

    @Test
    void futurePlanDatesDoNotPay() {
        assertThat(SprinklePolicy.isPayable(MON, MON)).isTrue();
        assertThat(SprinklePolicy.isPayable(MON.minusDays(3), MON)).isTrue();
        assertThat(SprinklePolicy.isPayable(MON.plusDays(1), MON)).isFalse();
    }

    @Test
    void onTime_isLocalDublinTime_onThePlanDay_atOrBeforeTheByTime() {
        // 13:59 UTC = 14:59 IST -> on time
        assertThat(SprinklePolicy.isOnTime(LocalDateTime.of(2026, 10, 12, 13, 59), MON, LUNCH_BY)).isTrue();
        // 14:00 UTC = 15:00 IST -> exactly the by-time still counts
        assertThat(SprinklePolicy.isOnTime(LocalDateTime.of(2026, 10, 12, 14, 0), MON, LUNCH_BY)).isTrue();
        // 14:01 UTC = 15:01 IST -> late
        assertThat(SprinklePolicy.isOnTime(LocalDateTime.of(2026, 10, 12, 14, 1), MON, LUNCH_BY)).isFalse();
        // next day, early -> late (not the plan day)
        assertThat(SprinklePolicy.isOnTime(LocalDateTime.of(2026, 10, 13, 8, 0), MON, LUNCH_BY)).isFalse();
        // 23:30 UTC on Sunday = 00:30 IST Monday -> counts for Monday breakfast
        assertThat(SprinklePolicy.isOnTime(LocalDateTime.of(2026, 10, 11, 23, 30), MON, LocalTime.of(11, 0))).isTrue();
    }

    @Test
    void mondaysCovering_listsEachCalendarWeekTouched() {
        assertThat(SprinklePolicy.mondaysCovering(MON.plusDays(2), MON.plusDays(2))).containsExactly(MON);
        assertThat(SprinklePolicy.mondaysCovering(MON.plusDays(6), MON.plusDays(7))).containsExactly(MON, MON.plusDays(7));
        assertThat(SprinklePolicy.mondaysCovering(MON, MON.plusDays(6))).containsExactly(MON);
    }

    @Test
    void weekOf_isThatWeeksMonday() {
        assertThat(SprinklePolicy.weekOf(LocalDate.of(2026, 10, 18))).isEqualTo(LocalDate.of(2026, 10, 12)); // Sunday
        assertThat(SprinklePolicy.weekOf(LocalDate.of(2026, 10, 12))).isEqualTo(LocalDate.of(2026, 10, 12)); // Monday
    }

    @Test
    void mealsPerWeek_isSevenDaysOfBreakfastLunchAndDinner() {
        assertThat(SprinklePolicy.mealsPerWeek()).isEqualTo(21);
    }
}
