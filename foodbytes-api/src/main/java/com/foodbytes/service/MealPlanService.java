package com.foodbytes.service;

import com.foodbytes.dto.CreateMealPlanRequest;
import com.foodbytes.dto.MealPlanEntryDTO;
import com.foodbytes.dto.RecipeIngredientDTO;
import com.foodbytes.dto.UpdateMealPlanRequest;
import com.foodbytes.model.MealPlanEntry;
import com.foodbytes.model.Recipe;
import com.foodbytes.model.User;
import com.foodbytes.repository.MealPlanRepository;
import com.foodbytes.repository.RecipeRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.temporal.TemporalAdjusters;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class MealPlanService {

    private final MealPlanRepository mealPlanRepository;
    private final RecipeRepository recipeRepository;

    @Transactional(readOnly = true)
    public List<MealPlanEntryDTO> getEntriesForDateRange(User user, LocalDate fromDate, LocalDate toDate) {
        List<MealPlanEntry> entries = mealPlanRepository.findByUserIdAndPlanDateBetween(
                user.getId(), fromDate, toDate);

        return entries.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public MealPlanEntryDTO createEntry(User user, CreateMealPlanRequest request) {
        // Get recipe
        Recipe recipe = recipeRepository.findByIdAndIsDeleted(request.getRecipeId(), false)
                .orElseThrow(() -> new RuntimeException("Recipe not found with id: " + request.getRecipeId()));

        // Check if recipe is live (non-admin users only see live recipes)
        if (!recipe.getIsLive()) {
            throw new RuntimeException("Recipe is not available");
        }

        // Validate cheat meal limits (FR-011: max 1 per meal type per week)
        if (recipe.getIsCheat()) {
            validateCheatMealLimit(user.getId(), request.getPlanDate(), request.getMealType());
        }

        // Create meal plan entry
        MealPlanEntry entry = MealPlanEntry.builder()
                .user(user)
                .planDate(request.getPlanDate())
                .mealType(request.getMealType())
                .recipe(recipe)
                .servings(request.getServings())
                .build();

        entry = mealPlanRepository.save(entry);

        log.info("Meal plan entry created for user: {} on date: {} meal: {} recipe: {}",
                user.getEmail(), request.getPlanDate(), request.getMealType(), recipe.getName());

        return convertToDTO(entry);
    }

    @Transactional
    public MealPlanEntryDTO updateEntry(User user, Long entryId, UpdateMealPlanRequest request) {
        MealPlanEntry entry = mealPlanRepository.findById(entryId)
                .orElseThrow(() -> new RuntimeException("Meal plan entry not found with id: " + entryId));

        // Check ownership
        if (!entry.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("Unauthorized to update this meal plan entry");
        }

        // Update servings only
        entry.setServings(request.getServings());
        entry = mealPlanRepository.save(entry);

        log.info("Meal plan entry updated: {} by user: {}", entryId, user.getEmail());

        return convertToDTO(entry);
    }

    @Transactional
    public void deleteEntry(User user, Long entryId) {
        MealPlanEntry entry = mealPlanRepository.findById(entryId)
                .orElseThrow(() -> new RuntimeException("Meal plan entry not found with id: " + entryId));

        // Check ownership
        if (!entry.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("Unauthorized to delete this meal plan entry");
        }

        mealPlanRepository.delete(entry);

        log.info("Meal plan entry deleted: {} by user: {}", entryId, user.getEmail());
    }

    private void validateCheatMealLimit(Long userId, LocalDate planDate, String mealType) {
        // Get start and end of the week (Monday to Sunday)
        LocalDate startOfWeek = planDate.with(TemporalAdjusters.previousOrSame(DayOfWeek.MONDAY));
        LocalDate endOfWeek = planDate.with(TemporalAdjusters.nextOrSame(DayOfWeek.SUNDAY));

        // Check existing cheat meals for this meal type in this week
        List<MealPlanEntry> existingCheatMeals = mealPlanRepository.findCheatMealsByUserAndDateRangeAndMealType(
                userId, startOfWeek, endOfWeek, mealType);

        if (!existingCheatMeals.isEmpty()) {
            throw new RuntimeException(
                    String.format("Cheat meal limit exceeded. You can only have 1 cheat meal per meal type per week. " +
                            "You already have a cheat %s scheduled for this week.", mealType.toLowerCase()));
        }
    }

    private MealPlanEntryDTO convertToDTO(MealPlanEntry entry) {
        List<RecipeIngredientDTO> ingredients = entry.getRecipe().getIngredients().stream()
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

        return MealPlanEntryDTO.builder()
                .id(entry.getId())
                .userId(entry.getUser().getId())
                .planDate(entry.getPlanDate())
                .mealType(entry.getMealType())
                .recipeId(entry.getRecipe().getId())
                .recipeName(entry.getRecipe().getName())
                .isCheat(entry.getRecipe().getIsCheat())
                .calories(entry.getRecipe().getCalories())
                .servings(entry.getServings())
                .recipeDefaultServings(entry.getRecipe().getDefaultServings())
                .ingredients(ingredients)
                .createdAt(entry.getCreatedAt())
                .updatedAt(entry.getUpdatedAt())
                .build();
    }
}
