package com.foodbytes.repository;

import com.foodbytes.model.UserHiddenRecipe;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Repository
public interface UserHiddenRecipeRepository extends JpaRepository<UserHiddenRecipe, Long> {
    List<UserHiddenRecipe> findByUserId(Long userId);
    boolean existsByUserIdAndRecipeId(Long userId, Long recipeId);

    /**
     * Idempotent hide: a concurrent duplicate converges on the unique (user_id, recipe_id) key instead
     * of throwing, which would otherwise mark the surrounding transaction rollback-only.
     */
    @Modifying
    @Query(value = "INSERT INTO user_hidden_recipes (user_id, recipe_id) VALUES (:userId, :recipeId) " +
                   "ON DUPLICATE KEY UPDATE user_id = user_id", nativeQuery = true)
    void insertIfAbsent(@Param("userId") Long userId, @Param("recipeId") Long recipeId);

    @Modifying
    @Transactional
    long deleteByUserIdAndRecipeId(Long userId, Long recipeId);
}
