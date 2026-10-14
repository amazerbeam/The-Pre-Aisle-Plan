package com.foodbytes.service;

import com.foodbytes.dto.PetGrowthDTO;
import com.foodbytes.service.PetGrowthPolicy.Replay;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvSource;

import java.time.LocalDate;
import java.util.SortedMap;
import java.util.TreeMap;

import static org.assertj.core.api.Assertions.assertThat;

/** MPP-31 AC 1–4: day scores, the floored running total, thresholds both ways and the bar. */
class PetGrowthPolicyTest {

    private static final LocalDate START = LocalDate.of(2026, 10, 1);

    /** Scores applied to consecutive days from START. */
    private static SortedMap<LocalDate, Integer> days(int... scores) {
        SortedMap<LocalDate, Integer> map = new TreeMap<>();
        for (int i = 0; i < scores.length; i++) {
            map.put(START.plusDays(i), scores[i]);
        }
        return map;
    }

    private static int[] repeat(int score, int times) {
        int[] out = new int[times];
        java.util.Arrays.fill(out, score);
        return out;
    }

    // ---- AC 1: day score ----

    @Test
    void perfectDay_allTickedAndBothClean_isPlusThree() {
        assertThat(PetGrowthPolicy.dayScore(3, 3, true, true, false)).isEqualTo(3);
    }

    @Test
    void anyLapse_isMinusThree_evenWithEveryMealTickedOrTheOtherHabitUnanswered() {
        assertThat(PetGrowthPolicy.dayScore(3, 3, false, true, false)).isEqualTo(-3);
        assertThat(PetGrowthPolicy.dayScore(3, 3, true, false, false)).isEqualTo(-3);
        assertThat(PetGrowthPolicy.dayScore(3, 3, false, null, false)).isEqualTo(-3);
    }

    @Test
    void slipsDoNotStack_snackAlcoholAndUntickedMeal_isStillMinusThree() {
        assertThat(PetGrowthPolicy.dayScore(3, 0, false, false, false)).isEqualTo(-3);
    }

    @Test
    void untickedPlannedMeal_withCleanCheckIn_isMinusThree() {
        assertThat(PetGrowthPolicy.dayScore(3, 2, true, true, false)).isEqualTo(-3);
    }

    @Test
    void unscoredDays_today_unansweredCheckIn_nothingPlannedAndClean_areZero() {
        assertThat(PetGrowthPolicy.dayScore(3, 3, true, true, true)).isZero();     // today
        assertThat(PetGrowthPolicy.dayScore(3, 0, null, true, false)).isZero();    // snack unanswered
        assertThat(PetGrowthPolicy.dayScore(3, 0, true, null, false)).isZero();    // alcohol unanswered
        assertThat(PetGrowthPolicy.dayScore(0, 0, true, true, false)).isZero();    // nothing planned, clean
    }

    @Test
    void nothingPlanned_withASnackOrAlcohol_isMinusThree() {
        assertThat(PetGrowthPolicy.dayScore(0, 0, false, true, false)).isEqualTo(-3);
    }

    // ---- AC 2: thresholds ----

    @ParameterizedTest
    @CsvSource({"0,1", "14,1", "15,2", "35,2", "36,3", "59,3", "60,4", "89,4", "90,5", "120,5"})
    void formFor_eachThresholdBoundary(int points, int form) {
        assertThat(PetGrowthPolicy.formFor(points)).isEqualTo(form);
    }

    // ---- AC 2 / AC 3: floored replay, both directions ----

    @Test
    void floorAtZero_slipsOnAnEmptyBarAreNotBanked() {
        Replay replay = PetGrowthPolicy.replay(days(-3, -3, 3));
        assertThat(replay.points()).isEqualTo(3);
    }

    @Test
    void zeroDaysAreSkipped_andLastDayScoreIsTheLatestNonZeroDay() {
        Replay replay = PetGrowthPolicy.replay(days(3, -3, 0, 0));
        assertThat(replay.lastDayScore()).isEqualTo(-3);
        assertThat(replay.lastScoredDate()).isEqualTo(START.plusDays(1));
    }

    @Test
    void emptyHistory_isTheEmptyReplay() {
        assertThat(PetGrowthPolicy.replay(new TreeMap<>())).isEqualTo(Replay.EMPTY);
    }

    @Test
    void slipRightAfterEvolving_deEvolves() {
        Replay evolved = PetGrowthPolicy.replay(days(repeat(3, 5)));               // 15 points
        assertThat(PetGrowthPolicy.toDTO(evolved, false).getForm()).isEqualTo(2);

        int[] thenSlip = java.util.Arrays.copyOf(repeat(3, 5), 6);
        thenSlip[5] = -3;                                                         // 12 points
        assertThat(PetGrowthPolicy.toDTO(PetGrowthPolicy.replay(days(thenSlip)), false).getForm()).isEqualTo(1);
    }

    // ---- MPP-32: peakForm, the highest form reached (evolution unlocks, lineup silhouettes) ----

    @Test
    void peakForm_staysAtTheHighestFormAfterADeEvolve() {
        int[] thenSlip = java.util.Arrays.copyOf(repeat(3, 5), 6);
        thenSlip[5] = -3;                                                         // 15 -> 12 points
        PetGrowthDTO dto = PetGrowthPolicy.toDTO(PetGrowthPolicy.replay(days(thenSlip)), false);
        assertThat(dto.getForm()).isEqualTo(1);
        assertThat(dto.getPeakForm()).isEqualTo(2);
    }

    @Test
    void peakForm_equalsTheFormWhenNeverHigher() {
        PetGrowthDTO dto = PetGrowthPolicy.toDTO(PetGrowthPolicy.replay(days(repeat(3, 12))), false); // 36
        assertThat(dto.getForm()).isEqualTo(3);
        assertThat(dto.getPeakForm()).isEqualTo(3);
    }

    @Test
    void peakForm_isBasiliskWhenFullyGrown_whateverThePoints() {
        PetGrowthDTO dto = PetGrowthPolicy.toDTO(PetGrowthPolicy.replay(days(repeat(3, 2))), true);
        assertThat(dto.getPeakForm()).isEqualTo(5);
    }

    @Test
    void peakForm_ofTheEmptyReplay_isTheSeed() {
        assertThat(PetGrowthPolicy.toDTO(Replay.EMPTY, false).getPeakForm()).isEqualTo(1);
    }

    @Test
    void eachThreshold_crossedUpThenDown() {
        // 12 → 15 (Seedling) → 12 (seed); 33 → 36 (Sprig) → 33; 57 → 60 (Bushling) → 57
        for (int[] pair : new int[][] {{4, 1}, {11, 2}, {19, 3}}) {
            int ups = pair[0] + 1;
            Replay up = PetGrowthPolicy.replay(days(repeat(3, ups)));
            assertThat(PetGrowthPolicy.formFor(up.points())).isEqualTo(pair[1] + 1);
            int[] down = java.util.Arrays.copyOf(repeat(3, ups), ups + 1);
            down[ups] = -3;
            assertThat(PetGrowthPolicy.formFor(PetGrowthPolicy.replay(days(down)).points())).isEqualTo(pair[1]);
        }
    }

    @Test
    void peak_tracksTheHighestRunningTotal() {
        int[] scores = java.util.Arrays.copyOf(repeat(3, 30), 32);                // 90 …
        scores[30] = -3;
        scores[31] = -3;                                                          // … then 84
        Replay replay = PetGrowthPolicy.replay(days(scores));
        assertThat(replay.points()).isEqualTo(84);
        assertThat(replay.peak()).isEqualTo(90);
        assertThat(PetGrowthPolicy.reachedBasilisk(replay)).isTrue();
    }

    // ---- AC 4: bar fields ----

    @Test
    void toDTO_barIsPointsMinusThreshold_overTheFormsBarSize() {
        PetGrowthDTO dto = PetGrowthPolicy.toDTO(PetGrowthPolicy.replay(days(repeat(3, 7))), false); // 21
        assertThat(dto.getForm()).isEqualTo(2);
        assertThat(dto.getBarCurrent()).isEqualTo(6);
        assertThat(dto.getBarSize()).isEqualTo(21);
        assertThat(dto.isFullyGrown()).isFalse();
    }

    @Test
    void toDTO_fullyGrown_isBasiliskWithNoBar_whateverThePoints() {
        PetGrowthDTO dto = PetGrowthPolicy.toDTO(PetGrowthPolicy.replay(days(repeat(3, 20))), true); // 60
        assertThat(dto.getForm()).isEqualTo(5);
        assertThat(dto.getBarCurrent()).isNull();
        assertThat(dto.getBarSize()).isNull();
        assertThat(dto.isFullyGrown()).isTrue();
        assertThat(dto.getPoints()).isEqualTo(60);
    }
}
