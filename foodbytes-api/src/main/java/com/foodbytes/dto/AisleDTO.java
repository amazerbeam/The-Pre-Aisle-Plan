package com.foodbytes.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AisleDTO {
    private Long id;
    private String key;
    private String name;
    private Integer displayOrder;
    private String color;
}
