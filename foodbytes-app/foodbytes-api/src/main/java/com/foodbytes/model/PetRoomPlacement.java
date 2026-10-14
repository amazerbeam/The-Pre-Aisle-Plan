package com.foodbytes.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

/**
 * MPP-27: what sits on one spot of one person's room - a decor item on LEFT_WALL / RIGHT_WALL /
 * FLOOR, or the chosen style on WALL_STYLE / FLOOR_STYLE. No row = an empty spot or the default style.
 * Written only by PetRoomPlacementRepository#upsert / #deleteByUserIdAndSpot from DecorService.
 */
@Entity
@Table(name = "pet_room_placements", uniqueConstraints = {
    @UniqueConstraint(name = "uk_pet_room_placements", columnNames = {"user_id", "spot"})
})
@Data
@NoArgsConstructor
@AllArgsConstructor
public class PetRoomPlacement {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Enumerated(EnumType.STRING)
    @JdbcTypeCode(SqlTypes.VARCHAR)
    @Column(name = "spot", nullable = false, length = 16)
    private RoomSpot spot;

    // A DecorCatalogue id whose spot is this spot
    @Column(name = "item_key", nullable = false, length = 32)
    private String itemKey;

    // Identity is the primary key — see Recipe#equals.
    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof PetRoomPlacement other)) return false;
        return id != null && id.equals(other.getId());
    }

    @Override
    public int hashCode() {
        return PetRoomPlacement.class.hashCode();
    }
}
