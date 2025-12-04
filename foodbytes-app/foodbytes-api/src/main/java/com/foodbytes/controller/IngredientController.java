package com.foodbytes.controller;

import com.foodbytes.dto.*;
import com.foodbytes.service.IngredientService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Admin endpoints for ingredient management.
 * Implements NFR-010 (Centralized Ingredient Definitions).
 */
@RestController
@RequestMapping("/api/admin/ingredients")
@RequiredArgsConstructor
@Tag(name = "Ingredients (Admin)", description = "Admin endpoints for ingredient management")
public class IngredientController {

    private final IngredientService ingredientService;

    // ========================================
    // READ OPERATIONS
    // ========================================

    @GetMapping
    @Operation(summary = "Get all ingredients", description = "Returns all ingredients sorted by name")
    public ResponseEntity<List<IngredientAdminDTO>> getAllIngredients() {
        return ResponseEntity.ok(ingredientService.getAllIngredients());
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get ingredient by ID")
    public ResponseEntity<IngredientAdminDTO> getIngredientById(@PathVariable Long id) {
        return ResponseEntity.ok(ingredientService.getIngredientById(id));
    }

    // ========================================
    // AUTOCOMPLETE & SEARCH
    // ========================================

    @GetMapping("/autocomplete")
    @Operation(summary = "Autocomplete ingredient search",
            description = "Returns matching ingredients for typeahead UI. Minimum 2 characters required.")
    public ResponseEntity<List<IngredientSearchResultDTO>> autocomplete(
            @RequestParam String query,
            @RequestParam(defaultValue = "10") int limit) {
        return ResponseEntity.ok(ingredientService.autocomplete(query, limit));
    }

    @GetMapping("/search")
    @Operation(summary = "Search similar ingredients",
            description = "Fuzzy search for similar ingredient names using Levenshtein distance")
    public ResponseEntity<List<IngredientSearchResultDTO>> searchSimilar(
            @RequestParam String name,
            @RequestParam(defaultValue = "10") int maxResults) {
        return ResponseEntity.ok(ingredientService.findSimilar(name, maxResults));
    }

    // ========================================
    // VALIDATION (pre-creation check)
    // ========================================

    @PostMapping("/validate")
    @Operation(summary = "Validate new ingredient name",
            description = "Checks if name is valid, normalizes it, and finds similar existing ingredients. " +
                    "Call this before creating a new ingredient to prevent duplicates.")
    public ResponseEntity<IngredientValidationResultDTO> validateIngredient(
            @RequestParam String name) {
        return ResponseEntity.ok(ingredientService.validateNewIngredient(name));
    }

    // ========================================
    // CRUD OPERATIONS
    // ========================================

    @PostMapping
    @Operation(summary = "Create new ingredient",
            description = "Creates ingredient after validation. Key is auto-generated from name. " +
                    "Call /validate first to check for duplicates.")
    public ResponseEntity<IngredientAdminDTO> createIngredient(
            @Valid @RequestBody IngredientAdminDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ingredientService.createIngredient(dto));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update ingredient",
            description = "Updates ingredient name and/or aisle. Key is immutable.")
    public ResponseEntity<IngredientAdminDTO> updateIngredient(
            @PathVariable Long id,
            @Valid @RequestBody IngredientAdminDTO dto) {
        return ResponseEntity.ok(ingredientService.updateIngredient(id, dto));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete ingredient",
            description = "Deletes ingredient. Fails if ingredient is used in any recipe (FK constraint).")
    public ResponseEntity<Void> deleteIngredient(@PathVariable Long id) {
        ingredientService.deleteIngredient(id);
        return ResponseEntity.noContent().build();
    }
}
