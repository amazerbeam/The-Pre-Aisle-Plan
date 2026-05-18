package com.foodbytes.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;
import java.util.ArrayList;

/**
 * FR-086: Tree node for recipe extras hierarchy.
 * Used in the homemade selection popup to display nested checkboxes.
 * Example: Pizza Sauce (this node) -> children: [Pesto]
 *
 * FR-103: Added storeBoughtIngredientId for extras with store-bought option.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RecipeExtraNodeDTO {
    private Long recipeId;
    private String recipeName;
    private Integer displayOrder;

    // FR-103: If set, this extra has a store-bought option
    // When store-bought is selected, use this ingredient instead of processing the linked recipe
    private Long storeBoughtIngredientId;

    @Builder.Default
    private List<RecipeExtraNodeDTO> children = new ArrayList<>();
}
