package com.foodbytes.service;

import com.foodbytes.model.Recipe;
import com.foodbytes.model.RecipeIngredient;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;

/**
 * FR-080, FR-081, FR-082, FR-084: Service for calculating macronutrient data.
 * Provides methods for calculating recipe, daily, and weekly macro totals.
 *
 * FR-084: Uses quantity_grams (not display quantity) for accurate macro calculation.
 */
@Service
@RequiredArgsConstructor
public class MacroCalculationService {

    /**
     * FR-080, FR-084: Calculate per-serving macros for a recipe.
     * Formula: SUM(ingredient.macro_per_100g * quantity_grams / 100) / default_servings
     *
     * FR-084: Uses quantity_grams (weight in grams) for accurate calculation
     * regardless of display unit (cups, tbsp, pieces, etc.).
     *
     * @param recipe Recipe entity with ingredients loaded
     * @return int array [protein, carbs, fat] per serving (rounded to whole numbers)
     */
    public int[] calculatePerServingMacros(Recipe recipe) {
        if (recipe == null || recipe.getDefaultServings() == null || recipe.getDefaultServings() == 0) {
            return new int[]{0, 0, 0};
        }

        BigDecimal totalProtein = BigDecimal.ZERO;
        BigDecimal totalCarbs = BigDecimal.ZERO;
        BigDecimal totalFat = BigDecimal.ZERO;

        if (recipe.getIngredients() != null) {
            for (RecipeIngredient ri : recipe.getIngredients()) {
                if (ri.getIngredient() == null) continue;

                // FR-084: Use quantity_grams for calculation (not display quantity)
                BigDecimal quantityGrams = ri.getQuantityGrams();
                if (quantityGrams == null) quantityGrams = BigDecimal.ZERO;

                // Get macros from ingredient (per 100g)
                BigDecimal proteinPer100g = ri.getIngredient().getProteinPer100g();
                BigDecimal carbsPer100g = ri.getIngredient().getCarbsPer100g();
                BigDecimal fatPer100g = ri.getIngredient().getFatPer100g();

                if (proteinPer100g == null) proteinPer100g = BigDecimal.ZERO;
                if (carbsPer100g == null) carbsPer100g = BigDecimal.ZERO;
                if (fatPer100g == null) fatPer100g = BigDecimal.ZERO;

                // FR-084: Calculate macros: (macro_per_100g * quantity_grams) / 100
                BigDecimal ingredientProtein = proteinPer100g
                    .multiply(quantityGrams)
                    .divide(BigDecimal.valueOf(100), 4, RoundingMode.HALF_UP);

                BigDecimal ingredientCarbs = carbsPer100g
                    .multiply(quantityGrams)
                    .divide(BigDecimal.valueOf(100), 4, RoundingMode.HALF_UP);

                BigDecimal ingredientFat = fatPer100g
                    .multiply(quantityGrams)
                    .divide(BigDecimal.valueOf(100), 4, RoundingMode.HALF_UP);

                totalProtein = totalProtein.add(ingredientProtein);
                totalCarbs = totalCarbs.add(ingredientCarbs);
                totalFat = totalFat.add(ingredientFat);
            }
        }

        // Divide by servings to get per-serving values
        BigDecimal servings = BigDecimal.valueOf(recipe.getDefaultServings());
        BigDecimal proteinPerServing = totalProtein.divide(servings, 2, RoundingMode.HALF_UP);
        BigDecimal carbsPerServing = totalCarbs.divide(servings, 2, RoundingMode.HALF_UP);
        BigDecimal fatPerServing = totalFat.divide(servings, 2, RoundingMode.HALF_UP);

        return new int[]{
            proteinPerServing.setScale(0, RoundingMode.HALF_UP).intValue(),
            carbsPerServing.setScale(0, RoundingMode.HALF_UP).intValue(),
            fatPerServing.setScale(0, RoundingMode.HALF_UP).intValue()
        };
    }

    /**
     * FR-081: Calculate total macros for a list of recipes (daily total).
     * Sums per-serving macros from all recipes.
     *
     * @param recipes List of Recipe entities
     * @return int array [protein, carbs, fat] totals (rounded to whole numbers)
     */
    public int[] calculateTotalMacros(List<Recipe> recipes) {
        int totalProtein = 0;
        int totalCarbs = 0;
        int totalFat = 0;

        if (recipes != null) {
            for (Recipe recipe : recipes) {
                int[] recipeMacros = calculatePerServingMacros(recipe);
                totalProtein += recipeMacros[0];
                totalCarbs += recipeMacros[1];
                totalFat += recipeMacros[2];
            }
        }

        return new int[]{totalProtein, totalCarbs, totalFat};
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
