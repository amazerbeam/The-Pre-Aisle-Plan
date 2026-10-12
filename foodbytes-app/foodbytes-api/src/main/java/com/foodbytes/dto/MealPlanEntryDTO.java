package com.foodbytes.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.HashMap;
import java.util.Map;

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
    private BigDecimal servings;   // Fractional portions allowed (0.5 = half portion)
    private Integer caloriesPerServing; // FR-017: Fixed per-serving calories
    private Integer proteinPerServing;
    private Integer carbsPerServing;
    private Integer fatPerServing;
    private Map<Long, Boolean> extraChoices = new HashMap<>(); // MPP-10: stored choices for this meal; empty = all homemade
    private Boolean eaten;            // MPP-12: one shared state per entry
    private Instant eatenAt;          // MPP-12: null when not eaten; ISO-8601 UTC ("...Z")
}
