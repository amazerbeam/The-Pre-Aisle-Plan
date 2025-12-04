package com.foodbytes.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.math.BigDecimal;

/**
 * DTO for adding an ingredient to a recipe by KEY.
 * Mirrors the N() function pattern from Legacy recipes.js.
 * Used when recipes reference existing ingredients.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class IngredientKeyDTO {

    @NotBlank(message = "Ingredient key is required")
    private String ingredientKey;  // e.g., "chicken_breast"

    @NotNull(message = "Quantity is required")
    @Positive(message = "Quantity must be positive")
    private BigDecimal quantity;

    @NotBlank(message = "Unit key is required")
    private String unitKey;  // e.g., "g", "ml", "piece"
}
