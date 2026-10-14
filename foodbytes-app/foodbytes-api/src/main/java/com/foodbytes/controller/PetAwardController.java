package com.foodbytes.controller;

import com.foodbytes.security.UserPrincipal;
import com.foodbytes.service.AwardService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import java.util.Map;

/**
 * MPP-22 / MPP-24: the caller's trophy cabinet - status per streak type plus their firsts
 * (see AwardService#getCabinet). Read by the cabinet (MPP-23).
 */
@RestController
@RequestMapping("/api/pet/awards")
@RequiredArgsConstructor
public class PetAwardController {

    private final AwardService awardService;

    @GetMapping
    public ResponseEntity<?> getAwards(@AuthenticationPrincipal UserPrincipal userPrincipal) {
        if (userPrincipal == null) {
            return ResponseEntity.status(401).body(Map.of("error", "Not authenticated"));
        }
        return ResponseEntity.ok(awardService.getCabinet(userPrincipal.getId()));
    }
}
