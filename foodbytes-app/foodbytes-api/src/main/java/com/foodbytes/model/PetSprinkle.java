package com.foodbytes.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;
import java.time.LocalDateTime;

/**
 * MPP-25: one sprinkles payout to one person. Identified by (user, source type, source id), so a
 * source pays each person once ever; written only by PetSprinkleRepository#insertIfAbsent and the
 * migration's backfill. Never updated or deleted by the app.
 */
@Entity
@Table(name = "pet_sprinkles", uniqueConstraints = {
    @UniqueConstraint(name = "uk_pet_sprinkles", columnNames = {"user_id", "source_type", "source_id"})
})
@Data
@NoArgsConstructor
@AllArgsConstructor
public class PetSprinkle {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // The earner - never the meal-plan owner (MPP-33)
    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Enumerated(EnumType.STRING)
    @JdbcTypeCode(SqlTypes.VARCHAR)
    @Column(name = "source_type", nullable = false, length = 16)
    private SprinkleSource sourceType;

    @Column(name = "source_id", nullable = false)
    private Long sourceId;

    @Column(name = "amount", nullable = false)
    private int amount;

    // DB default CURRENT_TIMESTAMP (UTC, as the JDBC URL pins serverTimezone=UTC)
    @Column(name = "created_at", nullable = false, insertable = false, updatable = false)
    private LocalDateTime createdAt;

    // Identity is the primary key - see Recipe#equals.
    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof PetSprinkle other)) return false;
        return id != null && id.equals(other.getId());
    }

    @Override
    public int hashCode() {
        return PetSprinkle.class.hashCode();
    }
}
