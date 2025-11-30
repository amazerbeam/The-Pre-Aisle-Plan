package com.foodbytes.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CreateRecipeRequest {

    @NotBlank(message = "Recipe name is required")
    private String name;

    @NotNull(message = "Default servings is required")
    @Positive(message = "Default servings must be positive")
    private Integer defaultServings;

    @NotNull(message = "Calories is required")
    private Integer calories;

    @NotNull(message = "isCheat flag is required")
    private Boolean isCheat;

    @NotNull(message = "isLive flag is required")
    private Boolean isLive;

    @NotEmpty(message = "At least one ingredient is required")
    @Valid
    private List<IngredientInput> ingredients;

    @NotEmpty(message = "At least one step is required")
    @Valid
    private List<StepInput> steps;

    @NotEmpty(message = "At least one meal type is required")
    private List<String> mealTypes;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class IngredientInput {
        @NotNull(message = "Ingredient ID is required")
        private Long ingredientId;

        @NotNull(message = "Quantity is required")
        private BigDecimal quantity;

        @NotNull(message = "Unit ID is required")
        private Long unitId;

        @NotNull(message = "Display order is required")
        private Integer displayOrder;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class StepInput {
        @NotNull(message = "Step number is required")
        private Integer stepNumber;

        @NotBlank(message = "Instruction is required")
        private String instruction;
    }
}
