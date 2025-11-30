package com.foodbytes.repository;

import com.foodbytes.model.MealPlanEntry;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface MealPlanRepository extends JpaRepository<MealPlanEntry, Long> {

    List<MealPlanEntry> findByUserIdAndPlanDateBetween(Long userId, LocalDate startDate, LocalDate endDate);

    List<MealPlanEntry> findByUserId(Long userId);

    @Query("SELECT m FROM MealPlanEntry m WHERE m.user.id = :userId AND m.planDate BETWEEN :startDate AND :endDate AND m.recipe.isCheat = true AND m.mealType = :mealType")
    List<MealPlanEntry> findCheatMealsByUserAndDateRangeAndMealType(
        @Param("userId") Long userId,
        @Param("startDate") LocalDate startDate,
        @Param("endDate") LocalDate endDate,
        @Param("mealType") String mealType
    );
}
