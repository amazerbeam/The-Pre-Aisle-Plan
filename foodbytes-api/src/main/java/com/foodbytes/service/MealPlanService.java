package com.foodbytes.service;

import com.foodbytes.dto.MealPlanDTO;
import com.foodbytes.exception.ResourceNotFoundException;
import com.foodbytes.model.MealPlanEntry;
import com.foodbytes.model.MealType;
import com.foodbytes.model.Recipe;
import com.foodbytes.model.User;
import com.foodbytes.repository.MealPlanRepository;
import com.foodbytes.repository.RecipeRepository;
import com.foodbytes.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class MealPlanService {

    private final MealPlanRepository mealPlanRepository;
    private final RecipeRepository recipeRepository;
    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public List<MealPlanDTO> getEntriesForDateRange(Long userId, LocalDate from, LocalDate to) {
        return mealPlanRepository.findByUserIdAndDateRange(userId, from, to).stream()
                .map(MealPlanDTO::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional
    public MealPlanDTO createEntry(MealPlanDTO dto, Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Recipe recipe = recipeRepository.findByIdNotDeleted(dto.getRecipeId())
                .orElseThrow(() -> new ResourceNotFoundException("Recipe not found"));

        MealType mealType = MealType.valueOf(dto.getMealType());

        // Check if entry already exists
        var existingEntry = mealPlanRepository.findExistingEntry(
                userId, dto.getDate(), mealType, dto.getRecipeId());

        if (existingEntry.isPresent()) {
            // Update servings if entry exists
            MealPlanEntry entry = existingEntry.get();
            entry.setServings(dto.getServings());
            return MealPlanDTO.fromEntity(mealPlanRepository.save(entry));
        }

        // Create new entry
        MealPlanEntry entry = MealPlanEntry.builder()
                .user(user)
                .planDate(dto.getDate())
                .mealType(mealType)
                .recipe(recipe)
                .servings(dto.getServings())
                .build();

        return MealPlanDTO.fromEntity(mealPlanRepository.save(entry));
    }

    @Transactional
    public MealPlanDTO updateEntry(Long entryId, MealPlanDTO dto, Long userId) {
        MealPlanEntry entry = mealPlanRepository.findByIdAndUserId(entryId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Meal plan entry not found"));

        entry.setServings(dto.getServings());

        return MealPlanDTO.fromEntity(mealPlanRepository.save(entry));
    }

    @Transactional
    public void deleteEntry(Long entryId, Long userId) {
        MealPlanEntry entry = mealPlanRepository.findByIdAndUserId(entryId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Meal plan entry not found"));

        mealPlanRepository.delete(entry);
    }
}
