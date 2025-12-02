package com.foodbytes.controller;

import com.foodbytes.dto.*;
import com.foodbytes.security.UserPrincipal;
import com.foodbytes.service.MealPlanService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;

/**
 * REST Controller for meal plan operations.
 * All endpoints require authentication (guest users get 403).
 * Implements FR-007, FR-014, FR-015, FR-016, FR-017.
 */
@RestController
@RequestMapping("/api/meal-plan")
@RequiredArgsConstructor
public class MealPlanController {

    private final MealPlanService mealPlanService;

    /**
     * FR-007, FR-016: Get 7-day meal plan starting from a given date.
     * GET /api/meal-plan?startDate=2025-12-01
     *
     * @param userPrincipal Authenticated user (required)
     * @param startDate The "From" date (required)
     * @return MealPlanWeekDTO with 7 days
     */
    @GetMapping
    public ResponseEntity<?> getWeekPlan(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate) {

        if (userPrincipal == null) {
            return ResponseEntity.status(403)
                .body(Map.of("error", "Authentication required to view meal plan"));
        }

        MealPlanWeekDTO weekPlan = mealPlanService.getWeekPlan(userPrincipal.getId(), startDate);
        return ResponseEntity.ok(weekPlan);
    }

    /**
     * FR-014: Assign recipe to a date (toggle behavior).
     * POST /api/meal-plan
     * If the recipe is already assigned to that date/meal, it removes it.
     * If not, it creates the assignment.
     *
     * @param userPrincipal Authenticated user (required)
     * @param request The assignment request (planDate, mealId, recipeId, servings)
     * @return MealPlanEntryDTO if created, 204 No Content if removed
     */
    @PostMapping
    public ResponseEntity<?> assignRecipe(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @Valid @RequestBody MealPlanCreateRequest request) {

        if (userPrincipal == null) {
            return ResponseEntity.status(403)
                .body(Map.of("error", "Authentication required to save meal plan"));
        }

        MealPlanEntryDTO result = mealPlanService.assignRecipe(userPrincipal.getId(), request);

        if (result == null) {
            // Recipe was toggled off (removed)
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.ok(result);
    }

    /**
     * FR-015: Remove a specific meal plan entry.
     * DELETE /api/meal-plan/{id}
     *
     * @param userPrincipal Authenticated user (required)
     * @param id Entry ID to remove
     * @return 204 No Content if removed, 404 if not found
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<?> removeEntry(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @PathVariable Long id) {

        if (userPrincipal == null) {
            return ResponseEntity.status(403)
                .body(Map.of("error", "Authentication required to modify meal plan"));
        }

        boolean removed = mealPlanService.removeEntry(userPrincipal.getId(), id);
        if (removed) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }

    /**
     * FR-014: Get which days a recipe is assigned to within the current date range.
     * GET /api/meal-plan/recipe/{recipeId}?startDate=2025-12-01
     * Used to highlight day buttons on RecipeCard.
     *
     * @param userPrincipal Authenticated user (required)
     * @param recipeId Recipe ID
     * @param startDate Start of 7-day range
     * @return List of entries for this recipe in the date range
     */
    @GetMapping("/recipe/{recipeId}")
    public ResponseEntity<?> getRecipeAssignments(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @PathVariable Long recipeId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate) {

        if (userPrincipal == null) {
            return ResponseEntity.status(403)
                .body(Map.of("error", "Authentication required to view assignments"));
        }

        List<MealPlanEntryDTO> assignments = mealPlanService.getRecipeAssignments(
            userPrincipal.getId(), recipeId, startDate);
        return ResponseEntity.ok(assignments);
    }
}
