package com.foodbytes.service;

import com.foodbytes.model.Recipe;
import com.foodbytes.model.RecipeIngredient;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

/**
 * FR-080, FR-081, FR-082, FR-084, FR-094: Service for calculating macronutrient data.
 * Provides methods for calculating recipe, daily, and weekly macro totals.
 *
 * FR-084: Uses quantity_grams (not display quantity) for accurate macro calculation.
 * FR-094: Supports linked recipe macro calculation with recursive depth-first traversal.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class MacroCalculationService {

    /**
     * FR-080, FR-084, FR-094: Calculate per-serving macros for a recipe.
     * Formula: SUM(ingredient.macro_per_100g * quantity_grams / 100) / default_servings
     *
     * FR-084: Uses quantity_grams (weight in grams) for accurate calculation
     * regardless of display unit (cups, tbsp, pieces, etc.).
     *
     * FR-094: For linked recipe ingredients, calculates proportional macros
     * based on quantity_grams / linked_recipe_total_yield.
     *
     * @param recipe Recipe entity with ingredients loaded
     * @return int array [protein, carbs, fat] per serving (rounded to whole numbers)
     */
    public int[] calculatePerServingMacros(Recipe recipe) {
        if (recipe == null || recipe.getDefaultServings() == null || recipe.getDefaultServings() == 0) {
            return new int[]{0, 0, 0};
        }

        // FR-094: Track visited recipes to prevent infinite recursion in circular references
        Set<Long> visitedRecipeIds = new HashSet<>();
        BigDecimal[] totalMacros = calculateRecipeTotalMacros(recipe, visitedRecipeIds);

        // Divide by servings to get per-serving values
        BigDecimal servings = BigDecimal.valueOf(recipe.getDefaultServings());
        BigDecimal proteinPerServing = totalMacros[0].divide(servings, 2, RoundingMode.HALF_UP);
        BigDecimal carbsPerServing = totalMacros[1].divide(servings, 2, RoundingMode.HALF_UP);
        BigDecimal fatPerServing = totalMacros[2].divide(servings, 2, RoundingMode.HALF_UP);

        return new int[]{
            proteinPerServing.setScale(0, RoundingMode.HALF_UP).intValue(),
            carbsPerServing.setScale(0, RoundingMode.HALF_UP).intValue(),
            fatPerServing.setScale(0, RoundingMode.HALF_UP).intValue()
        };
    }

    /**
     * Atwater factors. Mirrors client/src/constants/macroTargets.js -> KCAL_PER_GRAM
     * so the backend figure and the frontend traffic-light denominator cannot diverge.
     */
    private static final BigDecimal KCAL_PER_G_PROTEIN = BigDecimal.valueOf(4);
    private static final BigDecimal KCAL_PER_G_CARBS = BigDecimal.valueOf(4);
    private static final BigDecimal KCAL_PER_G_FAT = BigDecimal.valueOf(9);

    /**
     * kcal from a macro triple: 4P + 4C + 9F.
     *
     * Deliberately applied to the UNROUNDED BigDecimal totals. Rounding the three
     * macros to whole grams first injects up to ~7 kcal of error, and `ingredients`
     * carries no calorie column, so Atwater factors are the only available basis.
     *
     * @param macros BigDecimal array [protein, carbs, fat]
     * @return kcal, unrounded
     */
    public BigDecimal deriveKcal(BigDecimal[] macros) {
        if (macros == null || macros.length != 3) {
            return BigDecimal.ZERO;
        }
        BigDecimal protein = macros[0] == null ? BigDecimal.ZERO : macros[0];
        BigDecimal carbs = macros[1] == null ? BigDecimal.ZERO : macros[1];
        BigDecimal fat = macros[2] == null ? BigDecimal.ZERO : macros[2];

        return protein.multiply(KCAL_PER_G_PROTEIN)
            .add(carbs.multiply(KCAL_PER_G_CARBS))
            .add(fat.multiply(KCAL_PER_G_FAT));
    }

    /**
     * Whole-recipe kcal derived from raw ingredients plus prorated linked extras.
     *
     * This is the value RecipeDTO.calories and RecipeSummaryDTO.calories carry —
     * whole-recipe, NOT per-serving, because the frontend divides by defaultServings.
     * Replaces reads of the stored recipes.calories column, which on 20 of 48 recipes
     * with extras was entered on the store-bought basis (see the plan folder's findings.md).
     */
    public int calculateRecipeTotalCalories(Recipe recipe) {
        if (recipe == null) {
            return 0;
        }
        warnIfIngredientsMissing(recipe);
        BigDecimal[] totals = calculateRecipeTotalMacros(recipe, new HashSet<>());
        return deriveKcal(totals).setScale(0, RoundingMode.HALF_UP).intValue();
    }

    /**
     * Per-serving kcal = derived whole-recipe kcal / default_servings.
     *
     * Divides in BigDecimal, so 1025/2 is 513 rather than the 512 that
     * Integer/Integer division produced at the previous call sites.
     */
    public int calculateCaloriesPerServing(Recipe recipe) {
        if (recipe == null || recipe.getDefaultServings() == null || recipe.getDefaultServings() == 0) {
            return 0;
        }
        warnIfIngredientsMissing(recipe);
        BigDecimal[] totals = calculateRecipeTotalMacros(recipe, new HashSet<>());
        return deriveKcal(totals)
            .divide(BigDecimal.valueOf(recipe.getDefaultServings()), 4, RoundingMode.HALF_UP)
            .setScale(0, RoundingMode.HALF_UP)
            .intValue();
    }

    /**
     * A recipe with a null or empty ingredient collection now silently derives to
     * 0 kcal in place of whatever the stored recipes.calories column previously
     * showed. Unlike "derived kcal == 0" (a legitimately zero-macro recipe is not
     * a data bug and these methods run on every DTO assembly, so that condition
     * would flood the logs), an empty/null ingredient collection is a genuine data
     * signal worth one line. Checked directly on the collection, not on the
     * derived total, so it stays narrow.
     *
     * Called from both calculateRecipeTotalCalories and calculateCaloriesPerServing;
     * a request that calls both for the same recipe logs twice. Not deduplicated —
     * doing so cheaply would need request-scoped state this stateless service
     * doesn't have, and a duplicate warning is a smaller cost than that.
     */
    private void warnIfIngredientsMissing(Recipe recipe) {
        if (recipe.getIngredients() == null || recipe.getIngredients().isEmpty()) {
            log.warn("Recipe id {} ({}) has no ingredient rows; derived calories will be 0.",
                recipe.getId(), recipe.getName());
        }
    }

    /**
     * FR-094: Calculate total macros for a recipe (before dividing by servings).
     * Handles both raw ingredients and linked recipe ingredients recursively.
     *
     * @param recipe Recipe entity with ingredients loaded
     * @param visitedRecipeIds Set of already-visited recipe IDs (prevents infinite loops)
     * @return BigDecimal array [protein, carbs, fat] total macros
     */
    public BigDecimal[] calculateRecipeTotalMacros(Recipe recipe, Set<Long> visitedRecipeIds) {
        BigDecimal totalProtein = BigDecimal.ZERO;
        BigDecimal totalCarbs = BigDecimal.ZERO;
        BigDecimal totalFat = BigDecimal.ZERO;

        if (recipe == null || recipe.getIngredients() == null) {
            return new BigDecimal[]{totalProtein, totalCarbs, totalFat};
        }

        // FR-094: Guard genuine cycles only. The set tracks the CURRENT PATH, not
        // every recipe ever visited — ids are removed on the way back out (below).
        // A never-cleared set also zeroes legitimate repeats: one parent using the
        // same sub-recipe on two rows, or two sub-recipes sharing a grandchild.
        if (!visitedRecipeIds.add(recipe.getId())) {
            log.warn("Circular recipe reference detected for recipe ID: {}. Skipping to prevent infinite loop.", recipe.getId());
            return new BigDecimal[]{totalProtein, totalCarbs, totalFat};
        }

        try {
            for (RecipeIngredient ri : recipe.getIngredients()) {
                BigDecimal quantityGrams = ri.getQuantityGrams();
                if (quantityGrams == null) quantityGrams = BigDecimal.ZERO;

                // FR-094: Check if this is a linked recipe ingredient.
                // Tested BEFORE isRawIngredient() so an FR-103 dual-path row
                // (both ids set) always uses the homemade linked recipe and never
                // the store-bought ingredient — and never both.
                if (ri.isLinkedRecipe()) {
                    Recipe linkedRecipe = ri.getLinkedRecipe();
                    if (linkedRecipe != null) {
                        BigDecimal[] linkedMacros = calculateLinkedRecipeMacros(linkedRecipe, quantityGrams, visitedRecipeIds);
                        totalProtein = totalProtein.add(linkedMacros[0]);
                        totalCarbs = totalCarbs.add(linkedMacros[1]);
                        totalFat = totalFat.add(linkedMacros[2]);
                    }
                } else if (ri.isRawIngredient()) {
                    // FR-084: Calculate macros for raw ingredient
                    BigDecimal[] ingredientMacros = calculateRawIngredientMacros(ri, quantityGrams);
                    totalProtein = totalProtein.add(ingredientMacros[0]);
                    totalCarbs = totalCarbs.add(ingredientMacros[1]);
                    totalFat = totalFat.add(ingredientMacros[2]);
                }
            }

            return new BigDecimal[]{totalProtein, totalCarbs, totalFat};
        } finally {
            visitedRecipeIds.remove(recipe.getId());
        }
    }

    /**
     * FR-094: Calculate macros for a linked recipe based on portion used.
     *
     * Formula:
     * 1. Calculate linked recipe's total yield: SUM(quantity_grams) from all its ingredients
     * 2. Calculate linked recipe's total macros (recursive if it has linked ingredients)
     * 3. Calculate portion ratio: usedGrams / totalYield
     * 4. Apply ratio: linkedRecipeMacros * portionRatio
     *
     * @param linkedRecipe The linked recipe to calculate macros from
     * @param usedGrams How many grams of the linked recipe are used (from parent's quantity_grams)
     * @param visitedRecipeIds Set of already-visited recipe IDs (prevents infinite loops)
     * @return BigDecimal array [protein, carbs, fat] for the portion used
     */
    public BigDecimal[] calculateLinkedRecipeMacros(Recipe linkedRecipe, BigDecimal usedGrams, Set<Long> visitedRecipeIds) {
        BigDecimal zero = BigDecimal.ZERO;

        if (linkedRecipe == null || usedGrams == null || usedGrams.compareTo(zero) <= 0) {
            return new BigDecimal[]{zero, zero, zero};
        }

        // Step 1: Calculate linked recipe's total yield (sum of all ingredient quantity_grams)
        BigDecimal totalYield = calculateRecipeTotalYield(linkedRecipe);

        // Handle edge case: If linked recipe has 0 yield (no ingredients), return 0 macros
        if (totalYield.compareTo(zero) <= 0) {
            log.warn("Linked recipe ID {} has 0 total yield. Cannot calculate portion macros.", linkedRecipe.getId());
            return new BigDecimal[]{zero, zero, zero};
        }

        // Step 2: Calculate linked recipe's total macros (recursive)
        BigDecimal[] linkedTotalMacros = calculateRecipeTotalMacros(linkedRecipe, visitedRecipeIds);

        // Step 3: Calculate portion ratio
        BigDecimal portionRatio = usedGrams.divide(totalYield, 10, RoundingMode.HALF_UP);

        // Step 4: Apply ratio to get portion macros
        BigDecimal portionProtein = linkedTotalMacros[0].multiply(portionRatio).setScale(4, RoundingMode.HALF_UP);
        BigDecimal portionCarbs = linkedTotalMacros[1].multiply(portionRatio).setScale(4, RoundingMode.HALF_UP);
        BigDecimal portionFat = linkedTotalMacros[2].multiply(portionRatio).setScale(4, RoundingMode.HALF_UP);

        log.debug("Linked recipe {} ({}g of {}g = {}%): protein={}, carbs={}, fat={}",
            linkedRecipe.getName(), usedGrams, totalYield,
            portionRatio.multiply(BigDecimal.valueOf(100)).setScale(2, RoundingMode.HALF_UP),
            portionProtein, portionCarbs, portionFat);

        return new BigDecimal[]{portionProtein, portionCarbs, portionFat};
    }

    /**
     * FR-094: Calculate the total yield (weight in grams) of a recipe.
     * Total yield = SUM(quantity_grams) from all recipe_ingredients.
     *
     * For linked ingredients, their quantity_grams represents the portion used,
     * not the raw ingredient weight. This is correct because quantity_grams
     * always represents "how much of this item goes into the recipe".
     *
     * @param recipe Recipe entity with ingredients loaded
     * @return BigDecimal total yield in grams
     */
    public BigDecimal calculateRecipeTotalYield(Recipe recipe) {
        if (recipe == null || recipe.getIngredients() == null) {
            return BigDecimal.ZERO;
        }

        BigDecimal totalYield = BigDecimal.ZERO;
        for (RecipeIngredient ri : recipe.getIngredients()) {
            BigDecimal quantityGrams = ri.getQuantityGrams();
            if (quantityGrams != null) {
                totalYield = totalYield.add(quantityGrams);
            }
        }

        return totalYield;
    }

    /**
     * FR-084: Calculate macros for a raw ingredient based on quantity_grams.
     * Formula: (macro_per_100g * quantity_grams) / 100
     *
     * @param ri RecipeIngredient with raw ingredient
     * @param quantityGrams Weight in grams
     * @return BigDecimal array [protein, carbs, fat]
     */
    private BigDecimal[] calculateRawIngredientMacros(RecipeIngredient ri, BigDecimal quantityGrams) {
        BigDecimal zero = BigDecimal.ZERO;

        if (ri.getIngredient() == null) {
            return new BigDecimal[]{zero, zero, zero};
        }

        BigDecimal proteinPer100g = ri.getIngredient().getProteinPer100g();
        BigDecimal carbsPer100g = ri.getIngredient().getCarbsPer100g();
        BigDecimal fatPer100g = ri.getIngredient().getFatPer100g();

        if (proteinPer100g == null) proteinPer100g = zero;
        if (carbsPer100g == null) carbsPer100g = zero;
        if (fatPer100g == null) fatPer100g = zero;

        BigDecimal ingredientProtein = proteinPer100g
            .multiply(quantityGrams)
            .divide(BigDecimal.valueOf(100), 4, RoundingMode.HALF_UP);

        BigDecimal ingredientCarbs = carbsPer100g
            .multiply(quantityGrams)
            .divide(BigDecimal.valueOf(100), 4, RoundingMode.HALF_UP);

        BigDecimal ingredientFat = fatPer100g
            .multiply(quantityGrams)
            .divide(BigDecimal.valueOf(100), 4, RoundingMode.HALF_UP);

        return new BigDecimal[]{ingredientProtein, ingredientCarbs, ingredientFat};
    }

    /**
     * FR-081: Calculate total macros for a list of recipes (daily total).
     * Sums per-serving macros from all recipes.
     *
     * @param recipes List of Recipe entities
     * @return int array [protein, carbs, fat] totals (rounded to whole numbers)
     */
    public int[] calculateTotalMacros(List<Recipe> recipes) {
        BigDecimal totalProtein = BigDecimal.ZERO;
        BigDecimal totalCarbs = BigDecimal.ZERO;
        BigDecimal totalFat = BigDecimal.ZERO;

        if (recipes != null) {
            for (Recipe recipe : recipes) {
                if (recipe == null || recipe.getDefaultServings() == null || recipe.getDefaultServings() == 0) {
                    continue;
                }
                // Accumulate UNROUNDED per-serving values: rounding each recipe to whole
                // grams first loses up to 0.5 g per macro per meal, which compounds
                // across 21 meals in the weekly summary.
                BigDecimal[] totals = calculateRecipeTotalMacros(recipe, new HashSet<>());
                BigDecimal servings = BigDecimal.valueOf(recipe.getDefaultServings());
                totalProtein = totalProtein.add(totals[0].divide(servings, 4, RoundingMode.HALF_UP));
                totalCarbs = totalCarbs.add(totals[1].divide(servings, 4, RoundingMode.HALF_UP));
                totalFat = totalFat.add(totals[2].divide(servings, 4, RoundingMode.HALF_UP));
            }
        }

        return new int[]{
            totalProtein.setScale(0, RoundingMode.HALF_UP).intValue(),
            totalCarbs.setScale(0, RoundingMode.HALF_UP).intValue(),
            totalFat.setScale(0, RoundingMode.HALF_UP).intValue()
        };
    }

    /**
     * FR-082: Calculate weekly macro totals from daily totals.
     *
     * @param dailyMacros List of int arrays [protein, carbs, fat] (one per day)
     * @return int array [protein, carbs, fat] weekly totals
     */
    public int[] calculateWeeklyTotals(List<int[]> dailyMacros) {
        int totalProtein = 0;
        int totalCarbs = 0;
        int totalFat = 0;

        if (dailyMacros != null) {
            for (int[] daily : dailyMacros) {
                if (daily != null && daily.length == 3) {
                    totalProtein += daily[0];
                    totalCarbs += daily[1];
                    totalFat += daily[2];
                }
            }
        }

        return new int[]{totalProtein, totalCarbs, totalFat};
    }

    /**
     * FR-082: Calculate daily average macros (based on days with meals only).
     *
     * @param weeklyTotals int array [protein, carbs, fat] weekly totals
     * @param daysWithMeals Number of days that have at least one meal
     * @return int array [protein, carbs, fat] daily averages
     */
    public int[] calculateDailyAverages(int[] weeklyTotals, int daysWithMeals) {
        if (daysWithMeals == 0 || weeklyTotals == null || weeklyTotals.length != 3) {
            return new int[]{0, 0, 0};
        }

        int avgProtein = Math.round((float) weeklyTotals[0] / daysWithMeals);
        int avgCarbs = Math.round((float) weeklyTotals[1] / daysWithMeals);
        int avgFat = Math.round((float) weeklyTotals[2] / daysWithMeals);

        return new int[]{avgProtein, avgCarbs, avgFat};
    }
}
