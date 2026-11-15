package com.foodbytes.service;

import com.foodbytes.dto.PetGrowthDTO;
import com.foodbytes.dto.PetLineGrowthDTO;
import com.foodbytes.service.PetGrowthPolicy.Line;
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
    void peak_tracksTheHighestRunningTotal() {
        int[] scores = java.util.Arrays.copyOf(repeat(3, 30), 32);                // 90 …
        scores[30] = -3;
        scores[31] = -3;                                                          // … then 84
        Replay replay = PetGrowthPolicy.replay(days(scores));
        assertThat(replay.points()).isEqualTo(84);
        assertThat(replay.peak()).isEqualTo(90);
        assertThat(PetGrowthPolicy.reachedBasilisk(replay)).isTrue();
    }

    private static PetLineGrowthDTO line(PetGrowthDTO dto, Line line) {
        return dto.getLines().get(line.key());
    }

    private static int[] upThenDown(int ups, int downs) {
        int[] out = java.util.Arrays.copyOf(repeat(3, ups), ups + downs);
        java.util.Arrays.fill(out, ups, ups + downs, -3);
        return out;
    }

    // ---- line registry ----

    @Test
    void registry_herbDragonRobot_inOrder_withTheirThresholds() {
        assertThat(Line.values()).containsExactly(Line.HERB, Line.DRAGON, Line.ROBOT);
        assertThat(Line.HERB.thresholds()).containsExactly(0, 15, 36, 60, 90);
        assertThat(Line.DRAGON.thresholds()).containsExactly(0, 15, 36);
        assertThat(Line.ROBOT.thresholds()).containsExactly(0, 15, 36);
        assertThat(Line.HERB.key()).isEqualTo("herb");
        assertThat(Line.DRAGON.lastForm()).isEqualTo(3);
        assertThat(PetGrowthPolicy.FORM_THRESHOLDS).isEqualTo(Line.HERB.thresholds());
    }

    @ParameterizedTest
    @CsvSource({"0,1", "14,1", "15,2", "35,2", "36,3", "59,3", "60,4", "89,4", "90,5", "120,5"})
    void formFor_herb_eachThresholdBoundary(int points, int form) {
        assertThat(PetGrowthPolicy.formFor(Line.HERB, points)).isEqualTo(form);
    }

    @ParameterizedTest
    @CsvSource({"0,1", "14,1", "15,2", "35,2", "36,3", "90,3"})
    void formFor_dragonAndRobot_eachThresholdBoundary(int points, int form) {
        assertThat(PetGrowthPolicy.formFor(Line.DRAGON, points)).isEqualTo(form);
        assertThat(PetGrowthPolicy.formFor(Line.ROBOT, points)).isEqualTo(form);
    }

    @Test
    void toDTO_hasEveryLine_inRegistryOrder() {
        PetGrowthDTO dto = PetGrowthPolicy.toDTO(Replay.EMPTY, false);
        assertThat(dto.getLines()).containsOnlyKeys("herb", "dragon", "robot");
        assertThat(dto.getLines().keySet()).containsExactly("herb", "dragon", "robot");
        for (Line l : Line.values()) {
            assertThat(line(dto, l).getForm()).isEqualTo(1);
            assertThat(line(dto, l).getBarCurrent()).isZero();
            assertThat(line(dto, l).getBarSize()).isEqualTo(15);
        }
        assertThat(dto.getPeakForm()).isEqualTo(1);
    }

    // ---- never de-evolve: form from peak, every line (herb included) ----

    @Test
    void slipRightAfterEvolving_noLineDeEvolves_andTheBarSitsEmpty() {
        PetGrowthDTO dto = PetGrowthPolicy.toDTO(PetGrowthPolicy.replay(days(upThenDown(5, 1))), false); // 15 -> 12
        assertThat(dto.getPoints()).isEqualTo(12);
        for (Line l : Line.values()) {
            PetLineGrowthDTO g = line(dto, l);
            assertThat(g.getForm()).as(l.key()).isEqualTo(2);
            assertThat(g.getPeakForm()).isEqualTo(2);
            assertThat(g.getFormStart()).isEqualTo(15);
            assertThat(g.getBarCurrent()).isZero();
            assertThat(g.getBarSize()).isEqualTo(21);
        }
    }

    @Test
    void eachThreshold_crossedUpThenDown_keepsTheHigherForm() {
        // 15 -> 12, 36 -> 33, 60 -> 57: herb stays 2 / 3 / 4
        for (int[] pair : new int[][] {{5, 2}, {12, 3}, {20, 4}}) {
            PetGrowthDTO dto = PetGrowthPolicy.toDTO(PetGrowthPolicy.replay(days(upThenDown(pair[0], 1))), false);
            assertThat(line(dto, Line.HERB).getForm()).isEqualTo(pair[1]);
            assertThat(dto.getPeakForm()).isEqualTo(pair[1]);
        }
    }

    @Test
    void dragonAndRobot_reachTheirLastFormAt36_andStayFullyGrownAfterSlips() {
        PetGrowthDTO dto = PetGrowthPolicy.toDTO(PetGrowthPolicy.replay(days(upThenDown(12, 10))), false); // 36 -> 6
        for (Line l : new Line[] {Line.DRAGON, Line.ROBOT}) {
            PetLineGrowthDTO g = line(dto, l);
            assertThat(g.getForm()).isEqualTo(3);
            assertThat(g.isFullyGrown()).isTrue();
            assertThat(g.getBarCurrent()).isNull();
            assertThat(g.getBarSize()).isNull();
            assertThat(g.getFormStart()).isEqualTo(36);
        }
        PetLineGrowthDTO herb = line(dto, Line.HERB);
        assertThat(herb.getForm()).isEqualTo(3);
        assertThat(herb.isFullyGrown()).isFalse();
        assertThat(herb.getBarCurrent()).isZero();          // 6 points, below Sprig's 36
        assertThat(herb.getBarSize()).isEqualTo(24);
    }

    @Test
    void bar_isPointsMinusFormStart_overTheGapToTheNextForm() {
        PetGrowthDTO dto = PetGrowthPolicy.toDTO(PetGrowthPolicy.replay(days(repeat(3, 7))), false); // 21
        PetLineGrowthDTO herb = line(dto, Line.HERB);
        assertThat(herb.getForm()).isEqualTo(2);
        assertThat(herb.getBarCurrent()).isEqualTo(6);
        assertThat(herb.getBarSize()).isEqualTo(21);
        assertThat(herb.isFullyGrown()).isFalse();
    }

    // ---- the fully-grown marker floors the peak at Basilisk ----

    @Test
    void fullyGrownMarker_isBasiliskAndEveryLineAtItsLastForm_whateverThePoints() {
        PetGrowthDTO dto = PetGrowthPolicy.toDTO(PetGrowthPolicy.replay(days(repeat(3, 2))), true); // 6 points
        assertThat(dto.getPoints()).isEqualTo(6);
        assertThat(dto.getPeakForm()).isEqualTo(5);
        assertThat(line(dto, Line.HERB).getForm()).isEqualTo(5);
        for (Line l : Line.values()) {
            assertThat(line(dto, l).isFullyGrown()).isTrue();
            assertThat(line(dto, l).getBarSize()).isNull();
        }
    }

    @Test
    void effectivePeak_floorsAtNinetyOnlyWhenFullyGrown() {
        Replay replay = PetGrowthPolicy.replay(days(repeat(3, 4)));                 // peak 12
        assertThat(PetGrowthPolicy.effectivePeak(replay, false)).isEqualTo(12);
        assertThat(PetGrowthPolicy.effectivePeak(replay, true)).isEqualTo(90);
    }
}
