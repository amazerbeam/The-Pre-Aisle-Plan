package com.foodbytes.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO for creating a new ingredient during recipe save (FR-044).
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NewIngredientDTO {

    @NotBlank(message = "Ingredient name is required")
    private String name;

    @NotNull(message = "Aisle ID is required for new ingredients")
    private Long aisleId;

    // Temporary ID used by frontend to reference this new ingredient in recipe ingredients
    private String tempId;
}
