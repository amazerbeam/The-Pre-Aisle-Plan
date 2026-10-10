package com.foodbytes.controller;

import com.foodbytes.dto.ExtraChoicesUpdateRequest;
import com.foodbytes.dto.LegacySelectionsImportRequest;
import com.foodbytes.security.UserPrincipal;
import com.foodbytes.service.ExtraChoiceService;
import com.foodbytes.service.ManageExtrasService;
import com.foodbytes.service.MealPlanTemplateService.TemplateNotFoundException;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDate;
import java.util.Map;

/**
 * MPP-10: homemade/store-bought choices for recipe extras - the Manage extras popup (week and
 * template), the per-dish defaults that pre-fill the add-to-day popup, and the one-time upload
 * of legacy localStorage selections. All endpoints require authentication.
 */
@RestController
@RequestMapping("/api/meal-plan/extras")
@RequiredArgsConstructor
public class MealPlanExtrasController {

    private static final String CONFLICT_MESSAGE =
        "That choice was changed at the same time on another device. Try again.";

    private final ManageExtrasService manageExtrasService;
    private final ExtraChoiceService extraChoiceService;

    @GetMapping("/week")
    public ResponseEntity<?> getWeek(@AuthenticationPrincipal UserPrincipal userPrincipal,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate) {
        if (userPrincipal == null) {
            return ResponseEntity.status(403).body(Map.of("error", "Authentication required"));
        }
        return ResponseEntity.ok(manageExtrasService.getWeekView(userPrincipal.getId(), startDate));
    }

    @PutMapping("/week/choices")
    public ResponseEntity<?> updateWeek(@AuthenticationPrincipal UserPrincipal userPrincipal,
            @Valid @RequestBody ExtraChoicesUpdateRequest request) {
        if (userPrincipal == null) {
            return ResponseEntity.status(403).body(Map.of("error", "Authentication required"));
        }
        try {
            extraChoiceService.updateWeekChoices(userPrincipal.getId(), request.getChoices());
            return ResponseEntity.noContent().build();
        } catch (ExtraChoiceService.ChoiceTargetNotFoundException e) {
            return ResponseEntity.status(404).body(Map.of("error", e.getMessage()));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (DataIntegrityViolationException e) {
            return ResponseEntity.status(409).body(Map.of("error", CONFLICT_MESSAGE));
        }
    }

    @GetMapping("/templates/{templateId}")
    public ResponseEntity<?> getTemplate(@AuthenticationPrincipal UserPrincipal userPrincipal,
            @PathVariable Long templateId) {
        if (userPrincipal == null) {
            return ResponseEntity.status(403).body(Map.of("error", "Authentication required"));
        }
        try {
            return ResponseEntity.ok(manageExtrasService.getTemplateView(userPrincipal.getId(), templateId));
        } catch (TemplateNotFoundException e) {
            return ResponseEntity.status(404).body(Map.of("error", e.getMessage()));
        }
    }

    @PutMapping("/templates/{templateId}/choices")
    public ResponseEntity<?> updateTemplate(@AuthenticationPrincipal UserPrincipal userPrincipal,
            @PathVariable Long templateId, @Valid @RequestBody ExtraChoicesUpdateRequest request) {
        if (userPrincipal == null) {
            return ResponseEntity.status(403).body(Map.of("error", "Authentication required"));
        }
        try {
            extraChoiceService.updateTemplateChoices(userPrincipal.getId(), templateId, request.getChoices());
            return ResponseEntity.noContent().build();
        } catch (ExtraChoiceService.ChoiceTargetNotFoundException e) {
            return ResponseEntity.status(404).body(Map.of("error", e.getMessage()));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (DataIntegrityViolationException e) {
            return ResponseEntity.status(409).body(Map.of("error", CONFLICT_MESSAGE));
        }
    }

    @GetMapping("/defaults")
    public ResponseEntity<?> getDefaults(@AuthenticationPrincipal UserPrincipal userPrincipal) {
        if (userPrincipal == null) {
            return ResponseEntity.status(403).body(Map.of("error", "Authentication required"));
        }
        return ResponseEntity.ok(extraChoiceService.getDefaults(userPrincipal.getId()));
    }

    @PostMapping("/import")
    public ResponseEntity<?> importLegacy(@AuthenticationPrincipal UserPrincipal userPrincipal,
            @Valid @RequestBody LegacySelectionsImportRequest request) {
        if (userPrincipal == null) {
            return ResponseEntity.status(403).body(Map.of("error", "Authentication required"));
        }
        try {
            boolean imported = extraChoiceService.importLegacySelections(userPrincipal.getId(), request.getSelections());
            return ResponseEntity.ok(Map.of("imported", imported));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (DataIntegrityViolationException e) {
            return ResponseEntity.status(409).body(Map.of("error", CONFLICT_MESSAGE));
        }
    }
}
