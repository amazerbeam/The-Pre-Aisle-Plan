package com.foodbytes.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * DTO for updating only the ingredients of a recipe.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class RecipeIngredientsUpdateDTO {

    @NotEmpty(message = "At least one ingredient is required")
    @Valid
    private List<RecipeIngredientAdminDTO> ingredients;

    private List<NewIngredientDTO> newIngredients;
    private List<NewUnitDTO> newUnits;
}
