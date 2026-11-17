package com.foodbytes.service.game;

import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class GardenPathBandsTest {

    @Test
    void ofCoversOneToTen() {
        for (int d = 1; d <= 10; d++) assertThat(GardenPathBands.of(d).difficulty()).isEqualTo(d);
        assertThatThrownBy(() -> GardenPathBands.of(0)).isInstanceOf(IllegalArgumentException.class);
        assertThatThrownBy(() -> GardenPathBands.of(11)).isInstanceOf(IllegalArgumentException.class);
    }

    @Test
    void bandsAreSane() {
        int prevCells = 0;
        for (int d = 1; d <= 10; d++) {
            DifficultyBand b = GardenPathBands.of(d);
            assertThat(b.width()).isLessThanOrEqualTo(GridMap.MAX_COLS);
            assertThat(b.rocks()).isLessThan(b.width() * b.height());
            assertThat(b.minSolutions()).isGreaterThanOrEqualTo(1);
            assertThat(b.minSolutions()).isLessThanOrEqualTo(b.maxSolutions());
            assertThat(b.width() * b.height()).isGreaterThanOrEqualTo(prevCells);
            prevCells = b.width() * b.height();
        }
    }

    @Test
    void everyMockupFixtureSitsInItsBand() {
        for (GardenPathSolverTest.Fixture f : GardenPathSolverTest.FIXTURES) {
            GridMap m = GridMap.parse(f.rows());
            DifficultyBand b = GardenPathBands.of(f.difficulty());
            assertThat(m.width()).as(f.id()).isEqualTo(b.width());
            assertThat(m.height()).as(f.id()).isEqualTo(b.height());
            assertThat(m.cells() - m.openCount()).as(f.id()).isEqualTo(b.rocks());
            assertThat(b.accepts(f.solutions())).as(f.id()).isTrue();
        }
    }

    @Test
    void countLimit() {
        assertThat(GardenPathBands.of(1).countLimit()).isEqualTo(GardenPathBands.of(1).minSolutions());
        assertThat(GardenPathBands.of(9).countLimit()).isEqualTo(GardenPathBands.of(9).maxSolutions() + 1L);
    }
}
