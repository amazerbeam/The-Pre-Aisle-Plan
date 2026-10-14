package com.foodbytes.repository;

import com.foodbytes.model.MealPlanEntryEaten;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Collection;
import java.util.List;
import java.util.Optional;

/** MPP-33: per-person eaten ticks on shared meal plan entries. */
@Repository
public interface MealPlanEntryEatenRepository extends JpaRepository<MealPlanEntryEaten, Long> {

    /** One user's ticks for a batch of entries (week and assignment reads). */
    List<MealPlanEntryEaten> findByUserIdAndMealPlanEntryIdIn(Long userId, Collection<Long> mealPlanEntryIds);

    Optional<MealPlanEntryEaten> findByMealPlanEntryIdAndUserId(Long mealPlanEntryId, Long userId);

    /**
     * MPP-22: plan date of this user's earliest tick, or empty with no ticks. No counted plan day can
     * exist before it, so the plan streak scans from here.
     */
    @Query("SELECT MIN(mpe.planDate) FROM MealPlanEntry mpe, MealPlanEntryEaten t " +
           "WHERE t.mealPlanEntryId = mpe.id AND t.userId = :userId")
    Optional<LocalDate> findEarliestEatenPlanDate(@Param("userId") Long userId);

    /**
     * MPP-22: ids of this user's ticked entries whose plan date falls in [from, to]. Bounded by the
     * date range, so the plan streak never ships an ever-growing id list.
     */
    @Query("SELECT t.mealPlanEntryId FROM MealPlanEntryEaten t, MealPlanEntry mpe " +
           "WHERE t.mealPlanEntryId = mpe.id AND t.userId = :userId " +
           "AND mpe.planDate >= :from AND mpe.planDate <= :to")
    List<Long> findEatenEntryIdsInRange(@Param("userId") Long userId,
                                        @Param("from") LocalDate from,
                                        @Param("to") LocalDate to);

    /**
     * Idempotent tick: inserts the row, or leaves an existing one untouched so the first eaten_at
     * survives. Parallel ticks by the same user converge instead of failing on the unique key.
     */
    @Modifying
    @Query(value = "INSERT INTO meal_plan_entry_eaten (meal_plan_entry_id, user_id, eaten_at) " +
                   "VALUES (:entryId, :userId, :eatenAt) ON DUPLICATE KEY UPDATE eaten_at = eaten_at",
           nativeQuery = true)
    void insertIfAbsent(@Param("entryId") Long entryId,
                        @Param("userId") Long userId,
                        @Param("eatenAt") LocalDateTime eatenAt);

    /** Untick: removes only this user's row; a no-op when absent. */
    @Modifying
    @Query("DELETE FROM MealPlanEntryEaten e WHERE e.mealPlanEntryId = :entryId AND e.userId = :userId")
    int deleteByEntryAndUser(@Param("entryId") Long entryId, @Param("userId") Long userId);
}
