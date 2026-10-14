package com.foodbytes.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;
import java.time.LocalDateTime;

/**
 * MPP-24: the first time one person tried one feature. Identified by (user, key) so recording it
 * twice is a no-op; written only by PetFirstRepository#insertIfAbsent from PetFirstService, and by
 * the migration's backfill. Never deleted by the app.
 */
@Entity
@Table(name = "pet_firsts", uniqueConstraints = {
    @UniqueConstraint(name = "uk_pet_firsts", columnNames = {"user_id", "first_key"})
})
@Data
@NoArgsConstructor
@AllArgsConstructor
public class PetFirst {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // The person who acted - never the meal-plan owner (MPP-33)
    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Enumerated(EnumType.STRING)
    @JdbcTypeCode(SqlTypes.VARCHAR)
    @Column(name = "first_key", nullable = false, length = 32)
    private FirstKey firstKey;

    // DB default CURRENT_TIMESTAMP (UTC, as the JDBC URL pins serverTimezone=UTC)
    @Column(name = "earned_at", nullable = false, insertable = false, updatable = false)
    private LocalDateTime earnedAt;

    // Identity is the primary key — see Recipe#equals.
    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof PetFirst other)) return false;
        return id != null && id.equals(other.getId());
    }

    @Override
    public int hashCode() {
        return PetFirst.class.hashCode();
    }
}
