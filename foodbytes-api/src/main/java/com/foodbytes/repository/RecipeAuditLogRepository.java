package com.foodbytes.repository;

import com.foodbytes.model.RecipeAuditLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RecipeAuditLogRepository extends JpaRepository<RecipeAuditLog, Long> {

    List<RecipeAuditLog> findByRecipeIdOrderByTimestampDesc(Long recipeId);

    List<RecipeAuditLog> findAllByOrderByTimestampDesc();
}
