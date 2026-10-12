package com.foodbytes.controller;

import com.foodbytes.dto.PetNameRequest;
import com.foodbytes.security.UserPrincipal;
import com.foodbytes.service.PetService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

/**
 * MPP-14: the plan's pet — always the meal-plan owner's (see PetService).
 */
@RestController
@RequestMapping("/api/pet")
@RequiredArgsConstructor
public class PetController {

    private final PetService petService;

    @GetMapping
    public ResponseEntity<?> getPet(@AuthenticationPrincipal UserPrincipal userPrincipal) {
        if (userPrincipal == null) {
            return ResponseEntity.status(401).body(Map.of("error", "Not authenticated"));
        }
        return ResponseEntity.ok(petService.getPet(userPrincipal.getId()));
    }

    @PutMapping("/name")
    public ResponseEntity<?> renamePet(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @Valid @RequestBody PetNameRequest request) {
        if (userPrincipal == null) {
            return ResponseEntity.status(401).body(Map.of("error", "Not authenticated"));
        }
        return ResponseEntity.ok(petService.renamePet(userPrincipal.getId(), request.getName()));
    }

    /** No @ControllerAdvice in this codebase — same {error} shape as UserController. */
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<?> handleValidation(MethodArgumentNotValidException ex) {
        String message = ex.getBindingResult().getFieldErrors().stream()
                .findFirst()
                .map(err -> err.getDefaultMessage())
                .orElse("Invalid request");
        return ResponseEntity.badRequest().body(Map.of("error", message));
    }
}
