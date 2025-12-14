package com.foodbytes.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

/**
 * DTO for recipe ingredient data in admin operations (FR-044).
 * Uses ingredient key (existing) or name (new ingredient).
 * FR-084: Includes quantityGrams for accurate macro calculation.
 * FR-093: Supports linkedRecipeId for sub-recipe references.
 *
 * CONSTRAINT: Either ingredient fields OR linkedRecipeId must be provided, not both.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RecipeIngredientAdminDTO {

    private Long id;  // null for new ingredients in recipe

    // Either ingredientId (existing) or ingredientName (new) must be provided
    // FR-093: These are NULL when linkedRecipeId is set
    private Long ingredientId;        // ID of existing ingredient
    private String ingredientKey;     // Key of existing ingredient (alternative to ID)
    private String ingredientName;    // Name for display or new ingredient creation

    // FR-093: Reference to another recipe used as ingredient (e.g., Pizza Dough)
    // When set, ingredient fields must be NULL. Macros calculated from linked recipe.
    private Long linkedRecipeId;      // ID of linked recipe (if this is a sub-recipe reference)
    private String linkedRecipeName;  // Name of linked recipe for display

    @NotNull(message = "Quantity is required")
    @Min(value = 0, message = "Quantity cannot be negative")
    private BigDecimal quantity;

    // Either unitId (existing) or unitValue (new) must be provided
    private Long unitId;              // ID of existing unit
    private String unitKey;           // Key of existing unit (alternative to ID)
    private String unitValue;         // Display value for unit

    // FR-084, FR-093: Gram equivalent for macro calculations
    // For raw ingredients: admin weighs ingredient on scale
    // For linked recipes: portion of linked recipe's total yield (e.g., 280g of 761g dough)
    @NotNull(message = "Quantity in grams is required for macro calculation")
    @Min(value = 0, message = "Quantity in grams cannot be negative")
    private BigDecimal quantityGrams;

    private Integer sortOrder;        // Display order in recipe

    // For new ingredient creation
    private Long aisleId;             // Required if creating new ingredient
    private String aisleName;         // Aisle name for display

    // Flag to indicate if this is a new ingredient (not in database)
    private Boolean isNewIngredient = false;

    // Flag to indicate if this is a new unit (not in database)
    private Boolean isNewUnit = false;

    /**
     * FR-093: Check if this DTO represents a linked recipe reference.
     */
    public boolean isLinkedRecipe() {
        return linkedRecipeId != null;
    }

    /**
     * FR-093: Check if this DTO represents a raw ingredient reference.
     */
    public boolean isRawIngredient() {
        return !isLinkedRecipe();
    }
}
