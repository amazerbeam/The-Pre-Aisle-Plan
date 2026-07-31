package com.foodbytes.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.ToString;

@Entity
@Table(name = "recipe_steps")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class RecipeStep {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "recipe_id", nullable = false)
    @ToString.Exclude
    private Recipe recipe;

    @Column(name = "step_number", nullable = false)
    private Integer stepNumber;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String instruction;

    @Column(columnDefinition = "TEXT")
    private String tip;

    // FR-091: Links step to an extras recipe (e.g., "Prepare the dough" links to Pizza Dough recipe)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "linked_recipe_id")
    @ToString.Exclude
    private Recipe linkedRecipe;

    // FR-091: Alternative instruction when linked recipe is store-bought
    @Column(name = "alt_instruction", columnDefinition = "TEXT")
    private String altInstruction;

    // Identity is the primary key — see Recipe#equals.
    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof RecipeStep other)) return false;
        return id != null && id.equals(other.getId());
    }

    @Override
    public int hashCode() {
        return RecipeStep.class.hashCode();
    }
}
