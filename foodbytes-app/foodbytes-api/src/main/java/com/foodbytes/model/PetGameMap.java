package com.foodbytes.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.LocalDateTime;

/**
 * MPP-49: one Pip's Path map issued to one person. A clear is replayed against `layout` (rows joined by
 * '/', legend S . #); cleared_at is set once, and the id keys the GAME_CLEAR payout so it pays once.
 */
@Entity
@Table(name = "pet_game_maps")
@Data
@NoArgsConstructor
public class PetGameMap {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // The player - never the meal-plan owner (MPP-33)
    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(name = "family", nullable = false, length = 32)
    private String family;

    @Column(name = "difficulty", nullable = false)
    private int difficulty;

    @Enumerated(EnumType.STRING)
    @JdbcTypeCode(SqlTypes.VARCHAR)
    @Column(name = "mode", nullable = false, length = 16)
    private GameMode mode;

    @Column(name = "chapter")
    private Integer chapter;

    @Column(name = "seed", nullable = false)
    private long seed;

    @Column(name = "width", nullable = false)
    private int width;

    @Column(name = "height", nullable = false)
    private int height;

    @Column(name = "layout", nullable = false, length = 1024)
    private String layout;

    // DB default CURRENT_TIMESTAMP (UTC)
    @Column(name = "issued_at", nullable = false, insertable = false, updatable = false)
    private LocalDateTime issuedAt;

    @Column(name = "cleared_at")
    private LocalDateTime clearedAt;

    // Identity is the primary key - see Recipe#equals.
    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof PetGameMap other)) return false;
        return id != null && id.equals(other.getId());
    }

    @Override
    public int hashCode() {
        return PetGameMap.class.hashCode();
    }
}
