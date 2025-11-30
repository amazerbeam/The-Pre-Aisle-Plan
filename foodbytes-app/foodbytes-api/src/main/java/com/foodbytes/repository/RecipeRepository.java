package com.foodbytes.repository;

import com.foodbytes.model.Recipe;
import com.foodbytes.model.MealType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface RecipeRepository extends JpaRepository<Recipe, Long> {

    @Query("SELECT DISTINCT r FROM Recipe r LEFT JOIN FETCH r.meals WHERE r.isLive = true")
    List<Recipe> findAllLiveRecipes();

    @Query("SELECT DISTINCT r FROM Recipe r JOIN FETCH r.meals m WHERE r.isLive = true AND m.mealType = :mealType")
    List<Recipe> findByMealType(@Param("mealType") MealType mealType);

    @Query("SELECT DISTINCT r FROM Recipe r LEFT JOIN FETCH r.meals WHERE r.isLive = true AND LOWER(r.name) LIKE LOWER(CONCAT('%', :query, '%'))")
    List<Recipe> searchByName(@Param("query") String query);
}
