package com.foodbytes.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.ToString;

/**
 * FR-086: Recipe Extras - Links parent recipes to sub-recipes (extras).
 * Creates hierarchical relationships like: Pizza -> Pizza Dough, Pizza Sauce -> Pesto
 */
@Entity
@Table(name = "recipe_extras")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class RecipeExtra {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // The recipe that uses this extra (e.g., Pizza)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "parent_recipe_id", nullable = false)
    @ToString.Exclude
    private Recipe parentRecipe;

    // The extra recipe being linked (e.g., Pizza Sauce)
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "child_recipe_id", nullable = false)
    @ToString.Exclude
    private Recipe childRecipe;

    // Order in the homemade selection popup
    @Column(name = "display_order")
    private Integer displayOrder = 0;

    // Identity is the primary key — see Recipe#equals. `childRecipe` is EAGER, so
    // a field-based hashCode would walk the whole extras tree before recursing.
    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof RecipeExtra other)) return false;
        return id != null && id.equals(other.getId());
    }

    @Override
    public int hashCode() {
        return RecipeExtra.class.hashCode();
    }
}
