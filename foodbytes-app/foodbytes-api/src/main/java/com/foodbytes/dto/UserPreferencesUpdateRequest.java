package com.foodbytes.dto;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.validation.Valid;
import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Digits;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;

/**
 * MPP-3 / MPP-13: partial update of the authenticated user's preferences.
 *
 * True PATCH semantics: a field ABSENT from the JSON body is left untouched; an
 * explicit null clears it. Jackson only calls a setter for a key that is present,
 * so the hand-written setters below record presence. Without this, the meal-times
 * control saving {mealTimes} would clear a saved defaultServings, and the portions
 * control would reset meal times.
 */
@Data
@NoArgsConstructor
public class UserPreferencesUpdateRequest {

    /**
     * Nullable. An explicit null CLEARS the preference, restoring the
     * recipe-default behaviour (AC 9). All three constraints pass on null, so
     * that contract survives validation — the same trick MealPlanCreateRequest
     * uses to keep "omitted means recipe default" working.
     */
    @DecimalMin(value = "0.25", message = "Default portions must be at least 0.25")
    @DecimalMax(value = "20.00", message = "Default portions must be at most 20")
    @Digits(integer = 2, fraction = 2, message = "Default portions allows at most 2 decimal places")
    private BigDecimal defaultServings;

    /** MPP-13: all three times, or an explicit null to reset to the defaults. */
    @Valid
    private MealTimesRequest mealTimes;

    @JsonIgnore
    private boolean defaultServingsPresent;

    @JsonIgnore
    private boolean mealTimesPresent;

    public void setDefaultServings(BigDecimal defaultServings) {
        this.defaultServings = defaultServings;
        this.defaultServingsPresent = true;
    }

    public void setMealTimes(MealTimesRequest mealTimes) {
        this.mealTimes = mealTimes;
        this.mealTimesPresent = true;
    }
}
