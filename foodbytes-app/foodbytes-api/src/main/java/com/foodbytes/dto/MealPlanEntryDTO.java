package com.foodbytes.dto;

import com.foodbytes.model.MealType;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MealPlanEntryDTO {
    private Long id;

    @NotNull(message = "Plan date is required")
    private LocalDate planDate;

    @NotNull(message = "Meal type is required")
    private MealType mealType;

    @NotNull(message = "Recipe ID is required")
    private Long recipeId;

    private RecipeDTO recipe;

    @NotNull(message = "Servings is required")
    @Min(value = 1, message = "Servings must be at least 1")
    private Integer servings;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
