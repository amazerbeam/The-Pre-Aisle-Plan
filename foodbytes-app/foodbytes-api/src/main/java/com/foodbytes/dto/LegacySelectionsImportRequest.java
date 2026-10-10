package com.foodbytes.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.Map;

/** MPP-10: a browser's legacy localStorage selections, { parentRecipeId: { extraRecipeId: isHomemade } }. */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class LegacySelectionsImportRequest {
    @NotNull(message = "selections is required")
    @Size(max = 500, message = "selections may hold at most 500 recipes")
    private Map<Long, Map<Long, Boolean>> selections;
}
