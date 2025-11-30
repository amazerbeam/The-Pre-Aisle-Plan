package com.foodbytes.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UpdatePreferencesRequest {

    @NotNull(message = "Default servings is required")
    @Min(value = 1, message = "Default servings must be at least 1")
    @Max(value = 20, message = "Default servings cannot exceed 20")
    private Integer defaultServings;
}
