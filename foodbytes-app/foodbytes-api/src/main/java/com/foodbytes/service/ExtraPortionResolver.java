package com.foodbytes.service;

import com.foodbytes.model.Recipe;
import com.foodbytes.model.RecipeIngredient;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import java.math.BigDecimal;
import java.math.RoundingMode;

/**
 * MPP-1 / MPP-10: how much of a linked-recipe extra a parent uses, shared by the shopping list
 * (ShoppingListService) and the Manage extras popup (ManageExtrasService) so the two can never
 * disagree. Moved verbatim from ShoppingListService; mirrors
 * MacroCalculationService#calculateLinkedRecipeMacros.
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class ExtraPortionResolver {

    private final MacroCalculationService macroCalculationService;

    /**
     * MPP-1: How much of a linked-recipe extra is needed at the current scale, expressed as a
     * fraction of the CHILD recipe's own total yield. Mirrors
     * {@link MacroCalculationService#calculateLinkedRecipeMacros} so the shopping list and the
     * macro traffic light agree on what "using 400g of an 8-serving batch" means.
     *
     * <p>usedGrams = parentRecipe's own recipe_ingredients.quantity_grams for this link, scaled
     * by however much of the PARENT's own batch is needed (parentRatio). portionRatio =
     * usedGrams / childRecipe's total yield.
     *
     * @return the ratio to apply to childRecipe's own ingredient quantities, or ZERO if
     *         parentRecipe has no matching linked_recipe_id row for childRecipeId, or
     *         childRecipe's total yield is zero — both are data-integrity states (see
     *         linked-recipe-extras.md), not recoverable runtime states.
     */
    public BigDecimal resolveExtraPortionRatio(Recipe parentRecipe, Long childRecipeId,
                                                BigDecimal parentRatio, Recipe childRecipe) {
        BigDecimal linkQuantityGrams = findLinkedQuantityGrams(parentRecipe, childRecipeId);
        if (linkQuantityGrams == null) {
            // Null-safe: linkQuantityGrams can be null either because no matching linked_recipe_id
            // row was found on a non-null parentRecipe, or because parentRecipe itself was null —
            // don't let the diagnostic log NPE on the very case it's meant to surface.
            log.warn("No recipe_ingredients row on recipe {} links to extra recipe {}; " +
                     "cannot prorate its raw ingredients for the shopping list.",
                     parentRecipe != null ? parentRecipe.getId() : "?", childRecipeId);
            return BigDecimal.ZERO;
        }

        BigDecimal usedGrams = linkQuantityGrams.multiply(parentRatio);
        BigDecimal totalYield = macroCalculationService.calculateRecipeTotalYield(childRecipe);
        if (totalYield.compareTo(BigDecimal.ZERO) <= 0) {
            log.warn("Extra recipe {} has 0 total yield; cannot prorate its raw ingredients.", childRecipeId);
            return BigDecimal.ZERO;
        }

        return usedGrams.divide(totalYield, 10, RoundingMode.HALF_UP);
    }

    /**
     * MPP-1: Find parentRecipe's own recipe_ingredients row with linked_recipe_id = childRecipeId
     * and return its quantity_grams — the "how much of the child is used" figure needed to
     * prorate the child's own raw ingredients. Returns null if no such row exists.
     */
    public BigDecimal findLinkedQuantityGrams(Recipe parentRecipe, Long childRecipeId) {
        if (parentRecipe == null || parentRecipe.getIngredients() == null) {
            return null;
        }
        for (RecipeIngredient ri : parentRecipe.getIngredients()) {
            if (ri.isLinkedRecipe() && ri.getLinkedRecipe().getId().equals(childRecipeId)) {
                return ri.getQuantityGrams();
            }
        }
        return null;
    }

    /**
     * MPP-10: grams of childRecipeId consumed at the current scale - the parent's own
     * recipe_ingredients.quantity_grams for that link x parentRatio. This is the figure a
     * store-bought product is listed in, and the "N g" shown in the Manage extras popup.
     *
     * @return null when parentRecipe has no linked_recipe_id row for childRecipeId
     */
    public BigDecimal usedGrams(Recipe parentRecipe, Long childRecipeId, BigDecimal parentRatio) {
        BigDecimal linkQuantityGrams = findLinkedQuantityGrams(parentRecipe, childRecipeId);
        return linkQuantityGrams == null ? null : linkQuantityGrams.multiply(parentRatio);
    }
}
