package com.foodbytes.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.ToString;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * FR-043: Recipe Family entity.
 * Groups related recipe variants together (e.g., different dietary versions of the same meal).
 */
@Entity
@Table(name = "recipe_families")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class RecipeFamily {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "family_name", nullable = false)
    private String familyName;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @OneToMany(mappedBy = "family", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @OrderBy("displayOrder ASC")
    @ToString.Exclude
    private List<RecipeFamilyMember> members = new ArrayList<>();

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    // Identity is the primary key — see Recipe#equals. `members` hold a `family`
    // back-reference, closing the cycle.
    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof RecipeFamily other)) return false;
        return id != null && id.equals(other.getId());
    }

    @Override
    public int hashCode() {
        return RecipeFamily.class.hashCode();
    }
}
