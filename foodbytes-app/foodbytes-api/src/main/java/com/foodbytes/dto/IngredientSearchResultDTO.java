package com.foodbytes.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

/**
 * DTO for ingredient search/autocomplete results.
 * Includes similarity score for fuzzy matching.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class IngredientSearchResultDTO {

    private Long id;

    private String key;

    private String name;

    private String aisleName;

    /**
     * Similarity score from 0.0 to 1.0.
     * 1.0 = exact match
     * 0.9 = prefix match
     * 0.7-0.85 = contains match
     * 0.5+ = Levenshtein fuzzy match
     */
    private Double similarityScore;
}
