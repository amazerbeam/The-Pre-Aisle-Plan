package com.foodbytes.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.ToString;

@Entity
@Table(name = "recipe_meals")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class RecipeMeal {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "recipe_id", nullable = false)
    @ToString.Exclude
    private Recipe recipe;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "meal_id", nullable = false)
    private Meal meal;

    // Identity is the primary key — see Recipe#equals. The `recipe` back-reference
    // makes any field-based equals/hashCode infinitely recursive.
    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof RecipeMeal other)) return false;
        return id != null && id.equals(other.getId());
    }

    @Override
    public int hashCode() {
        return RecipeMeal.class.hashCode();
    }
}
