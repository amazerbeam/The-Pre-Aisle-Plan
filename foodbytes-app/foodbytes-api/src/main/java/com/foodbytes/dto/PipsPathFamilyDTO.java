package com.foodbytes.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/** MPP-49: one family's chapter number and the caller's progress in it. */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class PipsPathFamilyDTO {
    private String id;
    private int chapter;
    private int highestCleared;
    private int refresherThrough;
}
