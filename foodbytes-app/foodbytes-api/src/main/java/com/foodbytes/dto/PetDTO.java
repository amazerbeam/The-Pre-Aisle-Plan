package com.foodbytes.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * MPP-14 / MPP-33: the caller's own pet. Each person has their own name and meal times, even when
 * they share a meal plan with someone else.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class PetDTO {
    private String name;              // effective name, never null ("Pip" by default)
    private boolean customName;       // true when the caller has saved a name
    private MealTimesDTO mealTimes;   // the caller's effective meal times (MPP-13 shape)
}
