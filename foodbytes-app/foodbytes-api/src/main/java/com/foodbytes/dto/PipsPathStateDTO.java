package com.foodbytes.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/** MPP-49: GET /api/pet/games/pips-path - families, progress, the next slot and today's game earnings. */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class PipsPathStateDTO {
    private List<PipsPathFamilyDTO> families;
    private int currentChapter;
    private boolean endless;
    private PipsPathSlotDTO next;
    private long earnedToday;
    private int dailyCap;
    private int perClear;
}
