package com.foodbytes.repository;

import com.foodbytes.model.MealPlanTemplateEntry;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface MealPlanTemplateEntryRepository extends JpaRepository<MealPlanTemplateEntry, Long> {

    @Query("SELECT e FROM MealPlanTemplateEntry e " +
           "JOIN FETCH e.meal m " +
           "JOIN FETCH e.recipe " +
           "WHERE e.template.id = :templateId " +
           "ORDER BY e.dayOffset, m.displayOrder")
    List<MealPlanTemplateEntry> findByTemplateId(@Param("templateId") Long templateId);

    @Modifying
    @Query("DELETE FROM MealPlanTemplateEntry e WHERE e.template.id = :templateId")
    void deleteByTemplateId(@Param("templateId") Long templateId);
}
