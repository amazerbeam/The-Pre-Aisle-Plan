package com.foodbytes.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

/**
 * DTO for admin recipe CRUD operations (FR-033, FR-047).
 * Used for creating and updating recipes.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RecipeAdminDTO {

    private Long id;

    @NotBlank(message = "Recipe name is required")
    private String name;

    @NotNull(message = "Default servings is required")
    @Min(value = 1, message = "Default servings must be at least 1")
    private Integer defaultServings;

    @NotNull(message = "Calories is required")
    @Min(value = 0, message = "Calories cannot be negative")
    private Integer calories;

    private Boolean isCheat = false;

    private Boolean isLive = false;  // New recipes default to hidden (FR-047)

    // Macro/calorie audit sign-off — RESPONSE ONLY.
    // RecipeService never reads these off an inbound DTO; the only writer is
    // PATCH /api/recipes/admin/{id}/audit. RecipeInfoForm saves a spread of the
    // whole loaded DTO, so reading them here would let a stale client payload
    // flip the flag as a side effect of an unrelated edit.
    private Boolean macrosAudited = false;

    private LocalDateTime macrosAuditedAt;   // null when not audited

    private Long macrosAuditedBy;            // users.id, null when not audited

    @NotEmpty(message = "At least one meal type is required")
    private List<String> mealTypes;  // List of meal keys: "breakfast", "lunch", "dinner", "snacks"

    @NotEmpty(message = "At least one ingredient is required")
    @Valid
    private List<RecipeIngredientAdminDTO> ingredients;

    @NotEmpty(message = "At least one step is required")
    @Valid
    private List<RecipeStepAdminDTO> steps;

    // New items to be created (populated by frontend before save)
    private List<NewIngredientDTO> newIngredients;
    private List<NewUnitDTO> newUnits;
}
