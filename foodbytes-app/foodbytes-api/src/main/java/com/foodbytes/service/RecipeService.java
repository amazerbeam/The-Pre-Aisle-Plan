package com.foodbytes.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.foodbytes.dto.RecipeDTO;
import com.foodbytes.model.AuditAction;
import com.foodbytes.model.Recipe;
import com.foodbytes.model.User;
import com.foodbytes.repository.RecipeRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class RecipeService {

    private final RecipeRepository recipeRepository;
    private final AuditService auditService;
    private final ObjectMapper objectMapper;

    public List<RecipeDTO> getAllRecipes(boolean isAdmin) {
        List<Recipe> recipes = isAdmin
                ? recipeRepository.findByIsDeletedFalse()
                : recipeRepository.findByIsLiveTrueAndIsDeletedFalse();

        return recipes.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public RecipeDTO getRecipeById(Long id, boolean isAdmin) {
        Recipe recipe = recipeRepository.findByIdAndIsDeletedFalse(id)
                .orElseThrow(() -> new RuntimeException("Recipe not found with id: " + id));

        // Check if non-admin user is trying to access non-live recipe
        if (!isAdmin && !recipe.getIsLive()) {
            throw new RuntimeException("Recipe not found with id: " + id);
        }

        return convertToDTO(recipe);
    }

    @Transactional
    public RecipeDTO createRecipe(RecipeDTO recipeDTO, User user) {
        Recipe recipe = Recipe.builder()
                .name(recipeDTO.getName())
                .mealTypes(recipeDTO.getMealTypes().toString())
                .defaultServings(recipeDTO.getDefaultServings())
                .calories(recipeDTO.getCalories())
                .ingredients(recipeDTO.getIngredients().toString())
                .steps(recipeDTO.getSteps().toString())
                .isCheat(recipeDTO.getIsCheat() != null ? recipeDTO.getIsCheat() : false)
                .isLive(recipeDTO.getIsLive() != null ? recipeDTO.getIsLive() : false)
                .isDeleted(false)
                .build();

        Recipe savedRecipe = recipeRepository.save(recipe);
        log.info("Recipe created: {} (ID: {}) by user: {}", savedRecipe.getName(), savedRecipe.getId(), user.getEmail());

        // Audit log
        auditService.logChange(savedRecipe, user, AuditAction.CREATE, null, convertToDTO(savedRecipe));

        return convertToDTO(savedRecipe);
    }

    @Transactional
    public RecipeDTO updateRecipe(Long id, RecipeDTO recipeDTO, User user) {
        Recipe recipe = recipeRepository.findByIdAndIsDeletedFalse(id)
                .orElseThrow(() -> new RuntimeException("Recipe not found with id: " + id));

        // Store old values for audit
        RecipeDTO oldValues = convertToDTO(recipe);

        // Update fields
        recipe.setName(recipeDTO.getName());
        recipe.setMealTypes(recipeDTO.getMealTypes().toString());
        recipe.setDefaultServings(recipeDTO.getDefaultServings());
        recipe.setCalories(recipeDTO.getCalories());
        recipe.setIngredients(recipeDTO.getIngredients().toString());
        recipe.setSteps(recipeDTO.getSteps().toString());
        if (recipeDTO.getIsCheat() != null) {
            recipe.setIsCheat(recipeDTO.getIsCheat());
        }
        if (recipeDTO.getIsLive() != null) {
            recipe.setIsLive(recipeDTO.getIsLive());
        }

        Recipe savedRecipe = recipeRepository.save(recipe);
        log.info("Recipe updated: {} (ID: {}) by user: {}", savedRecipe.getName(), savedRecipe.getId(), user.getEmail());

        // Audit log
        RecipeDTO newValues = convertToDTO(savedRecipe);
        auditService.logChange(savedRecipe, user, AuditAction.UPDATE, oldValues, newValues);

        return newValues;
    }

    @Transactional
    public void softDeleteRecipe(Long id, User user) {
        Recipe recipe = recipeRepository.findByIdAndIsDeletedFalse(id)
                .orElseThrow(() -> new RuntimeException("Recipe not found with id: " + id));

        // Store old values for audit
        RecipeDTO oldValues = convertToDTO(recipe);

        recipe.setIsDeleted(true);
        recipeRepository.save(recipe);
        log.info("Recipe soft deleted: {} (ID: {}) by user: {}", recipe.getName(), recipe.getId(), user.getEmail());

        // Audit log
        auditService.logChange(recipe, user, AuditAction.DELETE, oldValues, null);
    }

    private RecipeDTO convertToDTO(Recipe recipe) {
        try {
            return RecipeDTO.builder()
                    .id(recipe.getId())
                    .name(recipe.getName())
                    .mealTypes(objectMapper.readTree(recipe.getMealTypes()))
                    .defaultServings(recipe.getDefaultServings())
                    .calories(recipe.getCalories())
                    .ingredients(objectMapper.readTree(recipe.getIngredients()))
                    .steps(objectMapper.readTree(recipe.getSteps()))
                    .isCheat(recipe.getIsCheat())
                    .isLive(recipe.getIsLive())
                    .isDeleted(recipe.getIsDeleted())
                    .createdAt(recipe.getCreatedAt())
                    .updatedAt(recipe.getUpdatedAt())
                    .build();
        } catch (JsonProcessingException e) {
            log.error("Error converting recipe to DTO", e);
            throw new RuntimeException("Error processing recipe data", e);
        }
    }
}
