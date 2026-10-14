package com.foodbytes.dto;

import com.foodbytes.model.WardrobeSlot;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/** MPP-32: one catalogue item for the caller. Locked items are listed too (owned = false). */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class WardrobeItemDTO {
    private String id;            // WardrobeCatalogue id, e.g. "wellies"
    private WardrobeSlot slot;
    private boolean owned;        // unlocked, ever (never revoked)
    private boolean unseen;       // owned and its slot not opened yet - drives the badge and NEW tag
}
