package com.foodbytes.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

/**
 * MPP-24: GET /api/pet/awards. streaks is the MPP-22 status per streak type (PLAN, SNACK, ALCOHOL);
 * firsts always lists all four FirstKey values in enum order.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class PetAwardsDTO {
    private List<AwardStatusDTO> streaks;
    private List<FirstStatusDTO> firsts;
}
