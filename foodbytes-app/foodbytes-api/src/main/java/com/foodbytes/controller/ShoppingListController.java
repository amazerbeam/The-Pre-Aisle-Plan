package com.foodbytes.controller;

import com.foodbytes.dto.*;
import com.foodbytes.security.UserPrincipal;
import com.foodbytes.service.PersistedShoppingListService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

/**
 * REST Controller for persisted shopping list operations.
 * All endpoints require authentication.
 */
@RestController
@RequestMapping("/api/shopping-list")
@RequiredArgsConstructor
public class ShoppingListController {

    private final PersistedShoppingListService persistedShoppingListService;

    /**
     * Get the current persisted shopping list.
     * GET /api/shopping-list
     *
     * @param userPrincipal Authenticated user
     * @return PersistedShoppingListDTO or null if no list exists
     */
    @GetMapping
    public ResponseEntity<?> getShoppingList(@AuthenticationPrincipal UserPrincipal userPrincipal) {
        if (userPrincipal == null) {
            return ResponseEntity.status(403)
                .body(Map.of("error", "Authentication required"));
        }

        PersistedShoppingListDTO list = persistedShoppingListService.getShoppingList(userPrincipal.getId());
        if (list == null) {
            return ResponseEntity.ok(Map.of("exists", false));
        }
        return ResponseEntity.ok(list);
    }

    /**
     * Check if a shopping list exists.
     * GET /api/shopping-list/exists
     *
     * @param userPrincipal Authenticated user
     * @return { exists: boolean }
     */
    @GetMapping("/exists")
    public ResponseEntity<?> checkShoppingListExists(@AuthenticationPrincipal UserPrincipal userPrincipal) {
        if (userPrincipal == null) {
            return ResponseEntity.status(403)
                .body(Map.of("error", "Authentication required"));
        }

        boolean exists = persistedShoppingListService.hasShoppingList(userPrincipal.getId());
        return ResponseEntity.ok(Map.of("exists", exists));
    }

    /**
     * Generate a new shopping list, replacing any existing one.
     * POST /api/shopping-list/generate
     *
     * @param userPrincipal Authenticated user
     * @param request Generation request with date range
     * @return Newly generated PersistedShoppingListDTO
     */
    @PostMapping("/generate")
    public ResponseEntity<?> generateShoppingList(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @RequestBody GenerateShoppingListRequest request) {

        if (userPrincipal == null) {
            return ResponseEntity.status(403)
                .body(Map.of("error", "Authentication required"));
        }

        if (request.getStartDate() == null || request.getEndDate() == null) {
            return ResponseEntity.badRequest()
                .body(Map.of("error", "startDate and endDate are required"));
        }

        if (request.getEndDate().isBefore(request.getStartDate())) {
            return ResponseEntity.badRequest()
                .body(Map.of("error", "endDate must be after startDate"));
        }

        // Convert selections to HomemadeSelectionsDTO if provided
        HomemadeSelectionsDTO homemadeSelections = null;
        if (request.getSelections() != null && !request.getSelections().isEmpty()) {
            homemadeSelections = new HomemadeSelectionsDTO();
            homemadeSelections.setSelections(request.getSelections());
        }

        PersistedShoppingListDTO list = persistedShoppingListService.generateShoppingList(
            userPrincipal.getId(),
            request.getStartDate(),
            request.getEndDate(),
            homemadeSelections
        );

        return ResponseEntity.ok(list);
    }

    /**
     * Toggle the checked state of a shopping list item.
     * PATCH /api/shopping-list/item/{itemId}/toggle
     *
     * @param userPrincipal Authenticated user
     * @param itemId Item ID to toggle
     * @return { isChecked: boolean }
     */
    @PatchMapping("/item/{itemId}/toggle")
    public ResponseEntity<?> toggleItemChecked(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @PathVariable Long itemId) {

        if (userPrincipal == null) {
            return ResponseEntity.status(403)
                .body(Map.of("error", "Authentication required"));
        }

        try {
            Boolean isChecked = persistedShoppingListService.toggleItemChecked(
                userPrincipal.getId(), itemId);
            return ResponseEntity.ok(Map.of("isChecked", isChecked));
        } catch (RuntimeException e) {
            return ResponseEntity.status(404)
                .body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Uncheck all items in the shopping list.
     * POST /api/shopping-list/uncheck-all
     *
     * @param userPrincipal Authenticated user
     * @return Success message
     */
    @PostMapping("/uncheck-all")
    public ResponseEntity<?> uncheckAllItems(@AuthenticationPrincipal UserPrincipal userPrincipal) {
        if (userPrincipal == null) {
            return ResponseEntity.status(403)
                .body(Map.of("error", "Authentication required"));
        }

        persistedShoppingListService.uncheckAllItems(userPrincipal.getId());
        return ResponseEntity.ok(Map.of("success", true));
    }

    /**
     * Delete the shopping list.
     * DELETE /api/shopping-list
     *
     * @param userPrincipal Authenticated user
     * @return Success message
     */
    @DeleteMapping
    public ResponseEntity<?> deleteShoppingList(@AuthenticationPrincipal UserPrincipal userPrincipal) {
        if (userPrincipal == null) {
            return ResponseEntity.status(403)
                .body(Map.of("error", "Authentication required"));
        }

        persistedShoppingListService.deleteShoppingList(userPrincipal.getId());
        return ResponseEntity.ok(Map.of("success", true));
    }
}
