package com.foodbytes.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * FR-091: DTO for recipe step in user view.
 * Includes linked recipe info for navigation between recipes.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RecipeStepViewDTO {

    private Integer stepNumber;
    private String instruction;
    private String tip;

    // FR-091: Linked recipe info for navigation
    private Long linkedRecipeId;     // ID of linked extras recipe (null if no link)
    private String linkedRecipeName; // Name for display (null if no link)
    private String altInstruction;   // Alternative instruction when linked is store-bought
}
