package com.foodbytes.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * MPP-14: the plan's pet. Always describes the meal-plan OWNER's pet, so two
 * linked users see the same name and the owner's meal times (AC 8).
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class PetDTO {
    private String name;              // effective name, never null ("Pip" by default)
    private boolean customName;       // true when the owner has saved a name
    private MealTimesDTO mealTimes;   // the OWNER's effective meal times (MPP-13 shape)
}
