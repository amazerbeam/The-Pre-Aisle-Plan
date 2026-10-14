package com.foodbytes.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

/**
 * MPP-32: one clothing item one person has unlocked. Identified by (user, item) so granting it twice
 * is a no-op; written only by PetWardrobeUnlockRepository#insertIfAbsent and never deleted by the
 * app (AC 2: kept forever). seenAt is null until the slot holding it is opened (AC 4).
 */
@Entity
@Table(name = "pet_wardrobe_unlocks", uniqueConstraints = {
    @UniqueConstraint(name = "uk_pet_wardrobe_unlocks", columnNames = {"user_id", "item_key"})
})
@Data
@NoArgsConstructor
@AllArgsConstructor
public class PetWardrobeUnlock {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // The person who owns this Pip - never the meal-plan owner (MPP-33)
    @Column(name = "user_id", nullable = false)
    private Long userId;

    // A WardrobeCatalogue item id, e.g. "beanie"
    @Column(name = "item_key", nullable = false, length = 32)
    private String itemKey;

    // DB default CURRENT_TIMESTAMP (UTC, as the JDBC URL pins serverTimezone=UTC)
    @Column(name = "unlocked_at", nullable = false, insertable = false, updatable = false)
    private LocalDateTime unlockedAt;

    @Column(name = "seen_at")
    private LocalDateTime seenAt;

    // Identity is the primary key — see Recipe#equals.
    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof PetWardrobeUnlock other)) return false;
        return id != null && id.equals(other.getId());
    }

    @Override
    public int hashCode() {
        return PetWardrobeUnlock.class.hashCode();
    }
}
