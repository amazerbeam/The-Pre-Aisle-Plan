package com.foodbytes.repository;

import com.foodbytes.model.Ingredient;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.EntityGraph;
import java.util.List;
import java.util.Optional;

public interface IngredientRepository extends JpaRepository<Ingredient, Long> {
    Optional<Ingredient> findByKey(String key);
    Optional<Ingredient> findByName(String name);

    @EntityGraph(attributePaths = {"aisle"})
    List<Ingredient> findAllByOrderByNameAsc();
}
