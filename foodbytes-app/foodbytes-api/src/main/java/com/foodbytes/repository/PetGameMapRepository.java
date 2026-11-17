package com.foodbytes.repository;

import com.foodbytes.model.GameMode;
import com.foodbytes.model.PetGameMap;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

/** MPP-49: issued Pip's Path maps. Always looked up with the caller's id, so nobody reads another's map. */
@Repository
public interface PetGameMapRepository extends JpaRepository<PetGameMap, Long> {
    Optional<PetGameMap> findByIdAndUserId(Long id, Long userId);

    /** CHAPTER slot (sequencer level or a replay): the newest uncleared map of that family and difficulty. */
    Optional<PetGameMap> findFirstByUserIdAndFamilyAndDifficultyAndModeAndClearedAtIsNullOrderByIdDesc(
            Long userId, String family, int difficulty, GameMode mode);

    /** REFRESHER slot: difficulty is rolled at issue, so the slot is (family, chapter). */
    Optional<PetGameMap> findFirstByUserIdAndFamilyAndModeAndChapterAndClearedAtIsNullOrderByIdDesc(
            Long userId, String family, GameMode mode, Integer chapter);

    /** ENDLESS slot: any open endless map. */
    Optional<PetGameMap> findFirstByUserIdAndModeAndClearedAtIsNullOrderByIdDesc(Long userId, GameMode mode);
}
