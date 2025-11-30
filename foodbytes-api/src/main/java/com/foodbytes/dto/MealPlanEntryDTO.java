package com.foodbytes.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MealPlanEntryDTO {
    private Long id;
    private Long userId;
    private LocalDate planDate;
    private String mealType;
    private Long recipeId;
    private String recipeName;
    private Boolean isCheat;
    private Integer calories;
    private Integer servings;
    private Integer recipeDefaultServings;
    private List<RecipeIngredientDTO> ingredients;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
