package com.foodbytes.repository;

import com.foodbytes.model.Recipe;
import com.foodbytes.model.RecipeAuditLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface RecipeAuditLogRepository extends JpaRepository<RecipeAuditLog, Long> {

    List<RecipeAuditLog> findByRecipeOrderByTimestampDesc(Recipe recipe);

    List<RecipeAuditLog> findByRecipeIdOrderByTimestampDesc(Long recipeId);

    List<RecipeAuditLog> findByTimestampBetweenOrderByTimestampDesc(
        LocalDateTime startDate,
        LocalDateTime endDate
    );

    List<RecipeAuditLog> findAllByOrderByTimestampDesc();
}
