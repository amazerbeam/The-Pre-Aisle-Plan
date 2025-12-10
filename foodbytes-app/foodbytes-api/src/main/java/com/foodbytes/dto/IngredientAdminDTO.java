package com.foodbytes.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.math.BigDecimal;

/**
 * DTO for admin ingredient management (CRUD operations).
 * FR-080: Includes macro fields
 * FR-083: Includes macrosVerified flag
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

    // FR-080: Macronutrient data per 100g
    private BigDecimal proteinPer100g;
    private BigDecimal carbsPer100g;
    private BigDecimal fatPer100g;

    // FR-083: Verification flag - must be TRUE for recipe to go live
    private Boolean macrosVerified = false;

    // Constructor without response-only fields (for requests)
    public IngredientAdminDTO(String name, Long aisleId) {
        this.name = name;
        this.aisleId = aisleId;
    }
}
