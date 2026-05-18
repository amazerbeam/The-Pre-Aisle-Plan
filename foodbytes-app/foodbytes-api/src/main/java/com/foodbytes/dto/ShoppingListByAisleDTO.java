package com.foodbytes.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * DTO for shopping items grouped by aisle.
 * Implements FR-020 (group by grocery aisle).
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ShoppingListByAisleDTO {
    private AisleDTO aisle;
    private List<ShoppingItemDTO> items;
}
