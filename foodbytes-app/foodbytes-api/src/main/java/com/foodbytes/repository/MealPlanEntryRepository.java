package com.foodbytes.repository;

import com.foodbytes.model.MealPlanEntry;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.time.LocalDate;
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
