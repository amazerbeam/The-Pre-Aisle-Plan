package com.foodbytes.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class RecipeDTO {
    private Long id;
    private String name;
    private Integer defaultServings;
    private Integer calories;
    private Boolean isCheat;
    private List<String> mealTypes;
    private List<IngredientDTO> ingredients;

    // FR-091: Updated to include linked recipe info for navigation
    private List<RecipeStepViewDTO> steps;

    // FR-043: Recipe variant info (null if recipe is not part of a family)
    private String variantLabel;           // e.g., "Vegetarian" (null for non-family or default)
    private List<RecipeVariantDTO> variants;  // All variants in the family (empty if not in family)

    // FR-086: Linked extras (sub-recipes) info
    private Boolean hasExtras;                    // Quick flag for UI to show popup
    private List<RecipeExtraNodeDTO> extras;      // Hierarchical tree of linked extras
}
