package com.foodbytes.service.game;

import com.foodbytes.model.GameMode;
import org.junit.jupiter.api.Test;

import java.util.List;
import java.util.Map;
import java.util.SplittableRandom;

import static org.assertj.core.api.Assertions.assertThat;

class PipsPathSequencerTest {

    record FakeFamily(String id, int chapter) implements PuzzleFamily {
        @Override public GridMap generate(int difficulty, long seed) { throw new UnsupportedOperationException(); }
        @Override public boolean isValidClear(GridMap map, List<Integer> path) { throw new UnsupportedOperationException(); }
    }

    private static final GardenPathFamily GP = new GardenPathFamily();
    private static final FakeFamily TI = new FakeFamily("thin-ice", 2);
    private static final List<PuzzleFamily> ONE = List.of(GP);
    private static final List<PuzzleFamily> TWO = List.of(GP, TI);

    private final SplittableRandom rng = new SplittableRandom(1);

    @Test
    void oneFamily_noProgress() {
        assertThat(PipsPathSequencer.next(ONE, Map.of(), rng)).isEqualTo(new Slot("garden-path", 1, GameMode.CHAPTER, 1));
        assertThat(PipsPathSequencer.currentChapter(ONE, Map.of())).isEqualTo(1);
    }

    @Test
    void oneFamily_highest3() {
        var p = Map.of("garden-path", new FamilyProgress(3, 0));
        assertThat(PipsPathSequencer.next(ONE, p, rng).difficulty()).isEqualTo(4);
    }

    @Test
    void oneFamily_done_isEndless() {
        var p = Map.of("garden-path", new FamilyProgress(10, 0));
        Slot s = PipsPathSequencer.next(ONE, p, rng);
        assertThat(s.mode()).isEqualTo(GameMode.ENDLESS);
        assertThat(s.family()).isEqualTo("garden-path");
        assertThat(s.chapter()).isNull();
        assertThat(s.difficulty()).isBetween(1, 10);
        assertThat(PipsPathSequencer.currentChapter(ONE, p)).isEqualTo(2);
        assertThat(PipsPathSequencer.isEndless(ONE, p)).isTrue();
    }

    @Test
    void twoFamilies_secondChapterStarts() {
        var p = Map.of("garden-path", new FamilyProgress(10, 0));
        assertThat(PipsPathSequencer.next(TWO, p, rng)).isEqualTo(new Slot("thin-ice", 1, GameMode.CHAPTER, 2));
    }

    @Test
    void twoFamilies_refresherAfterSecondChapter() {
        var p = Map.of("garden-path", new FamilyProgress(10, 0), "thin-ice", new FamilyProgress(10, 0));
        Slot s = PipsPathSequencer.next(TWO, p, rng);
        assertThat(s.mode()).isEqualTo(GameMode.REFRESHER);
        assertThat(s.family()).isEqualTo("garden-path");
        assertThat(s.chapter()).isEqualTo(2);
        assertThat(s.difficulty()).isBetween(8, 10);
        assertThat(PipsPathSequencer.currentChapter(TWO, p)).isEqualTo(2);
    }

    @Test
    void twoFamilies_refresherDone_isEndless() {
        var p = Map.of("garden-path", new FamilyProgress(10, 2), "thin-ice", new FamilyProgress(10, 0));
        assertThat(PipsPathSequencer.next(TWO, p, rng).mode()).isEqualTo(GameMode.ENDLESS);
        assertThat(PipsPathSequencer.currentChapter(TWO, p)).isEqualTo(3);
    }

    @Test
    void isUnlocked() {
        var p = Map.of("garden-path", new FamilyProgress(3, 0));
        for (int d = 1; d <= 4; d++) assertThat(PipsPathSequencer.isUnlocked(GP, d, ONE, p)).isTrue();
        assertThat(PipsPathSequencer.isUnlocked(GP, 5, ONE, p)).isFalse();
        assertThat(PipsPathSequencer.isUnlocked(GP, 0, ONE, p)).isFalse();
        assertThat(PipsPathSequencer.isUnlocked(GP, 11, ONE, p)).isFalse();

        assertThat(PipsPathSequencer.isUnlocked(TI, 1, TWO, Map.of("garden-path", new FamilyProgress(4, 0)))).isFalse();
        assertThat(PipsPathSequencer.isUnlocked(TI, 1, TWO, Map.of("garden-path", new FamilyProgress(10, 0)))).isTrue();
    }
}
