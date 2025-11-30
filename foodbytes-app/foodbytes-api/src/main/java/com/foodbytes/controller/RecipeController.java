package com.foodbytes.controller;

import com.foodbytes.dto.RecipeDTO;
import com.foodbytes.model.User;
import com.foodbytes.service.RecipeService;
import com.foodbytes.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/recipes")
@RequiredArgsConstructor
@Slf4j
public class RecipeController {

    private final RecipeService recipeService;
    private final UserService userService;

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<RecipeDTO>> getAllRecipes() {
        boolean isAdmin = isCurrentUserAdmin();
        List<RecipeDTO> recipes = recipeService.getAllRecipes(isAdmin);
        return ResponseEntity.ok(recipes);
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<RecipeDTO> getRecipeById(@PathVariable Long id) {
        boolean isAdmin = isCurrentUserAdmin();
        RecipeDTO recipe = recipeService.getRecipeById(id, isAdmin);
        return ResponseEntity.ok(recipe);
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<RecipeDTO> createRecipe(@Valid @RequestBody RecipeDTO recipeDTO) {
        User user = getCurrentUser();
        RecipeDTO createdRecipe = recipeService.createRecipe(recipeDTO, user);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdRecipe);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<RecipeDTO> updateRecipe(
            @PathVariable Long id,
            @Valid @RequestBody RecipeDTO recipeDTO) {
        User user = getCurrentUser();
        RecipeDTO updatedRecipe = recipeService.updateRecipe(id, recipeDTO, user);
        return ResponseEntity.ok(updatedRecipe);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteRecipe(@PathVariable Long id) {
        User user = getCurrentUser();
        recipeService.softDeleteRecipe(id, user);
        return ResponseEntity.noContent().build();
    }

    private User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        Long userId = (Long) authentication.getPrincipal();
        return userService.findById(userId);
    }

    private boolean isCurrentUserAdmin() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        return authentication.getAuthorities().stream()
                .anyMatch(auth -> auth.getAuthority().equals("ROLE_ADMIN"));
    }
}
