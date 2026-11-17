package com.foodbytes.service.game;

import com.foodbytes.service.PipGameException;

import java.util.Arrays;
import java.util.SplittableRandom;

/**
 * MPP-49: makes a Garden Path map for a difficulty, deterministically per seed. Lays the band's rocks on
 * random cells, then tries the open cells (shuffled) as Pip's start until the solver proves a solution count
 * inside the band. The solver is the proof of solvability: every band needs at least one solution.
 * Cheap speed-ups: a checkerboard parity filter skips layouts/starts that cannot have a route, and a layout with
 * no in-band start has one rock nudged to a neighbouring tile (up to MAX_PERTURBATIONS times) before a fresh
 * layout is rolled. Each layout tried counts toward MAX_ATTEMPTS.
 *
 * <p>Why not "walk a random solution, rocks = the cells off the walk": calibration showed those leftover
 * layouts almost never reach the hard bands (0 of 2 000 at difficulty 7-10, best count 9 against a ceiling
 * of 8), because the walk leaves rocks inside the board where they barely constrain the path. Uniform random
 * rocks plus a start scan reach every band in milliseconds.
 */
public final class GardenPathGenerator {

    public static final int MAX_ATTEMPTS = 400;
    public static final long NODE_BUDGET = 200_000L;
    /** Cheap budget for scanning candidate starts; a candidate that passes is re-proved with NODE_BUDGET. */
    static final long SCAN_BUDGET = 700L;

    /** Rock moves tried on one layout before a fresh layout is rolled. */
    static final int MAX_PERTURBATIONS = 8;

    private GardenPathGenerator() {
    }

    public static GridMap generate(int difficulty, long seed) {
        DifficultyBand band = GardenPathBands.of(difficulty);
        SplittableRandom rng = new SplittableRandom(seed);
        int cells = band.width() * band.height();
        int attempts = 0;
        while (attempts < MAX_ATTEMPTS) {
            boolean[] open = layRocks(cells, band.rocks(), rng);
            for (int move = 0; move <= MAX_PERTURBATIONS && attempts < MAX_ATTEMPTS; move++) {
                attempts++;
                GridMap found = scanStarts(band, open, cells, rng);
                if (found != null) return found;
                if (!moveOneRock(open, band.width(), band.height(), rng)) break;
            }
        }
        throw new PipGameException(PipGameException.Reason.GENERATION_FAILED,
                "Pip couldn't lay out a puzzle just now. Try again.");
    }

    /** Tries each open cell that passes the parity rule as the start; null when none lands in the band. */
    private static GridMap scanStarts(DifficultyBand band, boolean[] open, int cells, SplittableRandom rng) {
        if (!parityPossible(band.width(), open)) return null;
        for (int start : shuffledOpen(open, rng)) {
            if (!parityAllowsStart(band.width(), open, start)) continue;
            GridMap map = new GridMap(band.width(), band.height(), open.clone(), start, cells - band.rocks());
            if (inBand(band, map, SCAN_BUDGET) && inBand(band, map, NODE_BUDGET)) return map;
        }
        return null;
    }

    /**
     * Checkerboard rule: a route alternates colours (cell is dark when x + y is even), so open dark and light
     * counts may differ by at most 1, and when they differ the start must sit on the larger colour.
     */
    static boolean parityAllowsStart(int width, boolean[] open, int start) {
        if (start < 0 || start >= open.length || !open[start]) return false;
        int diff = darkMinusLight(width, open);
        if (Math.abs(diff) > 1) return false;
        boolean startDark = isDark(start, width);
        return diff == 0 || (diff > 0) == startDark;
    }

    private static boolean parityPossible(int width, boolean[] open) {
        return Math.abs(darkMinusLight(width, open)) <= 1;
    }

    private static int darkMinusLight(int width, boolean[] open) {
        int diff = 0;
        for (int i = 0; i < open.length; i++) if (open[i]) diff += isDark(i, width) ? 1 : -1;
        return diff;
    }

    private static boolean isDark(int cell, int width) {
        return (cell % width + cell / width) % 2 == 0;
    }

    /** Moves one random rock onto a random open orthogonal neighbour (rock count unchanged); false if none can. */
    private static boolean moveOneRock(boolean[] open, int width, int height, SplittableRandom rng) {
        int[] rocks = new int[open.length];
        int n = 0;
        for (int i = 0; i < open.length; i++) if (!open[i]) rocks[n++] = i;
        if (n == 0) return false;
        int rock = rocks[rng.nextInt(n)];
        int x = rock % width, y = rock / width;
        int[] targets = new int[4];
        int t = 0;
        if (y > 0 && open[rock - width]) targets[t++] = rock - width;
        if (y < height - 1 && open[rock + width]) targets[t++] = rock + width;
        if (x > 0 && open[rock - 1]) targets[t++] = rock - 1;
        if (x < width - 1 && open[rock + 1]) targets[t++] = rock + 1;
        if (t == 0) return false;
        open[rock] = true;
        open[targets[rng.nextInt(t)]] = false;
        return true;
    }

    private static boolean inBand(DifficultyBand band, GridMap map, long nodeBudget) {
        SolveResult proof = GardenPathSolver.countSolutions(map, band.countLimit(), nodeBudget);
        return !proof.budgetExceeded() && band.accepts(proof.count());
    }

    private static boolean[] layRocks(int cells, int rocks, SplittableRandom rng) {
        boolean[] open = new boolean[cells];
        Arrays.fill(open, true);
        int placed = 0;
        while (placed < rocks) {
            int cell = rng.nextInt(cells);
            if (open[cell]) {
                open[cell] = false;
                placed++;
            }
        }
        return open;
    }

    private static int[] shuffledOpen(boolean[] open, SplittableRandom rng) {
        int[] cells = new int[open.length];
        int n = 0;
        for (int i = 0; i < open.length; i++) if (open[i]) cells[n++] = i;
        for (int i = n - 1; i > 0; i--) {
            int j = rng.nextInt(i + 1);
            int t = cells[i];
            cells[i] = cells[j];
            cells[j] = t;
        }
        return Arrays.copyOf(cells, n);
    }
}
