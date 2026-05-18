package com.foodbytes.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.math.BigDecimal;
import java.util.List;

/**
 * FR-042: Response DTO for ingredient breakdown popup.
 * Shows which meals use an ingredient and how much each requires.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class IngredientBreakdownDTO {
    private Long ingredientId;
    private String ingredientName;
    private String unit;
    private BigDecimal totalQuantity;
    private List<MealIngredientUsageDTO> mealBreakdown;
}
