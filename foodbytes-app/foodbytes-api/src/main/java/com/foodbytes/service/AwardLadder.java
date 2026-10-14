package com.foodbytes.service;

import com.foodbytes.dto.NextMilestoneDTO;
import com.foodbytes.model.StreakType;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

/**
 * MPP-22: the one milestone ladder shared by the plan, snack and alcohol streaks. Streak day s maps
 * to ladder day ((s-1) mod 30)+1, so the ladder repeats every 30 days and day 31 re-earns the 1-day
 * award (cycle 1).
 */
public final class AwardLadder {

    /**
     * Changing this list needs a migration that also updates the CHECK constraint
     * chk_pet_awards_milestone; otherwise inserting the new milestone fails and the endpoint 500s.
     */
    public static final List<Integer> MILESTONES = List.of(1, 3, 5, 7, 14, 21, 30);
    public static final int CYCLE = 30;

    /** Identity of one earned award — the columns of uk_pet_awards minus the user. */
    public record AwardKey(StreakType type, int milestone, LocalDate streakStart, int cycleIndex) {}

    private AwardLadder() {
    }

    /** 1..30 for streak day s ≥ 1; 0 for no streak. */
    public static int ladderDay(int streakDay) {
        return streakDay <= 0 ? 0 : ((streakDay - 1) % CYCLE) + 1;
    }

    /** Every award a run has earned, in the order its days were reached. */
    public static List<AwardKey> awardsFor(StreakType type, StreakRuns.Run run) {
        List<AwardKey> keys = new ArrayList<>();
        for (int s = 1; s <= run.length(); s++) {
            int day = ladderDay(s);
            if (MILESTONES.contains(day)) {
                keys.add(new AwardKey(type, day, run.start(), (s - 1) / CYCLE));
            }
        }
        return keys;
    }

    /** The next milestone above the current ladder day; after day 30 it is the next cycle's 1. */
    public static NextMilestoneDTO next(int current) {
        int day = ladderDay(current);
        return MILESTONES.stream()
                .filter(milestone -> milestone > day)
                .findFirst()
                .map(milestone -> new NextMilestoneDTO(milestone, milestone - day))
                .orElse(new NextMilestoneDTO(MILESTONES.get(0), 1));
    }
}
