package com.foodbytes.model;

/**
 * MPP-32: Pip's seven clothing slots, in the Dress Pip tab order. Stored by name in
 * pet_outfit_slots.slot (chk_pet_outfit_slots_slot) and serialised the same way; adding a slot
 * needs a migration that widens that CHECK.
 */
public enum WardrobeSlot {
    HAT, GLASSES, SCARF, JACKET, BELT, PANTS, SHOES
}
