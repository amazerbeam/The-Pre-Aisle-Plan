package com.foodbytes.service.game;

import static com.foodbytes.service.game.DifficultyBand.UNBOUNDED;

/**
 * MPP-49: Garden Path difficulty 1-10, calibrated against the 10 hand-made mockup levels
 * (GardenPathBandsTest pins every fixture inside its band). Width = columns, never more than 6.
 */
public final class GardenPathBands {

    public static final int MIN_DIFFICULTY = 1;
    public static final int MAX_DIFFICULTY = PipsPathSequencer.CHAPTER_LEVELS;

    private static final DifficultyBand[] BANDS = {
        new DifficultyBand(1, 3, 3, 0, 2, UNBOUNDED),
        new DifficultyBand(2, 4, 3, 0, 4, UNBOUNDED),
        new DifficultyBand(3, 4, 4, 1, 2, UNBOUNDED),
        new DifficultyBand(4, 5, 4, 1, 2, 20),
        new DifficultyBand(5, 5, 5, 2, 2, 12),
        new DifficultyBand(6, 5, 5, 3, 1, 4),
        new DifficultyBand(7, 6, 5, 2, 1, 8),
        new DifficultyBand(8, 6, 6, 3, 1, 3),
        new DifficultyBand(9, 6, 6, 4, 1, 2),
        new DifficultyBand(10, 6, 7, 4, 1, 4),
    };

    private GardenPathBands() {
    }

    public static DifficultyBand of(int difficulty) {
        if (difficulty < MIN_DIFFICULTY || difficulty > MAX_DIFFICULTY) {
            throw new IllegalArgumentException("Difficulty must be " + MIN_DIFFICULTY + "-" + MAX_DIFFICULTY);
        }
        return BANDS[difficulty - 1];
    }
}
