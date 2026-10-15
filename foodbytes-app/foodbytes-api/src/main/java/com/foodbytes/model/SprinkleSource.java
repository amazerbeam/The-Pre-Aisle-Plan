package com.foodbytes.model;

/**
 * MPP-25: what paid a sprinkles ledger row. Stored as the name in pet_sprinkles.source_type
 * (chk_pet_sprinkles_source). Never a variety reward (MPP-11): none depends on which food was chosen.
 */
public enum SprinkleSource {
    MEAL_EATEN,      // source_id = meal_plan_entries.id
    MEAL_ON_TIME,    // source_id = meal_plan_entries.id
    FULL_WEEK,       // source_id = the week's Monday as LocalDate#toEpochDay
    HOMEMADE_EXTRA,  // source_id = meal_plan_entries.id
    STATION_UPGRADE, // MPP-26: a spend (negative amount), source_id = StationPolicy.sourceId
    DECOR_PURCHASE,  // MPP-27: a spend (negative amount), source_id = pet_decor_owned.id
    SHOPPING_LIST_GENERATED, // MPP-42: source_id = the week's Monday as LocalDate#toEpochDay, paid to every plan member
    SHOPPING_LIST_COMPLETED  // MPP-42: same key; the list had >= 1 item and every item checked
}
