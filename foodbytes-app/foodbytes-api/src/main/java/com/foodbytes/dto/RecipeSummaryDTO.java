package com.foodbytes.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;
import java.util.List;

/**
 * FR-102: Lightweight recipe DTO for list views.
 * Contains only summary data needed for recipe cards.
 * Full recipe data (ingredients, steps) fetched separately via getRecipeById.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RecipeSummaryDTO {
    private Long id;
    private String name;
    private Integer defaultServings;
    private Integer calories;
    private Boolean isCheat;
    private List<String> mealTypes;

    // FR-043: Recipe variant info (null if recipe is not part of a family)
    private String variantLabel;           // e.g., "Vegetarian" (null for non-family or default)
    private Boolean isDefault;             // FR-099: Whether this is the default variant
    private List<RecipeVariantDTO> variants;  // All variants in the family (empty if not in family)

    // FR-086: Quick flag for UI to show extras popup
    private Boolean hasExtras;
}
