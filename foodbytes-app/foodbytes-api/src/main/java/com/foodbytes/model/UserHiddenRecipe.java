package com.foodbytes.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

/**
 * Per-person "Hide from my recipes". recipeId is the family's DEFAULT recipe id (or the recipe
 * itself when it has no family), so one row hides the whole family. Plain id columns (no
 * associations); MySQL cascades rows away with their user / recipe.
 */
@Entity
@Table(name = "user_hidden_recipes", uniqueConstraints = {
    @UniqueConstraint(name = "uk_user_hidden_recipe", columnNames = {"user_id", "recipe_id"})
})
@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserHiddenRecipe {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(name = "recipe_id", nullable = false)
    private Long recipeId;

    @Column(name = "created_at", insertable = false, updatable = false)
    private LocalDateTime createdAt;

    // Identity is the primary key - see Recipe#equals.
    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof UserHiddenRecipe other)) return false;
        return id != null && id.equals(other.getId());
    }

    @Override
    public int hashCode() {
        return UserHiddenRecipe.class.hashCode();
    }
}
