package com.foodbytes.service;

import com.foodbytes.dto.*;
import com.foodbytes.model.*;
import com.foodbytes.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class RecipeService {

    private final RecipeRepository recipeRepository;
    private final RecipeIngredientRepository recipeIngredientRepository;
    private final RecipeStepRepository recipeStepRepository;
    private final RecipeMealRepository recipeMealRepository;
    private final IngredientRepository ingredientRepository;
    private final UnitRepository unitRepository;
    private final MealRepository mealRepository;
    private final AuditService auditService;

    @Transactional(readOnly = true)
    public List<RecipeListDTO> getAllRecipes(Boolean isAdmin, String mealType, String search) {
        List<Recipe> recipes;

        // Convert mealType name to meal key (e.g., "Breakfast" -> "breakfast")
        String mealKey = mealType != null ? mealType.toLowerCase() : null;

        if (isAdmin) {
            // Admin sees all non-deleted recipes
            if (mealKey != null) {
                recipes = recipeRepository.findByMealKeyAndIsDeleted(mealKey, false);
            } else if (search != null && !search.isEmpty()) {
                recipes = recipeRepository.findByNameContainingIgnoreCaseAndIsDeleted(search, false);
            } else {
                recipes = recipeRepository.findByIsDeleted(false);
            }
        } else {
            // Regular users only see live recipes
            if (mealKey != null) {
                recipes = recipeRepository.findByMealKeyAndIsLiveAndIsDeleted(mealKey, true, false);
            } else if (search != null && !search.isEmpty()) {
                recipes = recipeRepository.findByNameContainingIgnoreCaseAndIsLiveAndIsDeleted(search, true, false);
            } else {
                recipes = recipeRepository.findByIsLiveAndIsDeleted(true, false);
            }
        }

        return recipes.stream()
                .map(this::convertToListDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public RecipeDTO getRecipeById(Long id, Boolean isAdmin) {
        Recipe recipe = recipeRepository.findByIdAndIsDeleted(id, false)
                .orElseThrow(() -> new RuntimeException("Recipe not found with id: " + id));

        // Check access permissions
        if (!isAdmin && !recipe.getIsLive()) {
            throw new RuntimeException("Recipe is not available");
        }

        return convertToDTO(recipe);
    }

    @Transactional
    public RecipeDTO createRecipe(CreateRecipeRequest request, User user) {
        // Create recipe entity
        Recipe recipe = Recipe.builder()
                .name(request.getName())
                .defaultServings(request.getDefaultServings())
                .calories(request.getCalories())
                .isCheat(request.getIsCheat())
                .isLive(request.getIsLive())
                .isDeleted(false)
                .ingredients(new ArrayList<>())
                .steps(new ArrayList<>())
                .meals(new ArrayList<>())
                .build();

        recipe = recipeRepository.save(recipe);

        // Add ingredients
        for (CreateRecipeRequest.IngredientInput input : request.getIngredients()) {
            Ingredient ingredient = ingredientRepository.findById(input.getIngredientId())
                    .orElseThrow(() -> new RuntimeException("Ingredient not found: " + input.getIngredientId()));
            Unit unit = unitRepository.findById(input.getUnitId())
                    .orElseThrow(() -> new RuntimeException("Unit not found: " + input.getUnitId()));

            RecipeIngredient recipeIngredient = RecipeIngredient.builder()
                    .recipe(recipe)
                    .ingredient(ingredient)
                    .quantity(input.getQuantity())
                    .unit(unit)
                    .displayOrder(input.getDisplayOrder())
                    .build();

            recipe.getIngredients().add(recipeIngredient);
        }

        // Add steps
        for (CreateRecipeRequest.StepInput input : request.getSteps()) {
            RecipeStep step = RecipeStep.builder()
                    .recipe(recipe)
                    .stepNumber(input.getStepNumber())
                    .instruction(input.getInstruction())
                    .build();

            recipe.getSteps().add(step);
        }

        // Add meal types
        for (String mealKey : request.getMealTypes()) {
            Meal meal = mealRepository.findByKey(mealKey)
                    .orElseThrow(() -> new RuntimeException("Meal type not found: " + mealKey));

            RecipeMeal recipeMeal = RecipeMeal.builder()
                    .recipe(recipe)
                    .meal(meal)
                    .build();

            recipe.getMeals().add(recipeMeal);
        }

        recipe = recipeRepository.save(recipe);

        // Audit log
        auditService.logRecipeChange(recipe.getId(), user, AuditAction.CREATE, null, recipe);

        log.info("Recipe created: {} by user: {}", recipe.getName(), user.getEmail());

        return convertToDTO(recipe);
    }

    @Transactional
    public RecipeDTO updateRecipe(Long id, UpdateRecipeRequest request, User user) {
        Recipe recipe = recipeRepository.findByIdAndIsDeleted(id, false)
                .orElseThrow(() -> new RuntimeException("Recipe not found with id: " + id));

        // Store old recipe for audit
        Recipe oldRecipe = Recipe.builder()
                .id(recipe.getId())
                .name(recipe.getName())
                .defaultServings(recipe.getDefaultServings())
                .calories(recipe.getCalories())
                .isCheat(recipe.getIsCheat())
                .isLive(recipe.getIsLive())
                .isDeleted(recipe.getIsDeleted())
                .build();

        // Update recipe fields
        recipe.setName(request.getName());
        recipe.setDefaultServings(request.getDefaultServings());
        recipe.setCalories(request.getCalories());
        recipe.setIsCheat(request.getIsCheat());
        recipe.setIsLive(request.getIsLive());

        // Delete existing ingredients, steps, and meals
        recipeIngredientRepository.deleteByRecipeId(id);
        recipeStepRepository.deleteByRecipeId(id);
        recipeMealRepository.deleteByRecipeId(id);

        recipe.getIngredients().clear();
        recipe.getSteps().clear();
        recipe.getMeals().clear();

        // Add new ingredients
        for (UpdateRecipeRequest.IngredientInput input : request.getIngredients()) {
            Ingredient ingredient = ingredientRepository.findById(input.getIngredientId())
                    .orElseThrow(() -> new RuntimeException("Ingredient not found: " + input.getIngredientId()));
            Unit unit = unitRepository.findById(input.getUnitId())
                    .orElseThrow(() -> new RuntimeException("Unit not found: " + input.getUnitId()));

            RecipeIngredient recipeIngredient = RecipeIngredient.builder()
                    .recipe(recipe)
                    .ingredient(ingredient)
                    .quantity(input.getQuantity())
                    .unit(unit)
                    .displayOrder(input.getDisplayOrder())
                    .build();

            recipe.getIngredients().add(recipeIngredient);
        }

        // Add new steps
        for (UpdateRecipeRequest.StepInput input : request.getSteps()) {
            RecipeStep step = RecipeStep.builder()
                    .recipe(recipe)
                    .stepNumber(input.getStepNumber())
                    .instruction(input.getInstruction())
                    .build();

            recipe.getSteps().add(step);
        }

        // Add new meal types
        for (String mealKey : request.getMealTypes()) {
            Meal meal = mealRepository.findByKey(mealKey)
                    .orElseThrow(() -> new RuntimeException("Meal type not found: " + mealKey));

            RecipeMeal recipeMeal = RecipeMeal.builder()
                    .recipe(recipe)
                    .meal(meal)
                    .build();

            recipe.getMeals().add(recipeMeal);
        }

        recipe = recipeRepository.save(recipe);

        // Audit log
        auditService.logRecipeChange(recipe.getId(), user, AuditAction.UPDATE, oldRecipe, recipe);

        log.info("Recipe updated: {} by user: {}", recipe.getName(), user.getEmail());

        return convertToDTO(recipe);
    }

    @Transactional
    public void deleteRecipe(Long id, User user) {
        Recipe recipe = recipeRepository.findByIdAndIsDeleted(id, false)
                .orElseThrow(() -> new RuntimeException("Recipe not found with id: " + id));

        // Store old recipe for audit
        Recipe oldRecipe = Recipe.builder()
                .id(recipe.getId())
                .name(recipe.getName())
                .defaultServings(recipe.getDefaultServings())
                .calories(recipe.getCalories())
                .isCheat(recipe.getIsCheat())
                .isLive(recipe.getIsLive())
                .isDeleted(recipe.getIsDeleted())
                .build();

        // Soft delete
        recipe.setIsDeleted(true);
        recipe.setIsLive(false);
        recipeRepository.save(recipe);

        // Audit log
        auditService.logRecipeChange(recipe.getId(), user, AuditAction.DELETE, oldRecipe, recipe);

        log.info("Recipe soft deleted: {} by user: {}", recipe.getName(), user.getEmail());
    }

    @Transactional
    public RecipeDTO toggleVisibility(Long id, User user) {
        Recipe recipe = recipeRepository.findByIdAndIsDeleted(id, false)
                .orElseThrow(() -> new RuntimeException("Recipe not found with id: " + id));

        // Store old recipe for audit
        Recipe oldRecipe = Recipe.builder()
                .id(recipe.getId())
                .name(recipe.getName())
                .defaultServings(recipe.getDefaultServings())
                .calories(recipe.getCalories())
                .isCheat(recipe.getIsCheat())
                .isLive(recipe.getIsLive())
                .isDeleted(recipe.getIsDeleted())
                .build();

        recipe.setIsLive(!recipe.getIsLive());
        recipe = recipeRepository.save(recipe);

        // Audit log
        auditService.logRecipeChange(recipe.getId(), user, AuditAction.UPDATE, oldRecipe, recipe);

        log.info("Recipe visibility toggled: {} to {} by user: {}", recipe.getName(), recipe.getIsLive(), user.getEmail());

        return convertToDTO(recipe);
    }

    private RecipeListDTO convertToListDTO(Recipe recipe) {
        List<String> mealTypes = recipe.getMeals().stream()
                .map(rm -> rm.getMeal().getKey())
                .collect(Collectors.toList());

        return RecipeListDTO.builder()
                .id(recipe.getId())
                .name(recipe.getName())
                .defaultServings(recipe.getDefaultServings())
                .calories(recipe.getCalories())
                .isCheat(recipe.getIsCheat())
                .isLive(recipe.getIsLive())
                .mealTypes(mealTypes)
                .createdAt(recipe.getCreatedAt())
                .updatedAt(recipe.getUpdatedAt())
                .build();
    }

    private RecipeDTO convertToDTO(Recipe recipe) {
        List<RecipeIngredientDTO> ingredients = recipe.getIngredients().stream()
                .map(ri -> RecipeIngredientDTO.builder()
                        .id(ri.getId())
                        .ingredientId(ri.getIngredient().getId())
                        .ingredientName(ri.getIngredient().getName())
                        .ingredientKey(ri.getIngredient().getKey())
                        .quantity(ri.getQuantity())
                        .unitId(ri.getUnit().getId())
                        .unitValue(ri.getUnit().getValue())
                        .unitKey(ri.getUnit().getKey())
                        .displayOrder(ri.getDisplayOrder())
                        .aisleId(ri.getIngredient().getAisle().getId())
                        .aisleName(ri.getIngredient().getAisle().getName())
                        .aisleColor(ri.getIngredient().getAisle().getColor())
                        .build())
                .collect(Collectors.toList());

        List<RecipeStepDTO> steps = recipe.getSteps().stream()
                .map(rs -> RecipeStepDTO.builder()
                        .id(rs.getId())
                        .stepNumber(rs.getStepNumber())
                        .instruction(rs.getInstruction())
                        .build())
                .collect(Collectors.toList());

        List<String> mealTypes = recipe.getMeals().stream()
                .map(rm -> rm.getMeal().getKey())
                .collect(Collectors.toList());

        return RecipeDTO.builder()
                .id(recipe.getId())
                .name(recipe.getName())
                .defaultServings(recipe.getDefaultServings())
                .calories(recipe.getCalories())
                .isCheat(recipe.getIsCheat())
                .isLive(recipe.getIsLive())
                .isDeleted(recipe.getIsDeleted())
                .createdAt(recipe.getCreatedAt())
                .updatedAt(recipe.getUpdatedAt())
                .ingredients(ingredients)
                .steps(steps)
                .mealTypes(mealTypes)
                .build();
    }
}
