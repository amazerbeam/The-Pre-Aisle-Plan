package com.foodbytes.repository;

import com.foodbytes.model.Habit;
import com.foodbytes.model.PetHabitDay;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

/** MPP-20: per-person, per-day habit answers. Written by HabitStreakService; read by MPP-31. */
@Repository
public interface PetHabitDayRepository extends JpaRepository<PetHabitDay, Long> {

    List<PetHabitDay> findByUserIdAndHabitOrderByDayAsc(Long userId, Habit habit);
}
