package com.foodbytes.controller;

import com.foodbytes.dto.CreateRecipeRequest;
import com.foodbytes.dto.RecipeDTO;
import com.foodbytes.dto.RecipeListDTO;
import com.foodbytes.dto.UpdateRecipeRequest;
import com.foodbytes.model.User;
import com.foodbytes.security.UserPrincipal;
import com.foodbytes.service.RecipeService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/recipes")
@RequiredArgsConstructor
@Slf4j
public class RecipeController {

    private final RecipeService recipeService;

    @GetMapping
    public ResponseEntity<List<RecipeListDTO>> getAllRecipes(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @RequestParam(required = false) String mealType,
            @RequestParam(required = false) String search) {

        boolean isAdmin = userPrincipal != null && userPrincipal.getUser().getIsAdmin();
        List<RecipeListDTO> recipes = recipeService.getAllRecipes(isAdmin, mealType, search);

        return ResponseEntity.ok(recipes);
    }

    @GetMapping("/{id}")
    public ResponseEntity<RecipeDTO> getRecipeById(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @PathVariable Long id) {

        boolean isAdmin = userPrincipal != null && userPrincipal.getUser().getIsAdmin();
        RecipeDTO recipe = recipeService.getRecipeById(id, isAdmin);

        return ResponseEntity.ok(recipe);
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<RecipeDTO> createRecipe(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @Valid @RequestBody CreateRecipeRequest request) {

        User user = userPrincipal.getUser();
        RecipeDTO recipe = recipeService.createRecipe(request, user);

        return ResponseEntity.status(HttpStatus.CREATED).body(recipe);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<RecipeDTO> updateRecipe(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @PathVariable Long id,
            @Valid @RequestBody UpdateRecipeRequest request) {

        User user = userPrincipal.getUser();
        RecipeDTO recipe = recipeService.updateRecipe(id, request, user);

        return ResponseEntity.ok(recipe);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteRecipe(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @PathVariable Long id) {

        User user = userPrincipal.getUser();
        recipeService.deleteRecipe(id, user);

        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{id}/visibility")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<RecipeDTO> toggleVisibility(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @PathVariable Long id) {

        User user = userPrincipal.getUser();
        RecipeDTO recipe = recipeService.toggleVisibility(id, user);

        return ResponseEntity.ok(recipe);
    }
}
