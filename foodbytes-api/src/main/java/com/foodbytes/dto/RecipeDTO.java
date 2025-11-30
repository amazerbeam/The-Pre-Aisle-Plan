package com.foodbytes.dto;

import com.foodbytes.model.Recipe;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;

import java.util.List;
import java.util.stream.Collectors;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RecipeDTO {

    private Long id;
    private String name;
    private Integer defaultServings;
    private Integer calories;
    private Boolean isCheat;
    private Boolean isLive;
    private List<String> mealTypes;
    private List<IngredientDTO> ingredients;
    private List<String> steps;

    public static RecipeDTO fromEntity(Recipe recipe) {
        return RecipeDTO.builder()
                .id(recipe.getId())
                .name(recipe.getName())
                .defaultServings(recipe.getDefaultServings())
                .calories(recipe.getCalories())
                .isCheat(recipe.getIsCheat())
                .isLive(recipe.getIsLive())
                .mealTypes(recipe.getMeals().stream()
                        .map(m -> m.getKey())
                        .collect(Collectors.toList()))
                .ingredients(recipe.getIngredients().stream()
                        .map(IngredientDTO::fromEntity)
                        .collect(Collectors.toList()))
                .steps(recipe.getSteps().stream()
                        .map(s -> s.getInstruction())
                        .collect(Collectors.toList()))
                .build();
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class IngredientDTO {
        private String name;
        private Double quantity;
        private String unit;
        private String aisle;
        private String aisleColor;

        public static IngredientDTO fromEntity(com.foodbytes.model.RecipeIngredient ri) {
            return IngredientDTO.builder()
                    .name(ri.getIngredient().getName())
                    .quantity(ri.getQuantity().doubleValue())
                    .unit(ri.getUnit().getValue())
                    .aisle(ri.getIngredient().getAisle().getName())
                    .aisleColor(ri.getIngredient().getAisle().getColor())
                    .build();
        }
    }
}
