package com.foodbytes.repository;

import com.foodbytes.model.Unit;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface UnitRepository extends JpaRepository<Unit, Long> {
    Optional<Unit> findByKey(String key);
    Optional<Unit> findByValue(String value);
    Optional<Unit> findByKeyIgnoreCase(String key);
    Optional<Unit> findByValueIgnoreCase(String value);

    // Autocomplete - search by value (display) containing query
    @Query("SELECT u FROM Unit u WHERE LOWER(u.value) LIKE LOWER(CONCAT('%', :query, '%')) ORDER BY u.value")
    List<Unit> searchByValueContaining(@Param("query") String query);

    // Search by key containing query
    @Query("SELECT u FROM Unit u WHERE LOWER(u.key) LIKE LOWER(CONCAT('%', :query, '%')) ORDER BY u.key")
    List<Unit> searchByKeyContaining(@Param("query") String query);

    // Get all units sorted by value
    List<Unit> findAllByOrderByValueAsc();
}
