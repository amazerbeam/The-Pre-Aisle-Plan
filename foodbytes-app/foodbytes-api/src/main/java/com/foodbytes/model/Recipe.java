package com.foodbytes.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.ToString;
import org.hibernate.annotations.BatchSize;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Entity
@Table(name = "recipes")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Recipe {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(name = "default_servings")
    private Integer defaultServings = 2;

    private Integer calories;

    @Column(name = "is_cheat")
    private Boolean isCheat = false;

    @Column(name = "is_live")
    private Boolean isLive = true;

    @Column(name = "macros_audited", nullable = false)
    private Boolean macrosAudited = false;

    @Column(name = "macros_audited_at")
    private LocalDateTime macrosAuditedAt;

    /**
     * users.id of the admin who signed off the macros. Deliberately a plain FK column
     * rather than a @ManyToOne User: Recipe is mapped in list views and an extra lazy
     * association would risk an N+1 for a field the UI never renders.
     */
    @Column(name = "macros_audited_by")
    private Long macrosAuditedBy;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @OneToMany(mappedBy = "recipe", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @ToString.Exclude
    private Set<RecipeMeal> meals = new HashSet<>();

    @OneToMany(mappedBy = "recipe", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @OrderBy("sortOrder ASC")
    @BatchSize(size = 20)
    @ToString.Exclude
    private List<RecipeIngredient> ingredients = new ArrayList<>();

    @OneToMany(mappedBy = "recipe", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @OrderBy("stepNumber ASC")
    @BatchSize(size = 20)
    @ToString.Exclude
    private List<RecipeStep> steps = new ArrayList<>();

    // FR-086: Recipes that are "extras" (sub-recipes) for this recipe
    @OneToMany(mappedBy = "parentRecipe", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @OrderBy("displayOrder ASC")
    @ToString.Exclude
    private List<RecipeExtra> extras = new ArrayList<>();

    /**
     * Identity is the primary key, never the fields.
     *
     * Lombok's {@code @Data} would otherwise derive equals/hashCode from every
     * field, including the association collections above. Each of those elements
     * holds a back-reference to this Recipe, so a field-based hashCode recurses
     * Recipe -> meals -> RecipeMeal -> recipe -> Recipe until the stack overflows.
     * Hibernate 6 hashes entities whenever it de-duplicates a {@code SELECT DISTINCT}
     * result (see RecipeRepository#findByMealKey), so this is reachable from an
     * ordinary read, not just from application code.
     *
     * hashCode is a class-level constant so it stays stable across the
     * transient -> persistent transition, and equals treats two id-less
     * instances as distinct — RecipeService adds unsaved RecipeMeals to the
     * {@code meals} HashSet before flush, and id-only equality would silently
     * collapse them into one.
     */
    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof Recipe other)) return false;
        return id != null && id.equals(other.getId());
    }

    @Override
    public int hashCode() {
        return Recipe.class.hashCode();
    }

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
