package com.foodbytes.controller;

import com.foodbytes.security.UserPrincipal;
import com.foodbytes.service.SprinkleHistoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

/**
 * MPP-42: the caller's own recent sprinkles and the payout amounts (see SprinkleHistoryService).
 * Takes no user parameter - it can only ever read the principal's own ledger.
 */
@RestController
@RequestMapping("/api/pet/sprinkles")
@RequiredArgsConstructor
public class PetSprinkleController {

    private final SprinkleHistoryService sprinkleHistoryService;

    @GetMapping("/recent")
    public ResponseEntity<?> recent(@AuthenticationPrincipal UserPrincipal userPrincipal) {
        if (userPrincipal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Not authenticated"));
        }
        return ResponseEntity.ok(sprinkleHistoryService.recent(userPrincipal.getId()));
    }
}
