package com.foodbytes.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO for creating a new unit during recipe save (FR-045).
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NewUnitDTO {

    @NotBlank(message = "Unit value is required")
    private String value;  // Display value (e.g., "bunch", "sprig")

    // Temporary ID used by frontend to reference this new unit in recipe ingredients
    private String tempId;
}
