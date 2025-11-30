package com.foodbytes.controller;

import com.foodbytes.dto.AuditLogDTO;
import com.foodbytes.service.AuditService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/audit")
@RequiredArgsConstructor
@Slf4j
@PreAuthorize("hasRole('ADMIN')")
public class AuditController {

    private final AuditService auditService;

    @GetMapping
    public ResponseEntity<List<AuditLogDTO>> getAllAuditLogs() {
        List<AuditLogDTO> auditLogs = auditService.getAllAuditLogs();
        return ResponseEntity.ok(auditLogs);
    }

    @GetMapping("/recipes/{recipeId}")
    public ResponseEntity<List<AuditLogDTO>> getAuditLogsForRecipe(@PathVariable Long recipeId) {
        List<AuditLogDTO> auditLogs = auditService.getAuditLogForRecipe(recipeId);
        return ResponseEntity.ok(auditLogs);
    }
}
