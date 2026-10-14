package com.foodbytes.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;
import java.util.Map;

/** MPP-26: the caller's own room - every station's level (1..4, keyed "bed"...) and the upgrade price list. MPP-27: decor + placements. */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class PetRoomDTO {
    private Map<String, Integer> stations;      // all four keys, level 1 when never upgraded
    private Map<Integer, Integer> upgradeCosts; // {2:300, 3:600, 4:1200}
    private List<DecorItemDTO> decor;          // MPP-27: every catalogue entry, with ownership
    private Map<String, String> placements;    // MPP-27: leftWall/rightWall/floor -> id or null; wallStyle/floorStyle -> id (the default when unset)
}
