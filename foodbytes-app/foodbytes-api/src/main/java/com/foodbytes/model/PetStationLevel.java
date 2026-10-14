package com.foodbytes.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.LocalDateTime;

/**
 * MPP-26: one person's level for one station, 2..4. Level 1 has no row. Written only by
 * PetStationLevelRepository#upsert from StationService.upgrade; never lowered or deleted.
 */
@Entity
@Table(name = "pet_station_levels", uniqueConstraints = {
    @UniqueConstraint(name = "uk_pet_station_levels", columnNames = {"user_id", "station"})
})
@Data
@NoArgsConstructor
@AllArgsConstructor
public class PetStationLevel {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Enumerated(EnumType.STRING)
    @JdbcTypeCode(SqlTypes.VARCHAR)
    @Column(name = "station", nullable = false, length = 16)
    private RoomStation station;

    @Column(name = "level", nullable = false)
    private int level;

    @Column(name = "upgraded_at", insertable = false, updatable = false)
    private LocalDateTime upgradedAt;

    // Identity is the primary key — see Recipe#equals.
    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof PetStationLevel other)) return false;
        return id != null && id.equals(other.getId());
    }

    @Override
    public int hashCode() {
        return PetStationLevel.class.hashCode();
    }
}
