package com.foodbytes.dto;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * MPP-12: body of PUT /api/meal-plan/{id}/eaten. An explicit target state, not a toggle, so two
 * linked devices ticking at once converge instead of cancelling out.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class MealPlanEntryEatenRequest {
    @NotNull(message = "eaten is required")
    private Boolean eaten;
}
