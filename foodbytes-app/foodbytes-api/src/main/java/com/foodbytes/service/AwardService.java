package com.foodbytes.service;

import com.foodbytes.dto.AwardStatusDTO;
import com.foodbytes.dto.HabitStatusDTO;
import com.foodbytes.dto.PetAwardsDTO;
import com.foodbytes.model.Habit;
import com.foodbytes.model.PetHabitDay;
import com.foodbytes.model.StreakType;
import com.foodbytes.repository.PetAwardRepository;
import com.foodbytes.repository.PetHabitDayRepository;
import com.foodbytes.service.AwardLadder.AwardKey;
import com.foodbytes.service.StreakRuns.DayOutcome;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Clock;
import java.time.LocalDate;
import java.util.Arrays;
import java.util.EnumMap;
import java.util.HashSet;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.SortedMap;
import java.util.TreeMap;
import java.util.function.Function;
import java.util.stream.Collectors;

/**
 * MPP-22: the caller's trophy cabinet. Each read re-derives every run of the plan, snack and alcohol
 * streaks, records any milestone not yet in the ledger (idempotent on uk_pet_awards) and reports
 * current / best / counts / next per streak type. Always the caller's own id — never the meal-plan
 * owner (per-person Pip, MPP-33).
 *
 * <p>Accepted over-count (plan.md "Ledger vs live drift"): an award's identity includes the run's
 * start date, and awards are never revoked. If an untick/re-tick or a partner editing past slots
 * moves a run's start, the same streak can be recorded again under the new start and counts a
 * little high. That is preferred to revoking a trophy the user has already seen.
 */
@Service
@RequiredArgsConstructor
public class AwardService {

    private final PlanStreakService planStreakService;
    private final HabitStreakService habitStreakService;
    private final PetHabitDayRepository habitDayRepository;
    private final PetAwardRepository awardRepository;
    private final Clock clock;
    private final PetFirstService petFirstService;   // MPP-24

    /** PLAN, SNACK, ALCOHOL. Writes only ledger rows that are missing. */
    @Transactional
    public List<AwardStatusDTO> getAwards(Long userId) {
        LocalDate today = HabitStreakPolicy.today(clock);

        Map<StreakType, StreakRuns.Summary> runs = new EnumMap<>(StreakType.class);
        StreakRuns.Summary plan = planStreakService.planStreak(userId, today);
        runs.put(StreakType.PLAN, plan);
        for (Habit habit : Habit.values()) {
            runs.put(StreakType.of(habit), habitRuns(userId, habit));
        }
        // SNACK/ALCOHOL: the ledger runs above come from the pet_habit_days log, while current/best below
        // come from the pet_habit_streaks row via HabitStreakService. They agree by construction (the
        // streak row is maintained from that same log), pinned by
        // StreakRunsTest.mpp20HabitLogShape_matchesHabitStreakCurrentAndBest. Using the stored row
        // keeps the cabinet equal to the MPP-20 check-in bubble.
        Map<Habit, HabitStatusDTO> habits = habitStreakService.getHabits(userId).stream()
                .collect(Collectors.toMap(HabitStatusDTO::getHabit, Function.identity()));

        Set<AwardKey> earned = syncLedger(userId, runs);

        return Arrays.stream(StreakType.values())
                .map(type -> {
                    int current = type.habit().map(h -> habits.get(h).getCurrent()).orElse(plan.current());
                    int best = type.habit().map(h -> habits.get(h).getBest()).orElse(plan.best());
                    return new AwardStatusDTO(type, current, best, counts(type, earned), AwardLadder.next(current));
                })
                .toList();
    }

    /** MPP-24: GET /api/pet/awards - the streak statuses plus the caller's firsts. */
    @Transactional
    public PetAwardsDTO getCabinet(Long userId) {
        return new PetAwardsDTO(getAwards(userId), petFirstService.getFirsts(userId));
    }

    /** The MPP-20 day log as runs: clean days count, the lapse day breaks. */
    private StreakRuns.Summary habitRuns(Long userId, Habit habit) {
        SortedMap<LocalDate, DayOutcome> days = new TreeMap<>();
        for (PetHabitDay day : habitDayRepository.findByUserIdAndHabitOrderByDayAsc(userId, habit)) {
            days.put(day.getDay(), Boolean.TRUE.equals(day.getClean()) ? DayOutcome.COUNTS : DayOutcome.BREAKS);
        }
        return StreakRuns.summarise(days);
    }

    /** Existing ledger plus every award the runs have earned; inserts only the ones not yet recorded. */
    private Set<AwardKey> syncLedger(Long userId, Map<StreakType, StreakRuns.Summary> runs) {
        Set<AwardKey> earned = awardRepository.findByUserId(userId).stream()
                .map(a -> new AwardKey(a.getStreakType(), a.getMilestone(), a.getStreakStart(), a.getCycleIndex()))
                .collect(Collectors.toCollection(HashSet::new));
        runs.forEach((type, summary) -> summary.runs().forEach(run ->
                AwardLadder.awardsFor(type, run).forEach(key -> {
                    if (earned.add(key)) {
                        awardRepository.insertIfAbsent(
                                userId, key.type().name(), key.milestone(), key.streakStart(), key.cycleIndex());
                    }
                })));
        return earned;
    }

    /** Every milestone in ladder order, zeros included. */
    private static Map<Integer, Integer> counts(StreakType type, Set<AwardKey> earned) {
        Map<Integer, Integer> counts = new LinkedHashMap<>();
        AwardLadder.MILESTONES.forEach(milestone -> counts.put(milestone, 0));
        earned.stream()
                .filter(key -> key.type() == type)
                .forEach(key -> counts.merge(key.milestone(), 1, Integer::sum));
        return counts;
    }
}
