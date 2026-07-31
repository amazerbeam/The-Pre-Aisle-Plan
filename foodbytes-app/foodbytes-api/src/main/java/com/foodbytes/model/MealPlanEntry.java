package com.foodbytes.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.ToString;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * Meal Plan Entry entity - represents a recipe assigned to a specific date and meal type for a user.
 * Supports FR-007 (date range), FR-014 (assign to days), FR-015 (remove), FR-016 (calendar view), FR-017 (calories).
 */
@Entity
@Table(name = "meal_plan_entries")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class MealPlanEntry {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    @ToString.Exclude
    private User user;

    @Column(name = "plan_date", nullable = false)
    private LocalDate planDate;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "meal_id", nullable = false)
    private Meal meal;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "recipe_id", nullable = false)
    @ToString.Exclude
    private Recipe recipe;

    @Column(nullable = false, precision = 4, scale = 2)
    private BigDecimal servings = BigDecimal.ONE;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    /**
     * Calculate per-serving calories for this entry (FR-017).
     * Uses the recipe's total calories divided by default servings.
     */
    public Integer getCaloriesPerServing() {
        if (recipe == null || recipe.getCalories() == null || recipe.getDefaultServings() == null) {
            return 0;
        }
        return recipe.getCalories() / recipe.getDefaultServings();
    }

    // Identity is the primary key — see Recipe#equals. `recipe` is EAGER, so a
    // field-based hashCode reaches Recipe's cyclic association graph immediately.
    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof MealPlanEntry other)) return false;
        return id != null && id.equals(other.getId());
    }

    @Override
    public int hashCode() {
        return MealPlanEntry.class.hashCode();
    }
}
