package com.foodbytes.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.foodbytes.dto.RecipeAuditLogDTO;
import com.foodbytes.dto.RecipeDTO;
import com.foodbytes.model.AuditAction;
import com.foodbytes.model.Recipe;
import com.foodbytes.model.RecipeAuditLog;
import com.foodbytes.model.User;
import com.foodbytes.repository.RecipeAuditLogRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuditService {

    private final RecipeAuditLogRepository auditLogRepository;
    private final ObjectMapper objectMapper;

    @Transactional
    public void logChange(Recipe recipe, User user, AuditAction action, RecipeDTO oldValues, RecipeDTO newValues) {
        try {
            String oldValuesJson = oldValues != null ? objectMapper.writeValueAsString(oldValues) : null;
            String newValuesJson = newValues != null ? objectMapper.writeValueAsString(newValues) : null;

            RecipeAuditLog auditLog = RecipeAuditLog.builder()
                    .recipe(recipe)
                    .user(user)
                    .action(action)
                    .oldValues(oldValuesJson)
                    .newValues(newValuesJson)
                    .timestamp(LocalDateTime.now())
                    .build();

            auditLogRepository.save(auditLog);
            log.debug("Audit log created for recipe: {} (action: {})", recipe.getId(), action);

        } catch (JsonProcessingException e) {
            log.error("Error creating audit log", e);
            // Don't throw exception - audit logging should not break the main flow
        }
    }

    public List<RecipeAuditLogDTO> getAuditLogForRecipe(Long recipeId) {
        List<RecipeAuditLog> logs = auditLogRepository.findByRecipeIdOrderByTimestampDesc(recipeId);
        return logs.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public List<RecipeAuditLogDTO> getAllAuditLogs() {
        List<RecipeAuditLog> logs = auditLogRepository.findAllByOrderByTimestampDesc();
        return logs.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public List<RecipeAuditLogDTO> getAuditLogsBetween(LocalDateTime startDate, LocalDateTime endDate) {
        List<RecipeAuditLog> logs = auditLogRepository.findByTimestampBetweenOrderByTimestampDesc(startDate, endDate);
        return logs.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    private RecipeAuditLogDTO convertToDTO(RecipeAuditLog log) {
        try {
            return RecipeAuditLogDTO.builder()
                    .id(log.getId())
                    .recipeId(log.getRecipe().getId())
                    .recipeName(log.getRecipe().getName())
                    .userId(log.getUser().getId())
                    .userName(log.getUser().getName())
                    .action(log.getAction())
                    .oldValues(log.getOldValues() != null ? objectMapper.readTree(log.getOldValues()) : null)
                    .newValues(log.getNewValues() != null ? objectMapper.readTree(log.getNewValues()) : null)
                    .timestamp(log.getTimestamp())
                    .build();
        } catch (JsonProcessingException e) {
            log.error("Error converting audit log to DTO", e);
            throw new RuntimeException("Error processing audit log data", e);
        }
    }
}
