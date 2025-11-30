package com.foodbytes.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CreateMealPlanRequest {

    @NotNull(message = "Plan date is required")
    private LocalDate planDate;

    @NotNull(message = "Meal type is required")
    private String mealType;

    @NotNull(message = "Recipe ID is required")
    private Long recipeId;

    @NotNull(message = "Servings is required")
    @Positive(message = "Servings must be positive")
    private Integer servings;
}
