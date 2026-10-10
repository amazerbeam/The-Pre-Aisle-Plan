package com.foodbytes.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

/** MPP-10: one planned meal (or template entry) and its extras in the Manage extras popup. */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ManageExtrasMealDTO {
    private Long targetId;          // meal_plan_entries.id or meal_plan_template_entries.id
    private LocalDate planDate;     // WEEK only
    private Integer dayOffset;      // 0..6, both scopes
    private String mealType;        // meals.key
    private Long recipeId;
    private String recipeName;
    private String variantLabel;    // null when the recipe is not in a family
    private BigDecimal servings;
    private Integer defaultServings;

    @Builder.Default
    private List<ManageExtraDTO> extras = new ArrayList<>(); // flattened tree, display order, depth-first
}
