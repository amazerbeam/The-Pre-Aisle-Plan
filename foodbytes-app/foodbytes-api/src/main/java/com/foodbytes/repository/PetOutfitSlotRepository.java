package com.foodbytes.repository;

import com.foodbytes.model.PetOutfitSlot;
import com.foodbytes.model.WardrobeSlot;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;

/** MPP-32: what one person's Pip is wearing, one row per worn slot. */
@Repository
public interface PetOutfitSlotRepository extends JpaRepository<PetOutfitSlot, Long> {

    List<PetOutfitSlot> findByUserId(Long userId);

    /** Puts an item in a slot, replacing whatever was there (uk_pet_outfit_slots). */
    @Modifying(clearAutomatically = true)
    @Query(value = "INSERT INTO pet_outfit_slots (user_id, slot, item_key) VALUES (:userId, :slot, :itemKey) " +
                   "ON DUPLICATE KEY UPDATE item_key = VALUES(item_key)",
           nativeQuery = true)
    void upsert(@Param("userId") Long userId, @Param("slot") String slot, @Param("itemKey") String itemKey);

    @Modifying(clearAutomatically = true)
    @Query("DELETE FROM PetOutfitSlot s WHERE s.userId = :userId AND s.slot = :slot")
    int deleteByUserIdAndSlot(@Param("userId") Long userId, @Param("slot") WardrobeSlot slot);

    @Modifying(clearAutomatically = true)
    @Query("DELETE FROM PetOutfitSlot s WHERE s.userId = :userId")
    int deleteByUserId(@Param("userId") Long userId);
}
