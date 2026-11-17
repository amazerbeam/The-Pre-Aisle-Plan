package com.foodbytes.service.game;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;

import java.util.HashSet;
import java.util.Set;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class GardenPathGeneratorTest {

    @ParameterizedTest
    @ValueSource(ints = {1, 2, 3, 4, 5, 6, 7, 8, 9, 10})
    void everyDifficulty_fiftySeededMaps_areInBand(int d) {
        DifficultyBand band = GardenPathBands.of(d);
        long t0 = System.nanoTime();
        GridMap[] maps = new GridMap[50];
        for (int seed = 0; seed < 50; seed++) maps[seed] = GardenPathGenerator.generate(d, seed);
        long ms = (System.nanoTime() - t0) / 1_000_000;
        System.out.println("generator d=" + d + " 50 maps in " + ms + " ms");

        for (GridMap m : maps) {
            assertThat(m.width()).isEqualTo(band.width());
            assertThat(m.height()).isEqualTo(band.height());
            assertThat(m.cells() - m.openCount()).isEqualTo(band.rocks());
            assertThat(m.width()).isLessThanOrEqualTo(GridMap.MAX_COLS);
            assertThat(m.layout().chars().filter(c -> c == 'S').count()).isEqualTo(1);
            SolveResult r = GardenPathSolver.countSolutions(m, band.countLimit(), GardenPathGenerator.NODE_BUDGET);
            assertThat(r.budgetExceeded()).isFalse();
            assertThat(band.accepts(r.count())).as(m.layout()).isTrue();
        }
        assertThat(ms).as("50 maps at difficulty " + d).isLessThan(3_000);
    }

    @Test
    void sameSeed_sameMap() {
        assertThat(GardenPathGenerator.generate(8, 42L).layout()).isEqualTo(GardenPathGenerator.generate(8, 42L).layout());
    }

    @Test
    void differentSeeds_vary() {
        Set<String> layouts = new HashSet<>();
        for (long s = 0; s < 20; s++) layouts.add(GardenPathGenerator.generate(5, s).layout());
        assertThat(layouts.size()).isGreaterThan(1);
    }

    @Test
    void parity_everyMockupFixtureStartPasses() {
        for (GardenPathSolverTest.Fixture f : GardenPathSolverTest.FIXTURES) {
            GridMap m = GridMap.parse(f.rows());
            assertThat(GardenPathGenerator.parityAllowsStart(m.width(), m.open(), m.start()))
                    .as(f.id()).isTrue();
        }
    }

    @Test
    void parity_equalCounts_anyOpenStartAllowed() {
        boolean[] open = {true, true, true, true}; // 2x2: 2 dark, 2 light
        for (int i = 0; i < 4; i++) assertThat(GardenPathGenerator.parityAllowsStart(2, open, i)).isTrue();
    }

    @Test
    void parity_oneMoreDark_onlyDarkStartAllowed() {
        boolean[] open = new boolean[9];
        java.util.Arrays.fill(open, true); // 3x3: 5 dark (even x+y), 4 light
        assertThat(GardenPathGenerator.parityAllowsStart(3, open, 0)).isTrue();   // (0,0) dark
        assertThat(GardenPathGenerator.parityAllowsStart(3, open, 1)).isFalse();  // (1,0) light
    }

    @Test
    void parity_countsDifferByTwo_noStartAllowed() {
        // 3x3 with the two light cells (1,0) and (0,1) turned to rocks: 5 dark vs 2 light
        boolean[] open = {true, false, true, false, true, true, true, true, true};
        for (int i = 0; i < 9; i++) assertThat(GardenPathGenerator.parityAllowsStart(3, open, i)).isFalse();
    }

    @Test
    void parity_rockStart_neverAllowed() {
        boolean[] open = {true, false, true, true};
        assertThat(GardenPathGenerator.parityAllowsStart(2, open, 1)).isFalse();
    }

    @ParameterizedTest
    @ValueSource(ints = {1, 2, 3, 4, 5, 6, 7, 8, 9, 10})
    void generatedMaps_passParityRule(int d) {
        for (long seed = 0; seed < 10; seed++) {
            GridMap m = GardenPathGenerator.generate(d, seed);
            assertThat(GardenPathGenerator.parityAllowsStart(m.width(), m.open(), m.start()))
                    .as(m.layout()).isTrue();
        }
    }

    @Test
    void badDifficulty_throws() {
        assertThatThrownBy(() -> GardenPathGenerator.generate(0, 1L)).isInstanceOf(IllegalArgumentException.class);
    }
}
