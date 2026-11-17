package com.foodbytes.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/** MPP-49: one person's Pip's Path progress in one family. Per person, like Pip (MPP-33). */
@Entity
@Table(name = "pet_game_progress", uniqueConstraints = {
    @UniqueConstraint(name = "uk_pet_game_progress", columnNames = {"user_id", "family"})
})
@Data
@NoArgsConstructor
public class PetGameProgress {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(name = "family", nullable = false, length = 32)
    private String family;

    @Column(name = "highest_cleared", nullable = false)
    private int highestCleared;

    @Column(name = "refresher_through", nullable = false)
    private int refresherThrough;

    @Column(name = "updated_at", nullable = false, insertable = false, updatable = false)
    private LocalDateTime updatedAt;

    public PetGameProgress(Long userId, String family) {
        this.userId = userId;
        this.family = family;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof PetGameProgress other)) return false;
        return id != null && id.equals(other.getId());
    }

    @Override
    public int hashCode() {
        return PetGameProgress.class.hashCode();
    }
}
