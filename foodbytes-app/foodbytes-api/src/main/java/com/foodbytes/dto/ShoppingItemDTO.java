package com.foodbytes.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

/**
 * DTO for a single shopping list item.
 * Represents an aggregated ingredient with total quantity needed.
 * Implements FR-019 (aggregated shopping list).
 * FR-102: Added sourceChain for ingredient provenance tracking.
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

    // FR-102: Chain of recipe IDs showing ingredient provenance
    // Example: [10, 12, 13] means Basil came from Pesto(10) -> Pizza Sauce(12) -> Pizza(13)
    // Last ID is the root/main recipe
    private List<Long> sourceChain;
}
