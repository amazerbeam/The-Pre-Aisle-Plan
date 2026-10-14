package com.foodbytes.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/** MPP-26: every room write's response - the caller's balance after it and their whole room. */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class RoomWriteDTO {
    private long sprinkles;
    private PetRoomDTO room;
}
