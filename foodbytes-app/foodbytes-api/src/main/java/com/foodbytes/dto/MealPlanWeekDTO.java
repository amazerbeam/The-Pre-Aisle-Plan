package com.foodbytes.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.time.LocalDate;
import java.util.List;

/**
 * DTO for the full 7-day meal plan response (FR-007, FR-016).
 * Contains the start/end dates and all 7 days.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class MealPlanWeekDTO {
    private LocalDate startDate;      // FR-007: "From" date
    private LocalDate endDate;        // FR-007: Calculated as startDate + 6 days
    private List<MealPlanDayDTO> days; // Always 7 days, even if empty
    private Integer weekTotalCalories; // FR-017: Sum of all daily totals
}
