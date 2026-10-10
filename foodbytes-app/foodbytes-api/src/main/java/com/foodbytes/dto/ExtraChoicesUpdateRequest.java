package com.foodbytes.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

/** MPP-10: one or more choices saved in a single transaction (a tap, or All homemade / All store-bought). */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ExtraChoicesUpdateRequest {
    @NotEmpty(message = "choices is required")
    @Size(max = 300, message = "At most 300 choices per request")
    private List<@Valid ExtraChoiceItemDTO> choices;
}
