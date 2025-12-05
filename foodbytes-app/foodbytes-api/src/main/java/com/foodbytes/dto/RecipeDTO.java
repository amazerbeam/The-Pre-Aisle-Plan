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
    private List<String> steps;

    // FR-043: Recipe variant info (null if recipe is not part of a family)
    private String variantLabel;           // e.g., "Vegetarian" (null for non-family or default)
    private List<RecipeVariantDTO> variants;  // All variants in the family (empty if not in family)
}
