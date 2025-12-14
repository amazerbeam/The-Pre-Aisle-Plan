package com.foodbytes.repository;

import com.foodbytes.model.RecipeExtra;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;

/**
 * FR-086: Repository for Recipe Extras (sub-recipes/linked recipes)
 */
@Repository
public interface RecipeExtraRepository extends JpaRepository<RecipeExtra, Long> {

    /**
     * Find all extras for a parent recipe, ordered by display order
     */
    List<RecipeExtra> findByParentRecipeIdOrderByDisplayOrderAsc(Long parentRecipeId);

    /**
     * Find all recipes that use a specific recipe as an extra
     */
    @Query("SELECT re FROM RecipeExtra re WHERE re.childRecipe.id = :recipeId")
    List<RecipeExtra> findByChildRecipeId(@Param("recipeId") Long recipeId);

    /**
     * Check if a recipe has any extras
     */
    @Query("SELECT COUNT(re) > 0 FROM RecipeExtra re WHERE re.parentRecipe.id = :recipeId")
    boolean hasExtras(@Param("recipeId") Long recipeId);

    /**
     * Delete all extras for a parent recipe
     */
    void deleteByParentRecipeId(Long parentRecipeId);

    /**
     * Check if adding this child would create a circular reference.
     * Uses recursive CTE to detect cycles in the hierarchy.
     */
    @Query(nativeQuery = true, value = """
        WITH RECURSIVE extra_tree AS (
            SELECT child_recipe_id FROM recipe_extras WHERE parent_recipe_id = :childId
            UNION ALL
            SELECT re.child_recipe_id FROM recipe_extras re
            INNER JOIN extra_tree et ON re.parent_recipe_id = et.child_recipe_id
        )
        SELECT COUNT(*) > 0 FROM extra_tree WHERE child_recipe_id = :parentId
    """)
    boolean wouldCreateCircularReference(@Param("parentId") Long parentId, @Param("childId") Long childId);

    /**
     * Check if a specific parent-child relationship already exists
     */
    boolean existsByParentRecipeIdAndChildRecipeId(Long parentRecipeId, Long childRecipeId);
}
