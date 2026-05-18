package com.foodbytes.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * DTO for a shopping list aisle group.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PersistedShoppingAisleDTO {
    private Long aisleId;
    private String aisleName;
    private Short aisleOrder;
    private List<PersistedShoppingItemDTO> items;
}
