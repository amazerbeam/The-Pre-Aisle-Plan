package com.foodbytes.service;

import com.foodbytes.dto.MealTimesDTO;
import com.foodbytes.model.User;

import java.time.LocalTime;
import java.time.format.DateTimeFormatter;

/**
 * MPP-13: the single backend owner of the meal-time defaults, format and order
 * rule. The defaults live ONLY here — every user payload carries effective times
 * built by effective(), so the frontend has no copy to drift from. The format and
 * order rule are mirrored in client/src/utils/mealTimesUtils.js; keep them in sync.
 *
 * The String constants are compile-time constants so MealTimesRequest can use them
 * inside @Pattern / @AssertTrue annotations.
 */
public final class MealTimesPolicy {

    public static final LocalTime DEFAULT_BREAKFAST_BY = LocalTime.of(11, 0);
    public static final LocalTime DEFAULT_LUNCH_BY = LocalTime.of(15, 0);
    public static final LocalTime DEFAULT_DINNER_BY = LocalTime.of(21, 0);

    /** 24-hour, zero-padded HH:mm — exactly what an HTML time input produces. */
    public static final String HH_MM_REGEX = "^([01]\\d|2[0-3]):[0-5]\\d$";
    public static final String FORMAT_ERROR = "Meal times must be HH:mm";
    /** Same words as the frontend's MEAL_TIMES_ORDER_ERROR (MPP-13 AC 4). */
    public static final String ORDER_ERROR = "Times must run breakfast → lunch → dinner.";

    private static final DateTimeFormatter HH_MM = DateTimeFormatter.ofPattern("HH:mm");

    private MealTimesPolicy() {
    }

    /** Strict: equal times are rejected, and there is no wrap past midnight. */
    public static boolean isStrictlyOrdered(LocalTime breakfastBy, LocalTime lunchBy, LocalTime dinnerBy) {
        return breakfastBy.isBefore(lunchBy) && lunchBy.isBefore(dinnerBy);
    }

    public static LocalTime parse(String hhmm) {
        return LocalTime.parse(hhmm, HH_MM);
    }

    public static MealTimesDTO effective(User user) {
        boolean custom = user.getBreakfastBy() != null
                || user.getLunchBy() != null
                || user.getDinnerBy() != null;
        return new MealTimesDTO(
                format(user.getBreakfastBy(), DEFAULT_BREAKFAST_BY),
                format(user.getLunchBy(), DEFAULT_LUNCH_BY),
                format(user.getDinnerBy(), DEFAULT_DINNER_BY),
                custom);
    }

    private static String format(LocalTime saved, LocalTime fallback) {
        return (saved != null ? saved : fallback).format(HH_MM);
    }
}
