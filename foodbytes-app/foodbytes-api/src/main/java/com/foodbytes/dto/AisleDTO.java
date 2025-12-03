package com.foodbytes.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO for Aisle information.
 * Used in shopping list feature (FR-019, FR-020).
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AisleDTO {
    private Long id;
    private String key;
    private String name;
    private Short displayOrder;
}
