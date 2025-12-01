package com.foodbytes.repository;

import com.foodbytes.model.Meal;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface MealRepository extends JpaRepository<Meal, Long> {
    Optional<Meal> findByKey(String key);
    List<Meal> findAllByOrderByDisplayOrderAsc();
}
