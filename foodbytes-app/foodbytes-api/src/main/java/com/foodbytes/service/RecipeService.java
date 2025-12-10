package com.foodbytes.service;

import com.foodbytes.dto.*;
import com.foodbytes.model.*;
import com.foodbytes.repository.*;
import jakarta.persistence.EntityManager;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
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
    private final IngredientRepository ingredientRepository;
    private final UnitRepository unitRepository;
    private final MealRepository mealRepository;
    private final AisleRepository aisleRepository;
    private final EntityManager entityManager;

    @Transactional(readOnly = true)
    public List<RecipeDTO> getAllRecipes() {
        // FR-043: Filter out non-default family members (only show defaults in list)
        Set<Long> hiddenRecipeIds = new HashSet<>(recipeFamilyMemberRepository.findNonDefaultRecipeIds());
        return recipeRepository.findAllLiveRecipes().stream()
                .filter(recipe -> !hiddenRecipeIds.contains(recipe.getId()))
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<RecipeDTO> getRecipesByMealType(String mealType) {
        // FR-043: Filter out non-default family members (only show defaults in list)
        Set<Long> hiddenRecipeIds = new HashSet<>(recipeFamilyMemberRepository.findNonDefaultRecipeIds());
        return recipeRepository.findByMealKey(mealType.toLowerCase()).stream()
                .filter(recipe -> !hiddenRecipeIds.contains(recipe.getId()))
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<RecipeDTO> searchRecipes(String query) {
        // FR-043: Filter out non-default family members (only show defaults in list)
        Set<Long> hiddenRecipeIds = new HashSet<>(recipeFamilyMemberRepository.findNonDefaultRecipeIds());
        return recipeRepository.searchByName(query).stream()
                .filter(recipe -> !hiddenRecipeIds.contains(recipe.getId()))
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
                    .map(m -> {
                        Recipe variantRecipe = m.getRecipe();
                        // FR-043: Calculate per-serving calories for dropdown display
                        Integer caloriesPerServing = variantRecipe.getDefaultServings() > 0
                            ? variantRecipe.getCalories() / variantRecipe.getDefaultServings()
                            : variantRecipe.getCalories();
                        return new RecipeVariantDTO(
                            variantRecipe.getId(),
                            variantRecipe.getName(),
                            m.getVariantLabel(),
                            m.getIsDefault(),
                            m.getDisplayOrder(),
                            caloriesPerServing
                        );
                    })
                    .collect(Collectors.toList()));
            } else {
                dto.setVariants(new ArrayList<>());
            }
        } else {
            dto.setVariantLabel(null);
            dto.setVariants(new ArrayList<>());
        }
    }

    // ========================================
    // ADMIN CRUD OPERATIONS (FR-033, FR-047)
    // ========================================

    /**
     * Get all recipes for admin (including hidden but excluding non-default variants).
     * FR-043: Only default variant shows as card, others appear only in dropdown.
     */
    @Transactional(readOnly = true)
    public List<RecipeDTO> getAllRecipesAdmin() {
        Set<Long> hiddenRecipeIds = new HashSet<>(recipeFamilyMemberRepository.findNonDefaultRecipeIds());
        return recipeRepository.findAllByOrderByNameAsc().stream()
                .filter(recipe -> !hiddenRecipeIds.contains(recipe.getId()))
                .map(this::convertToAdminDTO)
                .collect(Collectors.toList());
    }

    /**
     * Get recipes by meal type for admin (including hidden but excluding non-default variants).
     * FR-043: Only default variant shows as card, others appear only in dropdown.
     */
    @Transactional(readOnly = true)
    public List<RecipeDTO> getRecipesByMealTypeAdmin(String mealType) {
        Set<Long> hiddenRecipeIds = new HashSet<>(recipeFamilyMemberRepository.findNonDefaultRecipeIds());
        return recipeRepository.findByMealKeyIncludingHidden(mealType.toLowerCase()).stream()
                .filter(recipe -> !hiddenRecipeIds.contains(recipe.getId()))
                .map(this::convertToAdminDTO)
                .collect(Collectors.toList());
    }

    /**
     * Get recipe by ID for admin (including hidden).
     */
    @Transactional(readOnly = true)
    public RecipeAdminDTO getRecipeByIdAdmin(Long id) {
        Recipe recipe = recipeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Recipe not found with id: " + id));
        return convertToRecipeAdminDTO(recipe);
    }

    /**
     * Create a new recipe (FR-047).
     * New recipes are always created as hidden (isLive = false).
     */
    @Transactional
    public RecipeAdminDTO createRecipe(RecipeAdminDTO dto) {
        // Create new ingredients first if any
        Map<String, Ingredient> newIngredientMap = createNewIngredients(dto.getNewIngredients());

        // Create new units first if any
        Map<String, Unit> newUnitMap = createNewUnits(dto.getNewUnits());

        // Create the recipe entity
        Recipe recipe = new Recipe();
        recipe.setName(dto.getName());
        recipe.setDefaultServings(dto.getDefaultServings());
        recipe.setCalories(dto.getCalories());
        recipe.setIsCheat(dto.getIsCheat() != null ? dto.getIsCheat() : false);
        recipe.setIsLive(false);  // FR-047: New recipes always start hidden

        // Save recipe first to get ID
        recipe = recipeRepository.save(recipe);

        // Add meal types
        addMealTypes(recipe, dto.getMealTypes());

        // Add ingredients
        addIngredients(recipe, dto.getIngredients(), newIngredientMap, newUnitMap);

        // Add steps
        addSteps(recipe, dto.getSteps());

        // Save with all relationships
        recipe = recipeRepository.save(recipe);

        return convertToRecipeAdminDTO(recipe);
    }

    /**
     * Update an existing recipe (FR-033).
     * FR-083: Validates that recipe cannot go live with unverified ingredients.
     */
    @Transactional
    public RecipeAdminDTO updateRecipe(Long id, RecipeAdminDTO dto) {
        Recipe recipe = recipeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Recipe not found with id: " + id));

        // Create new ingredients first if any
        Map<String, Ingredient> newIngredientMap = createNewIngredients(dto.getNewIngredients());

        // Create new units first if any
        Map<String, Unit> newUnitMap = createNewUnits(dto.getNewUnits());

        // FR-083: Check if trying to set isLive = true with unverified ingredients
        boolean wantsToGoLive = dto.getIsLive() != null && dto.getIsLive();
        if (wantsToGoLive) {
            validateIngredientsVerified(dto.getIngredients(), newIngredientMap);
        }

        // Update basic fields
        recipe.setName(dto.getName());
        recipe.setDefaultServings(dto.getDefaultServings());
        recipe.setCalories(dto.getCalories());
        recipe.setIsCheat(dto.getIsCheat() != null ? dto.getIsCheat() : false);
        recipe.setIsLive(dto.getIsLive() != null ? dto.getIsLive() : recipe.getIsLive());

        // Clear existing collections
        recipe.getMeals().clear();
        recipe.getIngredients().clear();
        recipe.getSteps().clear();

        // Flush to execute DELETE statements before INSERTs (prevents unique constraint violations)
        entityManager.flush();

        // Re-add meal types, ingredients, and steps
        addMealTypes(recipe, dto.getMealTypes());
        addIngredients(recipe, dto.getIngredients(), newIngredientMap, newUnitMap);
        addSteps(recipe, dto.getSteps());

        recipe = recipeRepository.save(recipe);

        return convertToRecipeAdminDTO(recipe);
    }

    /**
     * Delete a recipe (FR-033 - hard delete).
     */
    @Transactional
    public void deleteRecipe(Long id) {
        Recipe recipe = recipeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Recipe not found with id: " + id));

        // Check if recipe is part of a family - remove from family first
        recipeFamilyMemberRepository.findByRecipeId(id).ifPresent(member -> {
            recipeFamilyMemberRepository.delete(member);
        });

        recipeRepository.delete(recipe);
    }

    /**
     * Update recipe visibility only (toggle Live/Hidden).
     * FR-083: Validates that recipe cannot go live with unverified ingredients.
     */
    @Transactional
    public RecipeAdminDTO updateRecipeVisibility(Long id, boolean isLive) {
        Recipe recipe = recipeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Recipe not found with id: " + id));

        // FR-083: Check if trying to set isLive = true with unverified ingredients
        if (isLive) {
            List<String> unverifiedIngredients = recipe.getIngredients().stream()
                    .filter(ri -> ri.getIngredient() != null &&
                                  (ri.getIngredient().getMacrosVerified() == null ||
                                   !ri.getIngredient().getMacrosVerified()))
                    .map(ri -> ri.getIngredient().getName())
                    .toList();

            if (!unverifiedIngredients.isEmpty()) {
                throw new IllegalStateException(
                        "Cannot set recipe to live: the following ingredients have unverified macros: " +
                        String.join(", ", unverifiedIngredients) +
                        ". Please verify macro data for all ingredients before publishing.");
            }
        }

        recipe.setIsLive(isLive);
        recipe = recipeRepository.save(recipe);

        return convertToRecipeAdminDTO(recipe);
    }

    // ========================================
    // HELPER METHODS FOR ADMIN OPERATIONS
    // ========================================

    /**
     * FR-083: Validates that all ingredients in a recipe have verified macros.
     * Called when attempting to set a recipe to live.
     *
     * @param ingredientDTOs List of recipe ingredients
     * @param newIngredientMap Map of newly created ingredients (by temp ID)
     * @throws IllegalStateException if any ingredient has unverified macros
     */
    private void validateIngredientsVerified(List<RecipeIngredientAdminDTO> ingredientDTOs,
                                             Map<String, Ingredient> newIngredientMap) {
        List<String> unverifiedIngredients = new ArrayList<>();

        for (RecipeIngredientAdminDTO dto : ingredientDTOs) {
            Ingredient ingredient = null;

            if (dto.getIsNewIngredient() != null && dto.getIsNewIngredient()) {
                ingredient = newIngredientMap.get(dto.getIngredientName());
            } else if (dto.getIngredientId() != null) {
                ingredient = ingredientRepository.findById(dto.getIngredientId()).orElse(null);
            } else if (dto.getIngredientKey() != null) {
                ingredient = ingredientRepository.findByKeyIgnoreCase(dto.getIngredientKey()).orElse(null);
            } else if (dto.getIngredientName() != null) {
                ingredient = ingredientRepository.findByNameIgnoreCase(dto.getIngredientName()).orElse(null);
            }

            if (ingredient != null &&
                (ingredient.getMacrosVerified() == null || !ingredient.getMacrosVerified())) {
                unverifiedIngredients.add(ingredient.getName());
            }
        }

        if (!unverifiedIngredients.isEmpty()) {
            throw new IllegalStateException(
                    "Cannot set recipe to live: the following ingredients have unverified macros: " +
                    String.join(", ", unverifiedIngredients) +
                    ". Please verify macro data for all ingredients before publishing.");
        }
    }

    private Map<String, Ingredient> createNewIngredients(List<NewIngredientDTO> newIngredients) {
        Map<String, Ingredient> map = new HashMap<>();
        if (newIngredients == null || newIngredients.isEmpty()) {
            return map;
        }

        for (NewIngredientDTO dto : newIngredients) {
            // Generate key from name
            String key = ingredientService.generateKeyFromName(dto.getName());

            // Get aisle
            Aisle aisle = aisleRepository.findById(dto.getAisleId())
                    .orElseThrow(() -> new RuntimeException("Aisle not found with id: " + dto.getAisleId()));

            // Create ingredient
            Ingredient ingredient = new Ingredient();
            ingredient.setKey(key);
            ingredient.setName(ingredientService.normalizeName(dto.getName()));
            ingredient.setAisle(aisle);

            ingredient = ingredientRepository.save(ingredient);
            map.put(dto.getTempId(), ingredient);
        }

        return map;
    }

    private Map<String, Unit> createNewUnits(List<NewUnitDTO> newUnits) {
        Map<String, Unit> map = new HashMap<>();
        if (newUnits == null || newUnits.isEmpty()) {
            return map;
        }

        for (NewUnitDTO dto : newUnits) {
            // Generate key from value
            String key = dto.getValue().toUpperCase().replace(" ", "_");

            // Create unit
            Unit unit = new Unit();
            unit.setKey(key);
            unit.setValue(dto.getValue());

            unit = unitRepository.save(unit);
            map.put(dto.getTempId(), unit);
        }

        return map;
    }

    private void addMealTypes(Recipe recipe, List<String> mealTypes) {
        for (String mealKey : mealTypes) {
            Meal meal = mealRepository.findByKey(mealKey.toLowerCase())
                    .orElseThrow(() -> new RuntimeException("Meal type not found: " + mealKey));

            RecipeMeal recipeMeal = new RecipeMeal();
            recipeMeal.setRecipe(recipe);
            recipeMeal.setMeal(meal);
            recipe.getMeals().add(recipeMeal);
        }
    }

    private void addIngredients(Recipe recipe, List<RecipeIngredientAdminDTO> ingredientDTOs,
                                Map<String, Ingredient> newIngredientMap, Map<String, Unit> newUnitMap) {
        int sortOrder = 0;
        for (RecipeIngredientAdminDTO dto : ingredientDTOs) {
            // Get or create ingredient
            Ingredient ingredient;
            if (dto.getIsNewIngredient() != null && dto.getIsNewIngredient()) {
                // Use temp ID to find newly created ingredient
                ingredient = newIngredientMap.get(dto.getIngredientName());
                if (ingredient == null) {
                    throw new RuntimeException("New ingredient not found in map: " + dto.getIngredientName());
                }
            } else if (dto.getIngredientId() != null) {
                ingredient = ingredientRepository.findById(dto.getIngredientId())
                        .orElseThrow(() -> new RuntimeException("Ingredient not found: " + dto.getIngredientId()));
            } else if (dto.getIngredientKey() != null) {
                ingredient = ingredientRepository.findByKeyIgnoreCase(dto.getIngredientKey())
                        .orElseThrow(() -> new RuntimeException("Ingredient not found with key: " + dto.getIngredientKey()));
            } else {
                // Try to find by name
                ingredient = ingredientRepository.findByNameIgnoreCase(dto.getIngredientName())
                        .orElseThrow(() -> new RuntimeException("Ingredient not found: " + dto.getIngredientName()));
            }

            // Get or create unit
            Unit unit;
            if (dto.getIsNewUnit() != null && dto.getIsNewUnit()) {
                unit = newUnitMap.get(dto.getUnitValue());
                if (unit == null) {
                    throw new RuntimeException("New unit not found in map: " + dto.getUnitValue());
                }
            } else if (dto.getUnitId() != null) {
                unit = unitRepository.findById(dto.getUnitId())
                        .orElseThrow(() -> new RuntimeException("Unit not found: " + dto.getUnitId()));
            } else if (dto.getUnitKey() != null) {
                unit = unitRepository.findByKeyIgnoreCase(dto.getUnitKey())
                        .orElseThrow(() -> new RuntimeException("Unit not found with key: " + dto.getUnitKey()));
            } else {
                unit = unitRepository.findByValueIgnoreCase(dto.getUnitValue())
                        .orElseThrow(() -> new RuntimeException("Unit not found: " + dto.getUnitValue()));
            }

            RecipeIngredient recipeIngredient = new RecipeIngredient();
            recipeIngredient.setRecipe(recipe);
            recipeIngredient.setIngredient(ingredient);
            recipeIngredient.setQuantity(dto.getQuantity());
            recipeIngredient.setUnit(unit);
            // FR-084: Set quantity_grams for macro calculation
            recipeIngredient.setQuantityGrams(dto.getQuantityGrams());
            recipeIngredient.setSortOrder(dto.getSortOrder() != null ? dto.getSortOrder() : sortOrder++);

            recipe.getIngredients().add(recipeIngredient);
        }
    }

    private void addSteps(Recipe recipe, List<RecipeStepAdminDTO> stepDTOs) {
        int stepNumber = 1;
        for (RecipeStepAdminDTO dto : stepDTOs) {
            // Skip empty steps (FR-046: empty steps are removed)
            if (dto.getInstruction() == null || dto.getInstruction().trim().isEmpty()) {
                continue;
            }

            RecipeStep step = new RecipeStep();
            step.setRecipe(recipe);
            step.setStepNumber(stepNumber++);
            step.setInstruction(dto.getInstruction().trim());
            step.setTip(dto.getTip());

            recipe.getSteps().add(step);
        }
    }

    private RecipeDTO convertToAdminDTO(Recipe recipe) {
        RecipeDTO dto = convertToDTO(recipe);
        // Admin DTO could include additional fields like isLive, createdAt, etc.
        return dto;
    }

    private RecipeAdminDTO convertToRecipeAdminDTO(Recipe recipe) {
        return RecipeAdminDTO.builder()
                .id(recipe.getId())
                .name(recipe.getName())
                .defaultServings(recipe.getDefaultServings())
                .calories(recipe.getCalories())
                .isCheat(recipe.getIsCheat())
                .isLive(recipe.getIsLive())
                .mealTypes(recipe.getMeals().stream()
                        .map(m -> m.getMeal().getKey())
                        .collect(Collectors.toList()))
                .ingredients(recipe.getIngredients().stream()
                        .map(this::convertToIngredientAdminDTO)
                        .collect(Collectors.toList()))
                .steps(recipe.getSteps().stream()
                        .map(this::convertToStepAdminDTO)
                        .collect(Collectors.toList()))
                .build();
    }

    private RecipeIngredientAdminDTO convertToIngredientAdminDTO(RecipeIngredient ri) {
        return RecipeIngredientAdminDTO.builder()
                .id(ri.getId())
                .ingredientId(ri.getIngredient().getId())
                .ingredientKey(ri.getIngredient().getKey())
                .ingredientName(ri.getIngredient().getName())
                .quantity(ri.getQuantity())
                .unitId(ri.getUnit().getId())
                .unitKey(ri.getUnit().getKey())
                .unitValue(ri.getUnit().getValue())
                // FR-084: Include quantityGrams for macro calculation
                .quantityGrams(ri.getQuantityGrams())
                .sortOrder(ri.getSortOrder())
                .aisleId(ri.getIngredient().getAisle().getId())
                .aisleName(ri.getIngredient().getAisle().getName())
                .isNewIngredient(false)
                .isNewUnit(false)
                .build();
    }

    private RecipeStepAdminDTO convertToStepAdminDTO(RecipeStep step) {
        return RecipeStepAdminDTO.builder()
                .id(step.getId())
                .stepNumber(step.getStepNumber())
                .instruction(step.getInstruction())
                .tip(step.getTip())
                .build();
    }
}
