package com.foodbytes.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.math.BigDecimal;

/**
 * Recipe ingredient entity representing either a raw ingredient or a linked recipe.
 * FR-093: Supports linked_recipe_id for sub-recipes (e.g., Pizza Dough in Pizza).
 * Constraint: Either ingredient_id OR linked_recipe_id must be set, not both.
 */
@Entity
@Table(name = "recipe_ingredients")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class RecipeIngredient {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "recipe_id", nullable = false)
    private Recipe recipe;

    // FR-093: Made nullable - either ingredient OR linkedRecipe must be set
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ingredient_id", nullable = true)
    private Ingredient ingredient;

    // FR-093: Reference to another recipe used as ingredient (e.g., Pizza Dough)
    // When set, ingredient must be NULL. Macros calculated from linked recipe.
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "linked_recipe_id", nullable = true)
    private Recipe linkedRecipe;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal quantity;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "unit_id", nullable = false)
    private Unit unit;

    // FR-084, FR-093: Gram equivalent for macro calculation.
    // For raw ingredients: actual weight in grams.
    // For linked recipes: portion of linked recipe's total yield (e.g., 280g of 761g dough).
    @Column(name = "quantity_grams", nullable = false, precision = 10, scale = 2)
    private BigDecimal quantityGrams;

    @Column(name = "sort_order")
    private Integer sortOrder = 0;

    /**
     * FR-093: Check if this ingredient is a linked recipe reference.
     */
    public boolean isLinkedRecipe() {
        return linkedRecipe != null;
    }

    /**
     * FR-093: Check if this ingredient is a raw ingredient reference.
     */
    public boolean isRawIngredient() {
        return ingredient != null;
    }
}
