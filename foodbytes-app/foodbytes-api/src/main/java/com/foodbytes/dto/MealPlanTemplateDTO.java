package com.foodbytes.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.time.LocalDateTime;
import java.util.List;

/**
 * Saved meal-plan template summary returned by list and detail endpoints.
 * `entries` is null on list responses, populated on detail.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class MealPlanTemplateDTO {
    private Long id;
    private String name;
    private Integer entryCount;
    private Integer extrasMealCount;   // MPP-10: meals in the template that have extras
    private Integer storeBoughtCount;  // MPP-10: extras set to store-bought across those meals
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private List<MealPlanTemplateEntryDTO> entries;
}
