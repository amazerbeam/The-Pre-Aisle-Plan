package com.foodbytes.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.Map;

/**
 * Request DTO for generating a new shopping list.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GenerateShoppingListRequest {
    private LocalDate startDate;
    private LocalDate endDate;

    // Optional: homemade/store-bought selections for extras
    // Format: { parentRecipeId: { extraRecipeId: isHomemade } }
    private Map<Long, Map<Long, Boolean>> selections;
}
