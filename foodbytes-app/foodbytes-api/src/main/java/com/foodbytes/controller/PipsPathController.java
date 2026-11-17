package com.foodbytes.controller;

import com.foodbytes.dto.PipsPathClearRequest;
import com.foodbytes.dto.PipsPathMapRequest;
import com.foodbytes.security.UserPrincipal;
import com.foodbytes.service.PipGameException;
import com.foodbytes.service.PipsPathService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.function.Supplier;

/**
 * MPP-49: Pip's Path for the caller only (see PipsPathService). No user parameter anywhere - every call
 * reads and writes the principal's own maps, progress and sprinkles.
 */
@RestController
@RequestMapping("/api/pet/games/pips-path")
@RequiredArgsConstructor
public class PipsPathController {

    private final PipsPathService pipsPathService;

    @GetMapping
    public ResponseEntity<?> state(@AuthenticationPrincipal UserPrincipal userPrincipal) {
        return run(userPrincipal, () -> pipsPathService.state(userPrincipal.getId()));
    }

    @PostMapping("/maps")
    public ResponseEntity<?> issue(@AuthenticationPrincipal UserPrincipal userPrincipal,
                                   @Valid @RequestBody(required = false) PipsPathMapRequest request) {
        return run(userPrincipal, () -> pipsPathService.issue(userPrincipal.getId(),
                request == null ? null : request.getFamily(),
                request == null ? null : request.getDifficulty()));
    }

    @PostMapping("/maps/{mapId}/clear")
    public ResponseEntity<?> clear(@AuthenticationPrincipal UserPrincipal userPrincipal,
                                   @PathVariable Long mapId,
                                   @Valid @RequestBody PipsPathClearRequest request) {
        return run(userPrincipal, () -> pipsPathService.clear(userPrincipal.getId(), mapId, request.getPath()));
    }

    private static ResponseEntity<?> run(UserPrincipal userPrincipal, Supplier<Object> call) {
        if (userPrincipal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Not authenticated"));
        }
        try {
            return ResponseEntity.ok(call.get());
        } catch (PipGameException e) {
            return ResponseEntity.status(statusOf(e.getReason())).body(Map.of("error", e.getMessage()));
        }
    }

    static HttpStatus statusOf(PipGameException.Reason reason) {
        return switch (reason) {
            case UNKNOWN_FAMILY, BAD_DIFFICULTY -> HttpStatus.BAD_REQUEST;
            case LOCKED -> HttpStatus.FORBIDDEN;
            case NOT_FOUND -> HttpStatus.NOT_FOUND;
            case INVALID_PATH -> HttpStatus.UNPROCESSABLE_ENTITY;
            case GENERATION_FAILED -> HttpStatus.SERVICE_UNAVAILABLE;
        };
    }

    /** No @ControllerAdvice in this codebase - same {error} shape as PetStationController. */
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<?> handleValidation(MethodArgumentNotValidException ex) {
        String message = ex.getBindingResult().getFieldErrors().stream()
                .findFirst()
                .map(err -> err.getDefaultMessage())
                .orElse("Invalid request");
        return ResponseEntity.badRequest().body(Map.of("error", message));
    }
}
