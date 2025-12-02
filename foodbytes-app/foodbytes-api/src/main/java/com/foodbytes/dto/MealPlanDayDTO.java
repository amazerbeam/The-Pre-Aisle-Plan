package com.foodbytes.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;

/**
 * DTO for a single day in the meal plan (FR-016).
 * Contains all entries grouped by meal type.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class MealPlanDayDTO {
    private LocalDate date;
    private String dayOfWeek;         // "Mon", "Tue", "Wed", etc.
    private Boolean isToday;          // Highlight current day in calendar
    private Map<String, List<MealPlanEntryDTO>> mealsByType; // Grouped by breakfast, lunch, dinner, snacks
    private Integer totalCalories;    // FR-017: Sum of per-serving calories for this day
}
