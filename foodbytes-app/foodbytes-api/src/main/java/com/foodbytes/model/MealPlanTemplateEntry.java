package com.foodbytes.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

/**
 * Individual recipe assignment within a saved meal-plan template.
 * day_offset: 0..6 (Monday=0, Sunday=6).
 *
 * See requirement-meal-plan-templates-2026-05-09.md.
 */
@Entity
@Table(name = "meal_plan_template_entries")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class MealPlanTemplateEntry {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "template_id", nullable = false)
    private MealPlanTemplate template;

    @Column(name = "day_offset", nullable = false)
    private Integer dayOffset;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "meal_id", nullable = false)
    private Meal meal;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "recipe_id", nullable = false)
    private Recipe recipe;

    @Column(nullable = false)
    private Integer servings = 1;
}
