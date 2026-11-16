package com.foodbytes.repository;

import com.foodbytes.model.RecipeFolder;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface RecipeFolderRepository extends JpaRepository<RecipeFolder, Long> {
    List<RecipeFolder> findByUserId(Long userId);
    Optional<RecipeFolder> findByIdAndUserId(Long id, Long userId);
    long countByUserId(Long userId);
}
