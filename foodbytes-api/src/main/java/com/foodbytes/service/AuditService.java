package com.foodbytes.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.foodbytes.dto.AuditLogDTO;
import com.foodbytes.model.AuditAction;
import com.foodbytes.model.Recipe;
import com.foodbytes.model.RecipeAuditLog;
import com.foodbytes.model.User;
import com.foodbytes.repository.RecipeAuditLogRepository;
import com.foodbytes.repository.RecipeRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuditService {

    private final RecipeAuditLogRepository auditLogRepository;
    private final RecipeRepository recipeRepository;
    private final ObjectMapper objectMapper;

    @Transactional
    public void logRecipeChange(Long recipeId, User user, AuditAction action, Recipe oldRecipe, Recipe newRecipe) {
        try {
            String oldValues = oldRecipe != null ? serializeRecipe(oldRecipe) : null;
            String newValues = newRecipe != null ? serializeRecipe(newRecipe) : null;

            RecipeAuditLog auditLog = RecipeAuditLog.builder()
                    .recipeId(recipeId)
                    .user(user)
                    .action(action.name())
                    .oldValues(oldValues)
                    .newValues(newValues)
                    .build();

            auditLogRepository.save(auditLog);
            log.info("Audit log created for recipe {} by user {} with action {}", recipeId, user.getEmail(), action);
        } catch (Exception e) {
            log.error("Failed to create audit log for recipe {}", recipeId, e);
            // Don't throw exception - audit logging should not break the main operation
        }
    }

    @Transactional(readOnly = true)
    public List<AuditLogDTO> getAuditLogForRecipe(Long recipeId) {
        List<RecipeAuditLog> logs = auditLogRepository.findByRecipeIdOrderByTimestampDesc(recipeId);
        return logs.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<AuditLogDTO> getAllAuditLogs() {
        List<RecipeAuditLog> logs = auditLogRepository.findAllByOrderByTimestampDesc();
        return logs.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    private String serializeRecipe(Recipe recipe) throws JsonProcessingException {
        Map<String, Object> recipeData = new HashMap<>();
        recipeData.put("id", recipe.getId());
        recipeData.put("name", recipe.getName());
        recipeData.put("defaultServings", recipe.getDefaultServings());
        recipeData.put("calories", recipe.getCalories());
        recipeData.put("isCheat", recipe.getIsCheat());
        recipeData.put("isLive", recipe.getIsLive());
        recipeData.put("isDeleted", recipe.getIsDeleted());

        return objectMapper.writeValueAsString(recipeData);
    }

    private AuditLogDTO convertToDTO(RecipeAuditLog log) {
        String recipeName = null;
        try {
            recipeName = recipeRepository.findById(log.getRecipeId())
                    .map(Recipe::getName)
                    .orElse("Unknown Recipe");
        } catch (Exception e) {
            recipeName = "Unknown Recipe";
        }

        return AuditLogDTO.builder()
                .id(log.getId())
                .recipeId(log.getRecipeId())
                .recipeName(recipeName)
                .userId(log.getUser().getId())
                .userName(log.getUser().getName())
                .action(log.getAction())
                .oldValues(log.getOldValues())
                .newValues(log.getNewValues())
                .timestamp(log.getTimestamp())
                .build();
    }
}
