package com.foodbytes.service.game;

import com.foodbytes.model.GameMode;

import java.util.List;
import java.util.Map;
import java.util.random.RandomGenerator;

/**
 * MPP-49: the chapter cadence. Chapter n = difficulty 1-10 of family n in order, then one refresher
 * (difficulty REFRESHER_MIN-REFRESHER_MAX) of each earlier family; after the last shipped chapter,
 * endless = a random family and difficulty. `ordered` comes from PuzzleFamilyRegistry.
 */
public final class PipsPathSequencer {

    public static final int CHAPTER_LEVELS = 10; // levels per chapter, and the one source of the 1-10 difficulty range
    public static final int REFRESHER_MIN = 8;
    public static final int REFRESHER_MAX = 10;

    private PipsPathSequencer() {
    }

    public static Slot next(List<PuzzleFamily> ordered, Map<String, FamilyProgress> progress, RandomGenerator rng) {
        int open = openChapterIndex(ordered, progress);
        if (open < 0) {
            PuzzleFamily family = ordered.get(rng.nextInt(ordered.size()));
            return new Slot(family.id(), rng.nextInt(1, CHAPTER_LEVELS + 1), GameMode.ENDLESS, null);
        }
        PuzzleFamily family = ordered.get(open);
        FamilyProgress own = of(progress, family);
        if (own.highestCleared() < CHAPTER_LEVELS) {
            return new Slot(family.id(), own.highestCleared() + 1, GameMode.CHAPTER, family.chapter());
        }
        for (int k = 0; k < open; k++) {
            PuzzleFamily earlier = ordered.get(k);
            if (of(progress, earlier).refresherThrough() < family.chapter()) {
                return new Slot(earlier.id(), rng.nextInt(REFRESHER_MIN, REFRESHER_MAX + 1), GameMode.REFRESHER, family.chapter());
            }
        }
        throw new IllegalStateException("Open chapter " + family.chapter() + " has nothing left to play");
    }

    /** The chapter in play, or the last shipped chapter + 1 in endless mode. */
    public static int currentChapter(List<PuzzleFamily> ordered, Map<String, FamilyProgress> progress) {
        int open = openChapterIndex(ordered, progress);
        return open < 0 ? ordered.get(ordered.size() - 1).chapter() + 1 : ordered.get(open).chapter();
    }

    public static boolean isEndless(List<PuzzleFamily> ordered, Map<String, FamilyProgress> progress) {
        return openChapterIndex(ordered, progress) < 0;
    }

    /** A replay is allowed for a reached chapter, up to one past the highest cleared difficulty. */
    public static boolean isUnlocked(PuzzleFamily family, int difficulty, List<PuzzleFamily> ordered,
                                     Map<String, FamilyProgress> progress) {
        if (difficulty < 1 || difficulty > CHAPTER_LEVELS) return false;
        int open = openChapterIndex(ordered, progress);
        int index = ordered.indexOf(family);
        if (index < 0 || (open >= 0 && index > open)) return false;
        return difficulty <= of(progress, family).highestCleared() + 1;
    }

    /** Index of the first chapter not yet complete (levels or refreshers), or -1 when all are. */
    private static int openChapterIndex(List<PuzzleFamily> ordered, Map<String, FamilyProgress> progress) {
        for (int c = 0; c < ordered.size(); c++) {
            PuzzleFamily family = ordered.get(c);
            if (of(progress, family).highestCleared() < CHAPTER_LEVELS) return c;
            for (int k = 0; k < c; k++) {
                if (of(progress, ordered.get(k)).refresherThrough() < family.chapter()) return c;
            }
        }
        return -1;
    }

    private static FamilyProgress of(Map<String, FamilyProgress> progress, PuzzleFamily family) {
        return progress.getOrDefault(family.id(), FamilyProgress.NONE);
    }
}
