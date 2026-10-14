package com.foodbytes.service;

import com.foodbytes.dto.PetGrowthDTO;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.SortedMap;

/**
 * MPP-31: the single owner of Pip's growth rules (the PlanStreakPolicy / HabitStreakPolicy
 * pattern). Pure and static; PetGrowthService feeds it the caller's logs.
 *
 * A finished day scores +3 (every planned breakfast/lunch/dinner ticked by the caller, and both
 * habits answered clean), -3 (any lapse, or a planned main meal left unticked) or 0 (today, a day
 * the check-in hasn't covered yet, or nothing planned and clean). Scores are applied in date order
 * with the total floored at 0, and the total picks the form both ways (strict de-evolve). Basilisk
 * is the exception: once reached it is permanent (users.pet_fully_grown_at).
 */
public final class PetGrowthPolicy {

    public static final int POINTS_PERFECT_DAY = 3;
    public static final int POINTS_SLIP_DAY = -3;

    public static final int FORM_BASIL_SEED = 1;
    public static final int FORM_SEEDLING = 2;
    public static final int FORM_SPRIG = 3;
    public static final int FORM_BUSHLING = 4;
    public static final int FORM_BASILISK = 5;

    /** Index = form - 1: the points at which each form starts. A form's bar size is the gap to the next. */
    public static final List<Integer> FORM_THRESHOLDS = List.of(0, 15, 36, 60, 90);

    /** points = floored total; peak = highest total reached; last* = the most recent non-zero day. */
    public record Replay(int points, int peak, int lastDayScore, LocalDate lastScoredDate) {
        public static final Replay EMPTY = new Replay(0, 0, 0, null);
    }

    private PetGrowthPolicy() {
    }

    /**
     * One day's score. snackClean / alcoholClean: null = not answered for that day, TRUE = clean,
     * FALSE = lapse. A known lapse is final; otherwise nothing is judged until both habits are
     * answered, so an unticked dinner isn't a slip while the check-in is still pending.
     */
    public static int dayScore(int planned, int eatenByCaller, Boolean snackClean, Boolean alcoholClean,
                               boolean isTodayOrLater) {
        if (isTodayOrLater) {
            return 0;
        }
        if (Boolean.FALSE.equals(snackClean) || Boolean.FALSE.equals(alcoholClean)) {
            return POINTS_SLIP_DAY;
        }
        if (snackClean == null || alcoholClean == null || planned == 0) {
            return 0;
        }
        return eatenByCaller >= planned ? POINTS_PERFECT_DAY : POINTS_SLIP_DAY;
    }

    /** Applies the scores in date order, floored at 0. Zero days change nothing. */
    public static Replay replay(SortedMap<LocalDate, Integer> scores) {
        int points = 0;
        int peak = 0;
        int lastDayScore = 0;
        LocalDate lastScoredDate = null;
        for (Map.Entry<LocalDate, Integer> day : scores.entrySet()) {
            int score = day.getValue();
            if (score == 0) {
                continue;
            }
            points = Math.max(0, points + score);
            peak = Math.max(peak, points);
            lastDayScore = score;
            lastScoredDate = day.getKey();
        }
        return lastScoredDate == null ? Replay.EMPTY : new Replay(points, peak, lastDayScore, lastScoredDate);
    }

    public static int formFor(int points) {
        int form = FORM_BASIL_SEED;
        for (int i = 1; i < FORM_THRESHOLDS.size(); i++) {
            if (points >= FORM_THRESHOLDS.get(i)) {
                form = i + 1;
            }
        }
        return form;
    }

    /** True once the running total has ever reached Basilisk's threshold in this history. */
    public static boolean reachedBasilisk(Replay replay) {
        return replay.peak() >= FORM_THRESHOLDS.get(FORM_BASILISK - 1);
    }

    public static PetGrowthDTO toDTO(Replay replay, boolean fullyGrown) {
        int points = replay.points();
        int form = formFor(points);
        if (fullyGrown || form == FORM_BASILISK) {
            return new PetGrowthDTO(points, FORM_BASILISK, null, null, true,
                    replay.lastDayScore(), replay.lastScoredDate(), FORM_BASILISK);
        }
        int threshold = FORM_THRESHOLDS.get(form - 1);
        int peakForm = Math.max(formFor(replay.peak()), form); // MPP-32
        return new PetGrowthDTO(points, form, points - threshold, FORM_THRESHOLDS.get(form) - threshold, false,
                replay.lastDayScore(), replay.lastScoredDate(), peakForm);
    }
}
