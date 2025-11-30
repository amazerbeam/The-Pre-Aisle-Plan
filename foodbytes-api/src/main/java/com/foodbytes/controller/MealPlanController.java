package com.foodbytes.controller;

import com.foodbytes.dto.CreateMealPlanRequest;
import com.foodbytes.dto.MealPlanEntryDTO;
import com.foodbytes.dto.UpdateMealPlanRequest;
import com.foodbytes.model.User;
import com.foodbytes.security.UserPrincipal;
import com.foodbytes.service.MealPlanService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
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
@Slf4j
public class MealPlanController {

    private final MealPlanService mealPlanService;

    @GetMapping
    public ResponseEntity<List<MealPlanEntryDTO>> getMealPlanEntries(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to) {

        User user = userPrincipal.getUser();
        List<MealPlanEntryDTO> entries = mealPlanService.getEntriesForDateRange(user, from, to);

        return ResponseEntity.ok(entries);
    }

    @PostMapping
    public ResponseEntity<MealPlanEntryDTO> createMealPlanEntry(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @Valid @RequestBody CreateMealPlanRequest request) {

        User user = userPrincipal.getUser();
        MealPlanEntryDTO entry = mealPlanService.createEntry(user, request);

        return ResponseEntity.status(HttpStatus.CREATED).body(entry);
    }

    @PutMapping("/{id}")
    public ResponseEntity<MealPlanEntryDTO> updateMealPlanEntry(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @PathVariable Long id,
            @Valid @RequestBody UpdateMealPlanRequest request) {

        User user = userPrincipal.getUser();
        MealPlanEntryDTO entry = mealPlanService.updateEntry(user, id, request);

        return ResponseEntity.ok(entry);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteMealPlanEntry(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @PathVariable Long id) {

        User user = userPrincipal.getUser();
        mealPlanService.deleteEntry(user, id);

        return ResponseEntity.noContent().build();
    }
}
