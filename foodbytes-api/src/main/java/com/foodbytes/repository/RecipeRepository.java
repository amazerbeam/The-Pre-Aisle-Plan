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

    // Find all live, non-deleted recipes (for regular users)
    @Query("SELECT r FROM Recipe r WHERE r.isDeleted = false AND r.isLive = true ORDER BY r.name")
    List<Recipe> findAllLiveRecipes();

    // Find all non-deleted recipes (for admin users)
    @Query("SELECT r FROM Recipe r WHERE r.isDeleted = false ORDER BY r.name")
    List<Recipe> findAllForAdmin();

    // Find recipe by ID only if not deleted
    @Query("SELECT r FROM Recipe r WHERE r.id = :id AND r.isDeleted = false")
    Optional<Recipe> findByIdNotDeleted(@Param("id") Long id);

    // Find live recipe by ID (for regular users)
    @Query("SELECT r FROM Recipe r WHERE r.id = :id AND r.isDeleted = false AND r.isLive = true")
    Optional<Recipe> findByIdLive(@Param("id") Long id);

    // Find recipes by meal type
    @Query("SELECT DISTINCT r FROM Recipe r JOIN r.meals m WHERE m.key = :mealKey AND r.isDeleted = false AND r.isLive = true ORDER BY r.name")
    List<Recipe> findByMealType(@Param("mealKey") String mealKey);
}
