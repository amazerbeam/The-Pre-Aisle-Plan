package com.foodbytes.repository;

import com.foodbytes.model.MealPlanEntryEaten;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
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
