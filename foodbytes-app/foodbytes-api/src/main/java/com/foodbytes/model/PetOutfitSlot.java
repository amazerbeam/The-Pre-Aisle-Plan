package com.foodbytes.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

/**
 * MPP-32: what one person's Pip wears in one slot. At most one row per (user, slot); an empty
 * slot has no row. Written by PetOutfitSlotRepository#upsert / the delete methods.
 */
@Entity
@Table(name = "pet_outfit_slots", uniqueConstraints = {
    @UniqueConstraint(name = "uk_pet_outfit_slots", columnNames = {"user_id", "slot"})
})
@Data
@NoArgsConstructor
@AllArgsConstructor
public class PetOutfitSlot {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Enumerated(EnumType.STRING)
    @JdbcTypeCode(SqlTypes.VARCHAR)
    @Column(name = "slot", nullable = false, length = 16)
    private WardrobeSlot slot;

    @Column(name = "item_key", nullable = false, length = 32)
    private String itemKey;

    // Identity is the primary key — see Recipe#equals.
    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof PetOutfitSlot other)) return false;
        return id != null && id.equals(other.getId());
    }

    @Override
    public int hashCode() {
        return PetOutfitSlot.class.hashCode();
    }
}
