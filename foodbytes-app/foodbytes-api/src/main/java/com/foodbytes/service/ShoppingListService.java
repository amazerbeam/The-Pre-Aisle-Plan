package com.foodbytes.service;

import com.foodbytes.dto.AggregatedShoppingListDTO;
import com.foodbytes.dto.AisleDTO;
import com.foodbytes.dto.HomemadeSelectionsDTO;
import com.foodbytes.dto.IngredientBreakdownDTO;
import com.foodbytes.dto.MealIngredientUsageDTO;
import com.foodbytes.dto.RecipeExtraNodeDTO;
import com.foodbytes.dto.ShoppingItemDTO;
import com.foodbytes.dto.ShoppingListByAisleDTO;
import com.foodbytes.model.*;
import com.foodbytes.repository.IngredientRepository;
import com.foodbytes.repository.MealPlanEntryRepository;
import com.foodbytes.repository.RecipeRepository;
import com.foodbytes.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

/**
 * Service for shopping list operations.
 * Implements FR-019 (aggregated 7-day shopping list), FR-020 (group by aisle), FR-089 (extras integration).
 */
@Service
@RequiredArgsConstructor
public class ShoppingListService {

    private final MealPlanEntryRepository mealPlanEntryRepository;
    private final RecipeRepository recipeRepository;
    private final RecipeExtrasService recipeExtrasService;
    private final IngredientRepository ingredientRepository;
    private final UserRepository userRepository;

    // Special aisle for store-bought items
    private static final Long STORE_BOUGHT_AISLE_ID = -999L;
    private static final String STORE_BOUGHT_AISLE_NAME = "Store Bought Items";
    private static final Short STORE_BOUGHT_AISLE_ORDER = 0; // Show at top

    /**
     * Get the effective meal plan owner ID for a user.
     * If the user has meal_plan_owner_id set, they share another user's meal plans (sync mode).
     * Otherwise, they use their own meal plans.
     *
     * @param userId The authenticated user's ID
     * @return The effective owner ID to use for meal plan queries
     */
    private Long getEffectiveMealPlanOwnerId(Long userId) {
        return userRepository.findById(userId)
            .map(user -> user.getMealPlanOwnerId() != null ? user.getMealPlanOwnerId() : userId)
            .orElse(userId);
    }

    /**
     * Generate aggregated shopping list from 7-day meal plan.
     * FR-019: Aggregates ingredients with scaled quantities based on servings.
     * FR-020: Groups by grocery aisle with proper sorting.
     * FR-089: Handles homemade/store-bought selections for extras.
     *
     * @param userId User ID
     * @param startDate Start date of the 7-day period
     * @param homemadeSelections Optional selections from frontend (null = all homemade)
     * @return AggregatedShoppingListDTO with items grouped by aisle
     */
    @Transactional(readOnly = true)
    public AggregatedShoppingListDTO getShoppingList(Long userId, LocalDate startDate,
                                                      HomemadeSelectionsDTO homemadeSelections) {
        Long effectiveOwnerId = getEffectiveMealPlanOwnerId(userId);
        // Calculate endDate = startDate + 7 days
        LocalDate endDate = startDate.plusDays(7);

        // Fetch meal plan entries for user in date range
        List<MealPlanEntry> entries = mealPlanEntryRepository
            .findByUserIdAndDateRange(effectiveOwnerId, startDate, endDate);

        // If no entries, return empty shopping list
        if (entries.isEmpty()) {
            return AggregatedShoppingListDTO.builder()
                .startDate(startDate)
                .endDate(endDate.minusDays(1)) // Inclusive end for display
                .aisles(new ArrayList<>())
                .totalItems(0)
                .build();
        }

        // Map to store aggregated quantities: key = (ingredientId, unitId), value = totalQuantity
        Map<IngredientUnitKey, IngredientAggregate> aggregatedIngredients = new HashMap<>();

        // FR-089: List to store store-bought items (extras marked as store-bought)
        List<StoreBoughtItem> storeBoughtItems = new ArrayList<>();

        // Extract selections map (null-safe)
        Map<Long, Map<Long, Boolean>> selectionsMap = homemadeSelections != null
            ? homemadeSelections.getSelections()
            : null;

        // Process each meal plan entry
        for (MealPlanEntry entry : entries) {
            Recipe recipe = entry.getRecipe();
            Long recipeId = recipe.getId();
            Integer entryServings = entry.getServings();
            Integer recipeDefaultServings = recipe.getDefaultServings();

            // FR-102: Create source chain starting with the main recipe
            List<Long> mainRecipeChain = Collections.singletonList(recipeId);

            // Process main recipe ingredients
            processRecipeIngredients(recipe, entryServings, recipeDefaultServings,
                                    aggregatedIngredients, mainRecipeChain);

            // FR-089: Process extras based on homemade selections
            if (recipeExtrasService.hasExtras(recipeId)) {
                List<RecipeExtraNodeDTO> extras = recipeExtrasService.buildExtrasTree(recipeId, new HashSet<>());
                Map<Long, Boolean> recipeSelections = selectionsMap != null
                    ? selectionsMap.get(recipeId)
                    : null;

                processExtras(extras, recipeSelections, entryServings, recipeDefaultServings,
                             aggregatedIngredients, storeBoughtItems, mainRecipeChain);
            }
        }

        // FR-089: Add store-bought items to aggregated list
        if (!storeBoughtItems.isEmpty()) {
            addStoreBoughtItems(storeBoughtItems, aggregatedIngredients);
        }

        // Convert aggregated data to DTOs and group by aisle
        Map<Long, List<ShoppingItemDTO>> itemsByAisle = aggregatedIngredients.values().stream()
            .map(agg -> ShoppingItemDTO.builder()
                .ingredientId(agg.ingredientId)
                .ingredientName(agg.ingredientName)
                .totalQuantity(agg.totalQuantity.setScale(2, RoundingMode.HALF_UP))
                .unit(agg.unit)
                .aisleId(agg.aisleId)
                .aisleName(agg.aisleName)
                .sourceChain(agg.sourceChain)  // FR-102: Include source chain
                .build())
            .sorted(Comparator.comparing(ShoppingItemDTO::getIngredientName)) // Sort alphabetically within aisle
            .collect(Collectors.groupingBy(
                item -> item.getAisleId() != null ? item.getAisleId() : -1L,
                LinkedHashMap::new,
                Collectors.toList()
            ));

        // Create aisle groups sorted by displayOrder
        List<AisleGroup> aisleGroups = aggregatedIngredients.values().stream()
            .collect(Collectors.groupingBy(
                agg -> agg.aisleId != null ? agg.aisleId : -1L,
                () -> new TreeMap<Long, List<IngredientAggregate>>(),
                Collectors.toList()
            ))
            .entrySet().stream()
            .map(entry -> {
                IngredientAggregate firstItem = entry.getValue().get(0);
                return new AisleGroup(
                    firstItem.aisleId,
                    firstItem.aisleName,
                    firstItem.displayOrder
                );
            })
            .sorted(Comparator.comparing(ag -> ag.displayOrder))
            .collect(Collectors.toList());

        // Build final DTO list
        List<ShoppingListByAisleDTO> aisles = aisleGroups.stream()
            .map(aisleGroup -> {
                AisleDTO aisleDTO = AisleDTO.builder()
                    .id(aisleGroup.aisleId)
                    .name(aisleGroup.aisleName)
                    .displayOrder(aisleGroup.displayOrder)
                    .build();

                List<ShoppingItemDTO> items = itemsByAisle.get(
                    aisleGroup.aisleId != null ? aisleGroup.aisleId : -1L
                );

                return ShoppingListByAisleDTO.builder()
                    .aisle(aisleDTO)
                    .items(items)
                    .build();
            })
            .collect(Collectors.toList());

        // Calculate total items count
        int totalItems = aggregatedIngredients.size();

        return AggregatedShoppingListDTO.builder()
            .startDate(startDate)
            .endDate(endDate.minusDays(1)) // Inclusive end for display
            .aisles(aisles)
            .totalItems(totalItems)
            .build();
    }

    /**
     * FR-042: Get breakdown of which meals use a specific ingredient.
     * FR-102: Added sourceChain support for finding ingredients in extras.
     * Shows each meal that uses the ingredient and how much it requires.
     *
     * @param userId User ID
     * @param ingredientId Ingredient ID
     * @param unit Unit string (e.g., "tbsp", "g")
     * @param startDate Start date of the 7-day period
     * @param sourceChain Optional chain of recipe IDs showing provenance (first = extra, last = main recipe)
     * @return IngredientBreakdownDTO with meal breakdown list
     */
    @Transactional(readOnly = true)
    public IngredientBreakdownDTO getIngredientBreakdown(Long userId, Long ingredientId,
                                                          String unit, LocalDate startDate,
                                                          List<Long> sourceChain) {
        Long effectiveOwnerId = getEffectiveMealPlanOwnerId(userId);
        LocalDate endDate = startDate.plusDays(7);

        // Fetch meal plan entries for user in date range
        List<MealPlanEntry> entries = mealPlanEntryRepository
            .findByUserIdAndDateRange(effectiveOwnerId, startDate, endDate);

        List<MealIngredientUsageDTO> mealBreakdown = new ArrayList<>();
        BigDecimal totalQuantity = BigDecimal.ZERO;
        String ingredientName = null;

        // FR-102: Determine which recipe contains the ingredient
        // sourceChain format: [extraRecipeId, ..., mainRecipeId]
        // - If 1 element: it's the main recipe (ingredient is in the main recipe, not an extra)
        // - If 2+ elements: first is the extra recipe containing the ingredient, last is the main recipe
        Long extraRecipeId = null;
        Long mainRecipeId = null;

        if (sourceChain != null && !sourceChain.isEmpty()) {
            if (sourceChain.size() == 1) {
                // Single element = main recipe only (no extra involved)
                mainRecipeId = sourceChain.get(0);
                extraRecipeId = null;
            } else {
                // Multiple elements: first = extra recipe, last = main recipe
                extraRecipeId = sourceChain.get(0);
                mainRecipeId = sourceChain.get(sourceChain.size() - 1);
            }
        }

        // Process each meal plan entry
        for (MealPlanEntry entry : entries) {
            Recipe recipe = entry.getRecipe();
            Integer entryServings = entry.getServings();
            Integer recipeDefaultServings = recipe.getDefaultServings();

            // FR-102: If sourceChain provided, only process entries matching the main recipe
            if (mainRecipeId != null && !recipe.getId().equals(mainRecipeId)) {
                continue;
            }

            // FR-102: Determine which recipe to search for the ingredient
            Recipe searchRecipe = recipe;
            if (extraRecipeId != null) {
                // Ingredient is in an extra recipe, load it
                searchRecipe = recipeRepository.findById(extraRecipeId).orElse(recipe);
            }

            // Find the specific ingredient in the search recipe
            for (RecipeIngredient recipeIngredient : searchRecipe.getIngredients()) {
                // FR-093: Skip linked recipe ingredients (they don't have an ingredient)
                if (recipeIngredient.isLinkedRecipe()) {
                    continue;
                }

                Ingredient ingredient = recipeIngredient.getIngredient();

                // Check if this is the ingredient we're looking for
                if (ingredient != null && ingredient.getId().equals(ingredientId) &&
                    recipeIngredient.getUnit().getValue().equalsIgnoreCase(unit)) {

                    // Capture ingredient name
                    if (ingredientName == null) {
                        ingredientName = ingredient.getName();
                    }

                    // Scale quantity: scaledQty = ingredient.quantity * entry.servings / recipe.defaultServings
                    BigDecimal originalQuantity = recipeIngredient.getQuantity();
                    BigDecimal scaledQuantity = originalQuantity
                        .multiply(BigDecimal.valueOf(entryServings))
                        .divide(BigDecimal.valueOf(recipeDefaultServings), 2, RoundingMode.HALF_UP);

                    // Add to total
                    totalQuantity = totalQuantity.add(scaledQuantity);

                    // FR-102: Display the main recipe name (not the extra)
                    String displayName = recipe.getName();

                    // Add meal breakdown entry
                    mealBreakdown.add(new MealIngredientUsageDTO(
                        displayName,
                        entry.getMeal().getKey(),
                        entry.getPlanDate(),
                        scaledQuantity,
                        entryServings
                    ));
                }
            }
        }

        // Sort by date, then meal type
        mealBreakdown.sort(Comparator
            .comparing(MealIngredientUsageDTO::getPlanDate)
            .thenComparing(MealIngredientUsageDTO::getMealType));

        return new IngredientBreakdownDTO(
            ingredientId,
            ingredientName != null ? ingredientName : "Unknown Ingredient",
            unit,
            totalQuantity.setScale(2, RoundingMode.HALF_UP),
            mealBreakdown
        );
    }

    /**
     * Key class for aggregating ingredients by (ingredientId, unitId).
     */
    private static class IngredientUnitKey {
        private final Long ingredientId;
        private final Long unitId;

        public IngredientUnitKey(Long ingredientId, Long unitId) {
            this.ingredientId = ingredientId;
            this.unitId = unitId;
        }

        @Override
        public boolean equals(Object o) {
            if (this == o) return true;
            if (o == null || getClass() != o.getClass()) return false;
            IngredientUnitKey that = (IngredientUnitKey) o;
            return Objects.equals(ingredientId, that.ingredientId) &&
                   Objects.equals(unitId, that.unitId);
        }

        @Override
        public int hashCode() {
            return Objects.hash(ingredientId, unitId);
        }
    }

    /**
     * Helper class to store aggregated ingredient data.
     * FR-102: Added sourceChain for tracking ingredient provenance.
     */
    private static class IngredientAggregate {
        private final Long ingredientId;
        private final String ingredientName;
        private BigDecimal totalQuantity;
        private final String unit;
        private final Long aisleId;
        private final String aisleName;
        private final Short displayOrder;
        private final List<Long> sourceChain;  // FR-102: Recipe chain for provenance

        public IngredientAggregate(Long ingredientId, String ingredientName, BigDecimal totalQuantity,
                                   String unit, Long aisleId, String aisleName, Short displayOrder,
                                   List<Long> sourceChain) {
            this.ingredientId = ingredientId;
            this.ingredientName = ingredientName;
            this.totalQuantity = totalQuantity;
            this.unit = unit;
            this.aisleId = aisleId;
            this.aisleName = aisleName;
            this.displayOrder = displayOrder;
            this.sourceChain = sourceChain;
        }

        public void addQuantity(BigDecimal quantity) {
            this.totalQuantity = this.totalQuantity.add(quantity);
        }
    }

    /**
     * Helper class to store aisle grouping information.
     */
    private static class AisleGroup {
        private final Long aisleId;
        private final String aisleName;
        private final Short displayOrder;

        public AisleGroup(Long aisleId, String aisleName, Short displayOrder) {
            this.aisleId = aisleId;
            this.aisleName = aisleName;
            this.displayOrder = displayOrder;
        }
    }

    /**
     * FR-089: Helper class for store-bought items.
     */
    private static class StoreBoughtItem {
        private final Long recipeId;
        private final String recipeName;
        private int count;

        public StoreBoughtItem(Long recipeId, String recipeName) {
            this.recipeId = recipeId;
            this.recipeName = recipeName;
            this.count = 1;
        }
    }

    /**
     * FR-089: Process ingredients for a single recipe, adding to aggregated map.
     * FR-093: Skip linked recipe ingredients (handled by extras system).
     * FR-102: Added sourceChain parameter for tracking ingredient provenance.
     * @param sourceChain Chain of recipe IDs for provenance (null for main recipes)
     */
    private void processRecipeIngredients(Recipe recipe, Integer entryServings, Integer defaultServings,
                                          Map<IngredientUnitKey, IngredientAggregate> aggregatedIngredients,
                                          List<Long> sourceChain) {
        for (RecipeIngredient recipeIngredient : recipe.getIngredients()) {
            // FR-093: Skip linked recipe ingredients - they are handled by extras system
            if (recipeIngredient.isLinkedRecipe()) {
                continue;
            }

            // Scale quantity: scaledQty = ingredient.quantity * entry.servings / recipe.defaultServings
            BigDecimal originalQuantity = recipeIngredient.getQuantity();
            BigDecimal scaledQuantity = originalQuantity
                .multiply(BigDecimal.valueOf(entryServings))
                .divide(BigDecimal.valueOf(defaultServings), 2, RoundingMode.HALF_UP);

            // Create key for aggregation (ingredientId, unitId)
            Long ingredientId = recipeIngredient.getIngredient().getId();
            Long unitId = recipeIngredient.getUnit().getId();
            IngredientUnitKey key = new IngredientUnitKey(ingredientId, unitId);

            // Aggregate quantities
            final List<Long> finalSourceChain = sourceChain;
            aggregatedIngredients.compute(key, (k, existing) -> {
                if (existing == null) {
                    // First occurrence of this ingredient+unit combination
                    Ingredient ingredient = recipeIngredient.getIngredient();
                    Aisle aisle = ingredient.getAisle();
                    return new IngredientAggregate(
                        ingredientId,
                        ingredient.getName(),
                        scaledQuantity,
                        recipeIngredient.getUnit().getValue(),
                        aisle != null ? aisle.getId() : null,
                        aisle != null ? aisle.getName() : "Other",
                        aisle != null ? aisle.getDisplayOrder() : (short) 15,
                        finalSourceChain
                    );
                } else {
                    // Add to existing quantity
                    existing.totalQuantity = existing.totalQuantity.add(scaledQuantity);
                    return existing;
                }
            });
        }
    }

    /**
     * FR-089: Process extras recursively, adding ingredients or store-bought items.
     * FR-102: Added sourceChain parameter for tracking ingredient provenance.
     *
     * @param extras List of extra nodes to process
     * @param selections Map of extraRecipeId -> isHomemade (null = all homemade)
     * @param entryServings Servings for the meal plan entry
     * @param defaultServings Default servings for the parent recipe
     * @param aggregatedIngredients Map to add ingredients to
     * @param storeBoughtItems List to add store-bought items to
     * @param parentSourceChain Source chain from parent (to build upon)
     */
    private void processExtras(List<RecipeExtraNodeDTO> extras,
                               Map<Long, Boolean> selections,
                               Integer entryServings,
                               Integer defaultServings,
                               Map<IngredientUnitKey, IngredientAggregate> aggregatedIngredients,
                               List<StoreBoughtItem> storeBoughtItems,
                               List<Long> parentSourceChain) {
        if (extras == null || extras.isEmpty()) {
            return;
        }

        for (RecipeExtraNodeDTO extra : extras) {
            Long extraRecipeId = extra.getRecipeId();

            // FR-102: Build source chain for this extra (prepend extra recipe ID to parent chain)
            List<Long> currentSourceChain = new ArrayList<>();
            currentSourceChain.add(extraRecipeId);
            if (parentSourceChain != null) {
                currentSourceChain.addAll(parentSourceChain);
            }

            // Check if homemade (default true if no selection)
            Boolean selectionValue = selections != null ? selections.get(extraRecipeId) : null;
            boolean isHomemade = selections == null || selectionValue == null || selectionValue;

            if (isHomemade) {
                // Add extra's ingredients to shopping list
                Recipe extraRecipe = recipeRepository.findById(extraRecipeId).orElse(null);
                if (extraRecipe != null) {
                    processRecipeIngredients(extraRecipe, entryServings, defaultServings,
                                           aggregatedIngredients, currentSourceChain);
                }

                // Process children recursively
                if (extra.getChildren() != null && !extra.getChildren().isEmpty()) {
                    processExtras(extra.getChildren(), selections, entryServings, defaultServings,
                                 aggregatedIngredients, storeBoughtItems, currentSourceChain);
                }
            } else {
                // FR-103: Store-bought selected - use the actual ingredient if available
                Long storeBoughtIngredientId = extra.getStoreBoughtIngredientId();
                if (storeBoughtIngredientId != null) {
                    // Add the actual store-bought ingredient with proper aisle
                    addStoreBoughtIngredient(storeBoughtIngredientId, aggregatedIngredients, currentSourceChain);
                } else {
                    // Fallback to old behavior (special aisle) for extras without store-bought ingredient
                    storeBoughtItems.add(new StoreBoughtItem(extraRecipeId, extra.getRecipeName()));
                }
                // Don't process children - they're covered by the store-bought parent
            }
        }
    }

    /**
     * FR-103: Add a store-bought ingredient to the shopping list with its proper aisle.
     * FR-102: Added sourceChain parameter for tracking ingredient provenance.
     */
    private void addStoreBoughtIngredient(Long ingredientId,
                                          Map<IngredientUnitKey, IngredientAggregate> aggregatedIngredients,
                                          List<Long> sourceChain) {
        Ingredient ingredient = ingredientRepository.findById(ingredientId).orElse(null);
        if (ingredient == null) {
            return;
        }

        // Use "piece" as the unit for store-bought extras
        IngredientUnitKey key = new IngredientUnitKey(ingredientId, 0L); // 0 = no specific unit
        IngredientAggregate existing = aggregatedIngredients.get(key);

        if (existing != null) {
            // Aggregate with existing
            existing.addQuantity(BigDecimal.ONE);
        } else {
            // Create new entry
            Aisle aisle = ingredient.getAisle();
            aggregatedIngredients.put(key, new IngredientAggregate(
                ingredientId,
                ingredient.getName(),
                BigDecimal.ONE,
                "",  // No unit display for store-bought items
                aisle != null ? aisle.getId() : null,
                aisle != null ? aisle.getName() : "Other",
                aisle != null ? aisle.getDisplayOrder() : Short.MAX_VALUE,
                sourceChain
            ));
        }
    }

    /**
     * FR-089: Add store-bought items to the shopping list.
     */
    private void addStoreBoughtItems(List<StoreBoughtItem> storeBoughtItems,
                                     Map<IngredientUnitKey, IngredientAggregate> aggregatedIngredients) {
        // Aggregate duplicate store-bought items
        Map<Long, StoreBoughtItem> aggregated = new LinkedHashMap<>();
        for (StoreBoughtItem item : storeBoughtItems) {
            aggregated.compute(item.recipeId, (k, existing) -> {
                if (existing == null) {
                    return item;
                } else {
                    existing.count++;
                    return existing;
                }
            });
        }

        // Add to aggregated ingredients as special items (negative IDs to avoid conflicts)
        long storeBoughtIndex = -1000L;
        for (StoreBoughtItem item : aggregated.values()) {
            String itemName = "Store Bought " + item.recipeName;
            if (item.count > 1) {
                itemName += " (x" + item.count + ")";
            }

            IngredientUnitKey key = new IngredientUnitKey(storeBoughtIndex, storeBoughtIndex);
            aggregatedIngredients.put(key, new IngredientAggregate(
                storeBoughtIndex,
                itemName,
                BigDecimal.ONE,
                "",  // No unit for store-bought items
                STORE_BOUGHT_AISLE_ID,
                STORE_BOUGHT_AISLE_NAME,
                STORE_BOUGHT_AISLE_ORDER,
                null  // FR-102: No source chain for fallback store-bought items
            ));
            storeBoughtIndex--;
        }
    }
}
