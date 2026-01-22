package com.foodbytes.repository;

import com.foodbytes.model.ShoppingList;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.Optional;

/**
 * Repository for ShoppingList operations.
 * Each user has at most one shopping list at a time.
 */
@Repository
public interface ShoppingListRepository extends JpaRepository<ShoppingList, Long> {

    /**
     * Find the shopping list for a user.
     * Uses effective owner ID for shared meal plans.
     *
     * @param userId User ID (or effective owner ID)
     * @return Optional containing the shopping list if exists
     */
    Optional<ShoppingList> findByUserId(Long userId);

    /**
     * Find shopping list by ID and user ID.
     * Security check to ensure user can only access their own list.
     *
     * @param id Shopping list ID
     * @param userId User ID
     * @return Optional containing the shopping list if found and owned by user
     */
    Optional<ShoppingList> findByIdAndUserId(Long id, Long userId);

    /**
     * Delete the shopping list for a user.
     *
     * @param userId User ID
     */
    @Modifying
    void deleteByUserId(Long userId);

    /**
     * Check if a user has a shopping list.
     *
     * @param userId User ID
     * @return true if shopping list exists
     */
    boolean existsByUserId(Long userId);
}
