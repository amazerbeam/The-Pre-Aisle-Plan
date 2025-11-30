package com.foodbytes.repository;

import com.foodbytes.model.Aisle;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AisleRepository extends JpaRepository<Aisle, Long> {

    Optional<Aisle> findByKey(String key);

    List<Aisle> findAllByOrderByDisplayOrderAsc();
}
