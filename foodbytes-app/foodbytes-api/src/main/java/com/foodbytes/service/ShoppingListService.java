package com.foodbytes.service;

import com.foodbytes.dto.AggregatedShoppingListDTO;
import com.foodbytes.dto.AisleDTO;
import com.foodbytes.dto.ShoppingItemDTO;
import com.foodbytes.dto.ShoppingListByAisleDTO;
import com.foodbytes.model.*;
import com.foodbytes.repository.MealPlanEntryRepository;
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
 * Implements FR-019 (aggregated 7-day shopping list) and FR-020 (group by aisle).
 */
@Service
@RequiredArgsConstructor
public class ShoppingListService {

    private final MealPlanEntryRepository mealPlanEntryRepository;

    /**
     * Generate aggregated shopping list from 7-day meal plan.
     * FR-019: Aggregates ingredients with scaled quantities based on servings.
     * FR-020: Groups by grocery aisle with proper sorting.
     *
     * @param userId User ID
     * @param startDate Start date of the 7-day period
     * @return AggregatedShoppingListDTO with items grouped by aisle
     */
    @Transactional(readOnly = true)
    public AggregatedShoppingListDTO getShoppingList(Long userId, LocalDate startDate) {
        // Calculate endDate = startDate + 7 days
        LocalDate endDate = startDate.plusDays(7);

        // Fetch meal plan entries for user in date range
        List<MealPlanEntry> entries = mealPlanEntryRepository
            .findByUserIdAndDateRange(userId, startDate, endDate);

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

        // Process each meal plan entry
        for (MealPlanEntry entry : entries) {
            Recipe recipe = entry.getRecipe();
            Integer entryServings = entry.getServings();
            Integer recipeDefaultServings = recipe.getDefaultServings();

            // Process each ingredient in the recipe
            for (RecipeIngredient recipeIngredient : recipe.getIngredients()) {
                // Scale quantity: scaledQty = ingredient.quantity * entry.servings / recipe.defaultServings
                BigDecimal originalQuantity = recipeIngredient.getQuantity();
                BigDecimal scaledQuantity = originalQuantity
                    .multiply(BigDecimal.valueOf(entryServings))
                    .divide(BigDecimal.valueOf(recipeDefaultServings), 2, RoundingMode.HALF_UP);

                // Create key for aggregation (ingredientId, unitId)
                Long ingredientId = recipeIngredient.getIngredient().getId();
                Long unitId = recipeIngredient.getUnit().getId();
                IngredientUnitKey key = new IngredientUnitKey(ingredientId, unitId);

                // Aggregate quantities
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
                            aisle != null ? aisle.getDisplayOrder() : (short) 15
                        );
                    } else {
                        // Add to existing quantity
                        existing.totalQuantity = existing.totalQuantity.add(scaledQuantity);
                        return existing;
                    }
                });
            }
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
     */
    private static class IngredientAggregate {
        private final Long ingredientId;
        private final String ingredientName;
        private BigDecimal totalQuantity;
        private final String unit;
        private final Long aisleId;
        private final String aisleName;
        private final Short displayOrder;

        public IngredientAggregate(Long ingredientId, String ingredientName, BigDecimal totalQuantity,
                                   String unit, Long aisleId, String aisleName, Short displayOrder) {
            this.ingredientId = ingredientId;
            this.ingredientName = ingredientName;
            this.totalQuantity = totalQuantity;
            this.unit = unit;
            this.aisleId = aisleId;
            this.aisleName = aisleName;
            this.displayOrder = displayOrder;
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
}
