package com.foodbytes.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

/**
 * DTO for a persisted shopping list item.
 * Includes checked state for persistence.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PersistedShoppingItemDTO {
    private Long id;  // Item ID for toggling
    private Long ingredientId;
    private String ingredientName;
    private BigDecimal quantity;
    private String unit;
    private Long aisleId;
    private String aisleName;
    private List<Long> sourceChain;
    private Boolean isChecked;
}
