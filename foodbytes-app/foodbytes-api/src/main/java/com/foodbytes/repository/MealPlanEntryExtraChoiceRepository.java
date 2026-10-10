package com.foodbytes.repository;

import com.foodbytes.model.MealPlanEntryExtraChoice;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.Collection;
import java.util.List;

@Repository
public interface MealPlanEntryExtraChoiceRepository extends JpaRepository<MealPlanEntryExtraChoice, Long> {

    List<MealPlanEntryExtraChoice> findByMealPlanEntryIdIn(Collection<Long> mealPlanEntryIds);

    /** MPP-10: true when any planned meal of this owner has a stored choice (legacy-import guard). */
    @Query("SELECT COUNT(c) > 0 FROM MealPlanEntryExtraChoice c, MealPlanEntry e " +
           "WHERE e.id = c.mealPlanEntryId AND e.user.id = :ownerId")
    boolean existsForOwner(@Param("ownerId") Long ownerId);
}
