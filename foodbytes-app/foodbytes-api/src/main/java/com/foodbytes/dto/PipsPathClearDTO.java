package com.foodbytes.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/** MPP-49: result of a clear - what was paid, whether the daily cap bit, and the family's progress. */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class PipsPathClearDTO {
    private boolean alreadyCleared;
    private int paid;
    private boolean capped;
    private long earnedToday;
    private int dailyCap;
    private long balance;
    private PipsPathFamilyDTO progress;
}
