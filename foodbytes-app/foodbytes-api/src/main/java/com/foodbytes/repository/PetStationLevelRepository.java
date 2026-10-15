package com.foodbytes.repository;

import com.foodbytes.model.PetStationLevel;
import com.foodbytes.model.RoomStation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;

/** MPP-26: one person's upgraded stations (level 1 has no row). */
@Repository
public interface PetStationLevelRepository extends JpaRepository<PetStationLevel, Long> {

    List<PetStationLevel> findByUserId(Long userId);

    /** Sets a station's level (uk_pet_station_levels). Called only after the wallet-locked level check. */
    @Modifying(clearAutomatically = true)
    @Query(value = "INSERT INTO pet_station_levels (user_id, station, level) VALUES (:userId, :station, :level) " +
                   "ON DUPLICATE KEY UPDATE level = VALUES(level)",
           nativeQuery = true)
    void upsert(@Param("userId") Long userId, @Param("station") String station, @Param("level") int level);

    /** MPP-40 free mode: back to level 1 (no row). */
    @Modifying(clearAutomatically = true)
    @Query("DELETE FROM PetStationLevel s WHERE s.userId = :userId AND s.station = :station")
    int deleteByUserIdAndStation(@Param("userId") Long userId, @Param("station") RoomStation station);
}
