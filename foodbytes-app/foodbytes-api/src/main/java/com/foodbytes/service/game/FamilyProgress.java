package com.foodbytes.service.game;

/** MPP-49: one person's progress in one family (pet_game_progress, or NONE when there is no row). */
public record FamilyProgress(int highestCleared, int refresherThrough) {
    public static final FamilyProgress NONE = new FamilyProgress(0, 0);
}
