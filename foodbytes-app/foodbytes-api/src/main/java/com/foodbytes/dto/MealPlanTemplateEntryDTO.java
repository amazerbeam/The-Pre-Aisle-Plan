package com.foodbytes.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class MealPlanTemplateEntryDTO {
    private Long id;
    private Integer dayOffset;
    private Long mealId;
    private String mealType;
    private Long recipeId;
    private String recipeName;
    private Integer servings;
}
