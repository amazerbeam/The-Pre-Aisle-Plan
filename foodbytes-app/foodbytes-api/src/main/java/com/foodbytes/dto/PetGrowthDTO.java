package com.foodbytes.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

/**
 * MPP-31: the caller's own Pip growth (AC 4). Rules live in PetGrowthPolicy. barCurrent and
 * barSize are null at Basilisk, which has no bar.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class PetGrowthDTO {
    private int points;               // floored running total, never below 0
    private int form;                 // 1 Basil seed … 5 Basilisk; 5 whenever fullyGrown
    private Integer barCurrent;       // points - threshold(form); null at Basilisk
    private Integer barSize;          // threshold(form + 1) - threshold(form); null at Basilisk
    private boolean fullyGrown;       // Basilisk reached, permanently
    private int lastDayScore;         // most recent non-zero day score (3 or -3), 0 if none yet
    private LocalDate lastScoredDate; // date of that day, null if none yet
    private int peakForm;             // MPP-32: highest form in the replayed history; 5 when fullyGrown
}
