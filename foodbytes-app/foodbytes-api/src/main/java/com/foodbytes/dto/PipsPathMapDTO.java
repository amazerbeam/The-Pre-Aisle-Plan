package com.foodbytes.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/** MPP-49: a freshly issued, solver-proven map. rows use S start, . open, # rock. */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class PipsPathMapDTO {
    private Long mapId;
    private String family;
    private int difficulty;
    private String mode;
    private Integer chapter;
    private int width;
    private int height;
    private List<String> rows;
}
