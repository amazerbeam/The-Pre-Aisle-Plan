package com.foodbytes.repository;

import com.foodbytes.model.PetRoomPlacement;
import com.foodbytes.model.RoomSpot;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;

/** MPP-27: what is on each spot of one person's room, one row per filled spot. */
@Repository
public interface PetRoomPlacementRepository extends JpaRepository<PetRoomPlacement, Long> {

    List<PetRoomPlacement> findByUserId(Long userId);

    boolean existsByUserIdAndSpot(Long userId, RoomSpot spot);

    /** Puts an item on a spot, replacing whatever was there (uk_pet_room_placements). */
    @Modifying(clearAutomatically = true)
    @Query(value = "INSERT INTO pet_room_placements (user_id, spot, item_key) VALUES (:userId, :spot, :itemKey) " +
                   "ON DUPLICATE KEY UPDATE item_key = VALUES(item_key)",
           nativeQuery = true)
    void upsert(@Param("userId") Long userId, @Param("spot") String spot, @Param("itemKey") String itemKey);

    /** Empties a spot (or resets a finish to its default style). */
    @Modifying(clearAutomatically = true)
    @Query("DELETE FROM PetRoomPlacement p WHERE p.userId = :userId AND p.spot = :spot")
    int deleteByUserIdAndSpot(@Param("userId") Long userId, @Param("spot") RoomSpot spot);
}
