package com.foodbytes.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RecipeIngredientDTO {
    private Long id;
    private Long ingredientId;
    private String ingredientName;
    private String ingredientKey;
    private BigDecimal quantity;
    private Long unitId;
    private String unitValue;
    private String unitKey;
    private Integer displayOrder;
    private Long aisleId;
    private String aisleName;
    private String aisleColor;
}
