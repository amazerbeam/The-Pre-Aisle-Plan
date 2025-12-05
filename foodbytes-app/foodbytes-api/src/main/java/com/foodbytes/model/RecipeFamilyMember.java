package com.foodbytes.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

/**
 * FR-043: Recipe Family Member entity.
 * Links a recipe to a family with variant label and ordering.
 */
@Entity
@Table(name = "recipe_family_members")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class RecipeFamilyMember {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "family_id", nullable = false)
    private RecipeFamily family;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "recipe_id", nullable = false)
    private Recipe recipe;

    @Column(name = "is_default")
    private Boolean isDefault = false;

    @Column(name = "variant_label", length = 100)
    private String variantLabel;

    @Column(name = "display_order")
    private Integer displayOrder = 0;
}
