package com.foodbytes.repository;

import com.foodbytes.model.Habit;
import com.foodbytes.model.PetHabitDay;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.time.LocalDate;
import java.util.List;

/** MPP-20: per-person, per-day habit answers. Written by HabitStreakService; read by MPP-31. */
@Repository
public interface PetHabitDayRepository extends JpaRepository<PetHabitDay, Long> {

    List<PetHabitDay> findByUserIdAndHabitOrderByDayAsc(Long userId, Habit habit);

    /**
     * MPP-31: every habit answer this user logged before `day` (today), oldest first. The first
     * row's day is where Pip's growth history starts; earlier days are unscored by rule.
     */
    List<PetHabitDay> findByUserIdAndDayBeforeOrderByDayAsc(Long userId, LocalDate day);
}
