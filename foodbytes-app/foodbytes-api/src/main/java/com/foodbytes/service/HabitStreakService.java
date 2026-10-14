package com.foodbytes.service;

import com.foodbytes.dto.HabitAnswerRequest;
import com.foodbytes.dto.HabitFirstAnswerRequest;
import com.foodbytes.dto.HabitStatusDTO;
import com.foodbytes.model.Habit;
import com.foodbytes.model.PetHabitDay;
import com.foodbytes.model.PetHabitStreak;
import com.foodbytes.repository.PetHabitDayRepository;
import com.foodbytes.repository.PetHabitStreakRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Clock;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

/**
 * MPP-20: the caller's own snack-free / alcohol-free streaks. Always keyed by the caller's id —
 * never users.meal_plan_owner_id (per-person Pip, MPP-33). Date rules live in HabitStreakPolicy.
 *
 * Every answer logs exactly coversFrom..today and then moves last_answered_date to today, so the
 * logged ranges never overlap and a repeat clean answer has nothing left to credit.
 */
@Service
@RequiredArgsConstructor
public class HabitStreakService {

    private final PetHabitStreakRepository streakRepository;
    private final PetHabitDayRepository dayRepository;
    private final Clock clock;

    /** Both habits, SNACK then ALCOHOL. Never writes: a missing row reads as "never answered". */
    @Transactional(readOnly = true)
    public List<HabitStatusDTO> getHabits(Long userId) {
        LocalDate today = HabitStreakPolicy.today(clock);
        Map<Habit, PetHabitStreak> rows = streakRepository.findByUserId(userId).stream()
                .collect(Collectors.toMap(PetHabitStreak::getHabit, Function.identity()));
        return Arrays.stream(Habit.values())
                .map(habit -> HabitStreakPolicy.toDTO(habit, rows.get(habit), today))
                .toList();
    }

    /**
     * clean = true credits every day from coversFrom to today (idempotent once today is answered).
     * clean = false logs the lapse day as not clean, credits the days either side of it, restarts
     * the streak the day after the lapse and keeps best.
     *
     * @throws IllegalArgumentException when a lapse falls outside coversFrom..today
     */
    @Transactional
    public HabitStatusDTO answer(Long userId, Habit habit, HabitAnswerRequest request) {
        LocalDate today = HabitStreakPolicy.today(clock);
        streakRepository.ensureRow(userId, habit.name());
        PetHabitStreak row = streakRepository.findForUpdate(userId, habit)
                .orElseThrow(() -> new IllegalStateException("Habit row missing after ensureRow: " + habit));
        LocalDate from = HabitStreakPolicy.coversFrom(row.getLastAnsweredDate(), today);

        if (Boolean.TRUE.equals(request.getClean())) {
            if (from.isAfter(today)) {
                return HabitStreakPolicy.toDTO(habit, row, today);
            }
            logDays(userId, habit, from, today, null);
            if (row.getStreakStart() == null) {
                row.setStreakStart(from);
            }
        } else {
            LocalDate lapse = request.getLapseDate();
            HabitStreakPolicy.requireLapseInWindow(lapse, from, today);
            logDays(userId, habit, from, today, lapse);
            // Clean days before the lapse still extend the old run, so they can still raise best
            LocalDate runStart = row.getStreakStart() != null ? row.getStreakStart() : from;
            raiseBest(row, HabitStreakPolicy.current(runStart, lapse.minusDays(1)));
            row.setStreakStart(lapse.plusDays(1));
        }

        row.setLastAnsweredDate(today);
        raiseBest(row, HabitStreakPolicy.current(row.getStreakStart(), today));
        streakRepository.save(row);
        return HabitStreakPolicy.toDTO(habit, row, today);
    }

    /**
     * MPP-35: the one-time "When did you last have a snack / a drink?" answer, asked instead of the
     * daily question while the habit has never been answered. lastDate null ("Can't remember")
     * credits today only; otherwise the lapse day (if inside the 30-day window) is logged not clean
     * and every day after it to today clean, so the run is at most 30 days. Then the daily check-in
     * takes over from tomorrow.
     *
     * @throws IllegalArgumentException when already answered, or lastDate is outside today-30..today
     */
    @Transactional
    public HabitStatusDTO firstAnswer(Long userId, Habit habit, HabitFirstAnswerRequest request) {
        LocalDate today = HabitStreakPolicy.today(clock);
        streakRepository.ensureRow(userId, habit.name());
        PetHabitStreak row = streakRepository.findForUpdate(userId, habit)
                .orElseThrow(() -> new IllegalStateException("Habit row missing after ensureRow: " + habit));
        if (row.getLastAnsweredDate() != null) {
            throw new IllegalArgumentException(habit + " has already been answered");
        }

        LocalDate lastDate = request.getLastDate();
        if (lastDate == null) {
            logDays(userId, habit, today, today, null);
            row.setStreakStart(today);
        } else {
            HabitStreakPolicy.requireFirstAnswerInWindow(lastDate, today);
            logDays(userId, habit, HabitStreakPolicy.firstAnswerLogFrom(lastDate, today), today, lastDate);
            row.setStreakStart(lastDate.plusDays(1));
        }

        row.setLastAnsweredDate(today);
        raiseBest(row, HabitStreakPolicy.current(row.getStreakStart(), today));
        streakRepository.save(row);
        return HabitStreakPolicy.toDTO(habit, row, today);
    }

    /** One row per day in from..today; only the lapse day (if any) is not clean. */
    private void logDays(Long userId, Habit habit, LocalDate from, LocalDate today, LocalDate lapse) {
        List<PetHabitDay> days = new ArrayList<>();
        for (LocalDate day = from; !day.isAfter(today); day = day.plusDays(1)) {
            days.add(new PetHabitDay(null, userId, habit, day, !day.equals(lapse)));
        }
        dayRepository.saveAll(days);
    }

    private static void raiseBest(PetHabitStreak row, int streak) {
        row.setBest(Math.max(row.getBest(), streak));
    }
}
