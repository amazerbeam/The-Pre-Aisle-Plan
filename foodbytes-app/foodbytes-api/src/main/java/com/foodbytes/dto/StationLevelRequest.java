package com.foodbytes.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/** MPP-40: PUT /api/pet/stations/{station}/level (free mode only) - the level to set, 1..4. */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class StationLevelRequest {
    @NotNull(message = "level is required")
    @Min(value = 1, message = "level must be 1 to 4")
    @Max(value = 4, message = "level must be 1 to 4")
    private Integer level;
}
