package com.foodbytes.service.game;

/** MPP-49: what one difficulty means - board size, rock count, allowed solution count. */
public record DifficultyBand(int difficulty, int width, int height, int rocks, int minSolutions, int maxSolutions) {

    public static final int UNBOUNDED = Integer.MAX_VALUE;

    /** How far the solver needs to count to decide accepts(). */
    public long countLimit() {
        return maxSolutions == UNBOUNDED ? minSolutions : maxSolutions + 1L;
    }

    public boolean accepts(long count) {
        return count >= minSolutions && (maxSolutions == UNBOUNDED || count <= maxSolutions);
    }
}
