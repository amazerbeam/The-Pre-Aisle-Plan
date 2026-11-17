package com.foodbytes.repository;

import com.foodbytes.model.PetGameMap;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

/** MPP-49: issued Pip's Path maps. Always looked up with the caller's id, so nobody reads another's map. */
@Repository
public interface PetGameMapRepository extends JpaRepository<PetGameMap, Long> {
    Optional<PetGameMap> findByIdAndUserId(Long id, Long userId);
}
