package com.foodbytes.controller;

import com.foodbytes.dto.RecipeAuditLogDTO;
import com.foodbytes.service.AuditService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/audit")
@RequiredArgsConstructor
@Slf4j
public class AuditController {

    private final AuditService auditService;

    @GetMapping("/recipes")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<RecipeAuditLogDTO>> getAllRecipeAuditLogs() {
        List<RecipeAuditLogDTO> logs = auditService.getAllAuditLogs();
        return ResponseEntity.ok(logs);
    }

    @GetMapping("/recipes/{recipeId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<RecipeAuditLogDTO>> getRecipeAuditLogs(@PathVariable Long recipeId) {
        List<RecipeAuditLogDTO> logs = auditService.getAuditLogForRecipe(recipeId);
        return ResponseEntity.ok(logs);
    }

    @GetMapping("/recipes/date-range")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<RecipeAuditLogDTO>> getRecipeAuditLogsByDateRange(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate) {

        List<RecipeAuditLogDTO> logs = auditService.getAuditLogsBetween(startDate, endDate);
        return ResponseEntity.ok(logs);
    }
}
