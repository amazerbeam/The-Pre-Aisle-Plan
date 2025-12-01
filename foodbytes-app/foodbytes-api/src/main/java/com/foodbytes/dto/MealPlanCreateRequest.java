package com.foodbytes.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
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

    @Min(value = 1, message = "Servings must be at least 1")
    private Integer servings = 1;
}
