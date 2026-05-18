package com.foodbytes.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.math.BigDecimal;

/**
 * Shopping List Item entity - represents a single ingredient in a persisted shopping list.
 * Stores snapshot data at generation time plus checked state.
 */
@Entity
@Table(name = "shopping_list_items")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ShoppingListItem {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "shopping_list_id", nullable = false)
    private ShoppingList shoppingList;

    @Column(name = "ingredient_id", nullable = false)
    private Long ingredientId;

    @Column(name = "ingredient_name", nullable = false)
    private String ingredientName;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal quantity;

    @Column(nullable = false, length = 50)
    private String unit;

    @Column(name = "aisle_id")
    private Long aisleId;

    @Column(name = "aisle_name", length = 100)
    private String aisleName;

    @Column(name = "aisle_order")
    private Short aisleOrder;

    @Column(name = "source_chain", columnDefinition = "JSON")
    private String sourceChain;  // JSON array stored as string

    @Column(name = "is_checked")
    private Boolean isChecked = false;
}
