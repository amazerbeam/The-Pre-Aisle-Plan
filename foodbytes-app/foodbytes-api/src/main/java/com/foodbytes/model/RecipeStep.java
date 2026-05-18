package com.foodbytes.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

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
    private Recipe linkedRecipe;

    // FR-091: Alternative instruction when linked recipe is store-bought
    @Column(name = "alt_instruction", columnDefinition = "TEXT")
    private String altInstruction;
}
