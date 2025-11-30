package com.foodbytes.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AuditLogDTO {
    private Long id;
    private Long recipeId;
    private String recipeName;
    private Long userId;
    private String userName;
    private String action;
    private String oldValues;
    private String newValues;
    private LocalDateTime timestamp;
}
