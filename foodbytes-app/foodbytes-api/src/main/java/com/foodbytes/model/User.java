package com.foodbytes.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.time.LocalDateTime;
import java.math.BigDecimal;

@Entity
@Table(name = "users")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String email;

    @Column(nullable = false)
    private String name;

    @Column(name = "google_id", unique = true)
    private String googleId;

    @Column(name = "password_hash")
    private String passwordHash;

    @Column(name = "avatar_url")
    private String avatarUrl;

    @Column(name = "is_admin")
    private Boolean isAdmin = false;

    /**
     * MPP-3: the user's preferred starting portion count for servings controls.
     * NULL means never set — callers fall back to the recipe's own
     * default_servings (AC 9). Deliberately has NO field initialiser: a default
     * of 1 here would silently give every newly created user a one-serving
     * preference, which is the exact bug the 2026-08-09 migration reset exists
     * to undo.
     */
    @Column(name = "default_servings")
    private BigDecimal defaultServings;

    @Column(name = "meal_plan_owner_id")
    private Long mealPlanOwnerId;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "last_login")
    private LocalDateTime lastLogin;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}
