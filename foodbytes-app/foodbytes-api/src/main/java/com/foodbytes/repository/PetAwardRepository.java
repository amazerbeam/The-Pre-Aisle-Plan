package com.foodbytes.repository;

import com.foodbytes.model.PetAward;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.time.LocalDate;
import java.util.List;

/** MPP-22: the caller's award ledger. */
@Repository
public interface PetAwardRepository extends JpaRepository<PetAward, Long> {

    /** Every award one user has earned, across all streak types. */
    List<PetAward> findByUserId(Long userId);

    /**
     * Records an award, or leaves an existing identical one untouched. Parallel syncs for the same
     * user converge on uk_pet_awards instead of failing.
     */
    @Modifying
    @Query(value = "INSERT INTO pet_awards (user_id, streak_type, milestone, streak_start, cycle_index) " +
                   "VALUES (:userId, :streakType, :milestone, :streakStart, :cycleIndex) " +
                   "ON DUPLICATE KEY UPDATE id = id",
           nativeQuery = true)
    void insertIfAbsent(@Param("userId") Long userId,
                        @Param("streakType") String streakType,
                        @Param("milestone") int milestone,
                        @Param("streakStart") LocalDate streakStart,
                        @Param("cycleIndex") int cycleIndex);
}
