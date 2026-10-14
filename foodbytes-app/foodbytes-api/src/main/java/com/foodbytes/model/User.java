package com.foodbytes.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.time.LocalDateTime;
import java.time.LocalTime;
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

    /**
     * MPP-13: the time by which the user usually eats each meal. NULL means
     * "use the default" (MealTimesPolicy) — no field initialiser, for the same
     * reason as defaultServings: a default here would silently write the default
     * into every new user's row, and Reset could no longer mean "clear".
     * The three are always written together by UserService.updatePreferences.
     */
    @Column(name = "breakfast_by")
    private LocalTime breakfastBy;

    @Column(name = "lunch_by")
    private LocalTime lunchBy;

    @Column(name = "dinner_by")
    private LocalTime dinnerBy;

    /**
     * MPP-14 / MPP-33: this user's pet name. Every user has their own pet, linked or not. NULL means
     * "use the default" (PetPolicy.DEFAULT_NAME) — no initialiser, same reason as defaultServings.
     */
    @Column(name = "pet_name", length = 12)
    private String petName;

    /**
     * MPP-31: when this user's Pip first reached Basilisk (90 points). NULL = not yet. Set once by
     * UserRepository#markPetFullyGrown and never cleared, so Basilisk is permanent (AC 3).
     * updatable = false: the JPQL bulk update bypasses the entity path and still writes, while an
     * entity flush (e.g. a concurrent rename holding a stale User) can never overwrite it with NULL.
     */
    @Column(name = "pet_fully_grown_at", updatable = false)
    private LocalDateTime petFullyGrownAt;

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
