package com.foodbytes.controller;

import com.foodbytes.dto.MealPlanDTO;
import com.foodbytes.security.UserPrincipal;
import com.foodbytes.service.MealPlanService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/meal-plan")
@RequiredArgsConstructor
public class MealPlanController {

    private final MealPlanService mealPlanService;

    @GetMapping
    public ResponseEntity<List<MealPlanDTO>> getMealPlan(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to,
            @AuthenticationPrincipal UserPrincipal principal) {

        if (principal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        return ResponseEntity.ok(mealPlanService.getEntriesForDateRange(principal.getId(), from, to));
    }

    @PostMapping
    public ResponseEntity<MealPlanDTO> addEntry(
            @Valid @RequestBody MealPlanDTO dto,
            @AuthenticationPrincipal UserPrincipal principal) {

        if (principal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(mealPlanService.createEntry(dto, principal.getId()));
    }

    @PutMapping("/{id}")
    public ResponseEntity<MealPlanDTO> updateEntry(
            @PathVariable Long id,
            @Valid @RequestBody MealPlanDTO dto,
            @AuthenticationPrincipal UserPrincipal principal) {

        if (principal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        return ResponseEntity.ok(mealPlanService.updateEntry(id, dto, principal.getId()));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteEntry(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal principal) {

        if (principal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        mealPlanService.deleteEntry(id, principal.getId());
        return ResponseEntity.noContent().build();
    }
}
