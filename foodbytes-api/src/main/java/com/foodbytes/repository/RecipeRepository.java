package com.foodbytes.repository;

import com.foodbytes.model.Recipe;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface RecipeRepository extends JpaRepository<Recipe, Long> {

    List<Recipe> findByIsLiveAndIsDeleted(Boolean isLive, Boolean isDeleted);

    List<Recipe> findByNameContainingIgnoreCaseAndIsLiveAndIsDeleted(String name, Boolean isLive, Boolean isDeleted);

    List<Recipe> findByIsDeleted(Boolean isDeleted);

    List<Recipe> findByNameContainingIgnoreCaseAndIsDeleted(String name, Boolean isDeleted);

    @Query("SELECT r FROM Recipe r JOIN r.meals rm WHERE rm.meal.id = :mealId AND r.isLive = :isLive AND r.isDeleted = :isDeleted")
    List<Recipe> findByMealIdAndIsLiveAndIsDeleted(@Param("mealId") Long mealId, @Param("isLive") Boolean isLive, @Param("isDeleted") Boolean isDeleted);

    @Query("SELECT r FROM Recipe r JOIN r.meals rm WHERE rm.meal.id = :mealId AND r.isDeleted = :isDeleted")
    List<Recipe> findByMealIdAndIsDeleted(@Param("mealId") Long mealId, @Param("isDeleted") Boolean isDeleted);

    @Query("SELECT r FROM Recipe r JOIN r.meals rm WHERE rm.meal.key = :mealKey AND r.isLive = :isLive AND r.isDeleted = :isDeleted")
    List<Recipe> findByMealKeyAndIsLiveAndIsDeleted(@Param("mealKey") String mealKey, @Param("isLive") Boolean isLive, @Param("isDeleted") Boolean isDeleted);

    @Query("SELECT r FROM Recipe r JOIN r.meals rm WHERE rm.meal.key = :mealKey AND r.isDeleted = :isDeleted")
    List<Recipe> findByMealKeyAndIsDeleted(@Param("mealKey") String mealKey, @Param("isDeleted") Boolean isDeleted);

    Optional<Recipe> findByIdAndIsDeleted(Long id, Boolean isDeleted);
}
