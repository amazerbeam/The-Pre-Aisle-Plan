package com.foodbytes.service;

import com.foodbytes.dto.ManageExtraDTO;
import com.foodbytes.dto.ManageExtrasMealDTO;
import com.foodbytes.dto.ManageExtrasViewDTO;
import com.foodbytes.dto.RecipeExtraNodeDTO;
import com.foodbytes.model.*;
import com.foodbytes.repository.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyCollection;
import static org.mockito.Mockito.lenient;
import static org.mockito.Mockito.when;

/**
 * MPP-10: the Manage extras popup view model and the per-template counts.
 * ExtraPortionResolver is a real object over a mocked MacroCalculationService, so the
 * "used grams" asserted here are produced by the same maths the shopping list uses.
 */
@ExtendWith(MockitoExtension.class)
class ManageExtrasServiceTest {

    @Mock private ExtraChoiceService extraChoiceService;
    @Mock private MealPlanEntryRepository mealPlanEntryRepository;
    @Mock private MealPlanTemplateRepository templateRepository;
    @Mock private MealPlanTemplateEntryRepository templateEntryRepository;
    @Mock private RecipeExtrasService recipeExtrasService;
    @Mock private RecipeRepository recipeRepository;
    @Mock private IngredientRepository ingredientRepository;
    @Mock private RecipeFamilyMemberRepository familyMemberRepository;
    @Mock private MacroCalculationService macroCalculationService;

    private ManageExtrasService service;

    private static final Long USER_ID = 1L;
    private static final LocalDate MONDAY = LocalDate.of(2026, 10, 12);

    private User owner;
    private Meal breakfast;
    private Meal lunch;
    private Meal dinner;
    private Recipe bolognese;   // 82, default 2 servings, links Fresh Pasta (36) at 200 g
    private Recipe pinkSauce;   // 38, links Pizza Sauce (12) at 180 g
    private Recipe porridge;    // 50, no extras
    private Recipe pizza;       // 13 -> Pizza Sauce (12) -> Pesto (99)
    private Recipe pizzaSauce;  // 12

    @BeforeEach
    void setUp() {
        service = new ManageExtrasService(extraChoiceService, mealPlanEntryRepository, templateRepository,
            templateEntryRepository, recipeExtrasService, recipeRepository, ingredientRepository,
            familyMemberRepository, new ExtraPortionResolver(macroCalculationService));

        owner = new User();
        owner.setId(USER_ID);
        breakfast = meal(1L, "breakfast");
        lunch = meal(2L, "lunch");
        dinner = meal(3L, "dinner");

        Recipe freshPasta = recipe(36L, "Fresh Pasta", 4);
        Recipe pesto = recipe(99L, "Pesto", 4);
        pizzaSauce = recipe(12L, "Pizza Sauce", 4);
        pizzaSauce.setIngredients(List.of(linkRow(pesto, "20.00")));
        bolognese = recipe(82L, "Bolognese", 2);
        bolognese.setIngredients(List.of(linkRow(freshPasta, "200.00")));
        pinkSauce = recipe(38L, "Pink Sauce Pasta", 2);
        pinkSauce.setIngredients(List.of(linkRow(pizzaSauce, "180.00")));
        porridge = recipe(50L, "Porridge", 1);
        pizza = recipe(13L, "Pizza", 2);
        pizza.setIngredients(List.of(linkRow(pizzaSauce, "9.00")));

        lenient().when(extraChoiceService.resolveOwnerId(USER_ID)).thenReturn(USER_ID);
        lenient().when(extraChoiceService.getEntryChoices(anyCollection())).thenReturn(Map.of());
        lenient().when(extraChoiceService.getTemplateEntryChoices(anyCollection())).thenReturn(Map.of());
        lenient().when(recipeExtrasService.hasExtras(any())).thenReturn(false);
        lenient().when(familyMemberRepository.findByRecipeId(any())).thenReturn(Optional.empty());
        lenient().when(macroCalculationService.calculateRecipeTotalYield(any())).thenReturn(new BigDecimal("100"));

        extras(82L, node(36L, "Fresh Pasta", 126L));
        extras(38L, node(12L, "Pizza Sauce", 136L));
        extras(13L, node(12L, "Pizza Sauce", 136L, node(99L, "Pesto", null)));
        lenient().when(recipeRepository.findById(12L)).thenReturn(Optional.of(pizzaSauce));
        Ingredient spaghetti = new Ingredient();
        spaghetti.setId(126L);
        spaghetti.setName("Spaghetti (dried)");
        lenient().when(ingredientRepository.findById(126L)).thenReturn(Optional.of(spaghetti));
        Ingredient passata = new Ingredient();
        passata.setId(136L);
        passata.setName("Tomato passata");
        lenient().when(ingredientRepository.findById(136L)).thenReturn(Optional.of(passata));
    }

    private void extras(Long recipeId, RecipeExtraNodeDTO... nodes) {
        lenient().when(recipeExtrasService.hasExtras(recipeId)).thenReturn(true);
        lenient().when(recipeExtrasService.buildExtrasTree(org.mockito.ArgumentMatchers.eq(recipeId), any()))
            .thenReturn(List.of(nodes));
    }

    private static RecipeExtraNodeDTO node(Long id, String name, Long productId, RecipeExtraNodeDTO... children) {
        return RecipeExtraNodeDTO.builder().recipeId(id).recipeName(name).displayOrder(0)
            .storeBoughtIngredientId(productId).children(List.of(children)).build();
    }

    private static Meal meal(Long id, String key) {
        Meal m = new Meal();
        m.setId(id);
        m.setKey(key);
        return m;
    }

    private static Recipe recipe(Long id, String name, int defaultServings) {
        Recipe r = new Recipe();
        r.setId(id);
        r.setName(name);
        r.setDefaultServings(defaultServings);
        return r;
    }

    private static RecipeIngredient linkRow(Recipe linked, String grams) {
        RecipeIngredient ri = new RecipeIngredient();
        ri.setLinkedRecipe(linked);
        ri.setQuantityGrams(new BigDecimal(grams));
        return ri;
    }

    private MealPlanEntry entry(Long id, LocalDate date, Meal meal, Recipe recipe, String servings) {
        MealPlanEntry e = new MealPlanEntry();
        e.setId(id);
        e.setUser(owner);
        e.setPlanDate(date);
        e.setMeal(meal);
        e.setRecipe(recipe);
        e.setServings(new BigDecimal(servings));
        return e;
    }

    private void stubWeek(MealPlanEntry... entries) {
        when(mealPlanEntryRepository.findByUserIdAndDateRange(USER_ID, MONDAY, MONDAY.plusDays(7)))
            .thenReturn(List.of(entries));
    }

    @Test
    void weekView_listsOnlyMealsWithExtras_inDateThenMealOrder() {
        // Deliberately unordered input; Tuesday breakfast has no extras.
        stubWeek(entry(1L, MONDAY, dinner, bolognese, "2"),
                 entry(2L, MONDAY.plusDays(1), breakfast, porridge, "1"),
                 entry(3L, MONDAY, lunch, pinkSauce, "2"));

        ManageExtrasViewDTO view = service.getWeekView(USER_ID, MONDAY);

        assertThat(view.getScope()).isEqualTo("WEEK");
        assertThat(view.getEndDate()).isEqualTo(MONDAY.plusDays(6));
        assertThat(view.getMeals()).extracting(ManageExtrasMealDTO::getRecipeId).containsExactly(38L, 82L);
        assertThat(view.getMeals()).extracting(ManageExtrasMealDTO::getMealType).containsExactly("lunch", "dinner");
        assertThat(view.getMeals()).extracting(ManageExtrasMealDTO::getDayOffset).containsExactly(0, 0);
    }

    @Test
    void weekView_usedGramsScaleWithServings() {
        stubWeek(entry(1L, MONDAY, dinner, bolognese, "4")); // 4 servings of a 2-serving recipe

        ManageExtraDTO pasta = service.getWeekView(USER_ID, MONDAY).getMeals().get(0).getExtras().get(0);

        assertThat(pasta.getUsedGrams()).isEqualByComparingTo("400");
    }

    @Test
    void weekView_reportsStoredChoiceAndProductName() {
        stubWeek(entry(1L, MONDAY, dinner, bolognese, "2"));
        when(extraChoiceService.getEntryChoices(anyCollection())).thenReturn(Map.of(1L, Map.of(36L, false)));

        ManageExtraDTO pasta = service.getWeekView(USER_ID, MONDAY).getMeals().get(0).getExtras().get(0);

        assertThat(pasta.getHomemade()).isFalse();
        assertThat(pasta.getStoreBoughtIngredientId()).isEqualTo(126L);
        assertThat(pasta.getStoreBoughtIngredientName()).isEqualTo("Spaghetti (dried)");
        assertThat(pasta.getUsedGrams()).isEqualByComparingTo("200");
    }

    @Test
    void weekView_noStoredChoice_isHomemade() {
        stubWeek(entry(1L, MONDAY, dinner, bolognese, "2"));

        ManageExtraDTO pasta = service.getWeekView(USER_ID, MONDAY).getMeals().get(0).getExtras().get(0);

        assertThat(pasta.getHomemade()).isTrue();
        assertThat(pasta.getDepth()).isZero();
        assertThat(pasta.getParentExtraRecipeId()).isNull();
    }

    @Test
    void weekView_hidesChildrenOfStoreBoughtExtra() {
        stubWeek(entry(1L, MONDAY, dinner, pizza, "2"));

        // Homemade sauce: Pesto is cooked, so it is listed one level down.
        List<ManageExtraDTO> homemade = service.getWeekView(USER_ID, MONDAY).getMeals().get(0).getExtras();
        assertThat(homemade).extracting(ManageExtraDTO::getExtraRecipeId).containsExactly(12L, 99L);
        assertThat(homemade.get(1).getDepth()).isEqualTo(1);
        assertThat(homemade.get(1).getParentExtraRecipeId()).isEqualTo(12L);

        // Store-bought sauce: its Pesto is not cooked, so it disappears.
        when(extraChoiceService.getEntryChoices(anyCollection())).thenReturn(Map.of(1L, Map.of(12L, false)));
        List<ManageExtraDTO> storeBought = service.getWeekView(USER_ID, MONDAY).getMeals().get(0).getExtras();
        assertThat(storeBought).extracting(ManageExtraDTO::getExtraRecipeId).containsExactly(12L);
    }

    @Test
    void templateView_otherOwnersTemplate_throwsNotFound() {
        when(templateRepository.findByIdAndUserId(5L, USER_ID)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.getTemplateView(USER_ID, 5L))
            .isInstanceOf(MealPlanTemplateService.TemplateNotFoundException.class);
    }

    @Test
    void templateView_listsTemplateEntriesWithTheirChoices() {
        MealPlanTemplate template = new MealPlanTemplate();
        template.setId(5L);
        template.setName("Cut week");
        when(templateRepository.findByIdAndUserId(5L, USER_ID)).thenReturn(Optional.of(template));
        when(templateEntryRepository.findByTemplateId(5L))
            .thenReturn(List.of(templateEntry(700L, template, 2, dinner, bolognese)));
        when(extraChoiceService.getTemplateEntryChoices(anyCollection())).thenReturn(Map.of(700L, Map.of(36L, false)));

        ManageExtrasViewDTO view = service.getTemplateView(USER_ID, 5L);

        assertThat(view.getScope()).isEqualTo("TEMPLATE");
        assertThat(view.getTemplateName()).isEqualTo("Cut week");
        assertThat(view.getMeals()).hasSize(1);
        assertThat(view.getMeals().get(0).getDayOffset()).isEqualTo(2);
        assertThat(view.getMeals().get(0).getPlanDate()).isNull();
        assertThat(view.getMeals().get(0).getExtras().get(0).getHomemade()).isFalse();
    }

    @Test
    void templateExtrasCounts_countsMealsWithExtrasAndStoreBought() {
        MealPlanTemplate template = new MealPlanTemplate();
        template.setId(5L);
        MealPlanTemplateEntry withPasta = templateEntry(700L, template, 0, dinner, bolognese);
        MealPlanTemplateEntry withSauce = templateEntry(701L, template, 1, lunch, pinkSauce);
        MealPlanTemplateEntry plain = templateEntry(702L, template, 2, breakfast, porridge);
        when(templateEntryRepository.findByTemplateId(5L)).thenReturn(List.of(withPasta, withSauce, plain));
        when(extraChoiceService.getTemplateEntryChoices(anyCollection())).thenReturn(Map.of(
            700L, Map.of(36L, false),
            701L, Map.of(12L, false, 36L, true)));

        int[] counts = service.templateExtrasCounts(List.of(template)).get(5L);

        assertThat(counts[0]).isEqualTo(2); // extrasMealCount: two of the three entries have extras
        assertThat(counts[1]).isEqualTo(2); // storeBoughtCount: 36 on entry 700 and 12 on entry 701
    }

    private static MealPlanTemplateEntry templateEntry(Long id, MealPlanTemplate template, int dayOffset,
                                                       Meal meal, Recipe recipe) {
        MealPlanTemplateEntry e = new MealPlanTemplateEntry();
        e.setId(id);
        e.setTemplate(template);
        e.setDayOffset(dayOffset);
        e.setMeal(meal);
        e.setRecipe(recipe);
        e.setServings(new BigDecimal("2"));
        return e;
    }
}
