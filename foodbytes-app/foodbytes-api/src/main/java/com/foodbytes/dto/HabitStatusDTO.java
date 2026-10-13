package com.foodbytes.dto;

import com.foodbytes.model.Habit;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDate;

/** MPP-20: one habit's check-in state for the caller. Built only by HabitStreakPolicy#toDTO. */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class HabitStatusDTO {
    private Habit habit;                // SNACK | ALCOHOL
    private int current;                // clean days in the running streak, through lastAnsweredDate
    private int best;                   // best-ever streak, never lowered
    private LocalDate lastAnsweredDate; // null until the first answer
    private boolean askToday;           // true when today hasn't been answered yet
    private LocalDate coversFrom;       // first day the next answer covers: lastAnsweredDate + 1, or today
}
