package com.foodbytes.dto;

import com.foodbytes.model.WardrobeSlot;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;
import java.util.Map;

/**
 * MPP-32: the caller's wardrobe. items = all catalogue items in catalogue order; outfit = worn
 * slots only (JSON keys "HAT" ... "SHOES"), an absent slot is empty.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class WardrobeDTO {
    private List<WardrobeItemDTO> items;
    private Map<WardrobeSlot, String> outfit;
}
