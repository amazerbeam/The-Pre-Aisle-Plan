package com.foodbytes.service;

import com.foodbytes.dto.RecipeAdminDTO;
import com.foodbytes.model.Recipe;
import com.foodbytes.repository.*;
import jakarta.persistence.EntityManager;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

/**
 * Unit tests for the recipe macro/calorie audit sign-off.
 * Covers set, clear, and the sticky invariant (a full recipe update must not
 * disturb the flag, because PATCH /admin/{id}/audit is its only writer).
 */
@ExtendWith(MockitoExtension.class)
class RecipeServiceMacroAuditTest {

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

    private Recipe recipe;

    @BeforeEach
    void setUp() {
        recipe = new Recipe();
        recipe.setId(42L);
        recipe.setName("Greek Chicken Pita Bowl");
        recipe.setDefaultServings(2);
        recipe.setCalories(1300);
        recipe.setIsCheat(false);
        recipe.setIsLive(true);
        recipe.setMacrosAudited(false);
    }

    @Test
    void markAudited_setsFlagTimestampAndAuditor() {
        when(recipeRepository.findById(42L)).thenReturn(Optional.of(recipe));
        when(recipeRepository.save(any(Recipe.class))).thenAnswer(inv -> inv.getArgument(0));
        LocalDateTime before = LocalDateTime.now().minusSeconds(1);

        RecipeAdminDTO result = recipeService.updateRecipeMacrosAudit(42L, true, 7L);

        assertThat(recipe.getMacrosAudited()).isTrue();
        assertThat(recipe.getMacrosAuditedBy()).isEqualTo(7L);
        assertThat(recipe.getMacrosAuditedAt()).isAfter(before);
        assertThat(result.getMacrosAudited()).isTrue();
        assertThat(result.getMacrosAuditedBy()).isEqualTo(7L);
        assertThat(result.getMacrosAuditedAt()).isEqualTo(recipe.getMacrosAuditedAt());
    }

    @Test
    void unmarkAudited_clearsTimestampAndAuditor() {
        recipe.setMacrosAudited(true);
        recipe.setMacrosAuditedAt(LocalDateTime.of(2026, 7, 1, 9, 30));
        recipe.setMacrosAuditedBy(7L);
        when(recipeRepository.findById(42L)).thenReturn(Optional.of(recipe));
        when(recipeRepository.save(any(Recipe.class))).thenAnswer(inv -> inv.getArgument(0));

        RecipeAdminDTO result = recipeService.updateRecipeMacrosAudit(42L, false, 7L);

        assertThat(recipe.getMacrosAudited()).isFalse();
        assertThat(recipe.getMacrosAuditedAt()).isNull();
        assertThat(recipe.getMacrosAuditedBy()).isNull();
        assertThat(result.getMacrosAudited()).isFalse();
        assertThat(result.getMacrosAuditedAt()).isNull();
        assertThat(result.getMacrosAuditedBy()).isNull();
    }

    @Test
    void updateRecipe_doesNotFlipAuditFlagFromInboundDto() {
        when(recipeRepository.findById(42L)).thenReturn(Optional.of(recipe));
        when(recipeRepository.save(any(Recipe.class))).thenAnswer(inv -> inv.getArgument(0));

        RecipeAdminDTO dto = RecipeAdminDTO.builder()
                .name("Greek Chicken Pita Bowl")
                .defaultServings(2)
                .calories(1300)
                .isCheat(false)
                .isLive(false)
                .macrosAudited(true)          // hostile/stale client payload
                .macrosAuditedBy(99L)
                .macrosAuditedAt(LocalDateTime.of(2020, 1, 1, 0, 0))
                .mealTypes(new ArrayList<>())
                .ingredients(new ArrayList<>())
                .steps(new ArrayList<>())
                .build();

        recipeService.updateRecipe(42L, dto);

        assertThat(recipe.getMacrosAudited()).isFalse();
        assertThat(recipe.getMacrosAuditedAt()).isNull();
        assertThat(recipe.getMacrosAuditedBy()).isNull();
    }

    @Test
    void createRecipe_startsUnaudited() {
        when(recipeRepository.save(any(Recipe.class))).thenAnswer(inv -> inv.getArgument(0));

        RecipeAdminDTO dto = RecipeAdminDTO.builder()
                .name("Hostile Payload Recipe")
                .defaultServings(2)
                .calories(1300)
                .isCheat(false)
                .isLive(false)
                .macrosAudited(true)          // hostile/stale payload
                .macrosAuditedBy(99L)
                .macrosAuditedAt(LocalDateTime.of(2020, 1, 1, 0, 0))
                .mealTypes(new ArrayList<>())
                .ingredients(new ArrayList<>())
                .steps(new ArrayList<>())
                .build();

        RecipeAdminDTO result = recipeService.createRecipe(dto);

        ArgumentCaptor<Recipe> savedRecipe = ArgumentCaptor.forClass(Recipe.class);
        verify(recipeRepository, times(2)).save(savedRecipe.capture());
        assertThat(savedRecipe.getValue().getMacrosAudited()).isFalse();
        assertThat(savedRecipe.getValue().getMacrosAuditedAt()).isNull();
        assertThat(savedRecipe.getValue().getMacrosAuditedBy()).isNull();
        assertThat(result.getMacrosAudited()).isFalse();
    }

    @Test
    void unknownRecipeId_throws() {
        when(recipeRepository.findById(999L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> recipeService.updateRecipeMacrosAudit(999L, true, 7L))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("Recipe not found with id: 999");
    }
}
