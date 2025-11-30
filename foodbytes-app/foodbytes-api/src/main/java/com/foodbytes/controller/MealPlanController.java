package com.foodbytes.controller;

import com.foodbytes.dto.MealPlanEntryDTO;
import com.foodbytes.model.User;
import com.foodbytes.service.MealPlanService;
import com.foodbytes.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/meal-plan")
@RequiredArgsConstructor
@Slf4j
public class MealPlanController {

    private final MealPlanService mealPlanService;
    private final UserService userService;

    @GetMapping
    public ResponseEntity<List<MealPlanEntryDTO>> getMealPlan(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {

        User user = getCurrentUser();
        List<MealPlanEntryDTO> entries = mealPlanService.getEntriesForDateRange(user, startDate, endDate);
        return ResponseEntity.ok(entries);
    }

    @PostMapping
    public ResponseEntity<MealPlanEntryDTO> createMealPlanEntry(@Valid @RequestBody MealPlanEntryDTO entryDTO) {
        User user = getCurrentUser();
        MealPlanEntryDTO createdEntry = mealPlanService.createEntry(user, entryDTO);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdEntry);
    }

    @PutMapping("/{id}")
    public ResponseEntity<MealPlanEntryDTO> updateMealPlanEntry(
            @PathVariable Long id,
            @Valid @RequestBody MealPlanEntryDTO entryDTO) {

        User user = getCurrentUser();
        MealPlanEntryDTO updatedEntry = mealPlanService.updateEntry(user, id, entryDTO);
        return ResponseEntity.ok(updatedEntry);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteMealPlanEntry(@PathVariable Long id) {
        User user = getCurrentUser();
        mealPlanService.deleteEntry(user, id);
        return ResponseEntity.noContent().build();
    }

    private User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        Long userId = (Long) authentication.getPrincipal();
        return userService.findById(userId);
    }
}
