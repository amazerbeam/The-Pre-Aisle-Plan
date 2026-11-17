package com.foodbytes.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/** MPP-49: the player's path as cell indices (y * width + x), start included. */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class PipsPathClearRequest {
    /** Longest legal route = the largest board, GridMap.MAX_COLS (6) x 7 rows = 42 cells; 64 leaves headroom. Revisit if the board grows. */
    public static final int MAX_PATH_STEPS = 64;

    @NotNull(message = "path is required")
    @Size(min = 1, max = MAX_PATH_STEPS, message = "path must have 1-64 steps")
    private List<@NotNull Integer> path;
}
