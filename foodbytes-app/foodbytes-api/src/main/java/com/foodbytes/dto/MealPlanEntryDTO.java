package com.foodbytes.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.time.LocalDate;

/**
 * DTO for a single meal plan entry.
 * Used in API responses and within MealPlanDayDTO.
 * FR-102: Uses RecipeSummaryDTO for lightweight response (no ingredients/steps).
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class MealPlanEntryDTO {
    private Long id;
    private LocalDate planDate;
    private String mealType;          // "breakfast", "lunch", "dinner", "snacks"
    private Long mealId;
    private RecipeSummaryDTO recipe;  // FR-102: Summary only, fetch full on-demand
    private Integer servings;
    private Integer caloriesPerServing; // FR-017: Fixed per-serving calories
    private Integer proteinPerServing;
    private Integer carbsPerServing;
    private Integer fatPerServing;
}
