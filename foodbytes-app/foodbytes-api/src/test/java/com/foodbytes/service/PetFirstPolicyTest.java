package com.foodbytes.service;

import org.junit.jupiter.api.Test;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.IntStream;

import static org.assertj.core.api.Assertions.assertThat;

/** MPP-24 AC 1: "a 7-day window with B/L/D all planned" = any 7 consecutive fully planned days. */
class PetFirstPolicyTest {

    private static final LocalDate MON = LocalDate.of(2026, 10, 12);

    private static List<LocalDate> days(int fromOffset, int count) {
        return IntStream.range(fromOffset, fromOffset + count).mapToObj(MON::plusDays).toList();
    }

    @Test
    void sevenConsecutiveDays_isAFullWeek() {
        assertThat(PetFirstPolicy.containsFullWeek(days(0, 7))).isTrue();
    }

    @Test
    void sixConsecutiveDays_isNot() {
        assertThat(PetFirstPolicy.containsFullWeek(days(0, 6))).isFalse();
    }

    @Test
    void rollingWindow_needNotStartOnMonday() {
        assertThat(PetFirstPolicy.containsFullWeek(days(3, 7))).isTrue();
    }

    @Test
    void aGapResetsTheRun() {
        List<LocalDate> gapped = new java.util.ArrayList<>(days(0, 4));
        gapped.addAll(days(5, 4));   // day 4 missing: runs of 4 and 4
        assertThat(PetFirstPolicy.containsFullWeek(gapped)).isFalse();
    }

    @Test
    void orderAndDuplicatesDoNotMatter() {
        List<LocalDate> shuffled = new java.util.ArrayList<>(days(0, 7));
        java.util.Collections.reverse(shuffled);
        shuffled.add(MON.plusDays(2));
        assertThat(PetFirstPolicy.containsFullWeek(shuffled)).isTrue();
    }

    @Test
    void noDates_isNot() {
        assertThat(PetFirstPolicy.containsFullWeek(List.of())).isFalse();
    }

    @Test
    void scanWindow_coversEveryWeekContainingTheTouchedRange() {
        assertThat(PetFirstPolicy.scanFrom(MON)).isEqualTo(MON.minusDays(6));
        assertThat(PetFirstPolicy.scanTo(MON.plusDays(2))).isEqualTo(MON.plusDays(8));
    }
}
