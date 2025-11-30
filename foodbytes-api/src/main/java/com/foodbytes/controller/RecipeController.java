package com.foodbytes.controller;

import com.foodbytes.dto.RecipeDTO;
import com.foodbytes.security.UserPrincipal;
import com.foodbytes.service.RecipeService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/recipes")
@RequiredArgsConstructor
public class RecipeController {

    private final RecipeService recipeService;

    @GetMapping
    public ResponseEntity<List<RecipeDTO>> getAllRecipes(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestParam(required = false) String mealType) {

        boolean isAdmin = principal != null && Boolean.TRUE.equals(principal.getIsAdmin());

        if (mealType != null && !mealType.isEmpty()) {
            return ResponseEntity.ok(recipeService.getRecipesByMealType(mealType));
        }

        if (isAdmin) {
            return ResponseEntity.ok(recipeService.getAllRecipesForAdmin());
        }

        return ResponseEntity.ok(recipeService.getAllLiveRecipes());
    }

    @GetMapping("/{id}")
    public ResponseEntity<RecipeDTO> getRecipe(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal principal) {

        boolean isAdmin = principal != null && Boolean.TRUE.equals(principal.getIsAdmin());
        return ResponseEntity.ok(recipeService.getRecipeById(id, isAdmin));
    }
}
