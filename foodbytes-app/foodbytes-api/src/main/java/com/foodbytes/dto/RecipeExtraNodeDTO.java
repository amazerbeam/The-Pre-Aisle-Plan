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
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RecipeExtraNodeDTO {
    private Long recipeId;
    private String recipeName;
    private Integer displayOrder;

    @Builder.Default
    private List<RecipeExtraNodeDTO> children = new ArrayList<>();
}
