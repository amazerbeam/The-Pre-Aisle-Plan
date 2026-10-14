package com.foodbytes.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;
import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * MPP-22: one milestone earned on one run of one streak. Identified by
 * (user, streak type, milestone, run start, cycle) so recording it twice is a no-op; written only by
 * PetAwardRepository#insertIfAbsent from AwardService. Never deleted by the app.
 */
@Entity
@Table(name = "pet_awards", uniqueConstraints = {
    @UniqueConstraint(name = "uk_pet_awards",
            columnNames = {"user_id", "streak_type", "milestone", "streak_start", "cycle_index"})
})
@Data
@NoArgsConstructor
@AllArgsConstructor
public class PetAward {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Enumerated(EnumType.STRING)
    @JdbcTypeCode(SqlTypes.VARCHAR)
    @Column(name = "streak_type", nullable = false, length = 16)
    private StreakType streakType;

    // Ladder day earned: 1, 3, 5, 7, 14, 21 or 30 (AwardLadder.MILESTONES)
    @Column(name = "milestone", nullable = false)
    private Integer milestone;

    // First counted day of the run that earned it
    @Column(name = "streak_start", nullable = false)
    private LocalDate streakStart;

    // 0 for streak days 1-30, 1 for 31-60, ...
    @Column(name = "cycle_index", nullable = false)
    private Integer cycleIndex;

    // DB default CURRENT_TIMESTAMP (UTC, as the JDBC URL pins serverTimezone=UTC); audit only
    @Column(name = "awarded_at", nullable = false, insertable = false, updatable = false)
    private LocalDateTime awardedAt;

    // Identity is the primary key — see Recipe#equals.
    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof PetAward other)) return false;
        return id != null && id.equals(other.getId());
    }

    @Override
    public int hashCode() {
        return PetAward.class.hashCode();
    }
}
