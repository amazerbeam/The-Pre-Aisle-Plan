package com.foodbytes.service;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.ZoneOffset;
import java.time.ZonedDateTime;
import java.time.temporal.TemporalAdjusters;
import java.util.ArrayList;
import java.util.List;

/**
 * MPP-25: what earns sprinkles, and how many. The amounts are illustrative and retunable (target
 * about 300 a week from about 21 logged meals). Only consistency pays - never variety (MPP-11).
 * Days are Europe/Dublin (HabitStreakPolicy.ZONE) until a per-user zone exists.
 */
public final class SprinklePolicy {

    public static final int MEAL_EATEN = 10;
    public static final int ON_TIME_BONUS = 5;
    public static final int FULL_WEEK = 20;
    public static final int HOMEMADE_BONUS = 5;
    /** A full week is Monday to Sunday, every day with breakfast, lunch and dinner planned. */
    public static final int WEEK_DAYS = 7;

    private SprinklePolicy() {
    }

    /** Breakfast, lunch and dinner pay; snacks and extras do not. */
    static boolean isMainMeal(String mealKey) {
        return PlanStreakPolicy.MAIN_MEAL_KEYS.contains(mealKey);
    }

    /** A meal ticked before its plan date pays nothing, so pre-ticking can't farm sprinkles. */
    static boolean isPayable(LocalDate planDate, LocalDate today) {
        return !planDate.isAfter(today);
    }

    /** The tick (UTC wall time) fell on the plan day, at or before the meal's by-time, in Dublin. */
    static boolean isOnTime(LocalDateTime eatenAtUtc, LocalDate planDate, LocalTime byTime) {
        ZonedDateTime local = eatenAtUtc.atZone(ZoneOffset.UTC).withZoneSameInstant(HabitStreakPolicy.ZONE);
        return local.toLocalDate().equals(planDate) && !local.toLocalTime().isAfter(byTime);
    }

    /** The Monday of every calendar week that overlaps [from, to], oldest first. */
    static List<LocalDate> mondaysCovering(LocalDate from, LocalDate to) {
        List<LocalDate> mondays = new ArrayList<>();
        for (LocalDate monday = from.with(TemporalAdjusters.previousOrSame(DayOfWeek.MONDAY));
             !monday.isAfter(to);
             monday = monday.plusDays(WEEK_DAYS)) {
            mondays.add(monday);
        }
        return mondays;
    }
}
