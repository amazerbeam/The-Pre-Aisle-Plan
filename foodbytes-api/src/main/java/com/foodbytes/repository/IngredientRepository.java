package com.foodbytes.repository;

import com.foodbytes.model.Ingredient;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface IngredientRepository extends JpaRepository<Ingredient, Long> {

    Optional<Ingredient> findByKey(String key);

    List<Ingredient> findByAisleIdOrderByName(Long aisleId);
}
