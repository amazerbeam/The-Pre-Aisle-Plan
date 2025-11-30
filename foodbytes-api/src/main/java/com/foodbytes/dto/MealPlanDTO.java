package com.foodbytes.dto;

import com.foodbytes.model.MealPlanEntry;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Max;
import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MealPlanDTO {

    private Long id;

    @NotNull(message = "Date is required")
    private LocalDate date;

    @NotNull(message = "Meal type is required")
    private String mealType;

    @NotNull(message = "Recipe ID is required")
    private Long recipeId;

    private String recipeName;

    private Integer recipeCalories;

    @NotNull(message = "Servings is required")
    @Min(value = 1, message = "Servings must be at least 1")
    @Max(value = 10, message = "Servings cannot exceed 10")
    private Integer servings;

    public static MealPlanDTO fromEntity(MealPlanEntry entry) {
        return MealPlanDTO.builder()
                .id(entry.getId())
                .date(entry.getPlanDate())
                .mealType(entry.getMealType().name())
                .recipeId(entry.getRecipe().getId())
                .recipeName(entry.getRecipe().getName())
                .recipeCalories(entry.getRecipe().getCalories())
                .servings(entry.getServings())
                .build();
    }
}
