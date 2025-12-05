package com.foodbytes.repository;

import com.foodbytes.model.Ingredient;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;
import java.util.Optional;

public interface IngredientRepository extends JpaRepository<Ingredient, Long> {

    // Existing methods
    Optional<Ingredient> findByKey(String key);
    Optional<Ingredient> findByName(String name);

    @EntityGraph(attributePaths = {"aisle"})
    List<Ingredient> findAllByOrderByNameAsc();

    // Case-insensitive exact match
    @Query("SELECT i FROM Ingredient i WHERE LOWER(i.name) = LOWER(:name)")
    Optional<Ingredient> findByNameIgnoreCase(@Param("name") String name);

    @Query("SELECT i FROM Ingredient i WHERE LOWER(i.key) = LOWER(:key)")
    Optional<Ingredient> findByKeyIgnoreCase(@Param("key") String key);

    // Autocomplete/search with LIKE
    @EntityGraph(attributePaths = {"aisle"})
    @Query("SELECT i FROM Ingredient i WHERE LOWER(i.name) LIKE LOWER(CONCAT('%', :search, '%')) ORDER BY i.name")
    List<Ingredient> searchByNameContaining(@Param("search") String search);

    // Prefix search for autocomplete
    @EntityGraph(attributePaths = {"aisle"})
    @Query("SELECT i FROM Ingredient i WHERE LOWER(i.name) LIKE LOWER(CONCAT(:prefix, '%')) ORDER BY i.name")
    List<Ingredient> findByNameStartingWithIgnoreCase(@Param("prefix") String prefix);

    // Validation helpers
    boolean existsByKeyIgnoreCase(String key);
    boolean existsByNameIgnoreCase(String name);

    // Get all keys for validation cache
    @Query("SELECT i.key FROM Ingredient i")
    List<String> findAllKeys();

    // Get all names for similarity checking
    @Query("SELECT i.name FROM Ingredient i")
    List<String> findAllNames();
}
