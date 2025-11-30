package com.foodbytes.repository;

import com.foodbytes.model.Ingredient;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface IngredientRepository extends JpaRepository<Ingredient, Long> {

    Optional<Ingredient> findByKey(String key);

    Optional<Ingredient> findByName(String name);

    @Query("SELECT i FROM Ingredient i JOIN FETCH i.aisle ORDER BY i.aisle.displayOrder, i.name")
    List<Ingredient> findAllWithAisle();
}
