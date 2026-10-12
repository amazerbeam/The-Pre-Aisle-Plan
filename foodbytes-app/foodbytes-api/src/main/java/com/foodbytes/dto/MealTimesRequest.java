package com.foodbytes.dto;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.foodbytes.service.MealTimesPolicy;
import jakarta.validation.constraints.AssertTrue;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * MPP-13: a full set of meal times. All three are required — the order rule is
 * judged across the whole set, and the three columns are always written together.
 * Rules mirror client/src/utils/mealTimesUtils.js (AC 7).
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class MealTimesRequest {

    @NotNull(message = MealTimesPolicy.FORMAT_ERROR)
    @Pattern(regexp = MealTimesPolicy.HH_MM_REGEX, message = MealTimesPolicy.FORMAT_ERROR)
    private String breakfastBy;

    @NotNull(message = MealTimesPolicy.FORMAT_ERROR)
    @Pattern(regexp = MealTimesPolicy.HH_MM_REGEX, message = MealTimesPolicy.FORMAT_ERROR)
    private String lunchBy;

    @NotNull(message = MealTimesPolicy.FORMAT_ERROR)
    @Pattern(regexp = MealTimesPolicy.HH_MM_REGEX, message = MealTimesPolicy.FORMAT_ERROR)
    private String dinnerBy;

    /**
     * Passes when any time is missing or malformed — the field constraints above
     * report those, so a bad format never also shows the order message.
     */
    @JsonIgnore
    @AssertTrue(message = MealTimesPolicy.ORDER_ERROR)
    public boolean isStrictlyOrdered() {
        if (!isHhMm(breakfastBy) || !isHhMm(lunchBy) || !isHhMm(dinnerBy)) {
            return true;
        }
        return MealTimesPolicy.isStrictlyOrdered(
                MealTimesPolicy.parse(breakfastBy),
                MealTimesPolicy.parse(lunchBy),
                MealTimesPolicy.parse(dinnerBy));
    }

    private static boolean isHhMm(String value) {
        return value != null && value.matches(MealTimesPolicy.HH_MM_REGEX);
    }
}
