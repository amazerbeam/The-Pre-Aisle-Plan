package com.foodbytes.controller;

import com.foodbytes.dto.StationLevelRequest;
import com.foodbytes.model.RoomStation;
import com.foodbytes.security.UserPrincipal;
import com.foodbytes.service.PetShopException;
import com.foodbytes.service.StationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

/**
 * MPP-26: upgrade one of the caller's own stations (see StationService). The response is the
 * RoomWriteDTO the client swaps in; reads ride on GET /api/pet (PetDTO.room).
 */
@RestController
@RequestMapping("/api/pet/stations")
@RequiredArgsConstructor
public class PetStationController {

    private final StationService stationService;

    @PostMapping("/{station}/upgrade")
    public ResponseEntity<?> upgrade(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @PathVariable String station) {
        if (userPrincipal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Not authenticated"));
        }
        RoomStation resolved;
        try {
            resolved = RoomStation.fromPath(station);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
        try {
            return ResponseEntity.ok(stationService.upgrade(userPrincipal.getId(), resolved));
        } catch (PetShopException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(Map.of("error", e.getMessage()));
        }
    }

    /** MPP-40 free mode only (403 otherwise): set a station to any level. */
    @PutMapping("/{station}/level")
    public ResponseEntity<?> setLevel(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @PathVariable String station,
            @Valid @RequestBody StationLevelRequest request) {
        if (userPrincipal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Not authenticated"));
        }
        RoomStation resolved;
        try {
            resolved = RoomStation.fromPath(station);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
        try {
            return ResponseEntity.ok(stationService.setLevel(userPrincipal.getId(), resolved, request.getLevel()));
        } catch (PetShopException e) {
            HttpStatus status = e.getReason() == PetShopException.Reason.FREE_MODE_ONLY ? HttpStatus.FORBIDDEN : HttpStatus.CONFLICT;
            return ResponseEntity.status(status).body(Map.of("error", e.getMessage()));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /** No @ControllerAdvice in this codebase - same {error} shape as PetDecorController. */
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<?> handleValidation(MethodArgumentNotValidException ex) {
        String message = ex.getBindingResult().getFieldErrors().stream()
                .findFirst()
                .map(err -> err.getDefaultMessage())
                .orElse("Invalid request");
        return ResponseEntity.badRequest().body(Map.of("error", message));
    }
}
