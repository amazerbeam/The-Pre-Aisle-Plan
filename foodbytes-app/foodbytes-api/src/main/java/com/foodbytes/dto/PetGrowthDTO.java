package com.foodbytes.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.Map;

/**
 * MPP-31 / themed Pip lines: the caller's own Pip growth. One points history, one growth result per
 * line (keys "herb", "dragon", "robot"); the client draws the line its theme names. Rules live in
 * PetGrowthPolicy.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class PetGrowthDTO {
    private int points;                          // floored running total, never below 0
    private int lastDayScore;                    // most recent non-zero day score (3 or -3), 0 if none yet
    private LocalDate lastScoredDate;            // date of that day, null if none yet
    private int peakForm;                        // the herb line's form: drives wardrobe FORM unlocks (MPP-32)
    private Map<String, PetLineGrowthDTO> lines; // ordered herb, dragon, robot
}
