package com.foodbytes.dto;

import com.foodbytes.service.game.PipsPathSequencer;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/** MPP-49: body of POST /maps; both fields null (or no body) = the sequencer's next slot. */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class PipsPathMapRequest {
    @Size(max = 32)
    private String family;

    @Min(1)
    @Max(PipsPathSequencer.CHAPTER_LEVELS)
    private Integer difficulty;
}
