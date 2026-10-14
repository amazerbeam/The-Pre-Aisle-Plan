package com.foodbytes.repository;

import com.foodbytes.model.PetDecorOwned;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

/** MPP-27: one person's bought decor and styles. Rows are never deleted by the app (owned forever). */
@Repository
public interface PetDecorOwnedRepository extends JpaRepository<PetDecorOwned, Long> {

    List<PetDecorOwned> findByUserId(Long userId);

    boolean existsByUserIdAndItemKey(Long userId, String itemKey);
}
