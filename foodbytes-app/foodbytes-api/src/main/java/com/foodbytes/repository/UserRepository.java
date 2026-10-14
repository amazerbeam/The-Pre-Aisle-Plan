package com.foodbytes.repository;

import com.foodbytes.model.User;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmailIgnoreCase(String email);
    Optional<User> findByGoogleId(String googleId);

    /**
     * MPP-31: records the moment Pip first reached Basilisk. Conditional on the column still being
     * NULL, so concurrent reads that both see 90 points converge on the first timestamp.
     * Returns the number of rows changed (0 when already set).
     */
    @Modifying
    @Query("UPDATE User u SET u.petFullyGrownAt = :at WHERE u.id = :userId AND u.petFullyGrownAt IS NULL")
    int markPetFullyGrown(@Param("userId") Long userId, @Param("at") LocalDateTime at);

    /** MPP-25: everyone on this meal plan - the owner and every user linked to them. */
    @Query("SELECT u.id FROM User u WHERE u.id = :ownerId OR u.mealPlanOwnerId = :ownerId")
    List<Long> findPlanMemberIds(@Param("ownerId") Long ownerId);

    /**
     * MPP-26: SELECT … FOR UPDATE on the caller's own row. SprinkleService.lockWallet takes it so
     * every sprinkles spend by one person runs one at a time (two taps, two devices).
     */
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT u FROM User u WHERE u.id = :id")
    Optional<User> lockById(@Param("id") Long id);
}
