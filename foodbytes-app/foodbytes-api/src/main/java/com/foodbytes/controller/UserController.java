package com.foodbytes.controller;

import com.foodbytes.dto.UserDTO;
import com.foodbytes.dto.UserPreferencesUpdateRequest;
import com.foodbytes.security.UserPrincipal;
import com.foodbytes.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    /**
     * MPP-3 / MPP-13: partially update the authenticated user's preferences —
     * default portion count and/or meal times. Fields absent from the body are
     * untouched; an explicit null clears (meal times: back to the defaults).
     */
    @PatchMapping("/me/preferences")
    public ResponseEntity<?> updatePreferences(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @Valid @RequestBody UserPreferencesUpdateRequest request) {
        if (userPrincipal == null) {
            return ResponseEntity.status(401).body(Map.of("error", "Not authenticated"));
        }
        UserDTO updated = userService.updatePreferences(userPrincipal.getId(), request);
        return ResponseEntity.ok(updated);
    }

    /**
     * There is no @ControllerAdvice in this codebase — AuthController shapes its
     * own errors the same way. Without this the client would receive Spring
     * Boot's default {timestamp, status, error, path} body and the frontend's
     * "read the error body" path would surface nothing useful.
     */
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<?> handleValidation(MethodArgumentNotValidException ex) {
        String message = ex.getBindingResult().getFieldErrors().stream()
                .findFirst()
                .map(err -> err.getDefaultMessage())
                .orElse("Invalid request");
        return ResponseEntity.badRequest().body(Map.of("error", message));
    }
}
