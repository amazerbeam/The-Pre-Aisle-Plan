package com.foodbytes.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;
import java.time.LocalDate;

/**
 * MPP-20: one person's running state for one habit. The current streak length is derived from
 * streakStart..lastAnsweredDate (HabitStreakPolicy#current), never stored. best is never lowered.
 * Created on the first answer (PetHabitStreakRepository#ensureRow); a missing row means "never
 * answered".
 */
@Entity
@Table(name = "pet_habit_streaks", uniqueConstraints = {
    @UniqueConstraint(name = "uk_pet_habit_streaks_user_habit", columnNames = {"user_id", "habit"})
})
@Data
@NoArgsConstructor
@AllArgsConstructor
public class PetHabitStreak {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Enumerated(EnumType.STRING)
    @JdbcTypeCode(SqlTypes.VARCHAR)
    @Column(name = "habit", nullable = false, length = 16)
    private Habit habit;

    // First day of the running streak; null until the first clean day. After a lapse: lapse + 1.
    @Column(name = "streak_start")
    private LocalDate streakStart;

    @Column(name = "best", nullable = false)
    private Integer best;

    // Last Europe/Dublin day this habit was answered for; null until the first answer.
    @Column(name = "last_answered_date")
    private LocalDate lastAnsweredDate;

    // Identity is the primary key — see Recipe#equals.
    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof PetHabitStreak other)) return false;
        return id != null && id.equals(other.getId());
    }

    @Override
    public int hashCode() {
        return PetHabitStreak.class.hashCode();
    }
}
