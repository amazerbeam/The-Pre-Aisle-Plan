package com.foodbytes.service;

import com.foodbytes.dto.RecipeDTO;
import com.foodbytes.dto.RecipeVariantDTO;
import com.foodbytes.dto.IngredientDTO;
import com.foodbytes.dto.IngredientKeyDTO;
import com.foodbytes.model.Ingredient;
import com.foodbytes.model.Recipe;
import com.foodbytes.model.RecipeFamilyMember;
import com.foodbytes.repository.RecipeRepository;
import com.foodbytes.repository.RecipeFamilyMemberRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

/**
 * Service for recipe operations.
 *
 * When recipe creation/editing is implemented (FR-033), use IngredientService
 * to validate ingredient keys before creating RecipeIngredient entries:
 *
 * <pre>
 * // Validate all ingredient keys (mirrors N() function pattern)
 * List<String> keys = dto.getIngredients().stream()
 *     .map(IngredientKeyDTO::getIngredientKey)
 *     .toList();
 * Map<String, Ingredient> ingredientMap = ingredientService.validateAndGetByKeys(keys);
 *
 * // Then create RecipeIngredient with the validated Ingredient entities
 * </pre>
 */
@Service
@RequiredArgsConstructor
public class RecipeService {

    private final RecipeRepository recipeRepository;
    private final IngredientService ingredientService;
    private final RecipeFamilyMemberRepository recipeFamilyMemberRepository;

    @Transactional(readOnly = true)
    public List<RecipeDTO> getAllRecipes() {
        return recipeRepository.findAllLiveRecipes().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<RecipeDTO> getRecipesByMealType(String mealType) {
        return recipeRepository.findByMealKey(mealType.toLowerCase()).stream()
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
                .map(m -> m.getMeal().getKey())
                .collect(Collectors.toList()));

        dto.setIngredients(recipe.getIngredients().stream()
                .map(i -> new IngredientDTO(
                    i.getIngredient().getName(),
                    i.getQuantity(),
                    i.getUnit().getValue()))
                .collect(Collectors.toList()));

        dto.setSteps(recipe.getSteps().stream()
                .map(s -> s.getInstruction())
                .collect(Collectors.toList()));

        // FR-043: Add variant information
        addVariantInfo(dto, recipe.getId());

        return dto;
    }

    /**
     * FR-043: Add variant information to recipe DTO.
     */
    private void addVariantInfo(RecipeDTO dto, Long recipeId) {
        // Check if recipe is part of a family
        Optional<RecipeFamilyMember> membership = recipeFamilyMemberRepository.findByRecipeId(recipeId);

        if (membership.isPresent()) {
            RecipeFamilyMember member = membership.get();
            dto.setVariantLabel(member.getVariantLabel());

            // Get all variants in the family
            List<RecipeFamilyMember> allMembers = recipeFamilyMemberRepository
                .findVariantsForRecipe(recipeId);

            // Only include variants if 2+ members
            if (allMembers.size() >= 2) {
                dto.setVariants(allMembers.stream()
                    .map(m -> new RecipeVariantDTO(
                        m.getRecipe().getId(),
                        m.getRecipe().getName(),
                        m.getVariantLabel(),
                        m.getIsDefault(),
                        m.getDisplayOrder()
                    ))
                    .collect(Collectors.toList()));
            } else {
                dto.setVariants(new ArrayList<>());
            }
        } else {
            dto.setVariantLabel(null);
            dto.setVariants(new ArrayList<>());
        }
    }
}
