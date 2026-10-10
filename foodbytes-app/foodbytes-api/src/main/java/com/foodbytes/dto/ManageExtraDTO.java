package com.foodbytes.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;

/** MPP-10: one extra row in the Manage extras popup. */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ManageExtraDTO {
    private Long extraRecipeId;
    private String extraName;
    private Integer depth;                  // 0 = direct extra
    private Long parentExtraRecipeId;       // null at depth 0
    private Boolean homemade;               // stored choice, true when none stored
    private BigDecimal usedGrams;           // scaled to servings, 0 dp HALF_UP; null if no link row
    private Long storeBoughtIngredientId;   // null when no product
    private String storeBoughtIngredientName;
}
