package com.foodbytes.service.game;

import org.junit.jupiter.api.Test;

import java.util.Arrays;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class PuzzleFamilyRegistryTest {

    record FakeFamily(String id, int chapter) implements PuzzleFamily {
        @Override public GridMap generate(int difficulty, long seed) { throw new UnsupportedOperationException(); }
        @Override public boolean isValidClear(GridMap map, List<Integer> path) { throw new UnsupportedOperationException(); }
    }

    @Test
    void ordered_sortsByChapter() {
        var registry = new PuzzleFamilyRegistry(List.of(new FakeFamily("b", 2), new GardenPathFamily()));
        assertThat(registry.ordered()).extracting(PuzzleFamily::id).containsExactly("garden-path", "b");
    }

    @Test
    void byId() {
        var registry = new PuzzleFamilyRegistry(List.of(new GardenPathFamily()));
        assertThat(registry.byId("garden-path")).isPresent();
        assertThat(registry.byId("nope")).isEmpty();
        assertThat(registry.byId(null)).isEmpty();
    }

    @Test
    void duplicates_fail() {
        assertThatThrownBy(() -> new PuzzleFamilyRegistry(Arrays.asList(new FakeFamily("a", 1), new FakeFamily("a", 2))))
                .isInstanceOf(IllegalStateException.class);
        assertThatThrownBy(() -> new PuzzleFamilyRegistry(Arrays.asList(new FakeFamily("a", 1), new FakeFamily("b", 1))))
                .isInstanceOf(IllegalStateException.class);
    }

    @Test
    void gardenPathFamily_generatesSolvableMap() {
        var family = new GardenPathFamily();
        GridMap map = family.generate(3, 7L);
        assertThat(map.width()).isEqualTo(4);
        assertThat(map.height()).isEqualTo(4);
        int[] first = GardenPathSolver.countSolutions(map, 1, GardenPathGenerator.NODE_BUDGET).first();
        assertThat(family.isValidClear(map, Arrays.stream(first).boxed().toList())).isTrue();
    }
}
