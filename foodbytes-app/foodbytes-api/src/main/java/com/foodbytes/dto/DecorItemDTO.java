package com.foodbytes.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/** MPP-27: one catalogue entry as the caller sees it. kind = the RoomSpot key it belongs to. */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class DecorItemDTO {
    private String id;      // "herb-shelf"
    private String kind;    // "overWardrobe" ... "frontOfRoom" | "wallStyle" | "floorStyle"
    private int price;      // sprinkles; 0 for the free default styles
    private boolean owned;  // the defaults are always owned
}
