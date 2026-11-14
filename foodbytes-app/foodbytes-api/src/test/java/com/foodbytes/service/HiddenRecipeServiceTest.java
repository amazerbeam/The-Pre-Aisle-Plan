package com.foodbytes.service;

import com.foodbytes.model.Recipe;
import com.foodbytes.model.RecipeFamilyMember;
import com.foodbytes.model.UserHiddenRecipe;
import com.foodbytes.repository.RecipeFamilyMemberRepository;
import com.foodbytes.repository.RecipeRepository;
import com.foodbytes.repository.UserHiddenRecipeRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

/** Hide key normalisation (family default id), idempotency and per-user listing. */
@ExtendWith(MockitoExtension.class)
class HiddenRecipeServiceTest {

    @Mock private UserHiddenRecipeRepository userHiddenRecipeRepository;
    @Mock private RecipeRepository recipeRepository;
    @Mock private RecipeFamilyMemberRepository recipeFamilyMemberRepository;

    @InjectMocks private HiddenRecipeService service;

    @Test
    void hide_variant_storesTheFamilyDefaultId() {
        when(recipeRepository.existsById(6L)).thenReturn(true);
        RecipeFamilyMember light = memberOfFamily(6L, false);
        RecipeFamilyMember moderate = memberOfFamily(7L, true);
        when(recipeFamilyMemberRepository.findByRecipeId(6L)).thenReturn(Optional.of(light));
        when(recipeFamilyMemberRepository.findVariantsForRecipe(6L)).thenReturn(List.of(light, moderate));

        assertThat(service.hide(5L, 6L)).contains(7L);
        verify(userHiddenRecipeRepository).insertIfAbsent(5L, 7L);
    }

    @Test
    void hide_soloRecipe_storesItself() {
        when(recipeRepository.existsById(23L)).thenReturn(true);
        when(recipeFamilyMemberRepository.findByRecipeId(23L)).thenReturn(Optional.empty());

        assertThat(service.hide(5L, 23L)).contains(23L);
        verify(userHiddenRecipeRepository).insertIfAbsent(5L, 23L);
    }

    @Test
    void hide_isAnIdempotentInsert_withNoExistsCheckOrEntitySave() {
        when(recipeRepository.existsById(23L)).thenReturn(true);
        when(recipeFamilyMemberRepository.findByRecipeId(23L)).thenReturn(Optional.empty());

        assertThat(service.hide(5L, 23L)).contains(23L);
        assertThat(service.hide(5L, 23L)).contains(23L);

        // The duplicate is resolved in SQL (INSERT ... ON DUPLICATE KEY), so a repeat or concurrent hide
        // never throws inside the transaction.
        verify(userHiddenRecipeRepository, times(2)).insertIfAbsent(5L, 23L);
        verify(userHiddenRecipeRepository, never()).save(any());
    }

    @Test
    void hide_unknownRecipe_returnsEmpty() {
        when(recipeRepository.existsById(999L)).thenReturn(false);

        assertThat(service.hide(5L, 999L)).isEmpty();
        verify(userHiddenRecipeRepository, never()).insertIfAbsent(any(), any());
    }

    @Test
    void unhide_normalisesThenDeletes() {
        when(recipeRepository.existsById(6L)).thenReturn(true);
        RecipeFamilyMember light = memberOfFamily(6L, false);
        RecipeFamilyMember moderate = memberOfFamily(7L, true);
        when(recipeFamilyMemberRepository.findByRecipeId(6L)).thenReturn(Optional.of(light));
        when(recipeFamilyMemberRepository.findVariantsForRecipe(6L)).thenReturn(List.of(light, moderate));

        service.unhide(5L, 6L);

        verify(userHiddenRecipeRepository).deleteByUserIdAndRecipeId(5L, 7L);
    }

    @Test
    void listHidden_returnsIdsForThatUserOnly() {
        when(userHiddenRecipeRepository.findByUserId(5L))
            .thenReturn(List.of(new UserHiddenRecipe(1L, 5L, 7L, null)));

        assertThat(service.listHidden(5L)).containsExactly(7L);
    }

    private static RecipeFamilyMember memberOfFamily(Long recipeId, boolean isDefault) {
        Recipe recipe = new Recipe();
        recipe.setId(recipeId);
        RecipeFamilyMember m = new RecipeFamilyMember();
        m.setRecipe(recipe);
        m.setIsDefault(isDefault);
        return m;
    }
}
