package com.foodbytes.service.game;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.MethodSource;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.stream.Stream;

import static org.assertj.core.api.Assertions.assertThat;

class GardenPathSolverTest {

    /** The 10 hand-made mockup levels (pips-path.html pp-levels); also the band calibration fixtures. */
    record Fixture(String id, int difficulty, long solutions, List<String> rows) {}

    static final List<Fixture> FIXTURES = List.of(
        new Fixture("garden-01", 1, 8, List.of("S..", "...", "...")),
        new Fixture("garden-02", 2, 12, List.of("....", "..S.", "....")),
        new Fixture("garden-03", 3, 4, List.of(".#..", "....", "..S.", "....")),
        new Fixture("garden-04", 4, 9, List.of(".....", ".....", ".....", "S..#.")),
        new Fixture("garden-05", 5, 7, List.of(".....", ".#...", "....S", ".....", ".#...")),
        new Fixture("garden-06", 6, 1, List.of("..#..", "#....", "..#..", "....S", ".....")),
        new Fixture("garden-07", 7, 6, List.of(".#....", "......", "......", "......", ".S#...")),
        new Fixture("garden-08", 8, 1, List.of("......", "......", "......", "#....#", "......", "..S..#")),
        new Fixture("garden-09", 9, 1, List.of("....#.", "..#.#.", "......", ".S....", "......", "...#..")),
        new Fixture("garden-10", 10, 4, List.of("......", "......", "......", "..#..#", "....#.", ".S....", "...#..")));

    static Stream<Fixture> fixtures() {
        return FIXTURES.stream();
    }

    private static List<Integer> list(int[] a) {
        return Arrays.stream(a).boxed().toList();
    }

    private static Fixture fx(String id) {
        return FIXTURES.stream().filter(f -> f.id().equals(id)).findFirst().orElseThrow();
    }

    @ParameterizedTest
    @MethodSource("fixtures")
    void countsMatchMockup(Fixture f) {
        GridMap m = GridMap.parse(f.rows());
        SolveResult r = GardenPathSolver.countSolutions(m, 1_000_000, 10_000_000);
        assertThat(r.count()).as(f.id()).isEqualTo(f.solutions());
        assertThat(r.budgetExceeded()).isFalse();
        assertThat(r.first()).hasSize(m.openCount());
        assertThat(GardenPathSolver.isValidClear(m, list(r.first()))).isTrue();
    }

    @Test
    void isValidClear_rejectsBadPaths() {
        GridMap m = GridMap.parse(fx("garden-01").rows());
        List<Integer> good = list(GardenPathSolver.countSolutions(m, 1, 1_000_000).first());
        assertThat(GardenPathSolver.isValidClear(m, good)).isTrue();
        assertThat(GardenPathSolver.isValidClear(m, null)).isFalse();
        assertThat(GardenPathSolver.isValidClear(m, good.subList(0, good.size() - 1))).isFalse();

        List<Integer> notStart = new ArrayList<>(good);
        notStart.set(0, good.get(1));
        notStart.set(1, good.get(0));
        assertThat(GardenPathSolver.isValidClear(m, notStart)).isFalse();

        List<Integer> revisit = new ArrayList<>(good);
        revisit.set(8, good.get(7));
        assertThat(GardenPathSolver.isValidClear(m, revisit)).isFalse();

        assertThat(GardenPathSolver.isValidClear(m, List.of(0, 4, 1, 2, 5, 3, 6, 7, 8))).isFalse(); // diagonal 0->4
        List<Integer> withNull = new ArrayList<>(good);
        withNull.set(3, null);
        assertThat(GardenPathSolver.isValidClear(m, withNull)).isFalse();
        List<Integer> negative = new ArrayList<>(good);
        negative.set(4, -1);
        assertThat(GardenPathSolver.isValidClear(m, negative)).isFalse();
        List<Integer> big = new ArrayList<>(good);
        big.set(4, 9);
        assertThat(GardenPathSolver.isValidClear(m, big)).isFalse();
    }

    @Test
    void isValidClear_rejectsRock() {
        GridMap m = GridMap.parse(fx("garden-03").rows());
        List<Integer> good = new ArrayList<>(list(GardenPathSolver.countSolutions(m, 1, 1_000_000).first()));
        good.set(good.size() - 1, 1); // cell 1 is a rock
        assertThat(GardenPathSolver.isValidClear(m, good)).isFalse();
    }

    @Test
    void countSolutions_stopsAtLimit() {
        GridMap m = GridMap.parse(fx("garden-02").rows());
        assertThat(GardenPathSolver.countSolutions(m, 2, 1_000_000).count()).isEqualTo(2);
    }

    @Test
    void countSolutions_reportsBudget() {
        GridMap m = GridMap.parse(fx("garden-10").rows());
        assertThat(GardenPathSolver.countSolutions(m, 1_000_000, 5).budgetExceeded()).isTrue();
    }
}
