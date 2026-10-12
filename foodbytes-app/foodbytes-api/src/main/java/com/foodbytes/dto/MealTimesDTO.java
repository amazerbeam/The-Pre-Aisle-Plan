package com.foodbytes.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * MPP-13: the user's EFFECTIVE meal times — defaults already applied — as
 * "HH:mm". custom is true once the user has saved their own times; it drives the
 * "Reset to defaults" button and the subdued default styling. Built only by
 * MealTimesPolicy.effective, so the frontend never needs its own copy of the
 * defaults.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class MealTimesDTO {
    private String breakfastBy;
    private String lunchBy;
    private String dinnerBy;
    private boolean custom;
}
