package com.foodbytes.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

/**
 * MPP-10: homemade/store-bought choice for one extra of one template entry.
 * Absence of a row means homemade. Plain id columns (no associations): rows are always read in
 * bulk by entry id, and MySQL cascades them away with their meal_plan_template_entries row.
 */
@Entity
@Table(name = "meal_plan_template_entry_extra_choices", uniqueConstraints = {
    @UniqueConstraint(name = "uk_mpte_extra_choice", columnNames = {"template_entry_id", "extra_recipe_id"})
})
@Data
@NoArgsConstructor
@AllArgsConstructor
public class MealPlanTemplateEntryExtraChoice {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "template_entry_id", nullable = false)
    private Long templateEntryId;

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
        if (!(o instanceof MealPlanTemplateEntryExtraChoice other)) return false;
        return id != null && id.equals(other.getId());
    }

    @Override
    public int hashCode() {
        return MealPlanTemplateEntryExtraChoice.class.hashCode();
    }
}
