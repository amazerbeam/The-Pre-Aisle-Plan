package com.foodbytes.model;

import org.junit.jupiter.api.Test;

import java.util.HashSet;
import java.util.Set;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatCode;

/**
 * Entity identity must come from the primary key, never from the fields.
 *
 * <p>Every entity carries Lombok's {@code @Data}, which by default derives
 * equals/hashCode/toString from all fields — including the association
 * collections and their back-references. That makes the object graph cyclic:
 * Recipe -> meals -> RecipeMeal -> recipe -> Recipe -> ... A field-based
 * hashCode walks that cycle until the stack overflows.
 *
 * <p>This is reachable from an ordinary read, not just from application code.
 * Hibernate 6 de-duplicates a {@code SELECT DISTINCT} entity result by putting
 * the rows in a HashSet, so {@code RecipeRepository#findByMealKeyIncludingHidden}
 * hashes every Recipe it returns. That took down GET /api/recipes/admin and
 * GET /api/meal-plans in production with a StackOverflowError.
 *
 * <p>These tests fail with StackOverflowError if the hand-written
 * equals/hashCode on any of these entities is removed and Lombok's
 * field-based versions come back.
 */
class EntityIdentityTest {

    /** A Recipe wired up the way Hibernate returns one: every association populated and back-linked. */
    private static Recipe cyclicRecipe(Long id) {
        Recipe recipe = new Recipe();
        recipe.setId(id);
        recipe.setName("Greek Chicken Gyros");

        Meal meal = new Meal();
        meal.setId(1L);
        meal.setKey("dinner");

        RecipeMeal recipeMeal = new RecipeMeal();
        recipeMeal.setId(100L);
        recipeMeal.setMeal(meal);
        recipeMeal.setRecipe(recipe);
        recipe.getMeals().add(recipeMeal);

        // A linked sub-recipe (the FR-093 pita case) — its own ingredient row
        // points back at the parent, which is the second way the cycle closes.
        Recipe pita = new Recipe();
        pita.setId(117L);
        pita.setName("Pita Bread");

        RecipeIngredient ingredient = new RecipeIngredient();
        ingredient.setId(200L);
        ingredient.setRecipe(recipe);
        ingredient.setLinkedRecipe(pita);
        recipe.getIngredients().add(ingredient);

        RecipeStep step = new RecipeStep();
        step.setId(300L);
        step.setRecipe(recipe);
        step.setLinkedRecipe(pita);
        step.setInstruction("Prepare the pita according to the linked recipe.");
        recipe.getSteps().add(step);

        RecipeExtra extra = new RecipeExtra();
        extra.setId(400L);
        extra.setParentRecipe(recipe);
        extra.setChildRecipe(pita);
        recipe.getExtras().add(extra);

        return recipe;
    }

    @Test
    void recipeHashCodeDoesNotRecurseThroughItsAssociations() {
        Recipe recipe = cyclicRecipe(1L);

        assertThatCode(recipe::hashCode).doesNotThrowAnyException();
        assertThatCode(recipe::toString).doesNotThrowAnyException();
    }

    @Test
    void childEntitiesDoNotRecurseThroughTheirBackReferences() {
        Recipe recipe = cyclicRecipe(1L);

        assertThatCode(recipe.getMeals().iterator().next()::hashCode).doesNotThrowAnyException();
        assertThatCode(recipe.getIngredients().get(0)::hashCode).doesNotThrowAnyException();
        assertThatCode(recipe.getSteps().get(0)::hashCode).doesNotThrowAnyException();
        assertThatCode(recipe.getExtras().get(0)::hashCode).doesNotThrowAnyException();
    }

    @Test
    void mealPlanEntryDoesNotRecurseThroughItsEagerRecipe() {
        MealPlanEntry entry = new MealPlanEntry();
        entry.setId(500L);
        entry.setRecipe(cyclicRecipe(1L));

        assertThatCode(entry::hashCode).doesNotThrowAnyException();
        assertThatCode(entry::toString).doesNotThrowAnyException();
    }

    /** What Hibernate does to a SELECT DISTINCT result set — the production trigger. */
    @Test
    void distinctResultDedupCollapsesTwoInstancesOfTheSameRow() {
        Set<Recipe> distinct = new HashSet<>();
        distinct.add(cyclicRecipe(1L));
        distinct.add(cyclicRecipe(1L));
        distinct.add(cyclicRecipe(2L));

        assertThat(distinct).hasSize(2);
    }

    /**
     * RecipeService#createRecipe adds unsaved RecipeMeals to the {@code meals}
     * HashSet before flush, so id-less instances must stay distinct — otherwise
     * a recipe tagged both breakfast and lunch silently loses one meal type.
     */
    @Test
    void transientEntitiesWithNoIdAreNotCollapsedIntoOne() {
        Recipe recipe = new Recipe();

        RecipeMeal breakfast = new RecipeMeal();
        breakfast.setRecipe(recipe);
        RecipeMeal lunch = new RecipeMeal();
        lunch.setRecipe(recipe);

        recipe.getMeals().add(breakfast);
        recipe.getMeals().add(lunch);

        assertThat(recipe.getMeals()).hasSize(2);
        assertThat(breakfast).isNotEqualTo(lunch);
        assertThat(breakfast).isEqualTo(breakfast);
    }

    @Test
    void hashCodeIsStableAcrossTheTransientToPersistentTransition() {
        Recipe recipe = new Recipe();
        int beforeInsert = recipe.hashCode();

        recipe.setId(42L);

        assertThat(recipe.hashCode()).isEqualTo(beforeInsert);
    }
}
