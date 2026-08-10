package com.foodbytes.dto;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Digits;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;

/**
 * MPP-3: partial update of the authenticated user's preferences.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
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
}
