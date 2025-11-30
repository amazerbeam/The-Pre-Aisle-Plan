package com.foodbytes.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UpdateMealPlanRequest {

    @NotNull(message = "Servings is required")
    @Positive(message = "Servings must be positive")
    private Integer servings;
}
