package com.foodbytes.dto;

import com.fasterxml.jackson.databind.JsonNode;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RecipeDTO {
    private Long id;

    @NotBlank(message = "Recipe name is required")
    private String name;

    @NotNull(message = "Meal types are required")
    private JsonNode mealTypes;  // JSON array

    @NotNull(message = "Default servings is required")
    @Min(value = 1, message = "Default servings must be at least 1")
    private Integer defaultServings;

    @NotNull(message = "Calories is required")
    @Min(value = 0, message = "Calories must be non-negative")
    private Integer calories;

    @NotNull(message = "Ingredients are required")
    private JsonNode ingredients;  // JSON array

    @NotNull(message = "Steps are required")
    private JsonNode steps;  // JSON array

    private Boolean isCheat;
    private Boolean isLive;
    private Boolean isDeleted;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
