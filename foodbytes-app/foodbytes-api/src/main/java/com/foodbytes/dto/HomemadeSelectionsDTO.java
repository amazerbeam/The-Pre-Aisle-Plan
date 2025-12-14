package com.foodbytes.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.util.Map;

/**
 * FR-089: DTO for passing homemade/store-bought selections to shopping list.
 * Structure: { parentRecipeId: { extraRecipeId: isHomemade } }
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class HomemadeSelectionsDTO {

    /**
     * Map of parentRecipeId -> (extraRecipeId -> isHomemade)
     * Example: { "100": { "101": true, "102": false } }
     * true = homemade (add ingredients), false = store-bought (add single item)
     */
    private Map<Long, Map<Long, Boolean>> selections;
}
