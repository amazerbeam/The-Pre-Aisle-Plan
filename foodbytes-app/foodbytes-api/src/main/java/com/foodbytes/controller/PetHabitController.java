package com.foodbytes.controller;

import com.foodbytes.dto.HabitAnswerRequest;
import com.foodbytes.dto.HabitFirstAnswerRequest;
import com.foodbytes.model.Habit;
import com.foodbytes.security.UserPrincipal;
import com.foodbytes.service.HabitStreakService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;
import java.util.Map;

/**
 * MPP-20: the caller's own snack-free / alcohol-free check-in streaks (see HabitStreakService).
 * Read by Pip's speech bubble (MPP-21); the one-time first answer is MPP-35.
 */
@RestController
@RequestMapping("/api/pet/habits")
@RequiredArgsConstructor
public class PetHabitController {

    private final HabitStreakService habitStreakService;

    @GetMapping
    public ResponseEntity<?> getHabits(@AuthenticationPrincipal UserPrincipal userPrincipal) {
        if (userPrincipal == null) {
            return ResponseEntity.status(401).body(Map.of("error", "Not authenticated"));
        }
        return ResponseEntity.ok(habitStreakService.getHabits(userPrincipal.getId()));
    }

    @PostMapping("/{habit}/answer")
    public ResponseEntity<?> answer(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @PathVariable Habit habit,
            @Valid @RequestBody HabitAnswerRequest request) {
        if (userPrincipal == null) {
            return ResponseEntity.status(401).body(Map.of("error", "Not authenticated"));
        }
        try {
            return ResponseEntity.ok(habitStreakService.answer(userPrincipal.getId(), habit, request));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /** MPP-35: the one-time "When did you last…?" answer; 400 once the habit has been answered. */
    @PostMapping("/{habit}/first-answer")
    public ResponseEntity<?> firstAnswer(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @PathVariable Habit habit,
            @RequestBody HabitFirstAnswerRequest request) {
        if (userPrincipal == null) {
            return ResponseEntity.status(401).body(Map.of("error", "Not authenticated"));
        }
        try {
            return ResponseEntity.ok(habitStreakService.firstAnswer(userPrincipal.getId(), habit, request));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /** No @ControllerAdvice in this codebase — same {error} shape as PetController. */
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<?> handleValidation(MethodArgumentNotValidException ex) {
        String message = ex.getBindingResult().getFieldErrors().stream()
                .findFirst()
                .map(err -> err.getDefaultMessage())
                .orElse("Invalid request");
        return ResponseEntity.badRequest().body(Map.of("error", message));
    }

    /** {habit} must be SNACK or ALCOHOL. */
    @ExceptionHandler(MethodArgumentTypeMismatchException.class)
    public ResponseEntity<?> handleUnknownHabit(MethodArgumentTypeMismatchException ex) {
        return ResponseEntity.badRequest().body(Map.of("error", "Unknown habit: " + ex.getValue()));
    }
}
