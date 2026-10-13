package com.foodbytes.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

/**
 * MPP-33: one person's "I ate this" tick on a shared meal plan entry. The entry is shared by linked
 * users (users.meal_plan_owner_id); the tick is not. Absence of a row means not eaten.
 * Plain id columns (no associations), as MealPlanEntryExtraChoice: rows are always read in bulk by
 * entry id for one user, and MySQL cascades them away with their entry or user.
 */
@Entity
@Table(name = "meal_plan_entry_eaten", uniqueConstraints = {
    @UniqueConstraint(name = "uk_mpe_eaten_entry_user", columnNames = {"meal_plan_entry_id", "user_id"})
})
@Data
@NoArgsConstructor
@AllArgsConstructor
public class MealPlanEntryEaten {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "meal_plan_entry_id", nullable = false)
    private Long mealPlanEntryId;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    // UTC wall time of this person's first tick (the JDBC URL pins serverTimezone=UTC)
    @Column(name = "eaten_at", nullable = false)
    private LocalDateTime eatenAt;

    // Identity is the primary key — see Recipe#equals.
    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof MealPlanEntryEaten other)) return false;
        return id != null && id.equals(other.getId());
    }

    @Override
    public int hashCode() {
        return MealPlanEntryEaten.class.hashCode();
    }
}
