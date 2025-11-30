package com.foodbytes.repository;

import com.foodbytes.model.Recipe;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface RecipeRepository extends JpaRepository<Recipe, Long> {

    List<Recipe> findByIsDeletedFalse();

    List<Recipe> findByIsLiveTrueAndIsDeletedFalse();

    Optional<Recipe> findByIdAndIsDeletedFalse(Long id);
}
