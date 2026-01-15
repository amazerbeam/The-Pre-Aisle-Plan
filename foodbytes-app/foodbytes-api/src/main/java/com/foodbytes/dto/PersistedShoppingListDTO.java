package com.foodbytes.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

/**
 * DTO for a persisted shopping list.
 * Contains metadata and grouped items by aisle.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PersistedShoppingListDTO {
    private Long id;
    private LocalDate startDate;
    private LocalDate endDate;
    private LocalDateTime generatedAt;
    private List<PersistedShoppingAisleDTO> aisles;
    private Integer totalItems;
    private Integer checkedItems;
}
