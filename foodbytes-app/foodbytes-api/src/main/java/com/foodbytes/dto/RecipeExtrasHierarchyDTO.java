package com.foodbytes.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;
import java.util.ArrayList;

/**
 * FR-086: API response DTO for recipe extras hierarchy.
 * Contains the parent recipe info and the tree of linked extras.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RecipeExtrasHierarchyDTO {
    private Long parentRecipeId;
    private String parentRecipeName;

    @Builder.Default
    private List<RecipeExtraNodeDTO> extras = new ArrayList<>();
}
