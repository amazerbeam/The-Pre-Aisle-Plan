package com.foodbytes.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class RecipeDTO {
    private Long id;
    private String name;
    private Integer defaultServings;
    private Integer calories;
    private Boolean isCheat;
    private List<String> mealTypes;
    private List<IngredientDTO> ingredients;
    private List<String> steps;
}
