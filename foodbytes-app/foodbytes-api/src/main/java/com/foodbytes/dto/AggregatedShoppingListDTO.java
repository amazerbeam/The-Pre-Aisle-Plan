package com.foodbytes.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.List;

/**
 * DTO for the complete aggregated shopping list.
 * Implements FR-019 (7-day shopping list) and FR-020 (grouped by aisle).
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AggregatedShoppingListDTO {
    private LocalDate startDate;
    private LocalDate endDate;
    private List<ShoppingListByAisleDTO> aisles;
    private Integer totalItems;
}
