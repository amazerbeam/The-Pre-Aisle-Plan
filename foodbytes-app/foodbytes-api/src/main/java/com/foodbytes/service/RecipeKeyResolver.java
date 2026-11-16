package com.foodbytes.service;

import com.foodbytes.repository.RecipeFamilyMemberRepository;
import com.foodbytes.repository.RecipeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

/**
 * The per-person key for a recipe FAMILY: the family's default (Moderate) recipe id, or the recipe
 * itself when it has no family / no default. Shared by hidden recipes and recipe folders, so one card
 * maps to one key everywhere. Empty when the recipe does not exist.
 */
@Component
@RequiredArgsConstructor
public class RecipeKeyResolver {
    private final RecipeRepository recipeRepository;
    private final RecipeFamilyMemberRepository recipeFamilyMemberRepository;

    @Transactional(readOnly = true)
    public Optional<Long> resolve(Long recipeId) {
        if (!recipeRepository.existsById(recipeId)) return Optional.empty();
        // Lighter finder (no macro graph): only ids are needed here.
        return Optional.of(recipeFamilyMemberRepository.findByRecipeId(recipeId)
            .flatMap(m -> recipeFamilyMemberRepository.findVariantsForRecipe(recipeId).stream()
                .filter(v -> Boolean.TRUE.equals(v.getIsDefault()))
                .map(v -> v.getRecipe().getId())
                .findFirst())
            .orElse(recipeId));
    }
}
