package com.foodbytes.service;

import com.foodbytes.dto.*;
import com.foodbytes.model.*;
import com.foodbytes.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDate;
import java.time.format.TextStyle;
import java.util.*;
import java.util.stream.Collectors;

/**
 * Service for meal plan operations.
 * Implements FR-007 (date range), FR-014 (assign), FR-015 (remove), FR-016 (calendar), FR-017 (calories),
 * FR-081 (daily macros), FR-082 (weekly macros).
 */
@Service
@RequiredArgsConstructor
public class MealPlanService {

    private final MealPlanEntryRepository mealPlanEntryRepository;
    private final MealRepository mealRepository;
    private final RecipeRepository recipeRepository;
    private final UserRepository userRepository;
    private final RecipeService recipeService;
    private final MacroCalculationService macroCalculationService;

    /**
     * Get the effective meal plan owner ID for a user.
     * If the user has meal_plan_owner_id set, they share another user's meal plans (sync mode).
     * Otherwise, they use their own meal plans.
     *
     * @param userId The authenticated user's ID
     * @return The effective owner ID to use for meal plan queries/operations
     */
    private Long getEffectiveMealPlanOwnerId(Long userId) {
        return userRepository.findById(userId)
            .map(user -> user.getMealPlanOwnerId() != null ? user.getMealPlanOwnerId() : userId)
            .orElse(userId);
    }

    /**
     * FR-007, FR-016, FR-081, FR-082: Get 7-day meal plan starting from a given date.
     * Always returns exactly 7 days, even if some are empty.
     * Includes daily and weekly macro totals.
     *
     * @param userId User ID
     * @param startDate The "From" date
     * @return MealPlanWeekDTO with 7 days and macro data
     */
    @Transactional(readOnly = true)
    public MealPlanWeekDTO getWeekPlan(Long userId, LocalDate startDate) {
        Long effectiveOwnerId = getEffectiveMealPlanOwnerId(userId);
        LocalDate endDate = startDate.plusDays(7); // Exclusive end
        LocalDate today = LocalDate.now();

        List<MealPlanEntry> entries = mealPlanEntryRepository
            .findByUserIdAndDateRange(effectiveOwnerId, startDate, endDate);

        // Group entries by date
        Map<LocalDate, List<MealPlanEntry>> byDate = entries.stream()
            .collect(Collectors.groupingBy(MealPlanEntry::getPlanDate));

        // Build 7 days with macro data
        List<MealPlanDayDTO> days = new ArrayList<>();
        List<int[]> dailyMacrosForWeek = new ArrayList<>();
        int daysWithMeals = 0;

        for (int i = 0; i < 7; i++) {
            LocalDate date = startDate.plusDays(i);
            List<MealPlanEntry> dayEntries = byDate.getOrDefault(date, List.of());
            MealPlanDayDTO dayDTO = buildDayDTO(date, dayEntries, today);

            // FR-081: Calculate daily macros
            if (!dayEntries.isEmpty()) {
                List<Recipe> dayRecipes = dayEntries.stream()
                    .map(MealPlanEntry::getRecipe)
                    .collect(Collectors.toList());

                int[] dailyMacros = macroCalculationService.calculateTotalMacros(dayRecipes);
                dayDTO.setTotalProtein(dailyMacros[0]);
                dayDTO.setTotalCarbs(dailyMacros[1]);
                dayDTO.setTotalFat(dailyMacros[2]);

                dailyMacrosForWeek.add(dailyMacros);
                daysWithMeals++;
            } else {
                // Empty day - set macros to 0
                dayDTO.setTotalProtein(0);
                dayDTO.setTotalCarbs(0);
                dayDTO.setTotalFat(0);
            }

            days.add(dayDTO);
        }

        // FR-082: Calculate weekly totals and averages
        int[] weeklyTotals = macroCalculationService.calculateWeeklyTotals(dailyMacrosForWeek);
        int[] dailyAverages = macroCalculationService.calculateDailyAverages(weeklyTotals, daysWithMeals);

        // Calculate weekly calorie data
        int weekTotalCalories = days.stream().mapToInt(MealPlanDayDTO::getTotalCalories).sum();
        int avgDailyCalories = daysWithMeals > 0 ? Math.round((float) weekTotalCalories / daysWithMeals) : 0;

        MealPlanWeekDTO weekDTO = new MealPlanWeekDTO();
        weekDTO.setStartDate(startDate);
        weekDTO.setEndDate(startDate.plusDays(6)); // Inclusive end for display
        weekDTO.setDays(days);
        weekDTO.setWeekTotalCalories(weekTotalCalories);

        // FR-082: Set weekly macro data
        weekDTO.setWeekTotalProtein(weeklyTotals[0]);
        weekDTO.setWeekTotalCarbs(weeklyTotals[1]);
        weekDTO.setWeekTotalFat(weeklyTotals[2]);
        weekDTO.setAvgDailyCalories(avgDailyCalories);
        weekDTO.setAvgDailyProtein(dailyAverages[0]);
        weekDTO.setAvgDailyCarbs(dailyAverages[1]);
        weekDTO.setAvgDailyFat(dailyAverages[2]);
        weekDTO.setDaysWithMeals(daysWithMeals);

        return weekDTO;
    }

    /**
     * FR-014, FR-037: Assign recipe to a date with swap behavior.
     *
     * FR-037 Behavior:
     * - If THIS recipe is already assigned to the slot → toggle off (remove)
     * - If ANOTHER recipe is assigned to the slot → replace it (swap)
     * - If slot is empty → create new assignment
     *
     * Only ONE recipe per date/meal slot is allowed.
     *
     * @param userId User ID
     * @param request The assignment request
     * @return MealPlanEntryDTO if created/swapped, null if removed (toggle off)
     */
    @Transactional
    public MealPlanEntryDTO assignRecipe(Long userId, MealPlanCreateRequest request) {
        Long effectiveOwnerId = getEffectiveMealPlanOwnerId(userId);

        // FR-037: Check if THIS recipe is already assigned (toggle off case)
        Optional<MealPlanEntry> sameRecipeEntry = mealPlanEntryRepository
            .findByUserIdAndPlanDateAndMealIdAndRecipeId(
                effectiveOwnerId, request.getPlanDate(), request.getMealId(), request.getRecipeId()
            );

        if (sameRecipeEntry.isPresent()) {
            // Toggle off - clicking the same recipe again removes it
            mealPlanEntryRepository.delete(sameRecipeEntry.get());
            return null;
        }

        // FR-037: Check if ANY other recipe is assigned to this slot (swap case)
        Optional<MealPlanEntry> existingSlotEntry = mealPlanEntryRepository
            .findByUserIdAndPlanDateAndMealId(effectiveOwnerId, request.getPlanDate(), request.getMealId());

        if (existingSlotEntry.isPresent()) {
            // Swap - remove the existing recipe before adding the new one
            mealPlanEntryRepository.delete(existingSlotEntry.get());
        }

        // Create new entry - assign to the effective owner (sync mode)
        User user = userRepository.findById(effectiveOwnerId)
            .orElseThrow(() -> new RuntimeException("User not found"));
        Meal meal = mealRepository.findById(request.getMealId())
            .orElseThrow(() -> new RuntimeException("Meal type not found"));
        Recipe recipe = recipeRepository.findById(request.getRecipeId())
            .orElseThrow(() -> new RuntimeException("Recipe not found"));

        MealPlanEntry entry = new MealPlanEntry();
        entry.setUser(user);
        entry.setPlanDate(request.getPlanDate());
        entry.setMeal(meal);
        entry.setRecipe(recipe);
        entry.setServings(request.getServings() != null ? request.getServings() : 1);

        entry = mealPlanEntryRepository.save(entry);
        return convertToDTO(entry);
    }

    /**
     * FR-015: Remove a specific meal plan entry.
     * Only removes if the entry belongs to the user.
     *
     * @param userId User ID
     * @param entryId Entry ID to remove
     * @return true if removed, false if not found or not owned
     */
    @Transactional
    public boolean removeEntry(Long userId, Long entryId) {
        Long effectiveOwnerId = getEffectiveMealPlanOwnerId(userId);
        Optional<MealPlanEntry> entry = mealPlanEntryRepository.findByIdAndUserId(entryId, effectiveOwnerId);
        if (entry.isPresent()) {
            mealPlanEntryRepository.delete(entry.get());
            return true;
        }
        return false;
    }

    /**
     * FR-014: Get which days a recipe is assigned to within the current date range.
     * Used to highlight day buttons on RecipeCard.
     *
     * @param userId User ID
     * @param recipeId Recipe ID
     * @param startDate Start of date range
     * @return Map of date to meal type (e.g., "2025-12-01" -> "breakfast")
     */
    @Transactional(readOnly = true)
    public List<MealPlanEntryDTO> getRecipeAssignments(Long userId, Long recipeId, LocalDate startDate) {
        Long effectiveOwnerId = getEffectiveMealPlanOwnerId(userId);
        LocalDate endDate = startDate.plusDays(7);
        List<MealPlanEntry> entries = mealPlanEntryRepository
            .findByUserIdAndRecipeIdAndDateRange(effectiveOwnerId, recipeId, startDate, endDate);
        return entries.stream()
            .map(this::convertToDTO)
            .collect(Collectors.toList());
    }

    /**
     * FR-017: Calculate per-serving calories for a recipe.
     */
    private Integer calculateCaloriesPerServing(Recipe recipe) {
        if (recipe.getCalories() == null || recipe.getDefaultServings() == null || recipe.getDefaultServings() == 0) {
            return 0;
        }
        return recipe.getCalories() / recipe.getDefaultServings();
    }

    /**
     * Build a MealPlanDayDTO from entries for a specific date.
     */
    private MealPlanDayDTO buildDayDTO(LocalDate date, List<MealPlanEntry> entries, LocalDate today) {
        MealPlanDayDTO day = new MealPlanDayDTO();
        day.setDate(date);
        day.setDayOfWeek(date.getDayOfWeek().getDisplayName(TextStyle.SHORT, Locale.ENGLISH));
        day.setIsToday(date.equals(today));

        // Group by meal type
        Map<String, List<MealPlanEntryDTO>> byMeal = entries.stream()
            .map(this::convertToDTO)
            .collect(Collectors.groupingBy(MealPlanEntryDTO::getMealType));

        // Ensure all meal types exist (even if empty)
        if (!byMeal.containsKey("breakfast")) byMeal.put("breakfast", new ArrayList<>());
        if (!byMeal.containsKey("lunch")) byMeal.put("lunch", new ArrayList<>());
        if (!byMeal.containsKey("dinner")) byMeal.put("dinner", new ArrayList<>());
        if (!byMeal.containsKey("snacks")) byMeal.put("snacks", new ArrayList<>());

        day.setMealsByType(byMeal);

        // FR-017: Calculate daily total (per-serving calories)
        int totalCalories = entries.stream()
            .mapToInt(e -> calculateCaloriesPerServing(e.getRecipe()))
            .sum();
        day.setTotalCalories(totalCalories);

        return day;
    }

    /**
     * Convert MealPlanEntry entity to DTO.
     * FR-102: Uses RecipeSummaryDTO for lightweight response (no ingredients/steps).
     */
    private MealPlanEntryDTO convertToDTO(MealPlanEntry entry) {
        MealPlanEntryDTO dto = new MealPlanEntryDTO();
        dto.setId(entry.getId());
        dto.setPlanDate(entry.getPlanDate());
        dto.setMealType(entry.getMeal().getKey());
        dto.setMealId(entry.getMeal().getId());
        dto.setRecipe(recipeService.getRecipeSummaryById(entry.getRecipe().getId()));
        dto.setServings(entry.getServings());
        dto.setCaloriesPerServing(calculateCaloriesPerServing(entry.getRecipe()));
        return dto;
    }
}
