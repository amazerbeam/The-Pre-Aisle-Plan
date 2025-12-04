package com.foodbytes.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

/**
 * DTO for a single shopping list item.
 * Represents an aggregated ingredient with total quantity needed.
 * Implements FR-019 (aggregated shopping list).
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ShoppingItemDTO {
    private Long ingredientId;
    private String ingredientName;
    private BigDecimal totalQuantity;
    private String unit;
    private Long aisleId;
    private String aisleName;
}
