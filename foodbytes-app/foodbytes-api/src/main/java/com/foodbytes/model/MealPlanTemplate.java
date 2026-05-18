package com.foodbytes.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * Saved meal-plan template — a named, calendar-independent snapshot of
 * a 7-day plan for a user. Entries are stored by day_offset (0..6) so the
 * template can be re-applied to any Monday-start week.
 *
 * See requirement-meal-plan-templates-2026-05-09.md.
 */
@Entity
@Table(name = "meal_plan_templates", uniqueConstraints = {
    @UniqueConstraint(name = "uk_meal_plan_template_user_name", columnNames = {"user_id", "name"})
})
@Data
@NoArgsConstructor
@AllArgsConstructor
public class MealPlanTemplate {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false, length = 60)
    private String name;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @OneToMany(mappedBy = "template", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private List<MealPlanTemplateEntry> entries = new ArrayList<>();

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
