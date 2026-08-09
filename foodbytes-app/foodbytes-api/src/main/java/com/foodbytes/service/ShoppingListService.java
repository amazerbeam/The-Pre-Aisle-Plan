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
import lombok.extern.slf4j.Slf4j;
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
@Slf4j
public class ShoppingListService {

    private final MealPlanEntryRepository mealPlanEntryRepository;
    private final RecipeRepository recipeRepository;
    private final RecipeExtrasService recipeExtrasService;
    private final IngredientRepository ingredientRepository;
    private final UserRepository userRepository;
    private final MacroCalculationService macroCalculationService; // MPP-1: reuse calculateRecipeTotalYield

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

        // MPP-1: Request-scoped memoisation, mirroring getIngredientBreakdown's extraRecipeCache —
        // the same extra recipe (e.g. a sauce/dough reused across the week) is looked up at most
        // once per shopping-list generation instead of once per meal-plan entry that uses it.
        Map<Long, Recipe> extraRecipeCache = new HashMap<>();

        // Extract selections map (null-safe)
        Map<Long, Map<Long, Boolean>> selectionsMap = homemadeSelections != null
            ? homemadeSelections.getSelections()
            : null;

        // Process each meal plan entry
        for (MealPlanEntry entry : entries) {
            Recipe recipe = entry.getRecipe();
            Long recipeId = recipe.getId();
            BigDecimal entryServings = entry.getServings();
            Integer recipeDefaultServings = recipe.getDefaultServings();
            // MPP-1: pre-resolve once — the fraction of the MAIN recipe's own batch needed.
            // Extras derive their own ratio from this one via resolveExtraPortionRatio, not from
            // entryServings/defaultServings directly.
            BigDecimal mainRatio = entryServings.divide(BigDecimal.valueOf(recipeDefaultServings), 10, RoundingMode.HALF_UP);

            // FR-102: Create source chain starting with the main recipe
            List<Long> mainRecipeChain = Collections.singletonList(recipeId);

            // Process main recipe ingredients
            processRecipeIngredients(recipe, mainRatio, aggregatedIngredients, mainRecipeChain);

            // FR-089: Process extras based on homemade selections
            if (recipeExtrasService.hasExtras(recipeId)) {
                List<RecipeExtraNodeDTO> extras = recipeExtrasService.buildExtrasTree(recipeId, new HashSet<>());
                Map<Long, Boolean> recipeSelections = selectionsMap != null
                    ? selectionsMap.get(recipeId)
                    : null;

                processExtras(extras, recipeSelections, recipe, mainRatio,
                             aggregatedIngredients, storeBoughtItems, mainRecipeChain, extraRecipeCache);
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
     * FR-102: Extras are searched too, so ingredients that come from a sub-recipe are found.
     * Shows every meal that uses the ingredient and how much it requires.
     *
     * <p>The breakdown must mirror {@link #getShoppingList}: a shopping list row is the sum of
     * the ingredient across ALL planned meals (and their homemade extras), so this scans every
     * meal plan entry rather than a single recipe. Selections aren't available on this endpoint,
     * so extras are treated as homemade — the same default aggregation uses when no selections
     * are supplied.
     *
     * <p><b>Known divergence when a component is toggled to store-bought (FR-103).</b> This is a
     * GET with no {@link HomemadeSelectionsDTO} body, so it cannot see the user's homemade/
     * store-bought toggles. The persisted row, by contrast, comes from
     * {@code getShoppingList(…, homemadeSelections)}, and {@link #processExtras} SKIPS a
     * store-bought extra's whole ingredient subtree, substituting a single raw store-bought
     * ingredient instead. Consequently, for any row fed by a store-bought component this method
     * does NOT merely list a few extra rows the shopping list omits — it also <b>over-states
     * {@code totalQuantity} by that entire subtree's contribution</b>. The header the popup
     * presents as the authoritative total for the row can therefore exceed the row itself. The
     * discrepancy is NOT cosmetic. The honest fix is a POST carrying the selections; that needs a
     * new request shape and is deliberately out of scope here.
     *
     * @param userId User ID
     * @param ingredientId Ingredient ID
     * @param unit Unit string (e.g., "tbsp", "g")
     * @param startDate Start date of the 7-day period
     * @param sourceChain Legacy provenance hint from the shopping list row. Ignored: the row is
     *                    aggregated across recipes but IngredientAggregate only keeps the FIRST
     *                    contributor's chain, so filtering on it hid every other dish using the
     *                    ingredient. Kept on the signature for API compatibility.
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

        // Request-scoped memoisation: the same recipe usually appears on several days, so build
        // each extras tree once and load each distinct extra recipe once per call.
        Map<Long, List<RecipeExtraNodeDTO>> extrasTreeCache = new HashMap<>();
        Map<Long, Recipe> extraRecipeCache = new HashMap<>();

        // Process each meal plan entry
        for (MealPlanEntry entry : entries) {
            Recipe recipe = entry.getRecipe();
            BigDecimal entryServings = entry.getServings();
            Integer recipeDefaultServings = recipe.getDefaultServings();
            // MPP-1: same pre-resolved ratio as getShoppingList's mainRatio — the two entry
            // points are kept symmetric on purpose so they can never disagree.
            BigDecimal mainRatio = entryServings.divide(BigDecimal.valueOf(recipeDefaultServings), 10, RoundingMode.HALF_UP);

            // Collect every use of the ingredient in this meal: the main recipe first,
            // then its extras (recursively) — the same traversal getShoppingList aggregates over.
            List<IngredientUsage> usages = new ArrayList<>();
            collectIngredientUsages(recipe, ingredientId, unit, null, mainRatio, usages);

            List<RecipeExtraNodeDTO> extras = extrasTreeCache.computeIfAbsent(
                recipe.getId(),
                id -> recipeExtrasService.hasExtras(id)
                    ? recipeExtrasService.buildExtrasTree(id, new HashSet<>())
                    : Collections.emptyList());
            collectUsagesFromExtras(extras, ingredientId, unit, usages, extraRecipeCache, recipe, mainRatio);

            for (IngredientUsage usage : usages) {
                // Capture ingredient name
                if (ingredientName == null) {
                    ingredientName = usage.ingredientName();
                }

                // MPP-1: ratio is already fully resolved per-usage at collection time (see
                // collectIngredientUsages / collectUsagesFromExtras) — no separate
                // entryServings/defaultServings multiply here anymore.
                BigDecimal scaledQuantity = usage.quantity()
                    .multiply(usage.ratio())
                    .setScale(2, RoundingMode.HALF_UP);

                // Add to total
                totalQuantity = totalQuantity.add(scaledQuantity);

                // Add meal breakdown entry — named by the planned dish, with the extra (if any)
                // carried separately so the row stays recognisable against the meal plan.
                mealBreakdown.add(new MealIngredientUsageDTO(
                    recipe.getName(),
                    entry.getMeal().getKey(),
                    entry.getPlanDate(),
                    scaledQuantity,
                    entryServings,
                    usage.viaRecipeName()
                ));
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
     * FR-042: Find each row of a recipe that uses the given ingredient in the given unit.
     *
     * @param viaRecipeName Name of the extra the ingredient came from, or null for the main recipe
     * @param ratio MPP-1: fully-resolved scale factor for this recipe's own ingredients — mainRatio
     *              for the main recipe, or the portionRatio resolved by resolveExtraPortionRatio
     *              for an extra
     */
    private void collectIngredientUsages(Recipe recipe, Long ingredientId, String unit,
                                         String viaRecipeName, BigDecimal ratio, List<IngredientUsage> usages) {
        for (RecipeIngredient recipeIngredient : recipe.getIngredients()) {
            // FR-093: Skip linked recipe ingredients (they don't have an ingredient)
            if (recipeIngredient.isLinkedRecipe()) {
                continue;
            }

            Ingredient ingredient = recipeIngredient.getIngredient();
            if (ingredient != null && ingredient.getId().equals(ingredientId) &&
                recipeIngredient.getUnit().getValue().equalsIgnoreCase(unit)) {
                usages.add(new IngredientUsage(
                    ingredient.getName(),
                    recipeIngredient.getQuantity(),
                    viaRecipeName,
                    ratio
                ));
            }
        }
    }

    /**
     * FR-042: Walk an extras tree looking for the ingredient, labelling each hit with the extra
     * it came from. Cycle detection is handled by RecipeExtrasService.buildExtrasTree.
     *
     * <p><b>Loads extras with {@code findById}, deliberately — do NOT "optimise" this to
     * {@code findWithDetailsById}.</b> That finder's {@code @EntityGraph} LEFT JOIN FETCHes TWO
     * collections, {@code ingredients} (a {@code List} with no {@code @OrderColumn}, i.e. a
     * Hibernate bag) and {@code meals} (a {@code Set}). The SQL rows are the cartesian product of
     * the two, and bag initialisation does not de-duplicate — so the {@code Set} collapses while
     * every {@code RecipeIngredient} survives once per {@code recipe_meals} row. Because
     * {@link #collectIngredientUsages} SUMS over {@code recipe.getIngredients()}, an extra tagged
     * with 2 meals would report every quantity twice and inflate the popup's header total against
     * a shopping-list row that reads correctly. {@link #processExtras} uses plain
     * {@code findById} for exactly this reason; this method matches it and relies on the
     * {@code @BatchSize(20)} on {@code Recipe.ingredients} the same way — repeated tree entries
     * share one {@code Recipe} via session identity, so the batch loader keeps this to ~1-2
     * queries per call rather than one per entry.
     *
     * @param extraRecipeCache Request-scoped cache so each distinct extra is loaded at most once
     * @param parentRecipe The recipe that OWNS these extras (has the linked_recipe_id rows)
     * @param parentRatio Fraction of parentRecipe's own batch actually needed
     */
    private void collectUsagesFromExtras(List<RecipeExtraNodeDTO> extras, Long ingredientId,
                                         String unit, List<IngredientUsage> usages,
                                         Map<Long, Recipe> extraRecipeCache,
                                         Recipe parentRecipe, BigDecimal parentRatio) {
        for (RecipeExtraNodeDTO extra : extras) {
            // computeIfAbsent does not cache a null result, so a missing recipe is simply skipped.
            // findById (not findWithDetailsById) — see the javadoc: the @EntityGraph finder
            // duplicates the `ingredients` bag per recipe_meals row and would double-count here.
            Recipe extraRecipe = extraRecipeCache.computeIfAbsent(
                extra.getRecipeId(),
                id -> recipeRepository.findById(id).orElse(null));

            if (extraRecipe != null) {
                // MPP-1: prorate by how much of THIS extra's own batch the parent actually uses
                BigDecimal portionRatio = resolveExtraPortionRatio(parentRecipe, extra.getRecipeId(), parentRatio, extraRecipe);
                if (portionRatio.compareTo(BigDecimal.ZERO) > 0) {
                    collectIngredientUsages(extraRecipe, ingredientId, unit,
                                            extra.getRecipeName(), portionRatio, usages);

                    if (extra.getChildren() != null && !extra.getChildren().isEmpty()) {
                        collectUsagesFromExtras(extra.getChildren(), ingredientId, unit,
                                                usages, extraRecipeCache, extraRecipe, portionRatio);
                    }
                }
            }
        }
    }

    /**
     * FR-042: One use of an ingredient inside a recipe (or one of its extras).
     * MPP-1: ratio is the fully-resolved scale factor for THIS occurrence, computed at
     * collection time (mainRatio for the main recipe, or resolveExtraPortionRatio's result
     * for anything found inside an extra).
     */
    private record IngredientUsage(String ingredientName, BigDecimal quantity, String viaRecipeName, BigDecimal ratio) {}

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
     * MPP-1: ratio replaces the old (entryServings, defaultServings) pair — for the MAIN recipe
     * it is entryServings/defaultServings (unchanged); for a linked extra's own ingredients it is
     * the portionRatio resolved by resolveExtraPortionRatio.
     * @param ratio Fraction of THIS recipe's own batch actually needed
     * @param sourceChain Chain of recipe IDs for provenance (null for main recipes)
     */
    private void processRecipeIngredients(Recipe recipe, BigDecimal ratio,
                                          Map<IngredientUnitKey, IngredientAggregate> aggregatedIngredients,
                                          List<Long> sourceChain) {
        for (RecipeIngredient recipeIngredient : recipe.getIngredients()) {
            // FR-093: Skip linked recipe ingredients - they are handled by extras system
            if (recipeIngredient.isLinkedRecipe()) {
                continue;
            }

            BigDecimal originalQuantity = recipeIngredient.getQuantity();
            BigDecimal scaledQuantity = originalQuantity.multiply(ratio).setScale(2, RoundingMode.HALF_UP);

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
     * MPP-1: parentRecipe/parentRatio replace the old (entryServings, defaultServings) pair.
     * Each extra's own ratio is resolved from parentRecipe's linked_recipe_id row via
     * resolveExtraPortionRatio, not inherited directly from the top-level meal's servings.
     *
     * @param extras List of extra nodes to process
     * @param selections Map of extraRecipeId -> isHomemade (null = all homemade)
     * @param parentRecipe The recipe that OWNS these extras (has the linked_recipe_id rows)
     * @param parentRatio Fraction of parentRecipe's own batch actually needed
     * @param aggregatedIngredients Map to add ingredients to
     * @param storeBoughtItems List to add store-bought items to
     * @param parentSourceChain Source chain from parent (to build upon)
     * @param extraRecipeCache Request-scoped cache so each distinct extra is loaded at most once
     *                         (mirrors {@link #collectUsagesFromExtras}'s cache of the same name)
     */
    private void processExtras(List<RecipeExtraNodeDTO> extras,
                               Map<Long, Boolean> selections,
                               Recipe parentRecipe,
                               BigDecimal parentRatio,
                               Map<IngredientUnitKey, IngredientAggregate> aggregatedIngredients,
                               List<StoreBoughtItem> storeBoughtItems,
                               List<Long> parentSourceChain,
                               Map<Long, Recipe> extraRecipeCache) {
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
                // MPP-1: prorate by how much of THIS extra's own batch the parent actually uses.
                // computeIfAbsent does not cache a null result, so a missing recipe is simply
                // skipped — same contract as collectUsagesFromExtras's extraRecipeCache.
                Recipe extraRecipe = extraRecipeCache.computeIfAbsent(
                    extraRecipeId,
                    id -> recipeRepository.findById(id).orElse(null));
                if (extraRecipe != null) {
                    BigDecimal portionRatio = resolveExtraPortionRatio(parentRecipe, extraRecipeId, parentRatio, extraRecipe);
                    if (portionRatio.compareTo(BigDecimal.ZERO) > 0) {
                        processRecipeIngredients(extraRecipe, portionRatio, aggregatedIngredients, currentSourceChain);

                        // Process children recursively, carrying THIS extra's resolved ratio forward
                        if (extra.getChildren() != null && !extra.getChildren().isEmpty()) {
                            processExtras(extra.getChildren(), selections, extraRecipe, portionRatio,
                                         aggregatedIngredients, storeBoughtItems, currentSourceChain,
                                         extraRecipeCache);
                        }
                    }
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
     * MPP-1: How much of a linked-recipe extra is needed at the current scale, expressed as a
     * fraction of the CHILD recipe's own total yield. Mirrors
     * {@link MacroCalculationService#calculateLinkedRecipeMacros} so the shopping list and the
     * macro traffic light agree on what "using 400g of an 8-serving batch" means.
     *
     * <p>usedGrams = parentRecipe's own recipe_ingredients.quantity_grams for this link, scaled
     * by however much of the PARENT's own batch is needed (parentRatio). portionRatio =
     * usedGrams / childRecipe's total yield.
     *
     * @return the ratio to apply to childRecipe's own ingredient quantities, or ZERO if
     *         parentRecipe has no matching linked_recipe_id row for childRecipeId, or
     *         childRecipe's total yield is zero — both are data-integrity states (see
     *         linked-recipe-extras.md), not recoverable runtime states.
     */
    private BigDecimal resolveExtraPortionRatio(Recipe parentRecipe, Long childRecipeId,
                                                BigDecimal parentRatio, Recipe childRecipe) {
        BigDecimal linkQuantityGrams = findLinkedQuantityGrams(parentRecipe, childRecipeId);
        if (linkQuantityGrams == null) {
            // Null-safe: linkQuantityGrams can be null either because no matching linked_recipe_id
            // row was found on a non-null parentRecipe, or because parentRecipe itself was null —
            // don't let the diagnostic log NPE on the very case it's meant to surface.
            log.warn("No recipe_ingredients row on recipe {} links to extra recipe {}; " +
                     "cannot prorate its raw ingredients for the shopping list.",
                     parentRecipe != null ? parentRecipe.getId() : "?", childRecipeId);
            return BigDecimal.ZERO;
        }

        BigDecimal usedGrams = linkQuantityGrams.multiply(parentRatio);
        BigDecimal totalYield = macroCalculationService.calculateRecipeTotalYield(childRecipe);
        if (totalYield.compareTo(BigDecimal.ZERO) <= 0) {
            log.warn("Extra recipe {} has 0 total yield; cannot prorate its raw ingredients.", childRecipeId);
            return BigDecimal.ZERO;
        }

        return usedGrams.divide(totalYield, 10, RoundingMode.HALF_UP);
    }

    /**
     * MPP-1: Find parentRecipe's own recipe_ingredients row with linked_recipe_id = childRecipeId
     * and return its quantity_grams — the "how much of the child is used" figure needed to
     * prorate the child's own raw ingredients. Returns null if no such row exists.
     */
    private BigDecimal findLinkedQuantityGrams(Recipe parentRecipe, Long childRecipeId) {
        if (parentRecipe == null || parentRecipe.getIngredients() == null) {
            return null;
        }
        for (RecipeIngredient ri : parentRecipe.getIngredients()) {
            if (ri.isLinkedRecipe() && ri.getLinkedRecipe().getId().equals(childRecipeId)) {
                return ri.getQuantityGrams();
            }
        }
        return null;
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
