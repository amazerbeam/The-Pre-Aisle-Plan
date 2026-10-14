package com.foodbytes.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/** MPP-22: the next ladder milestone on a streak and how many more counted days reach it. */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class NextMilestoneDTO {
    private int milestone;
    private int inDays;
}
