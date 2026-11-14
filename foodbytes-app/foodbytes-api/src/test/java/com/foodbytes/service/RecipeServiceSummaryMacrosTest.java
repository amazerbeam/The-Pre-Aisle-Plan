package com.foodbytes.service;

import com.foodbytes.dto.RecipeSummaryDTO;
import com.foodbytes.dto.RecipeVariantDTO;
import com.foodbytes.model.Recipe;
import com.foodbytes.model.RecipeFamilyMember;
import com.foodbytes.repository.*;
import jakarta.persistence.EntityManager;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.HashSet;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

/**
 * Recipes redesign: the summary and each of its variants carry per-serving P/C/F from
 * MacroCalculationService (homemade basis), so the card chips agree with the recipe view.
 */
@ExtendWith(MockitoExtension.class)
class RecipeServiceSummaryMacrosTest {

    @Mock private RecipeRepository recipeRepository;
    @Mock private IngredientService ingredientService;
    @Mock private RecipeFamilyMemberRepository recipeFamilyMemberRepository;
    @Mock private RecipeExtrasService recipeExtrasService;
    @Mock private MacroCalculationService macroCalculationService;
    @Mock private IngredientRepository ingredientRepository;
    @Mock private UnitRepository unitRepository;
    @Mock private MealRepository mealRepository;
    @Mock private AisleRepository aisleRepository;
    @Mock private EntityManager entityManager;

    @InjectMocks private RecipeService recipeService;

    @Test
    void summary_carriesPerServingMacros_forTheRecipeAndEachVariant() {
        Recipe moderate = recipe(7L, "Porridge", 2);
        Recipe light = recipe(6L, "Porridge (Light)", 2);
        when(recipeRepository.findById(7L)).thenReturn(Optional.of(moderate));
        when(macroCalculationService.calculateRecipeTotalCalories(moderate)).thenReturn(1130);
        when(macroCalculationService.calculatePerServingMacros(moderate)).thenReturn(new int[]{40, 72, 16});
        when(macroCalculationService.calculatePerServingMacros(light)).thenReturn(new int[]{36, 62, 13});
        when(macroCalculationService.calculateCaloriesPerServing(any())).thenReturn(565);
        RecipeFamilyMember mModerate = member(moderate, "Moderate", true, 2);
        RecipeFamilyMember mLight = member(light, "Light", false, 1);
        when(recipeFamilyMemberRepository.findByRecipeId(7L)).thenReturn(Optional.of(mModerate));
        when(recipeFamilyMemberRepository.findVariantsForRecipeWithMacroGraph(7L)).thenReturn(List.of(mLight, mModerate));

        RecipeSummaryDTO dto = recipeService.getRecipeSummaryById(7L);

        assertThat(dto.getCalories()).isEqualTo(1130); // stays whole-recipe kcal
        assertThat(dto.getProteinPerServing()).isEqualTo(40);
        assertThat(dto.getCarbsPerServing()).isEqualTo(72);
        assertThat(dto.getFatPerServing()).isEqualTo(16);
        RecipeVariantDTO lightDto = dto.getVariants().stream()
            .filter(v -> v.getRecipeId().equals(6L)).findFirst().orElseThrow();
        assertThat(lightDto.getProteinPerServing()).isEqualTo(36);
        assertThat(lightDto.getCarbsPerServing()).isEqualTo(62);
        assertThat(lightDto.getFatPerServing()).isEqualTo(13);
    }

    @Test
    void summary_soloRecipe_hasMacrosAndNoVariants() {
        Recipe solo = recipe(23L, "Omelette", 1);
        when(recipeRepository.findById(23L)).thenReturn(Optional.of(solo));
        when(macroCalculationService.calculatePerServingMacros(solo)).thenReturn(new int[]{38, 45, 20});
        when(recipeFamilyMemberRepository.findByRecipeId(23L)).thenReturn(Optional.empty());

        RecipeSummaryDTO dto = recipeService.getRecipeSummaryById(23L);

        assertThat(dto.getProteinPerServing()).isEqualTo(38);
        assertThat(dto.getCarbsPerServing()).isEqualTo(45);
        assertThat(dto.getFatPerServing()).isEqualTo(20);
        assertThat(dto.getVariants()).isEmpty();
    }

    private static Recipe recipe(Long id, String name, int servings) {
        Recipe r = new Recipe();
        r.setId(id);
        r.setName(name);
        r.setDefaultServings(servings);
        r.setIsCheat(false);
        r.setMeals(new HashSet<>());
        return r;
    }

    private static RecipeFamilyMember member(Recipe recipe, String label, boolean isDefault, int order) {
        RecipeFamilyMember m = new RecipeFamilyMember();
        m.setRecipe(recipe);
        m.setVariantLabel(label);
        m.setIsDefault(isDefault);
        m.setDisplayOrder(order);
        return m;
    }
}
