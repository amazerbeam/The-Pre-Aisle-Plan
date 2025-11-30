package com.foodbytes.service;

import com.foodbytes.dto.MealPlanEntryDTO;
import com.foodbytes.dto.RecipeDTO;
import com.foodbytes.model.MealPlanEntry;
import com.foodbytes.model.Recipe;
import com.foodbytes.model.User;
import com.foodbytes.repository.MealPlanEntryRepository;
import com.foodbytes.repository.RecipeRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class MealPlanService {

    private final MealPlanEntryRepository mealPlanEntryRepository;
    private final RecipeRepository recipeRepository;
    private final RecipeService recipeService;

    public List<MealPlanEntryDTO> getEntriesForDateRange(User user, LocalDate startDate, LocalDate endDate) {
        List<MealPlanEntry> entries = mealPlanEntryRepository
                .findByUserAndPlanDateBetweenOrderByPlanDateAsc(user, startDate, endDate);

        return entries.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public MealPlanEntryDTO createEntry(User user, MealPlanEntryDTO entryDTO) {
        Recipe recipe = recipeRepository.findByIdAndIsDeletedFalse(entryDTO.getRecipeId())
                .orElseThrow(() -> new RuntimeException("Recipe not found with id: " + entryDTO.getRecipeId()));

        // Verify recipe is live for non-admin users
        if (!user.getIsAdmin() && !recipe.getIsLive()) {
            throw new RuntimeException("Recipe is not available");
        }

        MealPlanEntry entry = MealPlanEntry.builder()
                .user(user)
                .planDate(entryDTO.getPlanDate())
                .mealType(entryDTO.getMealType())
                .recipe(recipe)
                .servings(entryDTO.getServings())
                .build();

        MealPlanEntry savedEntry = mealPlanEntryRepository.save(entry);
        log.info("Meal plan entry created for user: {} on date: {}", user.getEmail(), entryDTO.getPlanDate());

        return convertToDTO(savedEntry);
    }

    @Transactional
    public MealPlanEntryDTO updateEntry(User user, Long entryId, MealPlanEntryDTO entryDTO) {
        MealPlanEntry entry = mealPlanEntryRepository.findById(entryId)
                .orElseThrow(() -> new RuntimeException("Meal plan entry not found with id: " + entryId));

        // Verify ownership
        if (!entry.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("Unauthorized to update this meal plan entry");
        }

        // If recipe is being changed, verify the new recipe
        if (entryDTO.getRecipeId() != null && !entry.getRecipe().getId().equals(entryDTO.getRecipeId())) {
            Recipe newRecipe = recipeRepository.findByIdAndIsDeletedFalse(entryDTO.getRecipeId())
                    .orElseThrow(() -> new RuntimeException("Recipe not found with id: " + entryDTO.getRecipeId()));

            if (!user.getIsAdmin() && !newRecipe.getIsLive()) {
                throw new RuntimeException("Recipe is not available");
            }

            entry.setRecipe(newRecipe);
        }

        // Update other fields
        if (entryDTO.getPlanDate() != null) {
            entry.setPlanDate(entryDTO.getPlanDate());
        }
        if (entryDTO.getMealType() != null) {
            entry.setMealType(entryDTO.getMealType());
        }
        if (entryDTO.getServings() != null) {
            entry.setServings(entryDTO.getServings());
        }

        MealPlanEntry savedEntry = mealPlanEntryRepository.save(entry);
        log.info("Meal plan entry updated: {} by user: {}", entryId, user.getEmail());

        return convertToDTO(savedEntry);
    }

    @Transactional
    public void deleteEntry(User user, Long entryId) {
        MealPlanEntry entry = mealPlanEntryRepository.findById(entryId)
                .orElseThrow(() -> new RuntimeException("Meal plan entry not found with id: " + entryId));

        // Verify ownership
        if (!entry.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("Unauthorized to delete this meal plan entry");
        }

        mealPlanEntryRepository.delete(entry);
        log.info("Meal plan entry deleted: {} by user: {}", entryId, user.getEmail());
    }

    private MealPlanEntryDTO convertToDTO(MealPlanEntry entry) {
        RecipeDTO recipeDTO = recipeService.getRecipeById(entry.getRecipe().getId(), true);

        return MealPlanEntryDTO.builder()
                .id(entry.getId())
                .planDate(entry.getPlanDate())
                .mealType(entry.getMealType())
                .recipeId(entry.getRecipe().getId())
                .recipe(recipeDTO)
                .servings(entry.getServings())
                .createdAt(entry.getCreatedAt())
                .updatedAt(entry.getUpdatedAt())
                .build();
    }
}
