package com.foodbytes.service;

import com.foodbytes.dto.RecipeVariantDTO;
import com.foodbytes.model.Recipe;
import com.foodbytes.model.RecipeFamilyMember;

/** FR-043: the one place a family member becomes a variant DTO (kcal + macros, homemade basis). */
final class RecipeVariantMapper {

    private RecipeVariantMapper() {
    }

    static RecipeVariantDTO toDto(RecipeFamilyMember member, MacroCalculationService macros) {
        Recipe recipe = member.getRecipe();
        // BigDecimal division inside the service: the Integer/Integer form truncated (1025/2 gave 512, not 513).
        Integer caloriesPerServing = macros.calculateCaloriesPerServing(recipe);
        int[] perServing = macros.calculatePerServingMacros(recipe);   // [protein, carbs, fat] grams
        int protein = perServing[0];
        int carbs = perServing[1];
        int fat = perServing[2];
        return new RecipeVariantDTO(
            recipe.getId(),
            recipe.getName(),
            member.getVariantLabel(),
            member.getIsDefault(),
            member.getDisplayOrder(),
            caloriesPerServing,
            protein, carbs, fat
        );
    }
}
