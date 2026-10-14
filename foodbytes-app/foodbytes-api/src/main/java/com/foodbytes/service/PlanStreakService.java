package com.foodbytes.service;

import com.foodbytes.repository.MealPlanEntryEatenRepository;
import com.foodbytes.repository.MealPlanEntryRepository;
import com.foodbytes.repository.MealPlanEntryRepository.PlannedMealSlot;
import com.foodbytes.service.StreakRuns.DayOutcome;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.HashSet;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.SortedMap;
import java.util.TreeMap;
import java.util.stream.Collectors;

/**
 * MPP-22: the caller's "followed the plan" streak. The slots come from the shared plan (the meal-plan
 * owner's entries); the ticks are always the caller's own (per-person Pip, MPP-33). Each day is
 * judged by PlanStreakPolicy#dayOutcome and the runs by StreakRuns.
 */
@Service
@RequiredArgsConstructor
public class PlanStreakService {

    private final ExtraChoiceService extraChoiceService;
    private final MealPlanEntryRepository mealPlanEntryRepository;
    private final MealPlanEntryEatenRepository eatenRepository;

    /** Scans from the caller's first ticked plan date to today; nothing earlier can count. */
    @Transactional(readOnly = true)
    public StreakRuns.Summary planStreak(Long userId, LocalDate today) {
        Optional<LocalDate> firstTick = eatenRepository.findEarliestEatenPlanDate(userId);
        if (firstTick.isEmpty() || firstTick.get().isAfter(today)) {
            return StreakRuns.Summary.EMPTY;
        }
        Long ownerId = extraChoiceService.resolveOwnerId(userId);
        List<PlannedMealSlot> slots = mealPlanEntryRepository.findMainMealSlots(
                ownerId, PlanStreakPolicy.MAIN_MEAL_KEYS, firstTick.get(), today);
        if (slots.isEmpty()) {
            return StreakRuns.Summary.EMPTY;
        }

        Set<Long> eaten = new HashSet<>(eatenRepository.findEatenEntryIdsInRange(userId, firstTick.get(), today));

        SortedMap<LocalDate, DayOutcome> days = new TreeMap<>();
        slots.stream()
                .collect(Collectors.groupingBy(PlannedMealSlot::getPlanDate))
                .forEach((day, daySlots) -> {
                    int eatenCount = (int) daySlots.stream().filter(s -> eaten.contains(s.getId())).count();
                    days.put(day, PlanStreakPolicy.dayOutcome(daySlots.size(), eatenCount, day.equals(today)));
                });
        return StreakRuns.summarise(days);
    }
}
