package com.foodbytes.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/** MPP-49: the slot POST /maps would issue next; difficulty is null for REFRESHER / ENDLESS (rolled at issue). */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class PipsPathSlotDTO {
    private String family;
    private Integer difficulty;
    private String mode;
    private Integer chapter;
}
