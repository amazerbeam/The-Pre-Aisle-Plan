package com.foodbytes.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import jakarta.validation.constraints.NotNull;

/**
 * FR-043: DTO for adding/updating recipe family member.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class RecipeFamilyMemberDTO {

    @NotNull(message = "Recipe ID is required")
    private Long recipeId;

    private String variantLabel;  // e.g., "Vegetarian", "Vegan", "Low-Carb"

    private Boolean isDefault = false;

    private Integer displayOrder = 0;
}
