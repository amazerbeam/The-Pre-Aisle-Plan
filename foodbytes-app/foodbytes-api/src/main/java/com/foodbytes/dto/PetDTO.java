package com.foodbytes.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * MPP-14 / MPP-33: the caller's own pet. Each person has their own name and meal times, even when
 * they share a meal plan with someone else. MPP-31: growth. MPP-32: wardrobe. MPP-25: sprinkles. MPP-26: room.
 * MPP-28: habits and awards, so /pet is the room's one pet read.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class PetDTO {
    private String name;              // effective name, never null ("Pip" by default)
    private boolean customName;       // true when the caller has saved a name
    private MealTimesDTO mealTimes;   // the caller's effective meal times (MPP-13 shape)
    private PetGrowthDTO growth;      // MPP-31: the caller's own Pip growth, never null
    private WardrobeDTO wardrobe;     // MPP-32: the caller's own wardrobe, never null
    private long sprinkles;           // MPP-25: the caller's own balance, 0 before any earning
    private PetRoomDTO room;          // MPP-26: the caller's own room (station levels + upgrade costs), never null
    private List<HabitStatusDTO> habits; // MPP-28: the caller's own SNACK + ALCOHOL statuses (= GET /pet/habits), never null
    private PetAwardsDTO awards;         // MPP-28: the caller's own cabinet (= GET /pet/awards), never null
}
