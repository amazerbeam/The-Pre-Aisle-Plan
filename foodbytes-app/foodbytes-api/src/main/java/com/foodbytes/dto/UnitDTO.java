package com.foodbytes.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO for Unit data in admin operations.
 * Used for autocomplete and unit selection in recipe editing (FR-045).
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UnitDTO {
    private Long id;
    private String key;      // e.g., "GRAM", "TABLESPOON"
    private String value;    // e.g., "g", "tbsp" (display value)
}
