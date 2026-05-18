package com.foodbytes.repository;

import com.foodbytes.model.MealPlanTemplate;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface MealPlanTemplateRepository extends JpaRepository<MealPlanTemplate, Long> {

    @Query("SELECT t FROM MealPlanTemplate t " +
           "WHERE t.user.id = :userId " +
           "ORDER BY LOWER(t.name)")
    List<MealPlanTemplate> findByUserId(@Param("userId") Long userId);

    Optional<MealPlanTemplate> findByIdAndUserId(Long id, Long userId);

    boolean existsByUserIdAndNameIgnoreCase(Long userId, String name);

    @Query("SELECT t FROM MealPlanTemplate t WHERE t.user.id = :userId AND LOWER(t.name) = LOWER(:name)")
    Optional<MealPlanTemplate> findByUserIdAndNameIgnoreCase(@Param("userId") Long userId, @Param("name") String name);
}
