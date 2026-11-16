package com.foodbytes.repository;

import com.foodbytes.model.RecipeFolderItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;
import java.util.Collection;
import java.util.List;

@Repository
public interface RecipeFolderItemRepository extends JpaRepository<RecipeFolderItem, Long> {
    List<RecipeFolderItem> findByFolderIdIn(Collection<Long> folderIds);

    /** Idempotent add: a concurrent duplicate converges on uk_recipe_folder_item instead of throwing. */
    @Modifying
    @Query(value = "INSERT INTO recipe_folder_items (folder_id, recipe_id) VALUES (:folderId, :recipeId) " +
                   "ON DUPLICATE KEY UPDATE folder_id = folder_id", nativeQuery = true)
    void insertIfAbsent(@Param("folderId") Long folderId, @Param("recipeId") Long recipeId);

    @Modifying
    @Transactional
    long deleteByFolderIdAndRecipeId(Long folderId, Long recipeId);
}
