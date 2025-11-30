package com.foodbytes.repository;

import com.foodbytes.model.MealPlanEntry;
import com.foodbytes.model.MealType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface MealPlanRepository extends JpaRepository<MealPlanEntry, Long> {

    @Query("SELECT m FROM MealPlanEntry m WHERE m.user.id = :userId AND m.planDate BETWEEN :from AND :to ORDER BY m.planDate, m.mealType")
    List<MealPlanEntry> findByUserIdAndDateRange(
        @Param("userId") Long userId,
        @Param("from") LocalDate from,
        @Param("to") LocalDate to
    );

    @Query("SELECT m FROM MealPlanEntry m WHERE m.user.id = :userId AND m.planDate = :date AND m.mealType = :mealType AND m.recipe.id = :recipeId")
    Optional<MealPlanEntry> findExistingEntry(
        @Param("userId") Long userId,
        @Param("date") LocalDate date,
        @Param("mealType") MealType mealType,
        @Param("recipeId") Long recipeId
    );

    @Query("SELECT m FROM MealPlanEntry m WHERE m.id = :id AND m.user.id = :userId")
    Optional<MealPlanEntry> findByIdAndUserId(@Param("id") Long id, @Param("userId") Long userId);

    void deleteByUserIdAndPlanDateBefore(Long userId, LocalDate date);
}
