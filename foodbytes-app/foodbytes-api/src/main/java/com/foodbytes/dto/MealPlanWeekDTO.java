package com.foodbytes.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.time.LocalDate;
import java.util.List;

/**
 * DTO for the full 7-day meal plan response (FR-007, FR-016, FR-082).
 * Contains the start/end dates, all 7 days, and weekly macro summary.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class MealPlanWeekDTO {
    private LocalDate startDate;      // FR-007: "From" date
    private LocalDate endDate;        // FR-007: Calculated as startDate + 6 days
    private List<MealPlanDayDTO> days; // Always 7 days, even if empty
    private Integer weekTotalCalories; // FR-017: Sum of all daily totals

    // FR-082: Weekly macro totals
    private Integer weekTotalProtein;   // Total protein in grams for the week
    private Integer weekTotalCarbs;     // Total carbs in grams for the week
    private Integer weekTotalFat;       // Total fat in grams for the week

    // FR-082: Daily averages (based on days with meals only)
    private Integer avgDailyCalories;   // Average daily calories
    private Integer avgDailyProtein;    // Average daily protein in grams
    private Integer avgDailyCarbs;      // Average daily carbs in grams
    private Integer avgDailyFat;        // Average daily fat in grams
    private Integer daysWithMeals;      // Number of days that have at least one meal
}
