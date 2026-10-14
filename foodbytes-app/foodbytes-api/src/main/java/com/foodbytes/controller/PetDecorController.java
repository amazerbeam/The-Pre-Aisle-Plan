package com.foodbytes.controller;

import com.foodbytes.dto.RoomPlacementRequest;
import com.foodbytes.dto.RoomWriteDTO;
import com.foodbytes.model.RoomSpot;
import com.foodbytes.security.UserPrincipal;
import com.foodbytes.service.DecorService;
import com.foodbytes.service.PetShopException;
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
 * MPP-27: buy decor and place it in the caller's own room (see DecorService). Both answer MPP-26's
 * RoomWriteDTO, which the client swaps in; reads ride on GET /api/pet (PetDTO.room).
 */
@RestController
@RequestMapping("/api/pet")
@RequiredArgsConstructor
public class PetDecorController {

    private final DecorService decorService;

    @PostMapping("/decor/{itemId}/buy")
    public ResponseEntity<?> buy(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @PathVariable String itemId) {
        if (userPrincipal == null) {
            return unauthenticated();
        }
        return respond(() -> decorService.buy(userPrincipal.getId(), itemId));
    }

    @PutMapping("/room/placements")
    public ResponseEntity<?> place(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @Valid @RequestBody RoomPlacementRequest request) {
        if (userPrincipal == null) {
            return unauthenticated();
        }
        return respond(() -> decorService.place(userPrincipal.getId(), RoomSpot.fromKey(request.getSpot()), request.getItemId()));
    }

    // PetShopException -> 409 (the client's copy is stale), IllegalArgumentException -> 400 (bad id / spot / kind).
    private static ResponseEntity<?> respond(Supplier<RoomWriteDTO> write) {
        try {
            return ResponseEntity.ok(write.get());
        } catch (PetShopException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(Map.of("error", e.getMessage()));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /** No @ControllerAdvice in this codebase - same {error} shape as PetWardrobeController. */
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<?> handleValidation(MethodArgumentNotValidException ex) {
        String message = ex.getBindingResult().getFieldErrors().stream()
                .findFirst()
                .map(err -> err.getDefaultMessage())
                .orElse("Invalid request");
        return ResponseEntity.badRequest().body(Map.of("error", message));
    }

    private static ResponseEntity<?> unauthenticated() {
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Not authenticated"));
    }
}
