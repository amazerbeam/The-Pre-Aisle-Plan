package com.foodbytes.dto;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.validation.constraints.AssertTrue;
import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Digits;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;
import java.time.LocalDate;

/**
 * Request DTO for PATCH /api/meal-plan/{id}: move an entry to another day/meal and/or change its servings.
 * Any subset may be sent, but planDate and mealId travel together and the body must not be empty.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class MealPlanEntryUpdateRequest {

    /** Nullable; paired with mealId. */
    private LocalDate planDate;

    /** Nullable; paired with planDate. */
    private Long mealId;

    @DecimalMin(value = "0.25", message = "Servings must be at least 0.25")
    @DecimalMax(value = "20.00", message = "Servings must be at most 20")
    @Digits(integer = 2, fraction = 2, message = "Servings allows at most 2 decimal places")
    private BigDecimal servings;

    @JsonIgnore
    @AssertTrue(message = "planDate and mealId must be sent together")
    public boolean isMoveComplete() {
        return (planDate == null) == (mealId == null);
    }

    @JsonIgnore
    @AssertTrue(message = "Nothing to update")
    public boolean isNotEmpty() {
        return planDate != null || servings != null;
    }
}
