package com.foodbytes.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

/**
 * FR-043: DTO for a single recipe variant in a family.
 * Used in the dropdown menu on recipe cards.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class RecipeVariantDTO {
    private Long recipeId;
    private String recipeName;
    private String variantLabel;    // e.g., "Vegetarian", "Vegan", "Low-Carb"
    private Boolean isDefault;
    private Integer displayOrder;
}
