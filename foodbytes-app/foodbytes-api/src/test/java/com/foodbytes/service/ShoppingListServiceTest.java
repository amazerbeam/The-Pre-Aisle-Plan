package com.foodbytes.service;

import com.foodbytes.dto.AggregatedShoppingListDTO;
import com.foodbytes.dto.IngredientBreakdownDTO;
import com.foodbytes.dto.MealIngredientUsageDTO;
import com.foodbytes.dto.RecipeExtraNodeDTO;
import com.foodbytes.dto.ShoppingItemDTO;
import com.foodbytes.dto.ShoppingListByAisleDTO;
import com.foodbytes.model.*;
import com.foodbytes.repository.IngredientRepository;
import com.foodbytes.repository.MealPlanEntryRepository;
import com.foodbytes.repository.RecipeRepository;
import com.foodbytes.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

/**
 * Unit tests for ShoppingListService.
 *
 * <p>Aggregation: FR-019 (aggregated shopping list) and FR-020 (grouping by aisle).
 *
 * <p>Breakdown: FR-042 / FR-102 — the breakdown popup must list EVERY planned meal feeding a
 * shopping list row. Regression guard for the bug where a row's sourceChain filtered the scan
 * to one recipe.
 */
@ExtendWith(MockitoExtension.class)
class ShoppingListServiceTest {

    private static final LocalDate MONDAY = LocalDate.of(2026, 7, 27);
    private static final Long OLIVE_OIL_ID = 12L;

    @Mock private MealPlanEntryRepository mealPlanEntryRepository;
    @Mock private RecipeRepository recipeRepository;
    @Mock private RecipeExtrasService recipeExtrasService;
    @Mock private IngredientRepository ingredientRepository;
    @Mock private UserRepository userRepository;

    @InjectMocks private ShoppingListService shoppingListService;

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

    // ------------------------------------------------------------------
    // getShoppingList — FR-019 / FR-020
    // ------------------------------------------------------------------

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

        MealPlanEntry entry = createMealPlanEntry(1L, testUser, startDate, breakfastMeal, recipe, new BigDecimal("2"));

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

        MealPlanEntry entry1 = createMealPlanEntry(1L, testUser, startDate, breakfastMeal, recipe1, new BigDecimal("2"));
        MealPlanEntry entry2 = createMealPlanEntry(2L, testUser, startDate.plusDays(1), breakfastMeal, recipe2, new BigDecimal("1"));

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
        MealPlanEntry entry = createMealPlanEntry(1L, testUser, startDate, breakfastMeal, recipe, new BigDecimal("2"));

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
    void testFractionalServings_ScalesQuantitiesToFraction() {
        // Arrange
        Recipe recipe = createRecipe(1L, "Pasta", 4); // Default 4 servings
        Ingredient pasta = createIngredient(1L, "pasta", "Pasta", produceAisle);
        RecipeIngredient recipeIngredient = createRecipeIngredient(recipe, pasta, new BigDecimal("8.00"), ouncesUnit);
        recipe.setIngredients(List.of(recipeIngredient));

        // Half a portion of a 4-serving recipe = one eighth of the ingredients
        MealPlanEntry entry = createMealPlanEntry(1L, testUser, startDate, breakfastMeal, recipe,
                                                 new BigDecimal("0.5"));

        when(mealPlanEntryRepository.findByUserIdAndDateRange(eq(userId), eq(startDate), eq(endDate)))
            .thenReturn(List.of(entry));

        // Act
        AggregatedShoppingListDTO result = shoppingListService.getShoppingList(userId, startDate, null);

        // Assert
        ShoppingItemDTO item = result.getAisles().get(0).getItems().get(0);
        // 8.00 * 0.5 / 4 = 1.00
        assertThat(item.getTotalQuantity()).isEqualByComparingTo(new BigDecimal("1.00"));
    }

    @Test
    void testQuarterServings_ScalesQuantitiesToFraction() {
        // Arrange
        Recipe recipe = createRecipe(1L, "Soup", 2); // Default 2 servings
        Ingredient stock = createIngredient(1L, "stock", "Stock", produceAisle);
        RecipeIngredient recipeIngredient = createRecipeIngredient(recipe, stock, new BigDecimal("10.00"), ouncesUnit);
        recipe.setIngredients(List.of(recipeIngredient));

        MealPlanEntry entry = createMealPlanEntry(1L, testUser, startDate, breakfastMeal, recipe,
                                                 new BigDecimal("0.25"));

        when(mealPlanEntryRepository.findByUserIdAndDateRange(eq(userId), eq(startDate), eq(endDate)))
            .thenReturn(List.of(entry));

        // Act
        AggregatedShoppingListDTO result = shoppingListService.getShoppingList(userId, startDate, null);

        // Assert
        ShoppingItemDTO item = result.getAisles().get(0).getItems().get(0);
        // 10.00 * 0.25 / 2 = 1.25
        assertThat(item.getTotalQuantity()).isEqualByComparingTo(new BigDecimal("1.25"));
    }

    @Test
    void testMultipleUnitsOfSameIngredient_CreatesSeperateItems() {
        // Arrange
        Recipe recipe = createRecipe(1L, "Mixed Recipe", 2);
        Ingredient milk = createIngredient(1L, "milk", "Milk", dairyAisle);

        RecipeIngredient milkInCups = createRecipeIngredient(recipe, milk, new BigDecimal("2.00"), cupsUnit);
        RecipeIngredient milkInOunces = createRecipeIngredient(recipe, milk, new BigDecimal("4.00"), ouncesUnit);

        recipe.setIngredients(List.of(milkInCups, milkInOunces));

        MealPlanEntry entry = createMealPlanEntry(1L, testUser, startDate, breakfastMeal, recipe, new BigDecimal("2"));

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

        MealPlanEntry entry = createMealPlanEntry(1L, testUser, startDate, breakfastMeal, recipe, new BigDecimal("2"));

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

        MealPlanEntry entry = createMealPlanEntry(1L, testUser, startDate, breakfastMeal, recipe, new BigDecimal("2"));

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

    // ------------------------------------------------------------------
    // getIngredientBreakdown — FR-042 / FR-102
    // ------------------------------------------------------------------

    @Test
    void breakdownListsEveryRecipeUsingTheIngredient() {
        Unit tbsp = unit(1L, "tbsp");
        Ingredient oliveOil = ingredient(OLIVE_OIL_ID, "Olive oil");

        Recipe curry = recipe(70L, "Irish Chicken Curry", 2,
            recipeIngredient(oliveOil, "1.00", tbsp));
        Recipe pasta = recipe(80L, "Pink Sauce Pasta", 2,
            recipeIngredient(oliveOil, "0.50", tbsp));

        givenUserOwnsTheirOwnPlan(1L);
        givenEntries(
            entry(MONDAY, "dinner", curry, 2),
            entry(MONDAY.plusDays(1), "lunch", pasta, 2));
        givenNoExtras();

        IngredientBreakdownDTO result = shoppingListService
            .getIngredientBreakdown(1L, OLIVE_OIL_ID, "tbsp", MONDAY, List.of(70L));

        // sourceChain says "recipe 70 only" — the pasta must still appear
        assertThat(result.getMealBreakdown())
            .extracting(MealIngredientUsageDTO::getRecipeName)
            .containsExactly("Irish Chicken Curry", "Pink Sauce Pasta");
        assertThat(result.getTotalQuantity()).isEqualByComparingTo("1.50");
        assertThat(result.getIngredientName()).isEqualTo("Olive oil");
    }

    @Test
    void breakdownScalesByServingsAndKeepsEveryOccurrenceOfTheSameDish() {
        Unit tsp = unit(2L, "tsp");
        Ingredient oliveOil = ingredient(OLIVE_OIL_ID, "Olive oil");
        Recipe burrito = recipe(57L, "Chicken Burrito Bowl", 2,
            recipeIngredient(oliveOil, "2.00", tsp));

        givenUserOwnsTheirOwnPlan(1L);
        givenEntries(
            entry(MONDAY, "lunch", burrito, 2),
            entry(MONDAY.plusDays(1), "lunch", burrito, 2),
            entry(MONDAY.plusDays(2), "lunch", burrito, 4));
        givenNoExtras();

        IngredientBreakdownDTO result = shoppingListService
            .getIngredientBreakdown(1L, OLIVE_OIL_ID, "tsp", MONDAY, List.of(57L));

        assertThat(result.getMealBreakdown()).hasSize(3);
        assertThat(result.getMealBreakdown())
            .extracting(MealIngredientUsageDTO::getPlanDate)
            .containsExactly(MONDAY, MONDAY.plusDays(1), MONDAY.plusDays(2));
        // 4 servings of a 2-serving recipe doubles the quantity
        assertThat(result.getMealBreakdown().get(2).getQuantity()).isEqualByComparingTo("4.00");
        assertThat(result.getTotalQuantity()).isEqualByComparingTo("8.00");
        assertThat(result.getMealBreakdown())
            .allSatisfy(row -> assertThat(row.getViaRecipeName()).isNull());

        // AC 7: the extras tree is memoised per recipeId, so three entries for recipe 57 must
        // trigger exactly ONE hasExtras round-trip, not one per entry.
        verify(recipeExtrasService, times(1)).hasExtras(57L);
    }

    @Test
    void breakdownFindsIngredientInsideAnExtraAndAttributesIt() {
        Unit grams = unit(3L, "g");
        Ingredient flour = ingredient(31L, "Bread flour");

        Recipe dough = recipe(13L, "Pizza Dough", 2,
            recipeIngredient(flour, "300.00", grams));
        Recipe pizza = recipe(12L, "Pizza", 2); // flour lives only in the extra

        givenUserOwnsTheirOwnPlan(1L);
        givenEntries(entry(MONDAY, "dinner", pizza, 2));
        when(recipeExtrasService.hasExtras(12L)).thenReturn(true);
        when(recipeExtrasService.buildExtrasTree(eq(12L), any()))
            .thenReturn(List.of(RecipeExtraNodeDTO.builder()
                .recipeId(13L)
                .recipeName("Pizza Dough")
                .children(new ArrayList<>())
                .build()));
        // findById, not findWithDetailsById: the @EntityGraph finder duplicates the `ingredients`
        // bag per recipe_meals row, which would double-count in the summing breakdown walk.
        when(recipeRepository.findById(13L)).thenReturn(Optional.of(dough));

        IngredientBreakdownDTO result = shoppingListService
            .getIngredientBreakdown(1L, 31L, "g", MONDAY, List.of(12L));

        assertThat(result.getMealBreakdown()).hasSize(1);
        MealIngredientUsageDTO row = result.getMealBreakdown().get(0);
        assertThat(row.getRecipeName()).isEqualTo("Pizza");
        assertThat(row.getViaRecipeName()).isEqualTo("Pizza Dough");
        assertThat(row.getQuantity()).isEqualByComparingTo("300.00");
    }

    @Test
    void breakdownWalksNestedExtrasAndScalesOffTheMainRecipeServings() {
        Unit grams = unit(3L, "g");
        Ingredient basil = ingredient(45L, "Basil");

        // Pizza(12) -> Pizza Sauce(14) -> Pesto(10); the basil lives only in the GRANDCHILD,
        // so this is the only fixture that enters the recursive branch of collectUsagesFromExtras.
        // Sibling default servings are deliberately different from Pizza's to prove which one wins.
        Recipe pesto = recipe(10L, "Pesto", 6,
            recipeIngredient(basil, "30.00", grams));
        Recipe pizzaSauce = recipe(14L, "Pizza Sauce", 4);
        Recipe pizza = recipe(12L, "Pizza", 2);

        givenUserOwnsTheirOwnPlan(1L);
        givenEntries(entry(MONDAY, "dinner", pizza, 4));
        when(recipeExtrasService.hasExtras(12L)).thenReturn(true);
        when(recipeExtrasService.buildExtrasTree(eq(12L), any()))
            .thenReturn(List.of(RecipeExtraNodeDTO.builder()
                .recipeId(14L)
                .recipeName("Pizza Sauce")
                .children(new ArrayList<>(List.of(RecipeExtraNodeDTO.builder()
                    .recipeId(10L)
                    .recipeName("Pesto")
                    .children(new ArrayList<>())
                    .build())))
                .build()));
        when(recipeRepository.findById(14L)).thenReturn(Optional.of(pizzaSauce));
        when(recipeRepository.findById(10L)).thenReturn(Optional.of(pesto));

        IngredientBreakdownDTO result = shoppingListService
            .getIngredientBreakdown(1L, 45L, "g", MONDAY, null);

        assertThat(result.getMealBreakdown()).hasSize(1);
        MealIngredientUsageDTO row = result.getMealBreakdown().get(0);
        assertThat(row.getRecipeName()).isEqualTo("Pizza");
        // Attributed to the nested extra that actually holds the ingredient, not its parent
        assertThat(row.getViaRecipeName()).isEqualTo("Pesto");
        // Scales off the MAIN recipe's defaultServings (Pizza = 2), matching processExtras —
        // NOT Pesto's 6 and not Pizza Sauce's 4: 30.00 * 4 / 2 = 60.00
        assertThat(row.getQuantity()).isEqualByComparingTo("60.00");
        assertThat(result.getTotalQuantity()).isEqualByComparingTo("60.00");
    }

    /**
     * AC 3 — the contract's central promise. The breakdown popup's header is presented as the
     * total for the shopping-list row the user long-pressed, so the two traversals
     * ({@code processRecipeIngredients}/{@code processExtras} vs
     * {@code collectIngredientUsages}/{@code collectUsagesFromExtras}) must agree. They are
     * separate code paths; without this test a scaling change in one and not the other keeps every
     * other test green while the popup silently stops summing to the row.
     */
    @Test
    void breakdownTotalMatchesShoppingListRowForTheSameIngredient() {
        Unit tbsp = unit(1L, "tbsp");
        Ingredient oliveOil = ingredient(OLIVE_OIL_ID, "Olive oil");

        // Two dishes on different days feed one row: one direct hit, one via an extra, so both
        // halves of both traversals are exercised by the same fixture.
        Recipe curry = recipe(70L, "Irish Chicken Curry", 2,
            recipeIngredient(oliveOil, "1.00", tbsp));
        Recipe dough = recipe(13L, "Pizza Dough", 2,
            recipeIngredient(oliveOil, "0.50", tbsp));
        Recipe pizza = recipe(12L, "Pizza", 2); // oil reaches this dish only through the extra

        givenUserOwnsTheirOwnPlan(1L);
        givenEntries(
            entry(MONDAY, "dinner", curry, 2),
            entry(MONDAY.plusDays(1), "lunch", pizza, 2));
        when(recipeExtrasService.hasExtras(70L)).thenReturn(false);
        when(recipeExtrasService.hasExtras(12L)).thenReturn(true);
        when(recipeExtrasService.buildExtrasTree(eq(12L), any()))
            .thenReturn(List.of(RecipeExtraNodeDTO.builder()
                .recipeId(13L)
                .recipeName("Pizza Dough")
                .children(new ArrayList<>())
                .build()));
        // One stub serves both methods now that the breakdown also uses findById (see F1)
        when(recipeRepository.findById(13L)).thenReturn(Optional.of(dough));

        // The persisted row, all-homemade (no selections) — same default the breakdown assumes
        AggregatedShoppingListDTO shoppingList = shoppingListService
            .getShoppingList(1L, MONDAY, null);
        ShoppingItemDTO oilRow = shoppingList.getAisles().stream()
            .flatMap(aisle -> aisle.getItems().stream())
            .filter(item -> OLIVE_OIL_ID.equals(item.getIngredientId())
                         && "tbsp".equals(item.getUnit()))
            .findFirst()
            .orElseThrow(() -> new AssertionError("no shopping list row for Olive oil in tbsp"));

        // The popup for that same row
        IngredientBreakdownDTO breakdown = shoppingListService
            .getIngredientBreakdown(1L, OLIVE_OIL_ID, "tbsp", MONDAY, oilRow.getSourceChain());

        // Both dishes contribute: curry 1.00*2/2 = 1.00, pizza's dough 0.50*2/2 = 0.50
        assertThat(breakdown.getMealBreakdown())
            .extracting(MealIngredientUsageDTO::getRecipeName)
            .containsExactly("Irish Chicken Curry", "Pizza");

        // The invariant: header total == the row the user long-pressed
        assertThat(breakdown.getTotalQuantity()).isEqualByComparingTo(oilRow.getTotalQuantity());

        // ...and the listed rows actually add up to that header, so the popup is internally honest
        BigDecimal summedRows = breakdown.getMealBreakdown().stream()
            .map(MealIngredientUsageDTO::getQuantity)
            .reduce(BigDecimal.ZERO, BigDecimal::add);
        assertThat(summedRows).isEqualByComparingTo(oilRow.getTotalQuantity());
    }

    @Test
    void breakdownReturnsUnknownIngredientSentinelWhenNothingMatches() {
        Unit tbsp = unit(1L, "tbsp");
        Recipe curry = recipe(70L, "Irish Chicken Curry", 2,
            recipeIngredient(ingredient(99L, "Ghee"), "1.00", tbsp));

        givenUserOwnsTheirOwnPlan(1L);
        givenEntries(entry(MONDAY, "dinner", curry, 2));
        givenNoExtras();

        IngredientBreakdownDTO result = shoppingListService
            .getIngredientBreakdown(1L, OLIVE_OIL_ID, "tbsp", MONDAY, null);

        assertThat(result.getMealBreakdown()).isEmpty();
        assertThat(result.getIngredientName()).isEqualTo("Unknown Ingredient");
        assertThat(result.getTotalQuantity()).isEqualByComparingTo("0.00");
    }

    @Test
    void breakdownHonoursSharedMealPlanOwner() {
        Unit tbsp = unit(1L, "tbsp");
        Ingredient oliveOil = ingredient(OLIVE_OIL_ID, "Olive oil");
        Recipe curry = recipe(70L, "Irish Chicken Curry", 2,
            recipeIngredient(oliveOil, "1.00", tbsp));

        User sharer = new User();
        sharer.setId(1L);
        sharer.setMealPlanOwnerId(10L);
        when(userRepository.findById(1L)).thenReturn(Optional.of(sharer));
        when(mealPlanEntryRepository.findByUserIdAndDateRange(10L, MONDAY, MONDAY.plusDays(7)))
            .thenReturn(List.of(entry(MONDAY, "dinner", curry, 2)));
        givenNoExtras();

        IngredientBreakdownDTO result = shoppingListService
            .getIngredientBreakdown(1L, OLIVE_OIL_ID, "tbsp", MONDAY, null);

        assertThat(result.getMealBreakdown()).hasSize(1);
    }

    // --- fixtures ---

    private void givenUserOwnsTheirOwnPlan(Long userId) {
        User user = new User();
        user.setId(userId);
        when(userRepository.findById(userId)).thenReturn(Optional.of(user));
    }

    private void givenEntries(MealPlanEntry... entries) {
        when(mealPlanEntryRepository.findByUserIdAndDateRange(anyLong(), any(), any()))
            .thenReturn(Arrays.asList(entries));
    }

    private void givenNoExtras() {
        when(recipeExtrasService.hasExtras(anyLong())).thenReturn(false);
    }

    private Unit unit(Long id, String value) {
        Unit unit = new Unit();
        unit.setId(id);
        unit.setValue(value);
        return unit;
    }

    private Ingredient ingredient(Long id, String name) {
        Ingredient ingredient = new Ingredient();
        ingredient.setId(id);
        ingredient.setName(name);
        return ingredient;
    }

    private RecipeIngredient recipeIngredient(Ingredient ingredient, String quantity, Unit unit) {
        RecipeIngredient recipeIngredient = new RecipeIngredient();
        recipeIngredient.setIngredient(ingredient);
        recipeIngredient.setQuantity(new BigDecimal(quantity));
        recipeIngredient.setUnit(unit);
        return recipeIngredient;
    }

    private Recipe recipe(Long id, String name, int defaultServings, RecipeIngredient... ingredients) {
        Recipe recipe = new Recipe();
        recipe.setId(id);
        recipe.setName(name);
        recipe.setDefaultServings(defaultServings);
        recipe.setIngredients(ingredients.length == 0
            ? new ArrayList<>()
            : new ArrayList<>(Arrays.asList(ingredients)));
        return recipe;
    }

    private MealPlanEntry entry(LocalDate date, String mealKey, Recipe recipe, int servings) {
        Meal meal = new Meal();
        meal.setKey(mealKey);
        MealPlanEntry entry = new MealPlanEntry();
        entry.setPlanDate(date);
        entry.setMeal(meal);
        entry.setRecipe(recipe);
        entry.setServings(BigDecimal.valueOf(servings));
        return entry;
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
                                              Meal meal, Recipe recipe, BigDecimal servings) {
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
