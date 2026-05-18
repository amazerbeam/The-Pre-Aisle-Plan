package com.foodbytes.service;

import com.foodbytes.dto.AggregatedShoppingListDTO;
import com.foodbytes.dto.ShoppingItemDTO;
import com.foodbytes.dto.ShoppingListByAisleDTO;
import com.foodbytes.model.*;
import com.foodbytes.repository.MealPlanEntryRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;

/**
 * Unit tests for ShoppingListService.
 * Tests FR-019 (aggregated shopping list) and FR-020 (grouping by aisle).
 */
@ExtendWith(MockitoExtension.class)
class ShoppingListServiceTest {

    @Mock
    private MealPlanEntryRepository mealPlanEntryRepository;

    @InjectMocks
    private ShoppingListService shoppingListService;

    private Long userId;
    private LocalDate startDate;
    private LocalDate endDate;
    private User testUser;
    private Meal breakfastMeal;
    private Aisle produceAisle;
    private Aisle dairyAisle;
    private Unit cupsUnit;
    private Unit ouncesUnit;

    @BeforeEach
    void setUp() {
        userId = 1L;
        startDate = LocalDate.of(2025, 12, 1);
        endDate = startDate.plusDays(7);

        testUser = new User();
        testUser.setId(userId);

        breakfastMeal = new Meal();
        breakfastMeal.setId(1L);
        breakfastMeal.setKey("breakfast");

        produceAisle = new Aisle(1L, "produce", "Produce", (short) 1);
        dairyAisle = new Aisle(2L, "dairy", "Dairy", (short) 2);

        cupsUnit = new Unit(1L, "cups", "cups");
        ouncesUnit = new Unit(2L, "oz", "oz");
    }

    @Test
    void testEmptyMealPlan_ReturnsEmptyShoppingList() {
        // Arrange
        when(mealPlanEntryRepository.findByUserIdAndDateRange(eq(userId), eq(startDate), eq(endDate)))
            .thenReturn(new ArrayList<>());

        // Act
        AggregatedShoppingListDTO result = shoppingListService.getShoppingList(userId, startDate, null);

        // Assert
        assertThat(result).isNotNull();
        assertThat(result.getStartDate()).isEqualTo(startDate);
        assertThat(result.getEndDate()).isEqualTo(endDate.minusDays(1));
        assertThat(result.getAisles()).isEmpty();
        assertThat(result.getTotalItems()).isEqualTo(0);
    }

    @Test
    void testSingleRecipe_CorrectIngredientsAndQuantities() {
        // Arrange
        Recipe recipe = createRecipe(1L, "Oatmeal", 2);
        Ingredient oats = createIngredient(1L, "oats", "Oats", produceAisle);
        RecipeIngredient recipeIngredient = createRecipeIngredient(recipe, oats, new BigDecimal("1.00"), cupsUnit);
        recipe.setIngredients(List.of(recipeIngredient));

        MealPlanEntry entry = createMealPlanEntry(1L, testUser, startDate, breakfastMeal, recipe, 2);

        when(mealPlanEntryRepository.findByUserIdAndDateRange(eq(userId), eq(startDate), eq(endDate)))
            .thenReturn(List.of(entry));

        // Act
        AggregatedShoppingListDTO result = shoppingListService.getShoppingList(userId, startDate, null);

        // Assert
        assertThat(result).isNotNull();
        assertThat(result.getTotalItems()).isEqualTo(1);
        assertThat(result.getAisles()).hasSize(1);

        ShoppingListByAisleDTO aisleGroup = result.getAisles().get(0);
        assertThat(aisleGroup.getAisle().getName()).isEqualTo("Produce");
        assertThat(aisleGroup.getItems()).hasSize(1);

        ShoppingItemDTO item = aisleGroup.getItems().get(0);
        assertThat(item.getIngredientName()).isEqualTo("Oats");
        assertThat(item.getTotalQuantity()).isEqualByComparingTo(new BigDecimal("1.00"));
        assertThat(item.getUnit()).isEqualTo("cups");
    }

    @Test
    void testMultipleRecipesWithSameIngredient_AggregatesSumCorrectly() {
        // Arrange
        Recipe recipe1 = createRecipe(1L, "Oatmeal", 2);
        Recipe recipe2 = createRecipe(2L, "Smoothie", 1);

        Ingredient banana = createIngredient(1L, "banana", "Banana", produceAisle);

        RecipeIngredient recipe1Ingredient = createRecipeIngredient(recipe1, banana, new BigDecimal("2.00"), ouncesUnit);
        RecipeIngredient recipe2Ingredient = createRecipeIngredient(recipe2, banana, new BigDecimal("3.00"), ouncesUnit);

        recipe1.setIngredients(List.of(recipe1Ingredient));
        recipe2.setIngredients(List.of(recipe2Ingredient));

        MealPlanEntry entry1 = createMealPlanEntry(1L, testUser, startDate, breakfastMeal, recipe1, 2);
        MealPlanEntry entry2 = createMealPlanEntry(2L, testUser, startDate.plusDays(1), breakfastMeal, recipe2, 1);

        when(mealPlanEntryRepository.findByUserIdAndDateRange(eq(userId), eq(startDate), eq(endDate)))
            .thenReturn(List.of(entry1, entry2));

        // Act
        AggregatedShoppingListDTO result = shoppingListService.getShoppingList(userId, startDate, null);

        // Assert
        assertThat(result.getTotalItems()).isEqualTo(1);
        ShoppingItemDTO item = result.getAisles().get(0).getItems().get(0);
        assertThat(item.getIngredientName()).isEqualTo("Banana");
        // recipe1: 2.00 * 2/2 = 2.00, recipe2: 3.00 * 1/1 = 3.00, total = 5.00
        assertThat(item.getTotalQuantity()).isEqualByComparingTo(new BigDecimal("5.00"));
        assertThat(item.getUnit()).isEqualTo("oz");
    }

    @Test
    void testDifferentServings_ScalesQuantitiesCorrectly() {
        // Arrange
        Recipe recipe = createRecipe(1L, "Pasta", 4); // Default 4 servings
        Ingredient pasta = createIngredient(1L, "pasta", "Pasta", produceAisle);
        RecipeIngredient recipeIngredient = createRecipeIngredient(recipe, pasta, new BigDecimal("8.00"), ouncesUnit);
        recipe.setIngredients(List.of(recipeIngredient));

        // Meal plan entry with 2 servings (half of default)
        MealPlanEntry entry = createMealPlanEntry(1L, testUser, startDate, breakfastMeal, recipe, 2);

        when(mealPlanEntryRepository.findByUserIdAndDateRange(eq(userId), eq(startDate), eq(endDate)))
            .thenReturn(List.of(entry));

        // Act
        AggregatedShoppingListDTO result = shoppingListService.getShoppingList(userId, startDate, null);

        // Assert
        ShoppingItemDTO item = result.getAisles().get(0).getItems().get(0);
        // 8.00 * 2/4 = 4.00
        assertThat(item.getTotalQuantity()).isEqualByComparingTo(new BigDecimal("4.00"));
    }

    @Test
    void testMultipleUnitsOfSameIngredient_CreatesSeperateItems() {
        // Arrange
        Recipe recipe = createRecipe(1L, "Mixed Recipe", 2);
        Ingredient milk = createIngredient(1L, "milk", "Milk", dairyAisle);

        RecipeIngredient milkInCups = createRecipeIngredient(recipe, milk, new BigDecimal("2.00"), cupsUnit);
        RecipeIngredient milkInOunces = createRecipeIngredient(recipe, milk, new BigDecimal("4.00"), ouncesUnit);

        recipe.setIngredients(List.of(milkInCups, milkInOunces));

        MealPlanEntry entry = createMealPlanEntry(1L, testUser, startDate, breakfastMeal, recipe, 2);

        when(mealPlanEntryRepository.findByUserIdAndDateRange(eq(userId), eq(startDate), eq(endDate)))
            .thenReturn(List.of(entry));

        // Act
        AggregatedShoppingListDTO result = shoppingListService.getShoppingList(userId, startDate, null);

        // Assert
        assertThat(result.getTotalItems()).isEqualTo(2); // Two separate items
        List<ShoppingItemDTO> items = result.getAisles().get(0).getItems();
        assertThat(items).hasSize(2);

        // Should have one in cups and one in oz
        boolean hasCups = items.stream().anyMatch(item -> item.getUnit().equals("cups"));
        boolean hasOunces = items.stream().anyMatch(item -> item.getUnit().equals("oz"));
        assertThat(hasCups).isTrue();
        assertThat(hasOunces).isTrue();
    }

    @Test
    void testAisleGrouping_SortsByDisplayOrder() {
        // Arrange
        Recipe recipe = createRecipe(1L, "Balanced Meal", 2);

        Ingredient cheese = createIngredient(1L, "cheese", "Cheese", dairyAisle); // displayOrder = 2
        Ingredient tomato = createIngredient(2L, "tomato", "Tomato", produceAisle); // displayOrder = 1

        RecipeIngredient cheeseIngredient = createRecipeIngredient(recipe, cheese, new BigDecimal("4.00"), ouncesUnit);
        RecipeIngredient tomatoIngredient = createRecipeIngredient(recipe, tomato, new BigDecimal("2.00"), ouncesUnit);

        recipe.setIngredients(List.of(cheeseIngredient, tomatoIngredient));

        MealPlanEntry entry = createMealPlanEntry(1L, testUser, startDate, breakfastMeal, recipe, 2);

        when(mealPlanEntryRepository.findByUserIdAndDateRange(eq(userId), eq(startDate), eq(endDate)))
            .thenReturn(List.of(entry));

        // Act
        AggregatedShoppingListDTO result = shoppingListService.getShoppingList(userId, startDate, null);

        // Assert
        assertThat(result.getAisles()).hasSize(2);
        // Produce (displayOrder=1) should come before Dairy (displayOrder=2)
        assertThat(result.getAisles().get(0).getAisle().getName()).isEqualTo("Produce");
        assertThat(result.getAisles().get(1).getAisle().getName()).isEqualTo("Dairy");
    }

    @Test
    void testAlphabeticalSortingWithinAisle() {
        // Arrange
        Recipe recipe = createRecipe(1L, "Salad", 2);

        Ingredient zucchini = createIngredient(1L, "zucchini", "Zucchini", produceAisle);
        Ingredient apple = createIngredient(2L, "apple", "Apple", produceAisle);
        Ingredient banana = createIngredient(3L, "banana", "Banana", produceAisle);

        RecipeIngredient zucchiniIngredient = createRecipeIngredient(recipe, zucchini, new BigDecimal("1.00"), ouncesUnit);
        RecipeIngredient appleIngredient = createRecipeIngredient(recipe, apple, new BigDecimal("2.00"), ouncesUnit);
        RecipeIngredient bananaIngredient = createRecipeIngredient(recipe, banana, new BigDecimal("3.00"), ouncesUnit);

        recipe.setIngredients(List.of(zucchiniIngredient, appleIngredient, bananaIngredient));

        MealPlanEntry entry = createMealPlanEntry(1L, testUser, startDate, breakfastMeal, recipe, 2);

        when(mealPlanEntryRepository.findByUserIdAndDateRange(eq(userId), eq(startDate), eq(endDate)))
            .thenReturn(List.of(entry));

        // Act
        AggregatedShoppingListDTO result = shoppingListService.getShoppingList(userId, startDate, null);

        // Assert
        List<ShoppingItemDTO> items = result.getAisles().get(0).getItems();
        assertThat(items).hasSize(3);
        // Should be sorted alphabetically: Apple, Banana, Zucchini
        assertThat(items.get(0).getIngredientName()).isEqualTo("Apple");
        assertThat(items.get(1).getIngredientName()).isEqualTo("Banana");
        assertThat(items.get(2).getIngredientName()).isEqualTo("Zucchini");
    }

    // Helper methods to create test entities
    private Recipe createRecipe(Long id, String name, Integer defaultServings) {
        Recipe recipe = new Recipe();
        recipe.setId(id);
        recipe.setName(name);
        recipe.setDefaultServings(defaultServings);
        recipe.setIngredients(new ArrayList<>());
        return recipe;
    }

    private Ingredient createIngredient(Long id, String key, String name, Aisle aisle) {
        Ingredient ingredient = new Ingredient();
        ingredient.setId(id);
        ingredient.setKey(key);
        ingredient.setName(name);
        ingredient.setAisle(aisle);
        return ingredient;
    }

    private RecipeIngredient createRecipeIngredient(Recipe recipe, Ingredient ingredient,
                                                     BigDecimal quantity, Unit unit) {
        RecipeIngredient recipeIngredient = new RecipeIngredient();
        recipeIngredient.setRecipe(recipe);
        recipeIngredient.setIngredient(ingredient);
        recipeIngredient.setQuantity(quantity);
        recipeIngredient.setUnit(unit);
        return recipeIngredient;
    }

    private MealPlanEntry createMealPlanEntry(Long id, User user, LocalDate planDate,
                                              Meal meal, Recipe recipe, Integer servings) {
        MealPlanEntry entry = new MealPlanEntry();
        entry.setId(id);
        entry.setUser(user);
        entry.setPlanDate(planDate);
        entry.setMeal(meal);
        entry.setRecipe(recipe);
        entry.setServings(servings);
        return entry;
    }
}
