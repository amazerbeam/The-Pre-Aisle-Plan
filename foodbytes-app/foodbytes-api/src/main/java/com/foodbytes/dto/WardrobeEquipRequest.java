package com.foodbytes.dto;

import com.foodbytes.model.WardrobeSlot;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

/** MPP-32: PUT /api/pet/wardrobe/outfit - put itemId in slot, or empty the slot when itemId is null. */
@Data
public class WardrobeEquipRequest {
    @NotNull(message = "slot is required")
    private WardrobeSlot slot;

    private String itemId;
}
