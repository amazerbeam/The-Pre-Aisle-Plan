package com.foodbytes.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

/**
 * MPP-10: per-owner default that pre-fills the add-to-day popup; written for every member of the
 * recipe's family. Absence of a row means homemade. Plain id columns (no associations); MySQL
 * cascades rows away with their user / recipes.
 */
@Entity
@Table(name = "user_extra_defaults", uniqueConstraints = {
    @UniqueConstraint(name = "uk_user_extra_default", columnNames = {"user_id", "recipe_id", "extra_recipe_id"})
})
@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserExtraDefault {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(name = "recipe_id", nullable = false)
    private Long recipeId;

    @Column(name = "extra_recipe_id", nullable = false)
    private Long extraRecipeId;

    @Column(name = "is_homemade", nullable = false)
    private Boolean homemade;

    @Column(name = "updated_at", insertable = false, updatable = false)
    private LocalDateTime updatedAt;

    // Identity is the primary key — see Recipe#equals.
    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof UserExtraDefault other)) return false;
        return id != null && id.equals(other.getId());
    }

    @Override
    public int hashCode() {
        return UserExtraDefault.class.hashCode();
    }
}
