package com.foodbytes.dto;

import com.foodbytes.model.FirstKey;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.Instant;

/** MPP-24: one first for the caller. earnedAt is UTC, or null while not yet earned. */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class FirstStatusDTO {
    private FirstKey key;
    private Instant earnedAt;
}
