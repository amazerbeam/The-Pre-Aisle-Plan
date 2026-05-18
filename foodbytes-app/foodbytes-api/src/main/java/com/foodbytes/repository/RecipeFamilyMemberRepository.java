package com.foodbytes.repository;

import com.foodbytes.model.RecipeFamilyMember;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;
import java.util.Optional;

/**
 * FR-043: Repository for Recipe Family Member operations.
 */
public interface RecipeFamilyMemberRepository extends JpaRepository<RecipeFamilyMember, Long> {

    /**
     * Find family membership for a recipe.
     */
    @EntityGraph(attributePaths = {"family", "family.members", "family.members.recipe"})
    Optional<RecipeFamilyMember> findByRecipeId(Long recipeId);

    /**
     * Check if a recipe is already in a family.
     */
    boolean existsByRecipeId(Long recipeId);

    /**
     * Get all family members for a family (sorted by displayOrder).
     */
    @EntityGraph(attributePaths = {"recipe"})
    @Query("SELECT m FROM RecipeFamilyMember m WHERE m.family.id = :familyId ORDER BY m.displayOrder ASC")
    List<RecipeFamilyMember> findByFamilyIdOrderByDisplayOrder(@Param("familyId") Long familyId);

    /**
     * Get all variants for a recipe (including the recipe itself).
     */
    @Query("SELECT m FROM RecipeFamilyMember m " +
           "WHERE m.family.id = (SELECT m2.family.id FROM RecipeFamilyMember m2 WHERE m2.recipe.id = :recipeId) " +
           "ORDER BY m.displayOrder ASC")
    List<RecipeFamilyMember> findVariantsForRecipe(@Param("recipeId") Long recipeId);

    /**
     * Count members in a family (for validation).
     */
    long countByFamilyId(Long familyId);

    /**
     * FR-043: Get all recipe IDs that are non-default family members.
     * These should be hidden from main recipe lists (only shown via dropdown).
     */
    @Query("SELECT m.recipe.id FROM RecipeFamilyMember m WHERE m.isDefault = false")
    List<Long> findNonDefaultRecipeIds();
}
