package com.foodbytes.dto;

import com.foodbytes.model.StreakType;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.Map;

/**
 * MPP-22: one streak type's trophy-cabinet status for the caller. counts lists every ladder
 * milestone in ladder order, zeros included (JSON keys "1", "3", … "30").
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class AwardStatusDTO {
    private StreakType streakType;
    private int current;
    private int best;
    private Map<Integer, Integer> counts;
    private NextMilestoneDTO next;
}
