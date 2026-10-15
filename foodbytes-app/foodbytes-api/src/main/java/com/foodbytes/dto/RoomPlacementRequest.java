package com.foodbytes.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

/** MPP-27: PUT /api/pet/room/placements - put itemId on spot, or clear the spot when itemId is null. */
@Data
public class RoomPlacementRequest {
    @NotBlank(message = "spot is required")
    private String spot;     // "overWardrobe" ... "frontOfRoom" | "wallStyle" | "floorStyle"

    private String itemId;   // null or blank empties the spot (a finish resets to its default)
}
