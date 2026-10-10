package com.foodbytes.repository;

import com.foodbytes.model.UserExtraDefault;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Collection;
import java.util.List;

@Repository
public interface UserExtraDefaultRepository extends JpaRepository<UserExtraDefault, Long> {
    List<UserExtraDefault> findByUserId(Long userId);
    List<UserExtraDefault> findByUserIdAndRecipeIdIn(Long userId, Collection<Long> recipeIds);
    boolean existsByUserId(Long userId);
}
