package com.foodbytes.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * DTO for updating only the steps of a recipe.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class RecipeStepsUpdateDTO {

    @NotEmpty(message = "At least one step is required")
    @Valid
    private List<RecipeStepAdminDTO> steps;
}
