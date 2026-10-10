package com.foodbytes.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

/**
 * Request DTO for generating a new shopping list.
 * MPP-10: homemade/store-bought choices are read from the database; a `selections` property
 * sent by an older client is ignored.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GenerateShoppingListRequest {
    private LocalDate startDate;
    private LocalDate endDate;
}
