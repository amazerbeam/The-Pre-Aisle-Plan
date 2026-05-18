package com.foodbytes.controller;

import com.foodbytes.dto.*;
import com.foodbytes.security.UserPrincipal;
import com.foodbytes.service.MealPlanTemplateService;
import com.foodbytes.service.MealPlanTemplateService.DuplicateTemplateNameException;
import com.foodbytes.service.MealPlanTemplateService.TemplateNotFoundException;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;

/**
 * REST endpoints for saved meal-plan templates.
 * See requirement-meal-plan-templates-2026-05-09.md.
 */
@RestController
@RequestMapping("/api/meal-plan/templates")
@RequiredArgsConstructor
public class MealPlanTemplateController {

    private final MealPlanTemplateService service;

    @GetMapping
    public ResponseEntity<?> list(@AuthenticationPrincipal UserPrincipal userPrincipal) {
        if (userPrincipal == null) {
            return ResponseEntity.status(403).body(Map.of("error", "Authentication required"));
        }
        List<MealPlanTemplateDTO> templates = service.listTemplates(userPrincipal.getId());
        return ResponseEntity.ok(templates);
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> get(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @PathVariable Long id) {
        if (userPrincipal == null) {
            return ResponseEntity.status(403).body(Map.of("error", "Authentication required"));
        }
        try {
            return ResponseEntity.ok(service.getTemplate(userPrincipal.getId(), id));
        } catch (TemplateNotFoundException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PostMapping
    public ResponseEntity<?> create(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @Valid @RequestBody MealPlanTemplateCreateRequest request) {
        if (userPrincipal == null) {
            return ResponseEntity.status(403).body(Map.of("error", "Authentication required"));
        }
        try {
            MealPlanTemplateDTO created = service.saveTemplate(userPrincipal.getId(), request);
            return ResponseEntity.ok(created);
        } catch (DuplicateTemplateNameException e) {
            return ResponseEntity.status(409).body(Map.of("error", "Template name already exists"));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PatchMapping("/{id}")
    public ResponseEntity<?> rename(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @PathVariable Long id,
            @Valid @RequestBody MealPlanTemplateRenameRequest request) {
        if (userPrincipal == null) {
            return ResponseEntity.status(403).body(Map.of("error", "Authentication required"));
        }
        try {
            return ResponseEntity.ok(service.renameTemplate(userPrincipal.getId(), id, request.getName()));
        } catch (TemplateNotFoundException e) {
            return ResponseEntity.notFound().build();
        } catch (DuplicateTemplateNameException e) {
            return ResponseEntity.status(409).body(Map.of("error", "Template name already exists"));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PutMapping("/{id}/snapshot")
    public ResponseEntity<?> updateSnapshot(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @PathVariable Long id,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate sourceStartDate) {
        if (userPrincipal == null) {
            return ResponseEntity.status(403).body(Map.of("error", "Authentication required"));
        }
        try {
            return ResponseEntity.ok(service.updateSnapshot(userPrincipal.getId(), id, sourceStartDate));
        } catch (TemplateNotFoundException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @PathVariable Long id) {
        if (userPrincipal == null) {
            return ResponseEntity.status(403).body(Map.of("error", "Authentication required"));
        }
        boolean removed = service.deleteTemplate(userPrincipal.getId(), id);
        return removed ? ResponseEntity.noContent().build() : ResponseEntity.notFound().build();
    }

    @PostMapping("/{id}/apply")
    public ResponseEntity<?> apply(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @PathVariable Long id,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate targetStartDate) {
        if (userPrincipal == null) {
            return ResponseEntity.status(403).body(Map.of("error", "Authentication required"));
        }
        try {
            MealPlanWeekDTO result = service.applyTemplate(userPrincipal.getId(), id, targetStartDate);
            return ResponseEntity.ok(result);
        } catch (TemplateNotFoundException e) {
            return ResponseEntity.notFound().build();
        }
    }
}
