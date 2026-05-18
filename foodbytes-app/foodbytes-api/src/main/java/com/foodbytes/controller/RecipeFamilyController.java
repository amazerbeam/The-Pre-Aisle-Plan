package com.foodbytes.controller;

import com.foodbytes.dto.*;
import com.foodbytes.service.RecipeFamilyService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * FR-043: Admin endpoints for recipe family management.
 */
@RestController
@RequestMapping("/api/admin/recipe-families")
@RequiredArgsConstructor
@Tag(name = "Recipe Families (Admin)", description = "Admin endpoints for managing recipe variants")
public class RecipeFamilyController {

    private final RecipeFamilyService recipeFamilyService;

    // ========================================
    // READ OPERATIONS
    // ========================================

    @GetMapping
    @Operation(summary = "Get all recipe families", description = "Returns all recipe families with their variants")
    public ResponseEntity<List<RecipeFamilyDTO>> getAllFamilies() {
        return ResponseEntity.ok(recipeFamilyService.getAllFamilies());
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get recipe family by ID")
    public ResponseEntity<RecipeFamilyDTO> getFamilyById(@PathVariable Long id) {
        return ResponseEntity.ok(recipeFamilyService.getFamilyById(id));
    }

    // ========================================
    // CREATE/UPDATE/DELETE FAMILY
    // ========================================

    @PostMapping
    @Operation(summary = "Create recipe family",
            description = "Creates a new recipe family. Optionally include members to add recipes to the family.")
    public ResponseEntity<RecipeFamilyDTO> createFamily(@Valid @RequestBody RecipeFamilyDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(recipeFamilyService.createFamily(dto));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update recipe family",
            description = "Updates family name and/or description. Does not modify members.")
    public ResponseEntity<RecipeFamilyDTO> updateFamily(
            @PathVariable Long id,
            @Valid @RequestBody RecipeFamilyDTO dto) {
        return ResponseEntity.ok(recipeFamilyService.updateFamily(id, dto));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete recipe family",
            description = "Deletes the family and unlinks all recipes (recipes are NOT deleted)")
    public ResponseEntity<Void> deleteFamily(@PathVariable Long id) {
        recipeFamilyService.deleteFamily(id);
        return ResponseEntity.noContent().build();
    }

    // ========================================
    // FAMILY MEMBER OPERATIONS
    // ========================================

    @PostMapping("/{familyId}/members")
    @Operation(summary = "Add recipes to family",
            description = "Adds one or more recipes to the family. Each recipe can only belong to one family.")
    public ResponseEntity<RecipeFamilyDTO> addMembers(
            @PathVariable Long familyId,
            @Valid @RequestBody List<RecipeFamilyMemberDTO> members) {
        return ResponseEntity.ok(recipeFamilyService.addMembersToFamily(familyId, members));
    }

    @PutMapping("/{familyId}/members/{recipeId}")
    @Operation(summary = "Update family member",
            description = "Updates variant label, display order, or sets as default")
    public ResponseEntity<RecipeFamilyDTO> updateMember(
            @PathVariable Long familyId,
            @PathVariable Long recipeId,
            @Valid @RequestBody RecipeFamilyMemberDTO dto) {
        return ResponseEntity.ok(recipeFamilyService.updateMember(familyId, recipeId, dto));
    }

    @DeleteMapping("/{familyId}/members/{recipeId}")
    @Operation(summary = "Remove recipe from family",
            description = "Removes a recipe from the family. Cannot remove default if other members exist.")
    public ResponseEntity<RecipeFamilyDTO> removeMember(
            @PathVariable Long familyId,
            @PathVariable Long recipeId) {
        return ResponseEntity.ok(recipeFamilyService.removeMemberFromFamily(familyId, recipeId));
    }

    @PostMapping("/{familyId}/default/{recipeId}")
    @Operation(summary = "Set default recipe",
            description = "Sets the specified recipe as the default for the family")
    public ResponseEntity<RecipeFamilyDTO> setDefault(
            @PathVariable Long familyId,
            @PathVariable Long recipeId) {
        return ResponseEntity.ok(recipeFamilyService.setDefaultRecipe(familyId, recipeId));
    }
}
