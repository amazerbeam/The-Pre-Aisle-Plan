package com.foodbytes.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

/**
 * MPP-27: one decor item or style one person has bought. Identified by (user, item), so it can be
 * bought once; saved only by DecorService.buy and never deleted by the app (AC 2: kept forever).
 * The free default styles never have a row.
 */
@Entity
@Table(name = "pet_decor_owned", uniqueConstraints = {
    @UniqueConstraint(name = "uk_pet_decor_owned", columnNames = {"user_id", "item_key"})
})
@Data
@NoArgsConstructor
@AllArgsConstructor
public class PetDecorOwned {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // The person decorating their own room - never the meal-plan owner (MPP-33)
    @Column(name = "user_id", nullable = false)
    private Long userId;

    // A DecorCatalogue id, e.g. "herb-shelf"
    @Column(name = "item_key", nullable = false, length = 32)
    private String itemKey;

    // DB default CURRENT_TIMESTAMP (UTC, as the JDBC URL pins serverTimezone=UTC)
    @Column(name = "purchased_at", nullable = false, insertable = false, updatable = false)
    private LocalDateTime purchasedAt;

    // Identity is the primary key — see Recipe#equals.
    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof PetDecorOwned other)) return false;
        return id != null && id.equals(other.getId());
    }

    @Override
    public int hashCode() {
        return PetDecorOwned.class.hashCode();
    }
}
