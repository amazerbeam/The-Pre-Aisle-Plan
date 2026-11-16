package com.foodbytes.controller;

import com.foodbytes.dto.RecipeFolderCreateRequest;
import com.foodbytes.dto.RecipeFolderItemDTO;
import com.foodbytes.dto.RecipeFolderNameRequest;
import com.foodbytes.dto.RecipeFolderParentRequest;
import com.foodbytes.dto.RecipeFoldersDTO;
import com.foodbytes.security.UserPrincipal;
import com.foodbytes.service.RecipeFolderService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.NoSuchElementException;

/** Personal recipe folders for the Recipes screen. The caller's own folders, never the shared plan owner's. */
@RestController
@RequestMapping("/api/recipe-folders")
@RequiredArgsConstructor
public class RecipeFolderController {
    private final RecipeFolderService recipeFolderService;

    @GetMapping
    public ResponseEntity<?> list(@AuthenticationPrincipal UserPrincipal user) {
        if (user == null) return forbidden();
        return ResponseEntity.ok(new RecipeFoldersDTO(recipeFolderService.listFolders(user.getId())));
    }

    @PostMapping
    public ResponseEntity<?> create(@AuthenticationPrincipal UserPrincipal user, @Valid @RequestBody RecipeFolderCreateRequest req) {
        if (user == null) return forbidden();
        return ResponseEntity.status(201).body(recipeFolderService.create(user.getId(), req.getName(), req.getParentId()));
    }

    @PatchMapping("/{id}/name")
    public ResponseEntity<?> rename(@AuthenticationPrincipal UserPrincipal user, @PathVariable Long id, @Valid @RequestBody RecipeFolderNameRequest req) {
        if (user == null) return forbidden();
        return recipeFolderService.rename(user.getId(), id, req.getName())
            .<ResponseEntity<?>>map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PatchMapping("/{id}/parent")
    public ResponseEntity<?> move(@AuthenticationPrincipal UserPrincipal user, @PathVariable Long id, @RequestBody RecipeFolderParentRequest req) {
        if (user == null) return forbidden();
        return recipeFolderService.move(user.getId(), id, req.getParentId())
            .<ResponseEntity<?>>map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@AuthenticationPrincipal UserPrincipal user, @PathVariable Long id) {
        if (user == null) return forbidden();
        return recipeFolderService.delete(user.getId(), id) ? ResponseEntity.noContent().build() : ResponseEntity.notFound().build();
    }

    @PutMapping("/{id}/recipes/{recipeId}")
    public ResponseEntity<?> addRecipe(@AuthenticationPrincipal UserPrincipal user, @PathVariable Long id, @PathVariable Long recipeId) {
        if (user == null) return forbidden();
        return recipeFolderService.addRecipe(user.getId(), id, recipeId)
            .<ResponseEntity<?>>map(key -> ResponseEntity.ok(new RecipeFolderItemDTO(key)))
            .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}/recipes/{recipeId}")
    public ResponseEntity<?> removeRecipe(@AuthenticationPrincipal UserPrincipal user, @PathVariable Long id, @PathVariable Long recipeId) {
        if (user == null) return forbidden();
        return recipeFolderService.removeRecipe(user.getId(), id, recipeId) ? ResponseEntity.noContent().build() : ResponseEntity.notFound().build();
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<?> handleRule(IllegalArgumentException ex) {
        return ResponseEntity.badRequest().body(Map.of("error", ex.getMessage()));
    }

    @ExceptionHandler(NoSuchElementException.class)
    public ResponseEntity<?> handleMissing(NoSuchElementException ex) {
        return ResponseEntity.status(404).body(Map.of("error", "That folder no longer exists."));
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<?> handleValidation(MethodArgumentNotValidException ex) {
        String message = ex.getBindingResult().getFieldErrors().stream().findFirst()
            .map(err -> err.getDefaultMessage()).orElse("Invalid request");
        return ResponseEntity.badRequest().body(Map.of("error", message));
    }

    private static ResponseEntity<?> forbidden() {
        return ResponseEntity.status(403).body(Map.of("error", "Authentication required to manage recipe folders"));
    }
}
