package com.foodbytes.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDate;

/**
 * MPP-35: the one-time answer to "When did you last have a snack / a drink?". lastDate is the last
 * lapse day: null = "Can't remember", today = "Today", otherwise today-30..today. The window is
 * checked in HabitStreakPolicy#requireFirstAnswerInWindow, which knows today.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class HabitFirstAnswerRequest {

    private LocalDate lastDate;
}
