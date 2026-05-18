package com.foodbytes.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.util.List;

/**
 * DTO for ingredient validation feedback.
 * Used when admin wants to create a new ingredient.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class IngredientValidationResultDTO {

    /**
     * True if the ingredient name is valid and can be created.
     * False if there are blocking errors.
     */
    private boolean valid;

    /**
     * Normalized name: trimmed, singular form, title case.
     * e.g., "carrots" -> "Carrot"
     */
    private String normalizedName;

    /**
     * Auto-generated key from normalized name.
     * e.g., "Chicken breast" -> "chicken_breast"
     */
    private String suggestedKey;

    /**
     * List of similar existing ingredients (potential duplicates).
     * Only includes results with >=50% similarity score.
     */
    private List<IngredientSearchResultDTO> similarExisting;

    /**
     * Validation error messages.
     * Empty if valid.
     */
    private List<String> validationErrors;
}
