package com.foodbytes.repository;

import com.foodbytes.model.ShoppingListItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

/**
 * Repository for ShoppingListItem operations.
 */
@Repository
public interface ShoppingListItemRepository extends JpaRepository<ShoppingListItem, Long> {

    /**
     * Find all items for a shopping list, ordered by aisle order then ingredient name.
     *
     * @param shoppingListId Shopping list ID
     * @return List of items sorted by aisle
     */
    @Query("SELECT i FROM ShoppingListItem i " +
           "WHERE i.shoppingList.id = :shoppingListId " +
           "ORDER BY i.aisleOrder, i.ingredientName")
    List<ShoppingListItem> findByShoppingListIdOrderByAisle(@Param("shoppingListId") Long shoppingListId);

    /**
     * Find item by ID and shopping list user ID.
     * Security check to ensure user can only modify items in their own list.
     *
     * @param itemId Item ID
     * @param userId User ID
     * @return Optional containing the item if found and owned by user
     */
    @Query("SELECT i FROM ShoppingListItem i " +
           "WHERE i.id = :itemId " +
           "AND i.shoppingList.user.id = :userId")
    Optional<ShoppingListItem> findByIdAndUserId(@Param("itemId") Long itemId, @Param("userId") Long userId);

    /**
     * Toggle checked state for an item.
     * Used for optimistic updates.
     *
     * @param itemId Item ID
     */
    @Modifying
    @Query("UPDATE ShoppingListItem i SET i.isChecked = NOT i.isChecked WHERE i.id = :itemId")
    void toggleChecked(@Param("itemId") Long itemId);

    /**
     * Uncheck all items in a shopping list.
     *
     * @param shoppingListId Shopping list ID
     */
    @Modifying
    @Query("UPDATE ShoppingListItem i SET i.isChecked = false WHERE i.shoppingList.id = :shoppingListId")
    void uncheckAll(@Param("shoppingListId") Long shoppingListId);

    /**
     * Delete all items for a shopping list.
     *
     * @param shoppingListId Shopping list ID
     */
    void deleteByShoppingListId(Long shoppingListId);
}
