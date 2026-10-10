package com.foodbytes.repository;

import com.foodbytes.model.MealPlanTemplateEntryExtraChoice;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Collection;
import java.util.List;

@Repository
public interface MealPlanTemplateEntryExtraChoiceRepository
        extends JpaRepository<MealPlanTemplateEntryExtraChoice, Long> {
    List<MealPlanTemplateEntryExtraChoice> findByTemplateEntryIdIn(Collection<Long> templateEntryIds);
}
