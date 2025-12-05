package com.foodbytes.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.math.BigDecimal;
import java.time.LocalDate;

/**
 * FR-042: Shows how much of an ingredient is used by a single meal.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class MealIngredientUsageDTO {
    private String recipeName;
    private String mealType;      // e.g., "breakfast", "lunch", "dinner", "snacks"
    private LocalDate planDate;
    private BigDecimal quantity;  // Scaled quantity for this meal
    private Integer servings;
}
