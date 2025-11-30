package com.foodbytes.controller;

import com.foodbytes.dto.RecipeDTO;
import com.foodbytes.service.RecipeService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Public endpoint for recipes - returns only live recipes
 * No authentication required
 */
@RestController
@RequestMapping("/api/public/recipes")
@RequiredArgsConstructor
@Slf4j
public class PublicRecipeController {

    private final RecipeService recipeService;

    @GetMapping
    public ResponseEntity<List<RecipeDTO>> getAllLiveRecipes() {
        List<RecipeDTO> recipes = recipeService.getAllRecipes(false); // false = non-admin view
        return ResponseEntity.ok(recipes);
    }

    @GetMapping("/{id}")
    public ResponseEntity<RecipeDTO> getLiveRecipeById(@PathVariable Long id) {
        RecipeDTO recipe = recipeService.getRecipeById(id, false); // false = non-admin view
        return ResponseEntity.ok(recipe);
    }
}
