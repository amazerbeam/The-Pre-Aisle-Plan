package com.foodbytes.service;

import com.foodbytes.dto.RecipeExtraNodeDTO;
import com.foodbytes.dto.RecipeExtrasHierarchyDTO;
import com.foodbytes.model.Recipe;
import com.foodbytes.model.RecipeExtra;
import com.foodbytes.repository.RecipeExtraRepository;
import com.foodbytes.repository.RecipeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

/**
 * FR-086: Service for managing recipe extras (sub-recipes).
 * Handles hierarchical relationships like: Pizza -> Pizza Dough, Pizza Sauce -> Pesto
 */
@Service
@RequiredArgsConstructor
public class RecipeExtrasService {

    private final RecipeExtraRepository recipeExtraRepository;
    private final RecipeRepository recipeRepository;

    /**
     * Get hierarchical extras tree for a recipe.
     * Recursively fetches nested extras (e.g., Pizza -> Pizza Sauce -> Pesto)
     */
    @Transactional(readOnly = true)
    public RecipeExtrasHierarchyDTO getExtrasHierarchy(Long recipeId) {
        Recipe recipe = recipeRepository.findById(recipeId)
                .orElseThrow(() -> new RuntimeException("Recipe not found: " + recipeId));

        return RecipeExtrasHierarchyDTO.builder()
                .parentRecipeId(recipeId)
                .parentRecipeName(recipe.getName())
                .extras(buildExtrasTree(recipeId, new HashSet<>()))
                .build();
    }

    /**
     * Recursively build extras tree with cycle detection.
     * FR-103: Also looks up store-bought ingredient IDs from recipe_ingredients.
     * @param recipeId The recipe to get extras for
     * @param visited Set of recipe IDs already visited (prevents infinite loops)
     * @return List of extra nodes with nested children
     */
    @Transactional(readOnly = true)
    public List<RecipeExtraNodeDTO> buildExtrasTree(Long recipeId, Set<Long> visited) {
        if (visited.contains(recipeId)) {
            return new ArrayList<>(); // Prevent infinite loops from circular references
        }
        visited.add(recipeId);

        List<RecipeExtra> extras = recipeExtraRepository
                .findByParentRecipeIdOrderByDisplayOrderAsc(recipeId);

        // FR-103: Get parent recipe's ingredients to find store-bought options
        Recipe parentRecipe = recipeRepository.findWithDetailsById(recipeId).orElse(null);
        Map<Long, Long> storeBoughtMap = new HashMap<>();
        if (parentRecipe != null) {
            for (var ri : parentRecipe.getIngredients()) {
                // If both ingredient_id AND linked_recipe_id are set, this is a store-bought option
                if (ri.getIngredient() != null && ri.getLinkedRecipe() != null) {
                    storeBoughtMap.put(ri.getLinkedRecipe().getId(), ri.getIngredient().getId());
                }
            }
        }

        return extras.stream()
                .map(extra -> {
                    Long childId = extra.getChildRecipe().getId();
                    return RecipeExtraNodeDTO.builder()
                            .recipeId(childId)
                            .recipeName(extra.getChildRecipe().getName())
                            .displayOrder(extra.getDisplayOrder())
                            .storeBoughtIngredientId(storeBoughtMap.get(childId))
                            .children(buildExtrasTree(childId, new HashSet<>(visited)))
                            .build();
                })
                .collect(Collectors.toList());
    }

    /**
     * Check if recipe has any extras (direct or nested).
     */
    @Transactional(readOnly = true)
    public boolean hasExtras(Long recipeId) {
        return recipeExtraRepository.hasExtras(recipeId);
    }

    /**
     * Flatten hierarchy to list of all recipe IDs (for ingredient collection).
     * Includes all nested extras recursively.
     */
    public List<Long> flattenExtrasToIds(List<RecipeExtraNodeDTO> extras) {
        List<Long> ids = new ArrayList<>();
        for (RecipeExtraNodeDTO node : extras) {
            ids.add(node.getRecipeId());
            if (node.getChildren() != null && !node.getChildren().isEmpty()) {
                ids.addAll(flattenExtrasToIds(node.getChildren()));
            }
        }
        return ids;
    }

    /**
     * Add extra to recipe (admin).
     * @throws IllegalArgumentException if adding would create circular reference
     */
    @Transactional
    public RecipeExtra addExtra(Long parentRecipeId, Long childRecipeId, Integer displayOrder) {
        // Prevent self-reference
        if (parentRecipeId.equals(childRecipeId)) {
            throw new IllegalArgumentException("Recipe cannot be its own extra");
        }

        // Check if relationship already exists
        if (recipeExtraRepository.existsByParentRecipeIdAndChildRecipeId(parentRecipeId, childRecipeId)) {
            throw new IllegalArgumentException("This extra is already linked to the recipe");
        }

        // Prevent circular reference
        if (recipeExtraRepository.wouldCreateCircularReference(parentRecipeId, childRecipeId)) {
            throw new IllegalArgumentException("Adding this extra would create a circular reference");
        }

        Recipe parent = recipeRepository.findById(parentRecipeId)
                .orElseThrow(() -> new RuntimeException("Parent recipe not found: " + parentRecipeId));
        Recipe child = recipeRepository.findById(childRecipeId)
                .orElseThrow(() -> new RuntimeException("Child recipe not found: " + childRecipeId));

        RecipeExtra extra = new RecipeExtra();
        extra.setParentRecipe(parent);
        extra.setChildRecipe(child);
        extra.setDisplayOrder(displayOrder != null ? displayOrder : 0);

        return recipeExtraRepository.save(extra);
    }

    /**
     * Remove extra from recipe (admin).
     */
    @Transactional
    public void removeExtra(Long extraId) {
        recipeExtraRepository.deleteById(extraId);
    }

    /**
     * Update all extras for a recipe (admin) - replaces existing.
     */
    @Transactional
    public void updateExtras(Long recipeId, List<Long> childRecipeIds) {
        // Delete all existing extras
        recipeExtraRepository.deleteByParentRecipeId(recipeId);

        // Add new extras
        if (childRecipeIds != null) {
            for (int i = 0; i < childRecipeIds.size(); i++) {
                addExtra(recipeId, childRecipeIds.get(i), i);
            }
        }
    }

    /**
     * Get available recipes that can be linked as extras.
     * Excludes current recipe and any that would cause circular refs.
     */
    @Transactional(readOnly = true)
    public List<Recipe> getAvailableExtrasForRecipe(Long recipeId) {
        List<Recipe> allRecipes = recipeRepository.findAllByOrderByNameAsc();

        return allRecipes.stream()
                .filter(recipe -> !recipe.getId().equals(recipeId)) // Exclude self
                .filter(recipe -> !recipeExtraRepository.wouldCreateCircularReference(recipeId, recipe.getId()))
                .collect(Collectors.toList());
    }
}
