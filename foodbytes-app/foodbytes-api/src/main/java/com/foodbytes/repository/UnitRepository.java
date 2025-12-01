package com.foodbytes.repository;

import com.foodbytes.model.Unit;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface UnitRepository extends JpaRepository<Unit, Long> {
    Optional<Unit> findByKey(String key);
    Optional<Unit> findByValue(String value);
}
