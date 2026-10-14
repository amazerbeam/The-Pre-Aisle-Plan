package com.foodbytes.service;

import com.foodbytes.service.StreakRuns.DayOutcome;
import com.foodbytes.service.StreakRuns.Run;
import com.foodbytes.service.StreakRuns.Summary;
import org.junit.jupiter.api.Test;

import java.time.LocalDate;
import java.util.TreeMap;

import static com.foodbytes.service.StreakRuns.DayOutcome.BREAKS;
import static com.foodbytes.service.StreakRuns.DayOutcome.COUNTS;
import static com.foodbytes.service.StreakRuns.DayOutcome.NEUTRAL;
import static org.assertj.core.api.Assertions.assertThat;

/** MPP-22: runs are counted days between breaks; neutral and missing days are skipped. */
class StreakRunsTest {

    private static LocalDate d(int dayOfOctober) {
        return LocalDate.of(2026, 10, dayOfOctober);
    }

    private static TreeMap<LocalDate, DayOutcome> days(Object... dayThenOutcome) {
        TreeMap<LocalDate, DayOutcome> map = new TreeMap<>();
        for (int i = 0; i < dayThenOutcome.length; i += 2) {
            map.put(d((Integer) dayThenOutcome[i]), (DayOutcome) dayThenOutcome[i + 1]);
        }
        return map;
    }

    @Test
    void noDays_isEmpty() {
        Summary s = StreakRuns.summarise(new TreeMap<>());
        assertThat(s.runs()).isEmpty();
        assertThat(s.current()).isZero();
        assertThat(s.best()).isZero();
    }

    @Test
    void neutralDay_neitherCountsNorBreaks() {
        Summary s = StreakRuns.summarise(days(1, COUNTS, 2, NEUTRAL, 3, COUNTS));
        assertThat(s.runs()).containsExactly(new Run(d(1), 2));
        assertThat(s.current()).isEqualTo(2);
    }

    @Test
    void missingDates_areNeutral() {
        Summary s = StreakRuns.summarise(days(1, COUNTS, 5, COUNTS));
        assertThat(s.runs()).containsExactly(new Run(d(1), 2));
    }

    @Test
    void break_endsTheRun_andANewOneStartsAfterIt() {
        Summary s = StreakRuns.summarise(days(1, COUNTS, 2, COUNTS, 3, BREAKS, 4, COUNTS));
        assertThat(s.runs()).containsExactly(new Run(d(1), 2), new Run(d(4), 1));
        assertThat(s.current()).isEqualTo(1);
        assertThat(s.best()).isEqualTo(2);
    }

    @Test
    void trailingBreak_leavesNoCurrentStreak_butKeepsBest() {
        Summary s = StreakRuns.summarise(days(1, COUNTS, 2, BREAKS));
        assertThat(s.current()).isZero();
        assertThat(s.best()).isEqualTo(1);
    }

    /**
     * Pins agreement with MPP-20: answers clean 1-3, then a lapse on the 4th reported on the 5th,
     * log as clean 1-3, not clean 4, clean 5 - HabitStreakService reports current 1, best 3.
     */
    @Test
    void mpp20HabitLogShape_matchesHabitStreakCurrentAndBest() {
        Summary s = StreakRuns.summarise(days(1, COUNTS, 2, COUNTS, 3, COUNTS, 4, BREAKS, 5, COUNTS));
        assertThat(s.current()).isEqualTo(1);
        assertThat(s.best()).isEqualTo(3);
    }
}
