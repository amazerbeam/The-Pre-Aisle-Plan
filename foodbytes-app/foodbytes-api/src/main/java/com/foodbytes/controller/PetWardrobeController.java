package com.foodbytes.controller;

import com.foodbytes.dto.WardrobeEquipRequest;
import com.foodbytes.dto.WardrobeSeenRequest;
import com.foodbytes.security.UserPrincipal;
import com.foodbytes.service.WardrobeService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

/**
 * MPP-32: the caller's own wardrobe writes (see WardrobeService). Reads ride on GET /api/pet
 * (PetDTO.wardrobe). Every response is the whole WardrobeDTO, which the client swaps in.
 */
@RestController
@RequestMapping("/api/pet/wardrobe")
@RequiredArgsConstructor
public class PetWardrobeController {

    private final WardrobeService wardrobeService;

    @PutMapping("/outfit")
    public ResponseEntity<?> equip(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @Valid @RequestBody WardrobeEquipRequest request) {
        if (userPrincipal == null) {
            return unauthenticated();
        }
        try {
            return ResponseEntity.ok(wardrobeService.equip(userPrincipal.getId(), request.getSlot(), request.getItemId()));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @DeleteMapping("/outfit")
    public ResponseEntity<?> undress(@AuthenticationPrincipal UserPrincipal userPrincipal) {
        if (userPrincipal == null) {
            return unauthenticated();
        }
        return ResponseEntity.ok(wardrobeService.undress(userPrincipal.getId()));
    }

    @PostMapping("/seen")
    public ResponseEntity<?> markSeen(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @Valid @RequestBody WardrobeSeenRequest request) {
        if (userPrincipal == null) {
            return unauthenticated();
        }
        return ResponseEntity.ok(wardrobeService.markSeen(userPrincipal.getId(), request.getSlot()));
    }

    /** No @ControllerAdvice in this codebase - same {error} shape as PetController. */
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<?> handleValidation(MethodArgumentNotValidException ex) {
        String message = ex.getBindingResult().getFieldErrors().stream()
                .findFirst()
                .map(err -> err.getDefaultMessage())
                .orElse("Invalid request");
        return ResponseEntity.badRequest().body(Map.of("error", message));
    }

    private static ResponseEntity<?> unauthenticated() {
        return ResponseEntity.status(401).body(Map.of("error", "Not authenticated"));
    }
}
