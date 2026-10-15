package com.foodbytes.repository;

import com.foodbytes.model.MealPlanEntry;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.time.LocalDate;
import java.util.Collection;
import java.util.List;
import java.util.Optional;

/**
 * Repository for MealPlanEntry operations.
 * Supports FR-007 (date range), FR-014 (assign), FR-015 (remove), FR-016 (calendar view).
 */
@Repository
public interface MealPlanEntryRepository extends JpaRepository<MealPlanEntry, Long> {

    /**
     * FR-007, FR-016: Get all meal plan entries for a user within a date range.
     * Eagerly fetches recipe, meal, and recipe meals to avoid N+1 queries.
     * Results are ordered by date, then by meal display order.
     *
     * @param userId User ID
     * @param startDate Start date (inclusive)
     * @param endDate End date (exclusive)
     * @return List of meal plan entries
     */
    @Query("SELECT mpe FROM MealPlanEntry mpe " +
           "JOIN FETCH mpe.meal m " +
           "JOIN FETCH mpe.recipe r " +
           "WHERE mpe.user.id = :userId " +
           "AND mpe.planDate >= :startDate " +
           "AND mpe.planDate < :endDate " +
           "ORDER BY mpe.planDate, m.displayOrder")
    List<MealPlanEntry> findByUserIdAndDateRange(
        @Param("userId") Long userId,
        @Param("startDate") LocalDate startDate,
        @Param("endDate") LocalDate endDate
    );

    /**
     * MPP-10: every entry of an owner dated on or after fromDate — used by the one-time
     * localStorage import to fill the current and future weeks.
     */
    @Query("SELECT mpe FROM MealPlanEntry mpe WHERE mpe.user.id = :userId AND mpe.planDate >= :fromDate")
    List<MealPlanEntry> findByUserIdFromDate(@Param("userId") Long userId, @Param("fromDate") LocalDate fromDate);

    /**
     * FR-014: Check if a specific recipe is already assigned to a date/meal for a user.
     * Used for toggle behavior - if exists, we remove it; if not, we create it.
     *
     * @param userId User ID
     * @param planDate The date
     * @param mealId Meal type ID (breakfast, lunch, etc.)
     * @param recipeId Recipe ID
     * @return Optional containing the entry if found
     */
    Optional<MealPlanEntry> findByUserIdAndPlanDateAndMealIdAndRecipeId(
        Long userId, LocalDate planDate, Long mealId, Long recipeId
    );

    /**
     * FR-015: Find entry by ID and user ID.
     * Security check to ensure user can only delete their own entries.
     *
     * @param id Entry ID
     * @param userId User ID
     * @return Optional containing the entry if found and owned by user
     */
    Optional<MealPlanEntry> findByIdAndUserId(Long id, Long userId);

    /**
     * FR-037: Find any recipe assigned to a specific date/meal slot for a user.
     * Used to implement single-recipe-per-slot constraint and swap behavior.
     *
     * @param userId User ID
     * @param planDate The date
     * @param mealId Meal type ID (breakfast, lunch, etc.)
     * @return Optional containing the entry if slot is occupied
     */
    Optional<MealPlanEntry> findByUserIdAndPlanDateAndMealId(Long userId, LocalDate planDate, Long mealId);

    /**
     * Get all entries for a specific user and date.
     * Useful for checking daily assignments.
     *
     * @param userId User ID
     * @param planDate The date
     * @return List of entries for that day
     */
    List<MealPlanEntry> findByUserIdAndPlanDate(Long userId, LocalDate planDate);

    /**
     * FR-014: Get all entries for a specific recipe across a date range.
     * Used to show which days a recipe is assigned to in the RecipeCard.
     *
     * @param userId User ID
     * @param recipeId Recipe ID
     * @param startDate Start date (inclusive)
     * @param endDate End date (exclusive)
     * @return List of entries for this recipe in the date range
     */
    @Query("SELECT mpe FROM MealPlanEntry mpe " +
           "WHERE mpe.user.id = :userId " +
           "AND mpe.recipe.id = :recipeId " +
           "AND mpe.planDate >= :startDate " +
           "AND mpe.planDate < :endDate")
    List<MealPlanEntry> findByUserIdAndRecipeIdAndDateRange(
        @Param("userId") Long userId,
        @Param("recipeId") Long recipeId,
        @Param("startDate") LocalDate startDate,
        @Param("endDate") LocalDate endDate
    );

    /** MPP-22: id + date of one planned slot, without loading the recipe. */
    interface PlannedMealSlot {
        Long getId();
        LocalDate getPlanDate();
    }

    /**
     * MPP-22: the owner's planned slots of the given meal types (breakfast/lunch/dinner for the plan
     * streak) between from and to, both inclusive.
     */
    @Query("SELECT mpe.id AS id, mpe.planDate AS planDate FROM MealPlanEntry mpe " +
           "WHERE mpe.user.id = :ownerId " +
           "AND mpe.meal.key IN :mealKeys " +
           "AND mpe.planDate >= :from " +
           "AND mpe.planDate <= :to")
    List<PlannedMealSlot> findMainMealSlots(
        @Param("ownerId") Long ownerId,
        @Param("mealKeys") Collection<String> mealKeys,
        @Param("from") LocalDate from,
        @Param("to") LocalDate to
    );

    /** MPP-42: meal key + date of one planned slot, without loading the recipe. */
    interface MealSlotContext {
        Long getId();
        String getMealKey();
        LocalDate getPlanDate();
    }

    /** MPP-42: one query for the meal context of many entries (sprinkle history). */
    @Query("SELECT mpe.id AS id, mpe.meal.key AS mealKey, mpe.planDate AS planDate FROM MealPlanEntry mpe " +
           "WHERE mpe.id IN :ids")
    List<MealSlotContext> findMealSlotContextByIdIn(@Param("ids") Collection<Long> ids);

    /**
     * MPP-24: the owner's dates in [from, to] that have every one of mealKeys planned (keyCount =
     * mealKeys.size()). Feeds PetFirstPolicy.containsFullWeek; same rule as the migration's backfill 3/4.
     */
    @Query("SELECT mpe.planDate FROM MealPlanEntry mpe " +
           "WHERE mpe.user.id = :ownerId " +
           "AND mpe.meal.key IN :mealKeys " +
           "AND mpe.planDate >= :from " +
           "AND mpe.planDate <= :to " +
           "GROUP BY mpe.planDate " +
           "HAVING COUNT(DISTINCT mpe.meal.key) = :keyCount")
    List<LocalDate> findFullyPlannedDates(
        @Param("ownerId") Long ownerId,
        @Param("mealKeys") Collection<String> mealKeys,
        @Param("from") LocalDate from,
        @Param("to") LocalDate to,
        @Param("keyCount") long keyCount
    );

    /**
     * Delete all entries for a user within a date range.
     * Used by copy-week to clear the target week before inserting copied entries.
     *
     * @param userId User ID
     * @param startDate Start date (inclusive)
     * @param endDate End date (exclusive)
     */
    @Modifying
    @Query("DELETE FROM MealPlanEntry mpe WHERE mpe.user.id = :userId AND mpe.planDate >= :startDate AND mpe.planDate < :endDate")
    void deleteByUserIdAndDateRange(
        @Param("userId") Long userId,
        @Param("startDate") LocalDate startDate,
        @Param("endDate") LocalDate endDate
    );

    /**
     * Delete all entries for a user (for account cleanup).
     *
     * @param userId User ID
     */
    void deleteByUserId(Long userId);
}
