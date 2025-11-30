package com.foodbytes.dto;

import com.fasterxml.jackson.databind.JsonNode;
import com.foodbytes.model.AuditAction;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RecipeAuditLogDTO {
    private Long id;
    private Long recipeId;
    private String recipeName;
    private Long userId;
    private String userName;
    private AuditAction action;
    private JsonNode oldValues;
    private JsonNode newValues;
    private LocalDateTime timestamp;
}
