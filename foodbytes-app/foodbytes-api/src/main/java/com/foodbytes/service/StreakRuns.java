package com.foodbytes.service;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.SortedMap;

/**
 * MPP-22: turns a dated series of day outcomes into streak runs. Shared by the plan streak
 * (PlanStreakPolicy decides each day) and the habit streaks (the MPP-20 day log's clean flag).
 * A run is the counted days between breaks; neutral days and dates absent from the map are skipped.
 */
public final class StreakRuns {

    public enum DayOutcome { COUNTS, BREAKS, NEUTRAL }

    /** start = first counted day; length = counted days (≥ 1). */
    public record Run(LocalDate start, int length) {}

    /** current = last run's length if no break follows it, else 0; best = longest run, 0 if none. */
    public record Summary(List<Run> runs, int current, int best) {
        public static final Summary EMPTY = new Summary(List.of(), 0, 0);
    }

    private StreakRuns() {
    }

    public static Summary summarise(SortedMap<LocalDate, DayOutcome> days) {
        List<Run> runs = new ArrayList<>();
        LocalDate start = null;
        int length = 0;
        for (Map.Entry<LocalDate, DayOutcome> day : days.entrySet()) {
            switch (day.getValue()) {
                case COUNTS -> {
                    if (length == 0) {
                        start = day.getKey();
                    }
                    length++;
                }
                case BREAKS -> {
                    if (length > 0) {
                        runs.add(new Run(start, length));
                    }
                    start = null;
                    length = 0;
                }
                case NEUTRAL -> {
                }
            }
        }
        if (length > 0) {
            runs.add(new Run(start, length));
        }
        int best = runs.stream().mapToInt(Run::length).max().orElse(0);
        return new Summary(List.copyOf(runs), length, best);
    }
}
