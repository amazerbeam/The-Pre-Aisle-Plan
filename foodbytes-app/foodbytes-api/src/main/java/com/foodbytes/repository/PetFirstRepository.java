package com.foodbytes.repository;

import com.foodbytes.model.FirstKey;
import com.foodbytes.model.PetFirst;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;

/** MPP-24: each person's firsts. */
@Repository
public interface PetFirstRepository extends JpaRepository<PetFirst, Long> {

    List<PetFirst> findByUserId(Long userId);

    boolean existsByUserIdAndFirstKey(Long userId, FirstKey firstKey);

    /**
     * Records a first, or leaves the existing one (and its earned_at) untouched. Two devices
     * earning it at once converge on uk_pet_firsts instead of failing.
     */
    @Modifying
    @Query(value = "INSERT INTO pet_firsts (user_id, first_key) VALUES (:userId, :firstKey) " +
                   "ON DUPLICATE KEY UPDATE id = id",
           nativeQuery = true)
    void insertIfAbsent(@Param("userId") Long userId, @Param("firstKey") String firstKey);

    /**
     * Direct extras of the entry's recipe that are homemade on that entry (no choice row = homemade,
     * MPP-10). Direct children suffice: a nested extra only matters under a homemade parent, which
     * already counts. Same probe as the migration's backfill 4/4.
     */
    @Query(value = "SELECT COUNT(*) FROM meal_plan_entries e " +
                   "JOIN recipe_extras x ON x.parent_recipe_id = e.recipe_id " +
                   "LEFT JOIN meal_plan_entry_extra_choices c " +
                   "  ON c.meal_plan_entry_id = e.id AND c.extra_recipe_id = x.child_recipe_id " +
                   "WHERE e.id = :entryId AND (c.id IS NULL OR c.is_homemade = 1)",
           nativeQuery = true)
    long countHomemadeExtras(@Param("entryId") Long entryId);
}
