package com.foodbytes.dto;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.math.BigDecimal;
import java.time.LocalDate;

/**
 * Request DTO for creating/toggling a meal plan entry (FR-014).
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class MealPlanCreateRequest {

    @NotNull(message = "Plan date is required")
    private LocalDate planDate;

    @NotNull(message = "Meal ID is required")
    private Long mealId;

    @NotNull(message = "Recipe ID is required")
    private Long recipeId;

    /**
     * Optional. When omitted, MealPlanService derives the value from the
     * recipe's default_servings — a field initialiser here would mask the
     * omission and silently store 1.
     *
     * <p>Decimal so a user can plan a fractional portion: 0.5 is a half
     * portion, 0.25 a quarter. All three constraints below pass on null, so
     * the "omitted means recipe default" contract above is preserved.
     */
    @DecimalMin(value = "0.25", message = "Servings must be at least 0.25")
    @DecimalMax(value = "20.00", message = "Servings must be at most 20")
    @Digits(integer = 2, fraction = 2, message = "Servings allows at most 2 decimal places")
    private BigDecimal servings;
}
