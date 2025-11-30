package com.foodbytes.service;

import com.foodbytes.dto.RecipeDTO;
import com.foodbytes.dto.IngredientDTO;
import com.foodbytes.model.Recipe;
import com.foodbytes.model.MealType;
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
    public List<RecipeDTO> getAllRecipes() {
        return recipeRepository.findAllLiveRecipes().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<RecipeDTO> getRecipesByMealType(String mealType) {
        MealType type = MealType.valueOf(mealType.toLowerCase());
        return recipeRepository.findByMealType(type).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<RecipeDTO> searchRecipes(String query) {
        return recipeRepository.searchByName(query).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public RecipeDTO getRecipeById(Long id) {
        Recipe recipe = recipeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Recipe not found"));
        return convertToDTO(recipe);
    }

    private RecipeDTO convertToDTO(Recipe recipe) {
        RecipeDTO dto = new RecipeDTO();
        dto.setId(recipe.getId());
        dto.setName(recipe.getName());
        dto.setDefaultServings(recipe.getDefaultServings());
        dto.setCalories(recipe.getCalories());
        dto.setIsCheat(recipe.getIsCheat());

        dto.setMealTypes(recipe.getMeals().stream()
                .map(m -> m.getMealType().name())
                .collect(Collectors.toList()));

        dto.setIngredients(recipe.getIngredients().stream()
                .map(i -> new IngredientDTO(i.getName(), i.getQuantity(), i.getUnit()))
                .collect(Collectors.toList()));

        dto.setSteps(recipe.getSteps().stream()
                .map(s -> s.getInstruction())
                .collect(Collectors.toList()));

        return dto;
    }
}
