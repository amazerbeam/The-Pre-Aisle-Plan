package com.foodbytes.service;

import com.foodbytes.dto.NextMilestoneDTO;
import com.foodbytes.model.StreakType;
import com.foodbytes.service.AwardLadder.AwardKey;
import com.foodbytes.service.StreakRuns.Run;
import org.junit.jupiter.api.Test;

import java.time.LocalDate;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

/** MPP-22 AC 1: 1/3/5/7/14/21/30, repeating every 30 days. */
class AwardLadderTest {

    private static final LocalDate START = LocalDate.of(2026, 9, 1);

    @Test
    void ladderDay_wrapsEvery30() {
        assertThat(AwardLadder.ladderDay(0)).isZero();
        assertThat(AwardLadder.ladderDay(1)).isEqualTo(1);
        assertThat(AwardLadder.ladderDay(30)).isEqualTo(30);
        assertThat(AwardLadder.ladderDay(31)).isEqualTo(1);
        assertThat(AwardLadder.ladderDay(60)).isEqualTo(30);
        assertThat(AwardLadder.ladderDay(61)).isEqualTo(1);
    }

    @Test
    void shortRun_earnsOnlyTheMilestonesItPassed() {
        assertThat(AwardLadder.awardsFor(StreakType.PLAN, new Run(START, 4)))
                .containsExactly(
                        new AwardKey(StreakType.PLAN, 1, START, 0),
                        new AwardKey(StreakType.PLAN, 3, START, 0));
    }

    /** AC 5: day 31 re-earns the 1-day award in cycle 1. */
    @Test
    void crossingDay30IntoDay31_reEarnsTheOneDayAwardInTheNextCycle() {
        List<AwardKey> keys = AwardLadder.awardsFor(StreakType.SNACK, new Run(START, 31));

        assertThat(keys).hasSize(8);
        assertThat(keys.subList(0, 7)).extracting(AwardKey::milestone).containsExactly(1, 3, 5, 7, 14, 21, 30);
        assertThat(keys.subList(0, 7)).allMatch(k -> k.cycleIndex() == 0);
        assertThat(keys.get(7)).isEqualTo(new AwardKey(StreakType.SNACK, 1, START, 1));
    }

    @Test
    void next_isTheFirstMilestoneAboveTheLadderDay() {
        assertThat(AwardLadder.next(0)).isEqualTo(new NextMilestoneDTO(1, 1));
        assertThat(AwardLadder.next(1)).isEqualTo(new NextMilestoneDTO(3, 2));
        assertThat(AwardLadder.next(7)).isEqualTo(new NextMilestoneDTO(14, 7));
        assertThat(AwardLadder.next(29)).isEqualTo(new NextMilestoneDTO(30, 1));
    }

    @Test
    void next_afterAFullCycle_restartsAtOneDay() {
        assertThat(AwardLadder.next(30)).isEqualTo(new NextMilestoneDTO(1, 1));
        assertThat(AwardLadder.next(31)).isEqualTo(new NextMilestoneDTO(3, 2));
    }
}
