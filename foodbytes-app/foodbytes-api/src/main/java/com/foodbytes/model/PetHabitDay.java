package com.foodbytes.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;
import java.time.LocalDate;

/**
 * MPP-20: one person's answer for one habit on one day. clean = true for a clean day, false for the
 * lapse day. Written only by HabitStreakService, one contiguous range per answer, so a day is never
 * written twice; the unique key is a backstop. MPP-31's 30-day score reads this log.
 * Plain id columns (no associations), as MealPlanEntryEaten.
 */
@Entity
@Table(name = "pet_habit_days", uniqueConstraints = {
    @UniqueConstraint(name = "uk_pet_habit_days_user_habit_day", columnNames = {"user_id", "habit", "day"})
})
@Data
@NoArgsConstructor
@AllArgsConstructor
public class PetHabitDay {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    // VARCHAR + CHECK in the DB; pin the JDBC type so validate never expects a MySQL ENUM
    @Enumerated(EnumType.STRING)
    @JdbcTypeCode(SqlTypes.VARCHAR)
    @Column(name = "habit", nullable = false, length = 16)
    private Habit habit;

    @Column(name = "day", nullable = false)
    private LocalDate day;

    @Column(name = "clean", nullable = false)
    private Boolean clean;

    // Identity is the primary key — see Recipe#equals.
    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof PetHabitDay other)) return false;
        return id != null && id.equals(other.getId());
    }

    @Override
    public int hashCode() {
        return PetHabitDay.class.hashCode();
    }
}
