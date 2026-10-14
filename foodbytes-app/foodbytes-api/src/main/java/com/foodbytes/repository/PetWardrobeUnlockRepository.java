package com.foodbytes.repository;

import com.foodbytes.model.PetWardrobeUnlock;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.time.LocalDateTime;
import java.util.Collection;
import java.util.List;

/** MPP-32: one person's unlocked clothes. Rows are never deleted by the app (kept forever). */
@Repository
public interface PetWardrobeUnlockRepository extends JpaRepository<PetWardrobeUnlock, Long> {

    List<PetWardrobeUnlock> findByUserId(Long userId);

    boolean existsByUserIdAndItemKey(Long userId, String itemKey);

    /** Grants an item, or leaves an existing grant (and its seen_at) untouched. Parallel syncs converge. */
    @Modifying(clearAutomatically = true)
    @Query(value = "INSERT INTO pet_wardrobe_unlocks (user_id, item_key) VALUES (:userId, :itemKey) " +
                   "ON DUPLICATE KEY UPDATE id = id",
           nativeQuery = true)
    void insertIfAbsent(@Param("userId") Long userId, @Param("itemKey") String itemKey);

    /** Marks the given items seen; ones already seen keep their first seen_at. */
    @Modifying(clearAutomatically = true)
    @Query("UPDATE PetWardrobeUnlock u SET u.seenAt = :seenAt " +
           "WHERE u.userId = :userId AND u.itemKey IN :itemKeys AND u.seenAt IS NULL")
    int markSeen(@Param("userId") Long userId,
                 @Param("itemKeys") Collection<String> itemKeys,
                 @Param("seenAt") LocalDateTime seenAt);
}
