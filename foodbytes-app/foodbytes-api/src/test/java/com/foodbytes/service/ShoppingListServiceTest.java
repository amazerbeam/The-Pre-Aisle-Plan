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
import com.foodbytes.repository.UnitRepository;
import com.foodbytes.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyCollection;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.ArgumentMatchers.argThat;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.lenient;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
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
    @Mock private MacroCalculationService macroCalculationService;
    @Mock private ExtraChoiceService extraChoiceService;
    @Mock private UnitRepository unitRepository;

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
    private Unit gramUnit;
    private long nextEntryId = 100L;

    @BeforeEach
    void setUp() {
        // ExtraPortionResolver is a real object over the mocked MacroCalculationService, so the
        // calculateRecipeTotalYield stubs keep driving the proration maths.
        shoppingListService = new ShoppingListService(
            mealPlanEntryRepository, recipeRepository, recipeExtrasService,
            ingredientRepository, userRepository, new ExtraPortionResolver(macroCalculationService),
            extraChoiceService, unitRepository);
        // MPP-10: the gram unit store-bought rows aggregate under (live: units.id = 1, key = 'g')
        gramUnit = new Unit(1L, "g", "g");
        lenient().when(unitRepository.findByKey("g")).thenReturn(Optional.of(gramUnit));

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
        AggregatedShoppingListDTO result = shoppingListService.getShoppingList(userId, startDate);

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
        AggregatedShoppingListDTO result = shoppingListService.getShoppingList(userId, startDate);

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
        AggregatedShoppingListDTO result = shoppingListService.getShoppingList(userId, startDate);

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
        AggregatedShoppingListDTO result = shoppingListService.getShoppingList(userId, startDate);

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
        AggregatedShoppingListDTO result = shoppingListService.getShoppingList(userId, startDate);

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
        AggregatedShoppingListDTO result = shoppingListService.getShoppingList(userId, startDate);

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
        AggregatedShoppingListDTO result = shoppingListService.getShoppingList(userId, startDate);

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
        AggregatedShoppingListDTO result = shoppingListService.getShoppingList(userId, startDate);

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
        AggregatedShoppingListDTO result = shoppingListService.getShoppingList(userId, startDate);

        // Assert
        List<ShoppingItemDTO> items = result.getAisles().get(0).getItems();
        assertThat(items).hasSize(3);
        // Should be sorted alphabetically: Apple, Banana, Zucchini
        assertThat(items.get(0).getIngredientName()).isEqualTo("Apple");
        assertThat(items.get(1).getIngredientName()).isEqualTo("Banana");
        assertThat(items.get(2).getIngredientName()).isEqualTo("Zucchini");
    }

    @Test
    void extraWithPartialPortionUsed_ProratesRawIngredientsByGramsNotServings() {
        // Regression test for MPP-1. Mirrors the real bug: recipe 65 (Pastichio) links to recipe
        // 64 (Honey Ham) via a recipe_ingredients row using less than Honey Ham's own total yield.
        // Numbers are simplified from the real 2916g/2500g Honey Ham recipe to round figures so
        // the expected value is hand-verifiable: here Honey Ham yields 2000g (Ham Fillet 1600g +
        // Onion 400g) and Pastichio's 8-serving batch uses 200g of it.
        Unit grams = unit(3L, "g");
        Ingredient hamFillet = ingredient(97L, "Ham Fillet");
        Ingredient onion = ingredient(12L, "Onion");

        Recipe honeyHam = recipe(64L, "Honey Ham", 8,
            recipeIngredient(hamFillet, "1600.00", grams, "1600.00"),
            recipeIngredient(onion, "400.00", grams, "400.00"));
        // Honey Ham's total yield = 1600 + 400 = 2000g

        Recipe pastichio = recipe(65L, "Pastichio (Lasagna)", 8);
        pastichio.setIngredients(List.of(linkedRecipeIngredient(honeyHam, "200.00"))); // 200g per 8-serving batch

        givenUserOwnsTheirOwnPlan(userId);
        givenEntries(entry(startDate, "dinner", pastichio, 16));
        when(recipeExtrasService.hasExtras(65L)).thenReturn(true);
        when(recipeExtrasService.buildExtrasTree(eq(65L), any()))
            .thenReturn(List.of(RecipeExtraNodeDTO.builder()
                .recipeId(64L)
                .recipeName("Honey Ham")
                .children(new ArrayList<>())
                .build()));
        when(recipeRepository.findById(64L)).thenReturn(Optional.of(honeyHam));
        // Mocked, not the real MacroCalculationService — stub the same sum it would compute:
        // Honey Ham's own total yield = 1600 (Ham Fillet) + 400 (Onion) = 2000g.
        when(macroCalculationService.calculateRecipeTotalYield(honeyHam)).thenReturn(new BigDecimal("2000.00"));

        AggregatedShoppingListDTO result = shoppingListService.getShoppingList(userId, startDate);

        ShoppingItemDTO hamFilletItem = result.getAisles().stream()
            .flatMap(a -> a.getItems().stream())
            .filter(i -> "Ham Fillet".equals(i.getIngredientName()))
            .findFirst()
            .orElseThrow(() -> new AssertionError("no shopping list row for Ham Fillet"));

        // usedGrams = 200 * (16/8) = 400; portionRatio = 400/2000 = 0.2
        // hamFillet = 1600 * 0.2 = 320.00 — NOT 1600 * 16/8 = 3200.00 (the bug: prorating by the
        // parent's servings ratio instead of the extra's own grams-used-vs-yield ratio)
        assertThat(hamFilletItem.getTotalQuantity()).isEqualByComparingTo(new BigDecimal("320.00"));
    }

    @Test
    void extraWithNoMatchingLinkedIngredientRow_SkipsProrationDefensively() {
        // Data-integrity guard: if the extras tree names a recipe with no corresponding
        // recipe_ingredients.linked_recipe_id row on the parent, there is no quantity_grams to
        // prorate by. The row must be skipped, not silently treated as "use the whole batch"
        // (which is exactly the MPP-1 bug this ticket fixes).
        Unit grams = unit(3L, "g");
        Ingredient hamFillet = ingredient(97L, "Ham Fillet");

        Recipe honeyHam = recipe(64L, "Honey Ham", 8,
            recipeIngredient(hamFillet, "1600.00", grams, "1600.00"));
        Recipe pastichio = recipe(65L, "Pastichio (Lasagna)", 8); // no linked_recipe_id row at all

        givenUserOwnsTheirOwnPlan(userId);
        givenEntries(entry(startDate, "dinner", pastichio, 16));
        when(recipeExtrasService.hasExtras(65L)).thenReturn(true);
        when(recipeExtrasService.buildExtrasTree(eq(65L), any()))
            .thenReturn(List.of(RecipeExtraNodeDTO.builder()
                .recipeId(64L)
                .recipeName("Honey Ham")
                .children(new ArrayList<>())
                .build()));
        when(recipeRepository.findById(64L)).thenReturn(Optional.of(honeyHam));

        AggregatedShoppingListDTO result = shoppingListService.getShoppingList(userId, startDate);

        boolean hasHamFillet = result.getAisles().stream()
            .flatMap(a -> a.getItems().stream())
            .anyMatch(i -> "Ham Fillet".equals(i.getIngredientName()));
        assertThat(hasHamFillet).isFalse();
    }
    // ------------------------------------------------------------------
    // MPP-10 - stored homemade / store-bought choices, store-bought products in grams
    // ------------------------------------------------------------------

    @Test
    void storeBought_withProduct_listsLinkGramsAtDefaultServings() {
        // Example 1 / AC 13: Bolognese (82) + Fresh Pasta (36) store-bought -> Spaghetti (dried) 200 g
        Recipe bolognese = bolognese();
        MealPlanEntry monday = entry(startDate, "dinner", bolognese, 2);
        givenBologneseWeek(bolognese, true, monday);
        givenChoices(Map.of(monday.getId(), Map.of(36L, false)));

        AggregatedShoppingListDTO result = shoppingListService.getShoppingList(userId, startDate);

        ShoppingItemDTO spaghetti = itemNamed(result, "Spaghetti (dried)");
        assertThat(spaghetti.getTotalQuantity()).isEqualByComparingTo("200.00");
        assertThat(spaghetti.getUnit()).isEqualTo("g");
        assertThat(allItemNames(result)).contains("Beef mince").doesNotContain("Plain flour", "Egg");
        verify(recipeRepository, never()).findById(36L);
    }

    @Test
    void storeBought_twoMeals_sumsGrams() {
        // Example 2: Mon + Thu both store-bought -> 400 g in one row
        Recipe bolognese = bolognese();
        MealPlanEntry mon = entry(startDate, "dinner", bolognese, 2);
        MealPlanEntry thu = entry(startDate.plusDays(3), "dinner", bolognese, 2);
        givenBologneseWeek(bolognese, true, mon, thu);
        givenChoices(Map.of(mon.getId(), Map.of(36L, false), thu.getId(), Map.of(36L, false)));

        AggregatedShoppingListDTO result = shoppingListService.getShoppingList(userId, startDate);

        assertThat(allItems(result).stream().filter(i -> "Spaghetti (dried)".equals(i.getIngredientName())))
            .hasSize(1)
            .allSatisfy(i -> assertThat(i.getTotalQuantity()).isEqualByComparingTo("400.00"));
    }

    @Test
    void storeBought_scalesWithServings() {
        // Example 3: 4 servings of a 2-serving recipe -> 400 g
        Recipe bolognese = bolognese();
        MealPlanEntry big = entry(startDate, "dinner", bolognese, 4);
        givenBologneseWeek(bolognese, true, big);
        givenChoices(Map.of(big.getId(), Map.of(36L, false)));

        AggregatedShoppingListDTO result = shoppingListService.getShoppingList(userId, startDate);

        assertThat(itemNamed(result, "Spaghetti (dried)").getTotalQuantity()).isEqualByComparingTo("400.00");
    }

    @Test
    void perEntryDivergence_sameDish() {
        // Example 4 / AC 3: Mon store-bought, Thu homemade -> 200 g spaghetti + Thursday's flour/egg only
        Recipe bolognese = bolognese();
        MealPlanEntry mon = entry(startDate, "dinner", bolognese, 2);
        MealPlanEntry thu = entry(startDate.plusDays(3), "dinner", bolognese, 2);
        givenBologneseWeek(bolognese, true, mon, thu);
        givenChoices(Map.of(mon.getId(), Map.of(36L, false))); // Thursday has no stored choice

        AggregatedShoppingListDTO result = shoppingListService.getShoppingList(userId, startDate);

        assertThat(itemNamed(result, "Spaghetti (dried)").getTotalQuantity()).isEqualByComparingTo("200.00");
        // Thursday only: link 200 g of a 400 g batch = 0.5 -> flour 300*0.5, egg 100*0.5
        assertThat(itemNamed(result, "Plain flour").getTotalQuantity()).isEqualByComparingTo("150.00");
        assertThat(itemNamed(result, "Egg").getTotalQuantity()).isEqualByComparingTo("50.00");
    }

    @Test
    void storeBought_mergesWithSameIngredientUsedRawInGrams() {
        // AC 13: another recipe uses Spaghetti (dried) 100 g raw -> one merged row of 300 g
        Recipe bolognese = bolognese();
        Recipe salad = recipe(90L, "Pasta Salad", 1,
            recipeIngredient(spaghetti(), "100.00", gramUnit, "100.00"));
        MealPlanEntry bolo = entry(startDate, "dinner", bolognese, 2);
        MealPlanEntry sal = entry(startDate.plusDays(1), "lunch", salad, 1);
        givenBologneseWeek(bolognese, true, bolo, sal);
        when(recipeExtrasService.hasExtras(90L)).thenReturn(false);
        givenChoices(Map.of(bolo.getId(), Map.of(36L, false)));

        AggregatedShoppingListDTO result = shoppingListService.getShoppingList(userId, startDate);

        assertThat(allItems(result).stream().filter(i -> "Spaghetti (dried)".equals(i.getIngredientName())))
            .hasSize(1)
            .allSatisfy(i -> {
                assertThat(i.getTotalQuantity()).isEqualByComparingTo("300.00");
                assertThat(i.getUnit()).isEqualTo("g");
            });
    }

    @Test
    void storeBought_pizzaSauce_listsPassata() {
        // Example 6: Pink Sauce Pasta (38) + Pizza Sauce (12) store-bought -> Tomato passata 180 g
        Unit grams = unit(3L, "g");
        Recipe pizzaSauce = recipe(12L, "Pizza Sauce", 4,
            recipeIngredient(ingredient(70L, "Tomato"), "400.00", grams, "400.00"));
        Recipe pink = recipe(38L, "Pink Sauce Pasta", 2);
        pink.setIngredients(new ArrayList<>(List.of(linkedRecipeIngredient(pizzaSauce, "180.00"))));
        Ingredient passata = ingredient(136L, "Tomato passata");
        MealPlanEntry entry = entry(startDate, "dinner", pink, 2);

        givenUserOwnsTheirOwnPlan(userId);
        givenEntries(entry);
        when(recipeExtrasService.hasExtras(38L)).thenReturn(true);
        when(recipeExtrasService.buildExtrasTree(eq(38L), any()))
            .thenReturn(List.of(RecipeExtraNodeDTO.builder().recipeId(12L).recipeName("Pizza Sauce")
                .storeBoughtIngredientId(136L).children(new ArrayList<>()).build()));
        when(ingredientRepository.findById(136L)).thenReturn(Optional.of(passata));
        givenChoices(Map.of(entry.getId(), Map.of(12L, false)));

        AggregatedShoppingListDTO result = shoppingListService.getShoppingList(userId, startDate);

        ShoppingItemDTO item = itemNamed(result, "Tomato passata");
        assertThat(item.getTotalQuantity()).isEqualByComparingTo("180.00");
        assertThat(item.getUnit()).isEqualTo("g");
    }

    @Test
    void storeBought_withoutProduct_keepsGenericRow() {
        // AC 14: no store-bought ingredient on the extra -> "Store Bought Fresh Pasta" in its own aisle
        Recipe bolognese = bolognese();
        MealPlanEntry entry = entry(startDate, "dinner", bolognese, 2);
        givenBologneseWeek(bolognese, false, entry);
        givenChoices(Map.of(entry.getId(), Map.of(36L, false)));

        AggregatedShoppingListDTO result = shoppingListService.getShoppingList(userId, startDate);

        ShoppingListByAisleDTO storeBoughtAisle = result.getAisles().stream()
            .filter(a -> "Store Bought Items".equals(a.getAisle().getName()))
            .findFirst()
            .orElseThrow(() -> new AssertionError("no Store Bought Items aisle"));
        assertThat(storeBoughtAisle.getItems())
            .extracting(ShoppingItemDTO::getIngredientName)
            .containsExactly("Store Bought Fresh Pasta");
        // The generic row says how much: the link's 200 g at default servings, not a bare "1"
        ShoppingItemDTO row = storeBoughtAisle.getItems().get(0);
        assertThat(row.getTotalQuantity()).isEqualByComparingTo("200.00");
        assertThat(row.getUnit()).isEqualTo("g");
        assertThat(allItemNames(result)).doesNotContain("Plain flour", "Egg", "Spaghetti (dried)");
        verify(ingredientRepository, never()).findById(anyLong());
        verifyNoInteractions(unitRepository);
    }

    @Test
    void storeBought_withoutProduct_twoMeals_sumsGramsInOneRow() {
        // Generic rows sum grams across meals (200 g + 400 g at 4 servings) with no "(x2)" suffix
        Recipe bolognese = bolognese();
        MealPlanEntry mon = entry(startDate, "dinner", bolognese, 2);
        MealPlanEntry thu = entry(startDate.plusDays(3), "dinner", bolognese, 4);
        givenBologneseWeek(bolognese, false, mon, thu);
        givenChoices(Map.of(mon.getId(), Map.of(36L, false), thu.getId(), Map.of(36L, false)));

        AggregatedShoppingListDTO result = shoppingListService.getShoppingList(userId, startDate);

        ShoppingItemDTO row = itemNamed(result, "Store Bought Fresh Pasta");
        assertThat(row.getTotalQuantity()).isEqualByComparingTo("600.00");
        assertThat(row.getUnit()).isEqualTo("g");
    }

    @Test
    void noStoredChoice_equalsHomemadeOutput() {
        // AC 15: no stored choice -> today's homemade behaviour (prorated flour/egg, no product row)
        Recipe bolognese = bolognese();
        MealPlanEntry entry = entry(startDate, "dinner", bolognese, 2);
        givenBologneseWeek(bolognese, true, entry);
        // extraChoiceService.getEntryChoices is not stubbed: the mock returns an empty map

        AggregatedShoppingListDTO result = shoppingListService.getShoppingList(userId, startDate);

        assertThat(itemNamed(result, "Plain flour").getTotalQuantity()).isEqualByComparingTo("150.00");
        assertThat(itemNamed(result, "Egg").getTotalQuantity()).isEqualByComparingTo("50.00");
        assertThat(allItemNames(result)).doesNotContain("Spaghetti (dried)");
        verifyNoInteractions(unitRepository);
    }

    @Test
    void storeBought_linkedUser_readsOwnersEntriesAndChoices() {
        // AC 2: user 2 shares owner 1's plan; the owner's stored {36:false} drives the list
        Recipe bolognese = bolognese();
        MealPlanEntry ownersEntry = entry(startDate, "dinner", bolognese, 2);
        User linked = new User();
        linked.setId(2L);
        linked.setMealPlanOwnerId(1L);
        when(userRepository.findById(2L)).thenReturn(Optional.of(linked));
        givenEntries(ownersEntry);
        stubBologneseExtras(bolognese, true);
        givenChoices(Map.of(ownersEntry.getId(), Map.of(36L, false)));

        AggregatedShoppingListDTO result = shoppingListService.getShoppingList(2L, startDate);

        ShoppingItemDTO spaghetti = itemNamed(result, "Spaghetti (dried)");
        assertThat(spaghetti.getTotalQuantity()).isEqualByComparingTo("200.00");
        assertThat(spaghetti.getUnit()).isEqualTo("g");
        verify(mealPlanEntryRepository).findByUserIdAndDateRange(eq(1L), any(), any());
        verify(extraChoiceService).getEntryChoices(argThat(ids -> ids.contains(ownersEntry.getId())));
    }

    @Test
    void storeBought_gramUnitMissing_fallsBackToGenericRow() {
        // W4: a missing 'g' unit must not 500 the whole list
        when(unitRepository.findByKey("g")).thenReturn(Optional.empty());
        Recipe bolognese = bolognese();
        MealPlanEntry entry = entry(startDate, "dinner", bolognese, 2);
        givenBologneseWeek(bolognese, true, entry);
        givenChoices(Map.of(entry.getId(), Map.of(36L, false)));

        AggregatedShoppingListDTO result = shoppingListService.getShoppingList(userId, startDate);

        assertThat(allItemNames(result)).contains("Store Bought Fresh Pasta", "Beef mince")
            .doesNotContain("Spaghetti (dried)", "Plain flour", "Egg");
    }

    @Test
    void choicesAreLoadedOncePerGeneration() {
        // AC 1 / 19: one bulk query for all entries, not one per entry
        Recipe bolognese = bolognese();
        MealPlanEntry a = entry(startDate, "dinner", bolognese, 2);
        MealPlanEntry b = entry(startDate.plusDays(1), "dinner", bolognese, 2);
        MealPlanEntry c = entry(startDate.plusDays(2), "dinner", bolognese, 2);
        givenBologneseWeek(bolognese, true, a, b, c);

        shoppingListService.getShoppingList(userId, startDate);

        verify(extraChoiceService, times(1)).getEntryChoices(anyCollection());
    }

    @Test
    void breakdown_storeBoughtExtra_reportsGramsAndSkipsSubtree() {
        // AC 18: Mon store-bought, Thu homemade. The product breakdown reports Monday's 200 g via the
        // store-bought label; the flour breakdown contains Thursday only.
        Recipe bolognese = bolognese();
        MealPlanEntry mon = entry(startDate, "dinner", bolognese, 2);
        MealPlanEntry thu = entry(startDate.plusDays(3), "dinner", bolognese, 2);
        givenBologneseWeek(bolognese, true, mon, thu);
        givenChoices(Map.of(mon.getId(), Map.of(36L, false)));

        IngredientBreakdownDTO product = shoppingListService
            .getIngredientBreakdown(userId, 126L, "g", startDate, null);
        assertThat(product.getTotalQuantity()).isEqualByComparingTo("200.00");
        assertThat(product.getIngredientName()).isEqualTo("Spaghetti (dried)");
        assertThat(product.getMealBreakdown()).singleElement().satisfies(row -> {
            assertThat(row.getPlanDate()).isEqualTo(startDate);
            assertThat(row.getViaRecipeName()).isEqualTo("Fresh Pasta (store-bought)");
            assertThat(row.getQuantity()).isEqualByComparingTo("200.00");
        });

        IngredientBreakdownDTO flour = shoppingListService
            .getIngredientBreakdown(userId, 40L, "g", startDate, null);
        assertThat(flour.getMealBreakdown()).singleElement()
            .satisfies(row -> assertThat(row.getPlanDate()).isEqualTo(startDate.plusDays(3)));
        assertThat(flour.getTotalQuantity()).isEqualByComparingTo("150.00");
    }

    @Test
    void breakdown_genericStoreBoughtRow_listsTheMealsBehindIt() {
        // The generic row's id is -extraRecipeId; holding it lists the store-bought meals with their
        // grams, and the total matches the row (200 + 400 = 600). Thursday's homemade meal is absent.
        Recipe bolognese = bolognese();
        MealPlanEntry mon = entry(startDate, "dinner", bolognese, 2);
        MealPlanEntry wed = entry(startDate.plusDays(2), "dinner", bolognese, 4);
        MealPlanEntry thu = entry(startDate.plusDays(3), "dinner", bolognese, 2);
        givenBologneseWeek(bolognese, false, mon, wed, thu);
        givenChoices(Map.of(mon.getId(), Map.of(36L, false), wed.getId(), Map.of(36L, false)));

        AggregatedShoppingListDTO list = shoppingListService.getShoppingList(userId, startDate);
        ShoppingItemDTO row = itemNamed(list, "Store Bought Fresh Pasta");
        assertThat(row.getIngredientId()).isEqualTo(-36L);

        IngredientBreakdownDTO breakdown = shoppingListService
            .getIngredientBreakdown(userId, row.getIngredientId(), row.getUnit(), startDate, null);

        assertThat(breakdown.getIngredientName()).isEqualTo("Store Bought Fresh Pasta");
        assertThat(breakdown.getTotalQuantity()).isEqualByComparingTo(row.getTotalQuantity());
        assertThat(breakdown.getMealBreakdown())
            .extracting(MealIngredientUsageDTO::getPlanDate)
            .containsExactly(startDate, startDate.plusDays(2));
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
            recipeIngredient(flour, "300.00", grams, "300.00"));
        // Dough's own total yield = 300g (its only ingredient).
        Recipe pizza = recipe(12L, "Pizza", 2); // flour lives only in the extra
        pizza.setIngredients(List.of(linkedRecipeIngredient(dough, "150.00")));
        // Pizza uses 150g of a 300g Dough batch — half.

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
        when(macroCalculationService.calculateRecipeTotalYield(dough)).thenReturn(new BigDecimal("300.00"));

        IngredientBreakdownDTO result = shoppingListService
            .getIngredientBreakdown(1L, 31L, "g", MONDAY, List.of(12L));

        assertThat(result.getMealBreakdown()).hasSize(1);
        MealIngredientUsageDTO row = result.getMealBreakdown().get(0);
        assertThat(row.getRecipeName()).isEqualTo("Pizza");
        assertThat(row.getViaRecipeName()).isEqualTo("Pizza Dough");
        // Pizza@2 servings of its own 2-serving default = ratio 1; dough portionRatio = 150/300
        // = 0.5; flour = 300 * 0.5 = 150.00 (MPP-1: prorated by grams used, not pizza's servings).
        assertThat(row.getQuantity()).isEqualByComparingTo("150.00");
    }

    @Test
    void breakdownWalksNestedExtrasAndProratesEachLinkedHop() {
        Unit grams = unit(3L, "g");
        Ingredient basil = ingredient(45L, "Basil");

        // Pizza(12) -> Pizza Sauce(14) -> Pesto(10); the basil lives only in the GRANDCHILD,
        // so this is the only fixture that enters the recursive branch of collectUsagesFromExtras.
        // MPP-1: each hop is prorated by its own linked_recipe_id row's quantity_grams against
        // the child's own total yield — not by Pizza's servings alone.
        Recipe pesto = recipe(10L, "Pesto", 6,
            recipeIngredient(basil, "30.00", grams, "30.00"));
        // Pesto's own total yield = 30g (its only ingredient).

        Recipe pizzaSauce = recipe(14L, "Pizza Sauce", 4);
        pizzaSauce.setIngredients(List.of(linkedRecipeIngredient(pesto, "20.00")));
        // Pizza Sauce's own total yield = 20g (its only ingredient is 20g of Pesto).

        Recipe pizza = recipe(12L, "Pizza", 2);
        pizza.setIngredients(List.of(linkedRecipeIngredient(pizzaSauce, "9.00")));
        // Pizza uses 9g of Pizza Sauce per its own 2-serving batch.

        givenUserOwnsTheirOwnPlan(1L);
        givenEntries(entry(MONDAY, "dinner", pizza, 4)); // double Pizza's own default batch
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
        when(macroCalculationService.calculateRecipeTotalYield(pizzaSauce)).thenReturn(new BigDecimal("20.00"));
        when(macroCalculationService.calculateRecipeTotalYield(pesto)).thenReturn(new BigDecimal("30.00"));

        IngredientBreakdownDTO result = shoppingListService
            .getIngredientBreakdown(1L, 45L, "g", MONDAY, null);

        assertThat(result.getMealBreakdown()).hasSize(1);
        MealIngredientUsageDTO row = result.getMealBreakdown().get(0);
        assertThat(row.getRecipeName()).isEqualTo("Pizza");
        // Attributed to the nested extra that actually holds the ingredient, not its parent
        assertThat(row.getViaRecipeName()).isEqualTo("Pesto");
        // Pizza@4 servings of its own 2-serving default = ratio 2.
        // usedGrams(sauce) = 9 * 2 = 18; sauce portionRatio = 18/20 = 0.9.
        // usedGrams(pesto, per one full sauce batch) = 20 (sauce's own link row) * 0.9 = 18;
        // pesto portionRatio = 18/30 = 0.6.
        // basil = 30 * 0.6 = 18.00 — NOT 30 * 4/2 = 60.00 (the bug: scaling every nested hop off
        // only the MAIN recipe's servings, ignoring each link's own quantity_grams/yield).
        assertThat(row.getQuantity()).isEqualByComparingTo("18.00");
        assertThat(result.getTotalQuantity()).isEqualByComparingTo("18.00");
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
            recipeIngredient(oliveOil, "1.00", tbsp, "14.00")); // 1 tbsp olive oil ~= 14g
        Recipe dough = recipe(13L, "Pizza Dough", 2,
            recipeIngredient(oliveOil, "0.50", tbsp, "7.00")); // 0.5 tbsp ~= 7g
        // Dough's own total yield = 7g (its only ingredient).
        Recipe pizza = recipe(12L, "Pizza", 2); // oil reaches this dish only through the extra
        pizza.setIngredients(List.of(linkedRecipeIngredient(dough, "3.50")));
        // Pizza uses 3.5g of a 7g Dough batch — half.

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
        when(macroCalculationService.calculateRecipeTotalYield(dough)).thenReturn(new BigDecimal("7.00"));

        // The persisted row, all-homemade (no stored choices) — same default the breakdown assumes
        AggregatedShoppingListDTO shoppingList = shoppingListService
            .getShoppingList(1L, MONDAY);
        ShoppingItemDTO oilRow = shoppingList.getAisles().stream()
            .flatMap(aisle -> aisle.getItems().stream())
            .filter(item -> OLIVE_OIL_ID.equals(item.getIngredientId())
                         && "tbsp".equals(item.getUnit()))
            .findFirst()
            .orElseThrow(() -> new AssertionError("no shopping list row for Olive oil in tbsp"));

        // The popup for that same row
        IngredientBreakdownDTO breakdown = shoppingListService
            .getIngredientBreakdown(1L, OLIVE_OIL_ID, "tbsp", MONDAY, oilRow.getSourceChain());

        // Both dishes contribute: curry 1.00*1 = 1.00, pizza's dough 0.50 * (3.50/7.00) = 0.25,
        // total 1.25
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

    private Ingredient spaghetti() {
        return ingredient(126L, "Spaghetti (dried)");
    }

    /** Spaghetti Bolognese (82, 2 servings) with a dual-path link: 200 g of Fresh Pasta (36). */
    private Recipe bolognese() {
        Unit grams = unit(3L, "g");
        Recipe freshPasta = recipe(36L, "Fresh Pasta", 4,
            recipeIngredient(ingredient(40L, "Plain flour"), "300.00", grams, "300.00"),
            recipeIngredient(ingredient(42L, "Egg"), "100.00", grams, "100.00"));
        RecipeIngredient dualPath = linkedRecipeIngredient(freshPasta, "200.00");
        dualPath.setIngredient(spaghetti()); // FR-103: both ids set
        return recipe(82L, "Spaghetti Bolognese", 2,
            recipeIngredient(ingredient(41L, "Beef mince"), "500.00", grams, "500.00"), dualPath);
    }

    private void givenBologneseWeek(Recipe bolognese, boolean withProduct, MealPlanEntry... entries) {
        givenUserOwnsTheirOwnPlan(userId);
        givenEntries(entries);
        stubBologneseExtras(bolognese, withProduct);
    }

    private void stubBologneseExtras(Recipe bolognese, boolean withProduct) {
        Recipe freshPasta = bolognese.getIngredients().stream()
            .filter(RecipeIngredient::isLinkedRecipe).findFirst().orElseThrow().getLinkedRecipe();
        when(recipeExtrasService.hasExtras(82L)).thenReturn(true);
        when(recipeExtrasService.buildExtrasTree(eq(82L), any()))
            .thenReturn(List.of(RecipeExtraNodeDTO.builder()
                .recipeId(36L)
                .recipeName("Fresh Pasta")
                .storeBoughtIngredientId(withProduct ? 126L : null)
                .children(new ArrayList<>())
                .build()));
        lenient().when(recipeRepository.findById(36L)).thenReturn(Optional.of(freshPasta));
        // Fresh Pasta yields 300 g flour + 100 g egg = 400 g
        lenient().when(macroCalculationService.calculateRecipeTotalYield(freshPasta)).thenReturn(new BigDecimal("400.00"));
        lenient().when(ingredientRepository.findById(126L)).thenReturn(Optional.of(spaghetti()));
    }

    private void givenChoices(Map<Long, Map<Long, Boolean>> choicesByEntry) {
        when(extraChoiceService.getEntryChoices(anyCollection())).thenReturn(choicesByEntry);
    }

    private List<ShoppingItemDTO> allItems(AggregatedShoppingListDTO result) {
        return result.getAisles().stream().flatMap(a -> a.getItems().stream()).toList();
    }

    private List<String> allItemNames(AggregatedShoppingListDTO result) {
        return allItems(result).stream().map(ShoppingItemDTO::getIngredientName).toList();
    }

    private ShoppingItemDTO itemNamed(AggregatedShoppingListDTO result, String name) {
        return allItems(result).stream()
            .filter(i -> name.equals(i.getIngredientName()))
            .findFirst()
            .orElseThrow(() -> new AssertionError("no shopping list row for " + name));
    }

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

    private RecipeIngredient recipeIngredient(Ingredient ingredient, String quantity, Unit unit, String quantityGrams) {
        RecipeIngredient recipeIngredient = recipeIngredient(ingredient, quantity, unit);
        recipeIngredient.setQuantityGrams(new BigDecimal(quantityGrams));
        return recipeIngredient;
    }

    private RecipeIngredient linkedRecipeIngredient(Recipe linkedRecipe, String quantityGrams) {
        RecipeIngredient recipeIngredient = new RecipeIngredient();
        recipeIngredient.setLinkedRecipe(linkedRecipe);
        recipeIngredient.setQuantityGrams(new BigDecimal(quantityGrams));
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
        entry.setId(nextEntryId++);
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
