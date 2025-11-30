package com.foodbytes.repository;

import com.foodbytes.model.RecipeMeal;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RecipeMealRepository extends JpaRepository<RecipeMeal, Long> {

    List<RecipeMeal> findByRecipeId(Long recipeId);

    void deleteByRecipeId(Long recipeId);
}
