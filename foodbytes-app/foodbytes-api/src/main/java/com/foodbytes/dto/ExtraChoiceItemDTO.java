package com.foodbytes.dto;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/** MPP-10: one homemade/store-bought choice. targetId = meal_plan_entries.id (week) or meal_plan_template_entries.id (template). */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ExtraChoiceItemDTO {
    @NotNull private Long targetId;
    @NotNull private Long extraRecipeId;
    @NotNull private Boolean homemade;
}
