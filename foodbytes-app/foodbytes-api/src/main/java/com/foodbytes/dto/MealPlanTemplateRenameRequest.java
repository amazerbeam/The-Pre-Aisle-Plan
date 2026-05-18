package com.foodbytes.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class MealPlanTemplateRenameRequest {

    @NotBlank(message = "Name is required")
    @Size(min = 1, max = 60, message = "Name must be 1–60 characters")
    private String name;
}
