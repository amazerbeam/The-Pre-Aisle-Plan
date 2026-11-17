package com.foodbytes.service.game;

import org.springframework.stereotype.Component;

import java.util.List;

/** MPP-49: Chapter 1, Garden Path - visit every open tile exactly once. */
@Component
public class GardenPathFamily implements PuzzleFamily {

    public static final String ID = "garden-path";
    public static final int CHAPTER = 1;

    @Override public String id() { return ID; }
    @Override public int chapter() { return CHAPTER; }

    @Override
    public GridMap generate(int difficulty, long seed) {
        return GardenPathGenerator.generate(difficulty, seed);
    }

    @Override
    public boolean isValidClear(GridMap map, List<Integer> path) {
        return GardenPathSolver.isValidClear(map, path);
    }
}
