package com.foodbytes.service;

import com.foodbytes.dto.RecipeDTO;
import com.foodbytes.exception.ResourceNotFoundException;
import com.foodbytes.model.Recipe;
import com.foodbytes.repository.RecipeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class RecipeService {

    private final RecipeRepository recipeRepository;

    @Transactional(readOnly = true)
    public List<RecipeDTO> getAllLiveRecipes() {
        return recipeRepository.findAllLiveRecipes().stream()
                .map(RecipeDTO::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<RecipeDTO> getAllRecipesForAdmin() {
        return recipeRepository.findAllForAdmin().stream()
                .map(RecipeDTO::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public RecipeDTO getRecipeById(Long id, boolean isAdmin) {
        Recipe recipe;
        if (isAdmin) {
            recipe = recipeRepository.findByIdNotDeleted(id)
                    .orElseThrow(() -> new ResourceNotFoundException("Recipe not found with id: " + id));
        } else {
            recipe = recipeRepository.findByIdLive(id)
                    .orElseThrow(() -> new ResourceNotFoundException("Recipe not found with id: " + id));
        }
        return RecipeDTO.fromEntity(recipe);
    }

    @Transactional(readOnly = true)
    public List<RecipeDTO> getRecipesByMealType(String mealType) {
        return recipeRepository.findByMealType(mealType).stream()
                .map(RecipeDTO::fromEntity)
                .collect(Collectors.toList());
    }
}
