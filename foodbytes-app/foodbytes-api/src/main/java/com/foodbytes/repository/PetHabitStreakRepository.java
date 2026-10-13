package com.foodbytes.repository;

import com.foodbytes.model.Habit;
import com.foodbytes.model.PetHabitStreak;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

/** MPP-20: one summary row per (user, habit). */
@Repository
public interface PetHabitStreakRepository extends JpaRepository<PetHabitStreak, Long> {

    /** Both habit rows for one user (0–2 rows). */
    List<PetHabitStreak> findByUserId(Long userId);

    /**
     * Creates the row on a person's first answer, or leaves an existing one untouched. Parallel
     * first answers converge on the unique key instead of failing.
     */
    @Modifying
    @Query(value = "INSERT INTO pet_habit_streaks (user_id, habit, best) VALUES (:userId, :habit, 0) " +
                   "ON DUPLICATE KEY UPDATE id = id",
           nativeQuery = true)
    void ensureRow(@Param("userId") Long userId, @Param("habit") String habit);

    /** SELECT … FOR UPDATE: serialises answers for the same person and habit. */
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT s FROM PetHabitStreak s WHERE s.userId = :userId AND s.habit = :habit")
    Optional<PetHabitStreak> findForUpdate(@Param("userId") Long userId, @Param("habit") Habit habit);
}
