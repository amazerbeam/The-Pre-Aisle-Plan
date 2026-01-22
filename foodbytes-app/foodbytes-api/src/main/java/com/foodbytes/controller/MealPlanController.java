package com.foodbytes.controller;

import com.foodbytes.dto.*;
import com.foodbytes.security.UserPrincipal;
import com.foodbytes.service.MealPlanService;
import com.foodbytes.service.ShoppingListService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDate;
import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

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
    private final ShoppingListService shoppingListService;

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
     * Swap all meals between two dates.
     * POST /api/meal-plan/swap?sourceDate=2025-01-16&targetDate=2025-01-17
     *
     * @param userPrincipal Authenticated user (required)
     * @param sourceDate First date
     * @param targetDate Second date
     * @return 204 No Content on success
     */
    @PostMapping("/swap")
    public ResponseEntity<?> swapDays(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate sourceDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate targetDate) {

        if (userPrincipal == null) {
            return ResponseEntity.status(403)
                .body(Map.of("error", "Authentication required to modify meal plan"));
        }

        mealPlanService.swapDays(userPrincipal.getId(), sourceDate, targetDate);
        return ResponseEntity.noContent().build();
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

    /**
     * FR-019, FR-020: Get aggregated shopping list for 7-day meal plan.
     * GET /api/meal-plan/shopping-list?startDate=2025-12-01
     *
     * @param userPrincipal Authenticated user (required)
     * @param startDate Start date of the 7-day period
     * @return AggregatedShoppingListDTO with items grouped by aisle
     */
    @GetMapping("/shopping-list")
    public ResponseEntity<AggregatedShoppingListDTO> getShoppingList(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate) {

        AggregatedShoppingListDTO shoppingList = shoppingListService.getShoppingList(
            userPrincipal.getId(),
            startDate,
            null  // No homemade selections
        );
        return ResponseEntity.ok(shoppingList);
    }

    /**
     * FR-089: Get aggregated shopping list with homemade/store-bought selections.
     * POST /api/meal-plan/shopping-list?startDate=2025-12-01
     *
     * Store-bought extras are shown as single "Store Bought [Recipe Name]" items.
     * Homemade extras have their ingredients added to the list.
     *
     * @param userPrincipal Authenticated user (required)
     * @param startDate Start date of the 7-day period
     * @param selections Homemade selections from localStorage
     * @return AggregatedShoppingListDTO with items grouped by aisle
     */
    @PostMapping("/shopping-list")
    public ResponseEntity<AggregatedShoppingListDTO> getShoppingListWithSelections(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestBody(required = false) HomemadeSelectionsDTO selections) {

        AggregatedShoppingListDTO shoppingList = shoppingListService.getShoppingList(
            userPrincipal.getId(),
            startDate,
            selections
        );
        return ResponseEntity.ok(shoppingList);
    }

    /**
     * FR-042: Get breakdown of which meals use a specific ingredient.
     * FR-102: Added sourceChain parameter for finding ingredients from extras.
     * GET /api/meal-plan/shopping-list/ingredient-breakdown?ingredientId=123&unit=tbsp&startDate=2025-12-01&sourceChain=10,12,13
     *
     * @param userPrincipal Authenticated user (required)
     * @param ingredientId The ingredient ID to look up
     * @param unit The unit string (e.g., "tbsp", "g")
     * @param startDate Start date of the 7-day period
     * @param sourceChain Optional comma-separated recipe IDs showing provenance
     * @return IngredientBreakdownDTO with meal breakdown list
     */
    @GetMapping("/shopping-list/ingredient-breakdown")
    public ResponseEntity<IngredientBreakdownDTO> getIngredientBreakdown(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @RequestParam Long ingredientId,
            @RequestParam String unit,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) String sourceChain) {

        // FR-102: Parse sourceChain from comma-separated string to List<Long>
        List<Long> sourceChainList = null;
        if (sourceChain != null && !sourceChain.isEmpty()) {
            sourceChainList = Arrays.stream(sourceChain.split(","))
                .map(String::trim)
                .map(Long::parseLong)
                .collect(Collectors.toList());
        }

        IngredientBreakdownDTO breakdown = shoppingListService.getIngredientBreakdown(
            userPrincipal.getId(),
            ingredientId,
            unit,
            startDate,
            sourceChainList
        );
        return ResponseEntity.ok(breakdown);
    }
}
