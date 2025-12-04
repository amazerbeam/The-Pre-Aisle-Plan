package com.foodbytes.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

/**
 * DTO for admin ingredient management (CRUD operations).
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class IngredientAdminDTO {

    private Long id;

    // Key is auto-generated from name, read-only for responses
    private String key;

    @NotBlank(message = "Ingredient name is required")
    private String name;

    @NotNull(message = "Aisle ID is required")
    private Long aisleId;

    // Response-only field
    private String aisleName;

    // Constructor without response-only fields (for requests)
    public IngredientAdminDTO(String name, Long aisleId) {
        this.name = name;
        this.aisleId = aisleId;
    }
}
