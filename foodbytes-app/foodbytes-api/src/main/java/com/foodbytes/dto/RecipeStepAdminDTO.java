package com.foodbytes.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO for recipe step data in admin operations (FR-046).
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RecipeStepAdminDTO {

    private Long id;  // null for new steps

    private Integer stepNumber;  // Will be auto-assigned based on order

    @NotBlank(message = "Step instruction is required")
    private String instruction;

    private String tip;  // Optional tip for this step

    // FR-091: Links step to an extras recipe
    private Long linkedRecipeId;     // Optional link to extras recipe
    private String linkedRecipeName; // For display in frontend (read-only)
    private String altInstruction;   // Alternative instruction when linked recipe is store-bought
}
