package com.foodbytes.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.time.LocalDate;

/**
 * DTO for a single meal plan entry.
 * Used in API responses and within MealPlanDayDTO.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class MealPlanEntryDTO {
    private Long id;
    private LocalDate planDate;
    private String mealType;          // "breakfast", "lunch", "dinner", "snacks"
    private Long mealId;
    private RecipeDTO recipe;
    private Integer servings;
    private Integer caloriesPerServing; // FR-017: Fixed per-serving calories
}
