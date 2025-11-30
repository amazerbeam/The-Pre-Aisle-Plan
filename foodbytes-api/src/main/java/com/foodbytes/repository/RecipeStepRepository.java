package com.foodbytes.repository;

import com.foodbytes.model.RecipeStep;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RecipeStepRepository extends JpaRepository<RecipeStep, Long> {

    List<RecipeStep> findByRecipeIdOrderByStepNumber(Long recipeId);

    void deleteByRecipeId(Long recipeId);
}
