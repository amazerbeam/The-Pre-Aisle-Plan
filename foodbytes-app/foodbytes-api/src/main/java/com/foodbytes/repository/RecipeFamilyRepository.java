package com.foodbytes.repository;

import com.foodbytes.model.RecipeFamily;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;
import java.util.Optional;

/**
 * FR-043: Repository for Recipe Family operations.
 */
public interface RecipeFamilyRepository extends JpaRepository<RecipeFamily, Long> {

    @EntityGraph(attributePaths = {"members", "members.recipe"})
    List<RecipeFamily> findAllByOrderByFamilyNameAsc();

    @EntityGraph(attributePaths = {"members", "members.recipe"})
    Optional<RecipeFamily> findById(Long id);

    boolean existsByFamilyNameIgnoreCase(String familyName);
}
