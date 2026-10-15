package com.foodbytes.dto;

import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.time.LocalDate;

/**
 * MPP-42: one ledger row with the context to describe it. The client groups and words it; every
 * context field is null when it doesn't apply or what it pointed at no longer exists.
 */
@Data
@NoArgsConstructor
public class SprinkleEntryDTO {
    private String sourceType;   // SprinkleSource name
    private int amount;          // + earning, - spend
    private Instant createdAt;   // UTC
    private Long entryId;        // MEAL_EATEN / MEAL_ON_TIME / HOMEMADE_EXTRA: meal_plan_entries.id (kept when the entry is gone)
    private String mealKey;      // those three: "breakfast" | "lunch" | "dinner"
    private LocalDate planDate;  // those three
    private String station;      // STATION_UPGRADE: RoomStation.key()
    private Integer level;       // STATION_UPGRADE: the level bought
    private String decorItem;    // DECOR_PURCHASE: pet_decor_owned.item_key
    private LocalDate weekStart; // FULL_WEEK / SHOPPING_LIST_*: the Monday
}
