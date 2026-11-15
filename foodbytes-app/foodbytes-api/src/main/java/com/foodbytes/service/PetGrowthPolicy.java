package com.foodbytes.service;

import com.foodbytes.dto.PetGrowthDTO;
import com.foodbytes.dto.PetLineGrowthDTO;

import java.time.LocalDate;
import java.util.LinkedHashMap;
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
 * with the total floored at 0. Each line (herb, dragon, robot) picks its form from the peak total, so
 * no line de-evolves; the bar shows the current total and can drain. Once Basilisk's 90 has been
 * reached (users.pet_fully_grown_at) the peak is floored there.
 */
public final class PetGrowthPolicy {

    public static final int POINTS_PERFECT_DAY = 3;
    public static final int POINTS_SLIP_DAY = -3;

    public static final int FORM_BASIL_SEED = 1;
    public static final int FORM_SEEDLING = 2;
    public static final int FORM_SPRIG = 3;
    public static final int FORM_BUSHLING = 4;
    public static final int FORM_BASILISK = 5;

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

    /** True once the running total has ever reached Basilisk's threshold in this history. */
    public static boolean reachedBasilisk(Replay replay) {
        return replay.peak() >= FORM_THRESHOLDS.get(FORM_BASILISK - 1);
    }

    /** One Pip skin per theme. Thresholds: index = form - 1. Append a threshold to add a stronger form. */
    public enum Line {
        HERB("herb", List.of(0, 15, 36, 60, 90)),
        DRAGON("dragon", List.of(0, 15, 36)),
        ROBOT("robot", List.of(0, 15, 36));

        private final String key;
        private final List<Integer> thresholds;

        Line(String key, List<Integer> thresholds) {
            this.key = key;
            this.thresholds = thresholds;
        }

        public String key() {
            return key;
        }

        public List<Integer> thresholds() {
            return thresholds;
        }

        public int lastForm() {
            return thresholds.size();
        }
    }

    /** The herb line's thresholds (WardrobeCatalogue's FORM_* unlocks are herb forms). */
    public static final List<Integer> FORM_THRESHOLDS = Line.HERB.thresholds();

    public static int formFor(Line line, int points) {
        List<Integer> thresholds = line.thresholds();
        int form = 1;
        for (int i = 1; i < thresholds.size(); i++) {
            if (points >= thresholds.get(i)) {
                form = i + 1;
            }
        }
        return form;
    }

    /** The peak the forms are picked from: the replayed peak, floored at Basilisk's once fully grown. */
    public static int effectivePeak(Replay replay, boolean fullyGrown) {
        int basilisk = FORM_THRESHOLDS.get(FORM_BASILISK - 1);
        return fullyGrown ? Math.max(replay.peak(), basilisk) : replay.peak();
    }

    /** One line's growth: form from the peak (never drops), bar from the current points, clamped at empty. */
    public static PetLineGrowthDTO lineGrowth(Line line, int points, int peak) {
        int form = formFor(line, peak);
        int start = line.thresholds().get(form - 1);
        if (form == line.lastForm()) {
            return new PetLineGrowthDTO(form, form, start, null, null, true);
        }
        int size = line.thresholds().get(form) - start;
        return new PetLineGrowthDTO(form, form, start, Math.max(0, points - start), size, false);
    }

    public static PetGrowthDTO toDTO(Replay replay, boolean fullyGrown) {
        int points = replay.points();
        int peak = effectivePeak(replay, fullyGrown);
        Map<String, PetLineGrowthDTO> lines = new LinkedHashMap<>();
        for (Line line : Line.values()) {
            lines.put(line.key(), lineGrowth(line, points, peak));
        }
        return new PetGrowthDTO(points, replay.lastDayScore(), replay.lastScoredDate(),
                lines.get(Line.HERB.key()).getForm(), lines);
    }
}
