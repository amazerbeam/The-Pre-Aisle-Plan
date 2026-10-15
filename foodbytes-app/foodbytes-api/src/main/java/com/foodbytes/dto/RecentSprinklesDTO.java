package com.foodbytes.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/** MPP-42: GET /api/pet/sprinkles/recent - the caller's own last 14 days, newest first, plus what each way of earning pays. */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class RecentSprinklesDTO {
    private List<SprinkleEntryDTO> entries;
    private SprinkleRatesDTO rates;
}
