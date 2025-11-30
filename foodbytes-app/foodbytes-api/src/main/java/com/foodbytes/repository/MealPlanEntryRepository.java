package com.foodbytes.repository;

import com.foodbytes.model.MealPlanEntry;
import com.foodbytes.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface MealPlanEntryRepository extends JpaRepository<MealPlanEntry, Long> {

    List<MealPlanEntry> findByUserAndPlanDateBetweenOrderByPlanDateAsc(
        User user,
        LocalDate startDate,
        LocalDate endDate
    );

    List<MealPlanEntry> findByUser(User user);

    void deleteByUserAndId(User user, Long id);
}
