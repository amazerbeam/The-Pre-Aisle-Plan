package com.foodbytes.service.game;

import java.util.List;

/** MPP-49: one Pip's Path puzzle family = one chapter. Later chapters add a bean; nothing else changes. */
public interface PuzzleFamily {
    String id();
    int chapter();
    GridMap generate(int difficulty, long seed);
    boolean isValidClear(GridMap map, List<Integer> path);
}
