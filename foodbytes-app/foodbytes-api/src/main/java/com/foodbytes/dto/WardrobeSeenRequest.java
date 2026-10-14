package com.foodbytes.dto;

import com.foodbytes.model.WardrobeSlot;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

/** MPP-32: POST /api/pet/wardrobe/seen - the slot whose tab was opened. */
@Data
public class WardrobeSeenRequest {
    @NotNull(message = "slot is required")
    private WardrobeSlot slot;
}
