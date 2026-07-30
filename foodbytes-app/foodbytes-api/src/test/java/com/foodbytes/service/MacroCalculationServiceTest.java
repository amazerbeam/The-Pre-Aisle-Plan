package com.foodbytes.service;

import com.foodbytes.model.Ingredient;
import com.foodbytes.model.Recipe;
import com.foodbytes.model.RecipeIngredient;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.within;

/**
 * Unit tests for the linked-recipe extras maths (FR-084, FR-094).
 *
 * The invariant these tests exist to protect: nutrition ALWAYS comes from the
 * homemade linked recipe, never from the store-bought ingredient on an FR-103
 * dual-path row. That currently holds only because calculateRecipeTotalMacros
 * tests isLinkedRecipe() before isRawIngredient() — an untested branch order
 * that 38 of 64 linked rows in production depend on.
 */
class MacroCalculationServiceTest {

    private MacroCalculationService service;

    @BeforeEach
    void setUp() {
        service = new MacroCalculationService();
    }

    // ---- fixture helpers ----

    private Ingredient ingredient(String name, double protein, double carbs, double fat) {
        Ingredient i = new Ingredient();
        i.setName(name);
        i.setProteinPer100g(BigDecimal.valueOf(protein));
        i.setCarbsPer100g(BigDecimal.valueOf(carbs));
        i.setFatPer100g(BigDecimal.valueOf(fat));
        return i;
    }

    private Recipe recipe(long id, String name, int servings) {
        Recipe r = new Recipe();
        r.setId(id);
        r.setName(name);
        r.setDefaultServings(servings);
        r.setIngredients(new ArrayList<>());
        return r;
    }

    private RecipeIngredient rawRow(Recipe parent, Ingredient ing, double grams) {
        RecipeIngredient ri = new RecipeIngredient();
        ri.setRecipe(parent);
        ri.setIngredient(ing);
        ri.setQuantityGrams(BigDecimal.valueOf(grams));
        parent.getIngredients().add(ri);
        return ri;
    }

    private RecipeIngredient linkedRow(Recipe parent, Recipe child, double grams) {
        RecipeIngredient ri = new RecipeIngredient();
        ri.setRecipe(parent);
        ri.setLinkedRecipe(child);
        ri.setQuantityGrams(BigDecimal.valueOf(grams));
        parent.getIngredients().add(ri);
        return ri;
    }

    /** Child: 100 g of flour-like ingredient. Yield 100 g, macros 10/70/2, 338 kcal. */
    private Recipe childBatch() {
        Recipe child = recipe(2L, "Child Batch", 1);
        rawRow(child, ingredient("Bread flour", 10, 70, 2), 100);
        return child;
    }

    /** Parent: 50 g of childBatch + 100 g chicken. Whole totals 35/35/4, 316 kcal, serves 2. */
    private Recipe parentUsingHalfTheBatch() {
        Recipe parent = recipe(1L, "Parent Dish", 2);
        linkedRow(parent, childBatch(), 50);
        rawRow(parent, ingredient("Chicken breast", 30, 0, 3), 100);
        return parent;
    }

    // ---- baseline: proration is applied ----

    @Test
    void linkedRecipeContributesProratedPortionNotItsWholeBatch() {
        BigDecimal[] totals = service.calculateRecipeTotalMacros(
                parentUsingHalfTheBatch(), new HashSet<>());

        // 50 g of a 100 g batch = half of 10/70/2, plus the raw 30/0/3
        assertThat(totals[0].doubleValue()).isEqualTo(35.0);
        assertThat(totals[1].doubleValue()).isEqualTo(35.0);
        assertThat(totals[2].doubleValue()).isEqualTo(4.0);
    }

    @Test
    void perServingMacrosDivideByDefaultServings() {
        int[] macros = service.calculatePerServingMacros(parentUsingHalfTheBatch());

        assertThat(macros).containsExactly(18, 18, 2);   // 17.5 / 17.5 / 2.0 rounded HALF_UP
    }

    @Test
    void totalYieldSumsEveryRowIncludingLinkedPortions() {
        assertThat(service.calculateRecipeTotalYield(parentUsingHalfTheBatch()).doubleValue())
                .isEqualTo(150.0);   // 50 g linked portion + 100 g chicken
    }

    // ---- the load-bearing invariant: homemade wins on a dual-path row ----

    @Test
    void dualPathRowUsesHomemadeLinkedRecipeAndIgnoresStoreBoughtIngredient() {
        Recipe parent = recipe(1L, "Parent Dish", 2);
        // FR-103: both set. The store-bought ingredient is deliberately absurd
        // so that any leakage into the result is unmistakable.
        RecipeIngredient dual = linkedRow(parent, childBatch(), 50);
        dual.setIngredient(ingredient("Store-bought Batch", 0, 0, 50));

        BigDecimal[] totals = service.calculateRecipeTotalMacros(parent, new HashSet<>());

        // Homemade only: half of 10/70/2. Nothing from the 0/0/50 store-bought row,
        // and not both added together either.
        assertThat(totals[0].doubleValue()).isEqualTo(5.0);
        assertThat(totals[1].doubleValue()).isEqualTo(35.0);
        assertThat(totals[2].doubleValue()).isEqualTo(1.0);
    }

    // ---- documented edge cases ----

    @Test
    void linkedRecipeWithZeroYieldContributesNothing() {
        Recipe parent = recipe(1L, "Parent Dish", 2);
        linkedRow(parent, recipe(2L, "Empty Batch", 1), 50);   // child has no ingredient rows

        BigDecimal[] totals = service.calculateRecipeTotalMacros(parent, new HashSet<>());

        assertThat(totals[0].doubleValue()).isEqualTo(0.0);
        assertThat(totals[1].doubleValue()).isEqualTo(0.0);
        assertThat(totals[2].doubleValue()).isEqualTo(0.0);
    }

    @Test
    void nullRecipeAndZeroServingsReturnZeroInsteadOfThrowing() {
        assertThat(service.calculatePerServingMacros(null)).containsExactly(0, 0, 0);

        Recipe noServings = recipe(1L, "Broken", 0);
        assertThat(service.calculatePerServingMacros(noServings)).containsExactly(0, 0, 0);
    }

    // ---- derived calories (4P + 4C + 9F on unrounded totals) ----

    @Test
    void wholeRecipeCaloriesDeriveFromIngredientsPlusProratedExtras() {
        // 4(35) + 4(35) + 9(4) = 140 + 140 + 36 = 316
        assertThat(service.calculateRecipeTotalCalories(parentUsingHalfTheBatch()))
                .isEqualTo(316);
    }

    @Test
    void perServingCaloriesDivideWholeRecipeByServings() {
        // 316 / 2 = 158
        assertThat(service.calculateCaloriesPerServing(parentUsingHalfTheBatch()))
                .isEqualTo(158);
    }

    @Test
    void perServingCaloriesDoNotTruncateOnOddTotals() {
        // Single 100 g row at 1/0/0 -> 4 kcal whole, 3 servings -> 1.33 -> 1 (not floor-of-int-division
        // on a pre-rounded value). Guards the Integer/Integer truncation this change removes.
        Recipe odd = recipe(1L, "Odd", 3);
        rawRow(odd, ingredient("Trace", 1, 0, 0), 100);

        assertThat(service.calculateCaloriesPerServing(odd)).isEqualTo(1);
    }

    @Test
    void derivedCaloriesUseHomemadePathOnDualPathRows() {
        Recipe parent = recipe(1L, "Parent Dish", 2);
        RecipeIngredient dual = linkedRow(parent, childBatch(), 50);
        dual.setIngredient(ingredient("Store-bought Batch", 0, 0, 50));

        // Homemade: 4(5) + 4(35) + 9(1) = 20 + 140 + 9 = 169.
        // Store-bought would have been 9 * 25 = 225 for that row.
        assertThat(service.calculateRecipeTotalCalories(parent)).isEqualTo(169);
    }

    @Test
    void caloriesReturnZeroForNullRecipeOrZeroServings() {
        assertThat(service.calculateRecipeTotalCalories(null)).isEqualTo(0);
        assertThat(service.calculateCaloriesPerServing(null)).isEqualTo(0);
        assertThat(service.calculateCaloriesPerServing(recipe(1L, "Broken", 0))).isEqualTo(0);
    }

    // ---- cycle guard must cut cycles, not legitimate repeats ----

    @Test
    void sameSubRecipeUsedOnTwoRowsIsCountedTwice() {
        Recipe child = childBatch();
        Recipe parent = recipe(1L, "Parent Dish", 2);
        linkedRow(parent, child, 50);
        linkedRow(parent, child, 50);   // e.g. dough for two bases, as two rows

        BigDecimal[] totals = service.calculateRecipeTotalMacros(parent, new HashSet<>());

        // Two 50 g portions of a 100 g batch = the whole batch: 10/70/2.
        // The never-cleared visited set silently zeroed the second row.
        assertThat(totals[0].doubleValue()).isEqualTo(10.0);
        assertThat(totals[1].doubleValue()).isEqualTo(70.0);
        assertThat(totals[2].doubleValue()).isEqualTo(2.0);
    }

    @Test
    void twoSubRecipesSharingAGrandchildBothCountIt() {
        Recipe grandchild = recipe(3L, "Shared Base", 1);
        rawRow(grandchild, ingredient("Bread flour", 10, 70, 2), 100);

        Recipe childA = recipe(4L, "Component A", 1);
        linkedRow(childA, grandchild, 100);          // A is 100 g, all of it grandchild

        Recipe childB = recipe(5L, "Component B", 1);
        linkedRow(childB, grandchild, 100);          // B likewise

        Recipe parent = recipe(1L, "Parent Dish", 2);
        linkedRow(parent, childA, 100);
        linkedRow(parent, childB, 100);

        BigDecimal[] totals = service.calculateRecipeTotalMacros(parent, new HashSet<>());

        // Diamond: both branches must contribute a full 10/70/2.
        assertThat(totals[0].doubleValue()).isEqualTo(20.0);
        assertThat(totals[1].doubleValue()).isEqualTo(140.0);
        assertThat(totals[2].doubleValue()).isEqualTo(4.0);
    }

    @Test
    void genuineCycleIsCutAndDoesNotRecurseForever() {
        Recipe parent = recipe(1L, "Parent Dish", 2);
        Recipe child = recipe(2L, "Cyclic Child", 1);
        rawRow(child, ingredient("Bread flour", 10, 70, 2), 100);
        linkedRow(child, parent, 50);       // child links back to parent
        linkedRow(parent, child, 100);

        BigDecimal[] totals = service.calculateRecipeTotalMacros(parent, new HashSet<>());

        // Terminates, and the child's own 100 g of flour is counted once.
        // 100 g of child's 150 g yield = 2/3 of 10/70/2.
        assertThat(totals[0].doubleValue()).isCloseTo(6.6667, within(0.001));
        assertThat(totals[1].doubleValue()).isCloseTo(46.6667, within(0.001));
        assertThat(totals[2].doubleValue()).isCloseTo(1.3333, within(0.001));
    }

    @Test
    void legitimateRepeatSurvivesAlongsideAGenuineCycleInTheSameTraversal() {
        // Child links back to Parent (a genuine cycle, cut by the guard) AND Parent
        // uses Child on TWO separate rows (a legitimate repeat, must count twice).
        // Unlike genuineCycleIsCutAndDoesNotRecurseForever above -- whose cycle only
        // ever revisits the parent's own id, so no sibling branch ever needs that id
        // back -- this fixture makes the pre-fix "add, never remove" guard and the
        // post-fix path-scoped guard disagree.
        Recipe parent = recipe(1L, "Parent Dish", 2);
        Recipe child = recipe(2L, "Cyclic Child", 1);
        rawRow(child, ingredient("Bread flour", 10, 70, 2), 100);
        linkedRow(child, parent, 50);   // cycle: child links back to parent
        linkedRow(parent, child, 100);  // parent's FIRST use of child
        linkedRow(parent, child, 100);  // parent's SECOND use of child (legitimate repeat)

        BigDecimal[] totals = service.calculateRecipeTotalMacros(parent, new HashSet<>());

        // Arithmetic, worked by hand:
        //   child's own yield        = 100 g (raw) + 50 g (linked back to parent) = 150 g
        //   child's own macros       = raw 10/70/2 (100 g @ 10/70/2 per 100 g)
        //                              + the linked-back-to-parent row, which
        //                                contributes 0/0/0 because that inner call
        //                                revisits parent's id (still on the current
        //                                path) and is cut as a genuine cycle
        //                            => child totals = 10/70/2
        //   portionRatio (per row)   = 100 / 150 = 0.6666666667
        //   per-row portion          = 10/70/2 * 0.6666666667, each macro rounded to
        //                              scale 4 => 6.6667 / 46.6667 / 1.3333
        //   parent's two rows are independent calls -- the child's id (2) is
        //   released via the `finally` block between them -- so BOTH rows
        //   legitimately contribute the same portion:
        //     protein: 6.6667 + 6.6667 = 13.3334
        //     carbs:   46.6667 + 46.6667 = 93.3334
        //     fat:     1.3333 + 1.3333 = 2.6666
        //
        // NON-TAUTOLOGY: the PRE-FIX guard (add to visitedRecipeIds, never remove)
        // would have left the child's id (2) in the set after the first row
        // finished processing, so the second row's call to the child would see
        // "already visited" and be (wrongly) treated as a cycle, contributing
        // 0/0/0 instead of 6.6667/46.6667/1.3333. The pre-fix guard would therefore
        // have asserted 6.6667/46.6667/1.3333 for the WHOLE parent (identical to
        // genuineCycleIsCutAndDoesNotRecurseForever's figures, because the second
        // row is silently dropped) -- this test asserts the different, correct,
        // path-scoped answer instead, so it distinguishes the two implementations.
        assertThat(totals[0].doubleValue()).isCloseTo(13.3334, within(0.001));
        assertThat(totals[1].doubleValue()).isCloseTo(93.3334, within(0.001));
        assertThat(totals[2].doubleValue()).isCloseTo(2.6666, within(0.001));
    }

    // ---- daily totals must not sum pre-rounded per-serving values ----

    @Test
    void dailyTotalsAccumulateUnroundedPerServingMacros() {
        // Each recipe is 100 g at 1/1/1 per 100 g, serving 4 -> 0.25 g per serving
        // per macro. Four of them = exactly 1 g. Rounding each to 0 first gives 0.
        List<Recipe> day = new ArrayList<>();
        for (int i = 0; i < 4; i++) {
            Recipe r = recipe(100L + i, "Trace " + i, 4);
            rawRow(r, ingredient("Trace", 1, 1, 1), 100);
            day.add(r);
        }

        assertThat(service.calculateTotalMacros(day)).containsExactly(1, 1, 1);
    }
}
