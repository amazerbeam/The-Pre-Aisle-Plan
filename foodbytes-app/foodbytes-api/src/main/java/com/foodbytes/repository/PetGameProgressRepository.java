package com.foodbytes.repository;

import com.foodbytes.model.PetGameProgress;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/** MPP-49: per-person Pip's Path progress (uk_pet_game_progress leads with user_id). */
@Repository
public interface PetGameProgressRepository extends JpaRepository<PetGameProgress, Long> {
    List<PetGameProgress> findByUserId(Long userId);
    Optional<PetGameProgress> findByUserIdAndFamily(Long userId, String family);
}
