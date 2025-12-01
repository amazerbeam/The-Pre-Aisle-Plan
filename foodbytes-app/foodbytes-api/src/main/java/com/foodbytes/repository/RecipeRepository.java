package com.foodbytes.repository;

import com.foodbytes.model.Recipe;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface RecipeRepository extends JpaRepository<Recipe, Long> {

    @EntityGraph(attributePaths = {
        "ingredients", "ingredients.ingredient", "ingredients.ingredient.aisle",
        "ingredients.unit", "steps", "meals", "meals.meal"
    })
    Optional<Recipe> findWithDetailsById(Long id);

    @EntityGraph(attributePaths = {"meals", "meals.meal"})
    List<Recipe> findByIsLiveTrueOrderByNameAsc();

    @Query("SELECT DISTINCT r FROM Recipe r LEFT JOIN FETCH r.meals rm LEFT JOIN FETCH rm.meal WHERE r.isLive = true")
    List<Recipe> findAllLiveRecipes();

    @Query("SELECT DISTINCT r FROM Recipe r JOIN FETCH r.meals rm JOIN FETCH rm.meal m WHERE r.isLive = true AND m.key = :mealKey")
    List<Recipe> findByMealKey(@Param("mealKey") String mealKey);

    @Query("SELECT DISTINCT r FROM Recipe r LEFT JOIN FETCH r.meals rm LEFT JOIN FETCH rm.meal WHERE r.isLive = true AND LOWER(r.name) LIKE LOWER(CONCAT('%', :query, '%'))")
    List<Recipe> searchByName(@Param("query") String query);

    // Admin methods - see all recipes including hidden
    @EntityGraph(attributePaths = {"meals", "meals.meal"})
    List<Recipe> findAllByOrderByNameAsc();
}
