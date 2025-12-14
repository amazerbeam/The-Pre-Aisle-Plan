package com.foodbytes.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.math.BigDecimal;

@Entity
@Table(name = "ingredients")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Ingredient {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "`key`", unique = true, nullable = false, length = 100)
    private String key;

    @Column(unique = true, nullable = false)
    private String name;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "aisle_id", nullable = false)
    private Aisle aisle;

    // FR-080: Macronutrient data per 100g
    @Column(name = "protein_per_100g", precision = 5, scale = 2, nullable = false)
    private BigDecimal proteinPer100g = BigDecimal.ZERO;

    @Column(name = "carbs_per_100g", precision = 5, scale = 2, nullable = false)
    private BigDecimal carbsPer100g = BigDecimal.ZERO;

    @Column(name = "fat_per_100g", precision = 5, scale = 2, nullable = false)
    private BigDecimal fatPer100g = BigDecimal.ZERO;

    // FR-083: Verification flag - recipes cannot go live with unverified ingredients
    @Column(name = "macros_verified", nullable = false)
    private Boolean macrosVerified = false;
}
