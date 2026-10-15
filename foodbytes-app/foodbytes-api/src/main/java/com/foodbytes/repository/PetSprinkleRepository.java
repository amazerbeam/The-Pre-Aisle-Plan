package com.foodbytes.repository;

import com.foodbytes.model.PetSprinkle;
import com.foodbytes.model.SprinkleSource;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

/** MPP-25: each person's sprinkles ledger. */
@Repository
public interface PetSprinkleRepository extends JpaRepository<PetSprinkle, Long> {

    boolean existsByUserIdAndSourceTypeAndSourceId(Long userId, SprinkleSource sourceType, Long sourceId);

    /** The person's balance; 0 with no rows. uk_pet_sprinkles leads with user_id, so this is a range scan. */
    @Query("SELECT COALESCE(SUM(s.amount), 0) FROM PetSprinkle s WHERE s.userId = :userId")
    long sumAmountByUserId(@Param("userId") Long userId);

    /** MPP-42: the person's own rows since a UTC time, newest first (uk_pet_sprinkles leads with user_id). */
    List<PetSprinkle> findByUserIdAndCreatedAtGreaterThanEqualOrderByCreatedAtDescIdDesc(Long userId, LocalDateTime since);

    /**
     * Pays a source, or leaves the existing payout untouched. Two devices paying the same source at
     * once converge on uk_pet_sprinkles instead of failing or paying twice.
     */
    @Modifying
    @Query(value = "INSERT INTO pet_sprinkles (user_id, source_type, source_id, amount) " +
                   "VALUES (:userId, :sourceType, :sourceId, :amount) ON DUPLICATE KEY UPDATE id = id",
           nativeQuery = true)
    void insertIfAbsent(@Param("userId") Long userId,
                        @Param("sourceType") String sourceType,
                        @Param("sourceId") Long sourceId,
                        @Param("amount") int amount);

    /**
     * MPP-26: a spend - one negative row. A plain INSERT on purpose: a duplicate
     * (user, source_type, source_id) throws DataIntegrityViolationException instead of being skipped.
     */
    @Modifying
    @Query(value = "INSERT INTO pet_sprinkles (user_id, source_type, source_id, amount) " +
                   "VALUES (:userId, :sourceType, :sourceId, :amount)",
           nativeQuery = true)
    void insertDebit(@Param("userId") Long userId, @Param("sourceType") String sourceType,
                     @Param("sourceId") Long sourceId, @Param("amount") int amount);
}
