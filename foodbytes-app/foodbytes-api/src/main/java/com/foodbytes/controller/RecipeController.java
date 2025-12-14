package com.foodbytes.controller;

import com.foodbytes.dto.RecipeAdminDTO;
import com.foodbytes.dto.RecipeDTO;
import com.foodbytes.dto.RecipeExtrasHierarchyDTO;
import com.foodbytes.service.RecipeService;
import com.foodbytes.service.RecipeExtrasService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/recipes")
@RequiredArgsConstructor
@Tag(name = "Recipes", description = "Recipe endpoints for users and admins")
public class RecipeController {

    private final RecipeService recipeService;
    private final RecipeExtrasService recipeExtrasService;

    // ========================================
    // ADMIN ENDPOINTS (FR-033, FR-047)
    // Must be defined before /{id} to avoid route conflicts
    // ========================================

    @GetMapping("/admin")
    @Operation(summary = "Get all recipes (admin)", description = "Returns all recipes including hidden ones, optionally filtered by meal type")
    public ResponseEntity<List<RecipeDTO>> getAllRecipesAdmin(
            @RequestParam(required = false) String mealType) {
        if (mealType != null && !mealType.isEmpty()) {
            return ResponseEntity.ok(recipeService.getRecipesByMealTypeAdmin(mealType));
        }
        return ResponseEntity.ok(recipeService.getAllRecipesAdmin());
    }

    @GetMapping("/admin/{id}")
    @Operation(summary = "Get recipe by ID (admin)", description = "Returns recipe details for editing")
    public ResponseEntity<RecipeAdminDTO> getRecipeByIdAdmin(@PathVariable Long id) {
        return ResponseEntity.ok(recipeService.getRecipeByIdAdmin(id));
    }

    // ========================================
    // PUBLIC READ ENDPOINTS (for all users)
    // ========================================

    @GetMapping
    @Operation(summary = "Get all live recipes", description = "Returns all visible recipes, optionally filtered by meal type")
    public ResponseEntity<List<RecipeDTO>> getAllRecipes(
            @RequestParam(required = false) String mealType) {
        if (mealType != null && !mealType.isEmpty()) {
            return ResponseEntity.ok(recipeService.getRecipesByMealType(mealType));
        }
        return ResponseEntity.ok(recipeService.getAllRecipes());
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get recipe by ID")
    public ResponseEntity<RecipeDTO> getRecipeById(@PathVariable Long id) {
        return ResponseEntity.ok(recipeService.getRecipeById(id));
    }

    @GetMapping("/search")
    @Operation(summary = "Search recipes by name")
    public ResponseEntity<List<RecipeDTO>> searchRecipes(@RequestParam String query) {
        return ResponseEntity.ok(recipeService.searchRecipes(query));
    }

    @PostMapping("/admin")
    @Operation(summary = "Create new recipe (admin)",
            description = "Creates a new recipe. New recipes are always hidden (isLive=false)")
    public ResponseEntity<RecipeAdminDTO> createRecipe(@Valid @RequestBody RecipeAdminDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(recipeService.createRecipe(dto));
    }

    @PutMapping("/admin/{id}")
    @Operation(summary = "Update recipe (admin)", description = "Updates an existing recipe")
    public ResponseEntity<RecipeAdminDTO> updateRecipe(
            @PathVariable Long id,
            @Valid @RequestBody RecipeAdminDTO dto) {
        return ResponseEntity.ok(recipeService.updateRecipe(id, dto));
    }

    @DeleteMapping("/admin/{id}")
    @Operation(summary = "Delete recipe (admin)", description = "Permanently deletes a recipe")
    public ResponseEntity<Void> deleteRecipe(@PathVariable Long id) {
        recipeService.deleteRecipe(id);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/admin/{id}/visibility")
    @Operation(summary = "Toggle recipe visibility (admin)", description = "Set recipe as Live or Hidden")
    public ResponseEntity<RecipeAdminDTO> updateVisibility(
            @PathVariable Long id,
            @RequestParam boolean isLive) {
        return ResponseEntity.ok(recipeService.updateRecipeVisibility(id, isLive));
    }

    // ========================================
    // FR-086: RECIPE EXTRAS ENDPOINTS
    // ========================================

    @GetMapping("/{id}/extras")
    @Operation(summary = "Get recipe extras hierarchy",
            description = "Returns hierarchical tree of linked extras for homemade selection popup")
    public ResponseEntity<RecipeExtrasHierarchyDTO> getRecipeExtras(@PathVariable Long id) {
        return ResponseEntity.ok(recipeExtrasService.getExtrasHierarchy(id));
    }

    @GetMapping("/admin/{id}/available-extras")
    @Operation(summary = "Get available extras (admin)",
            description = "Returns recipes that can be linked as extras (excludes self and circular refs)")
    public ResponseEntity<List<RecipeDTO>> getAvailableExtras(@PathVariable Long id) {
        return ResponseEntity.ok(
            recipeExtrasService.getAvailableExtrasForRecipe(id).stream()
                .map(recipe -> {
                    RecipeDTO dto = new RecipeDTO();
                    dto.setId(recipe.getId());
                    dto.setName(recipe.getName());
                    return dto;
                })
                .toList()
        );
    }
}
