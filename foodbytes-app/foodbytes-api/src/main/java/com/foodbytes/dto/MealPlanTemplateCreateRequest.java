package com.foodbytes.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.time.LocalDate;

/**
 * Request body for creating a saved template by snapshotting the user's
 * current week starting at sourceStartDate.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class MealPlanTemplateCreateRequest {

    @NotBlank(message = "Name is required")
    @Size(min = 1, max = 60, message = "Name must be 1–60 characters")
    private String name;

    @NotNull(message = "Source start date is required")
    private LocalDate sourceStartDate;
}
