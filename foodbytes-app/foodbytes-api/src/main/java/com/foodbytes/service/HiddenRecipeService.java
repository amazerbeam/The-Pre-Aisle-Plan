package com.foodbytes.service;

import com.foodbytes.model.UserHiddenRecipe;
import com.foodbytes.repository.UserHiddenRecipeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

/**
 * Per-person "Hide from my recipes" (Recipes redesign). Keys are the family's DEFAULT recipe id,
 * so hiding any variant hides the whole family. Keyed by the requesting user, never the shared
 * meal-plan owner. Never touches meal_plan_entries; independent of recipes.is_live.
 */
@Service
@RequiredArgsConstructor
public class HiddenRecipeService {
    private final UserHiddenRecipeRepository userHiddenRecipeRepository;
    private final RecipeKeyResolver recipeKeyResolver;

    @Transactional(readOnly = true)
    public List<Long> listHidden(Long userId) {
        return userHiddenRecipeRepository.findByUserId(userId).stream().map(UserHiddenRecipe::getRecipeId).toList();
    }

    @Transactional
    public Optional<Long> hide(Long userId, Long recipeId) {
        return normalise(recipeId).map(key -> {
            userHiddenRecipeRepository.insertIfAbsent(userId, key);
            return key;
        });
    }

    @Transactional
    public void unhide(Long userId, Long recipeId) {
        normalise(recipeId).ifPresent(key -> userHiddenRecipeRepository.deleteByUserIdAndRecipeId(userId, key));
    }

    /** Family default id, or the recipe itself when it has no family / no default. Empty if unknown. */
    public Optional<Long> normalise(Long recipeId) {
        return recipeKeyResolver.resolve(recipeId);
    }
}
