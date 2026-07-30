package com.foodbytes.service;

import com.foodbytes.dto.MealPlanCreateRequest;
import com.foodbytes.model.Meal;
import com.foodbytes.model.MealPlanEntry;
import com.foodbytes.model.Recipe;
import com.foodbytes.model.User;
import com.foodbytes.repository.MealPlanEntryRepository;
import com.foodbytes.repository.MealRepository;
import com.foodbytes.repository.RecipeRepository;
import com.foodbytes.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Captor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

/**
 * Unit tests for MealPlanService.assignRecipe servings resolution.
 * A meal plan entry must inherit the recipe's default_servings when the request
 * omits servings — defaulting to the literal 1 halves every quantity the
 * shopping list derives from that entry.
 */
@ExtendWith(MockitoExtension.class)
class MealPlanServiceTest {

    @Mock private MealPlanEntryRepository mealPlanEntryRepository;
    @Mock private MealRepository mealRepository;
    @Mock private RecipeRepository recipeRepository;
    @Mock private UserRepository userRepository;
    @Mock private RecipeService recipeService;
    @Mock private MacroCalculationService macroCalculationService;

    @InjectMocks private MealPlanService mealPlanService;

    @Captor private ArgumentCaptor<MealPlanEntry> entryCaptor;

    private static final Long USER_ID = 1L;
    private static final Long MEAL_ID = 3L;
    private static final Long RECIPE_ID = 104L;

    private User user;
    private Meal meal;
    private Recipe recipe;

    @BeforeEach
    void setUp() {
        user = new User();
        user.setId(USER_ID);

        meal = new Meal();
        meal.setId(MEAL_ID);
        meal.setKey("dinner");

        recipe = new Recipe();
        recipe.setId(RECIPE_ID);
        recipe.setName("Beef & Mushroom Black Bean Stir Fry");
        recipe.setDefaultServings(2);
        recipe.setCalories(900);
    }

    /**
     * Stubs the empty-slot "create a new entry" path through assignRecipe,
     * including the convertToDTO tail that runs after the save.
     */
    private void stubHappyPath() {
        when(userRepository.findById(USER_ID)).thenReturn(Optional.of(user));
        when(mealPlanEntryRepository.findByUserIdAndPlanDateAndMealIdAndRecipeId(
                anyLong(), any(), anyLong(), anyLong())).thenReturn(Optional.empty());
        when(mealPlanEntryRepository.findByUserIdAndPlanDateAndMealId(
                anyLong(), any(), anyLong())).thenReturn(Optional.empty());
        when(mealRepository.findById(MEAL_ID)).thenReturn(Optional.of(meal));
        when(recipeRepository.findById(RECIPE_ID)).thenReturn(Optional.of(recipe));
        when(mealPlanEntryRepository.save(any(MealPlanEntry.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));
        when(macroCalculationService.calculatePerServingMacros(any()))
                .thenReturn(new int[]{0, 0, 0});
    }

    private MealPlanCreateRequest requestWithServings(BigDecimal servings) {
        MealPlanCreateRequest request = new MealPlanCreateRequest();
        request.setPlanDate(LocalDate.of(2026, 7, 31));
        request.setMealId(MEAL_ID);
        request.setRecipeId(RECIPE_ID);
        request.setServings(servings);
        return request;
    }

    @Test
    void assignRecipe_whenServingsOmitted_usesRecipeDefaultServings() {
        stubHappyPath();

        mealPlanService.assignRecipe(USER_ID, requestWithServings(null));

        verify(mealPlanEntryRepository).save(entryCaptor.capture());
        assertThat(entryCaptor.getValue().getServings()).isEqualByComparingTo("2");
    }

    /**
     * A value that is neither 1 nor the recipe's default_servings — the case a real
     * user hits when asking for 4 servings of a 2-serving recipe.
     */
    @Test
    void assignRecipe_whenServingsProvided_honoursRequestedValue() {
        stubHappyPath();

        mealPlanService.assignRecipe(USER_ID, requestWithServings(new BigDecimal("4")));

        verify(mealPlanEntryRepository).save(entryCaptor.capture());
        assertThat(entryCaptor.getValue().getServings()).isEqualByComparingTo("4");
    }

    /**
     * servings = 1 remains a legal EXPLICIT value (someone cooking for one).
     * Only the silent default changed — an explicit 1 must not be overwritten
     * by the recipe's default_servings.
     */
    @Test
    void assignRecipe_whenServingsExplicitlyOne_isNotOverriddenByRecipeDefault() {
        stubHappyPath();

        mealPlanService.assignRecipe(USER_ID, requestWithServings(BigDecimal.ONE));

        verify(mealPlanEntryRepository).save(entryCaptor.capture());
        assertThat(entryCaptor.getValue().getServings()).isEqualByComparingTo("1");
    }

    @Test
    void assignRecipe_whenRecipeHasNoDefaultServings_fallsBackToOne() {
        recipe.setDefaultServings(null);
        stubHappyPath();

        mealPlanService.assignRecipe(USER_ID, requestWithServings(null));

        verify(mealPlanEntryRepository).save(entryCaptor.capture());
        assertThat(entryCaptor.getValue().getServings()).isEqualByComparingTo("1");
    }

    /**
     * Covers the `recipeDefault > 0` half of the guard: a corrupt recipe row with
     * default_servings = 0 must still yield a usable 1, not a 0 that would zero
     * out every shopping-list quantity derived from the entry.
     */
    @Test
    void assignRecipe_whenRecipeDefaultServingsIsZero_fallsBackToOne() {
        recipe.setDefaultServings(0);
        stubHappyPath();

        mealPlanService.assignRecipe(USER_ID, requestWithServings(null));

        verify(mealPlanEntryRepository).save(entryCaptor.capture());
        assertThat(entryCaptor.getValue().getServings()).isEqualByComparingTo("1");
    }
}
