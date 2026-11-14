package com.foodbytes.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/** The normalised hide key returned after hiding a recipe. */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class HiddenRecipeDTO {
    private Long recipeId;
}
