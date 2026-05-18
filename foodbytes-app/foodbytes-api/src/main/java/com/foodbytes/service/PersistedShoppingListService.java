package com.foodbytes.service;

import com.foodbytes.dto.*;
import com.foodbytes.model.*;
import com.foodbytes.repository.*;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

/**
 * Service for persisted shopping list operations.
 * Handles generation, retrieval, and item state management.
 * Supports meal plan sharing via effective owner ID.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class PersistedShoppingListService {

    private final ShoppingListRepository shoppingListRepository;
    private final ShoppingListItemRepository shoppingListItemRepository;
    private final ShoppingListService shoppingListService;
    private final UserRepository userRepository;
    private final ObjectMapper objectMapper;

    /**
     * Get the effective meal plan owner ID for a user.
     * If the user has meal_plan_owner_id set, they share another user's meal plans.
     */
    private Long getEffectiveMealPlanOwnerId(Long userId) {
        return userRepository.findById(userId)
            .map(user -> user.getMealPlanOwnerId() != null ? user.getMealPlanOwnerId() : userId)
            .orElse(userId);
    }

    /**
     * Get the current persisted shopping list for a user.
     *
     * @param userId User ID
     * @return PersistedShoppingListDTO or null if no list exists
     */
    @Transactional(readOnly = true)
    public PersistedShoppingListDTO getShoppingList(Long userId) {
        Long effectiveOwnerId = getEffectiveMealPlanOwnerId(userId);

        Optional<ShoppingList> listOpt = shoppingListRepository.findByUserId(effectiveOwnerId);
        if (listOpt.isEmpty()) {
            return null;
        }

        ShoppingList list = listOpt.get();
        List<ShoppingListItem> items = shoppingListItemRepository
            .findByShoppingListIdOrderByAisle(list.getId());

        return convertToDTO(list, items);
    }

    /**
     * Check if a user has a shopping list.
     *
     * @param userId User ID
     * @return true if shopping list exists
     */
    @Transactional(readOnly = true)
    public boolean hasShoppingList(Long userId) {
        Long effectiveOwnerId = getEffectiveMealPlanOwnerId(userId);
        return shoppingListRepository.existsByUserId(effectiveOwnerId);
    }

    /**
     * Generate a new shopping list for a user, replacing any existing list.
     * Uses the existing ShoppingListService to aggregate ingredients from meal plans.
     *
     * @param userId User ID
     * @param startDate Start date for the shopping list period
     * @param endDate End date for the shopping list period
     * @param homemadeSelections Optional homemade/store-bought selections
     * @return The newly generated PersistedShoppingListDTO
     */
    @Transactional
    public PersistedShoppingListDTO generateShoppingList(Long userId, LocalDate startDate, LocalDate endDate,
                                                          HomemadeSelectionsDTO homemadeSelections) {
        Long effectiveOwnerId = getEffectiveMealPlanOwnerId(userId);
        User user = userRepository.findById(effectiveOwnerId)
            .orElseThrow(() -> new RuntimeException("User not found"));

        // Delete existing shopping list if present (flush to ensure delete completes before insert)
        shoppingListRepository.deleteByUserId(effectiveOwnerId);
        shoppingListRepository.flush();

        // Generate aggregated shopping list using existing service
        // Note: We pass endDate + 1 day because the existing service uses exclusive end date
        AggregatedShoppingListDTO aggregated = shoppingListService
            .getShoppingList(effectiveOwnerId, startDate, homemadeSelections);

        // Create new shopping list
        ShoppingList shoppingList = new ShoppingList();
        shoppingList.setUser(user);
        shoppingList.setStartDate(startDate);
        shoppingList.setEndDate(endDate);
        shoppingList = shoppingListRepository.save(shoppingList);

        // Convert aggregated items to persisted items
        List<ShoppingListItem> items = new ArrayList<>();
        for (ShoppingListByAisleDTO aisle : aggregated.getAisles()) {
            for (ShoppingItemDTO item : aisle.getItems()) {
                ShoppingListItem persistedItem = new ShoppingListItem();
                persistedItem.setShoppingList(shoppingList);
                persistedItem.setIngredientId(item.getIngredientId());
                persistedItem.setIngredientName(item.getIngredientName());
                persistedItem.setQuantity(item.getTotalQuantity());
                persistedItem.setUnit(item.getUnit());
                persistedItem.setAisleId(item.getAisleId());
                persistedItem.setAisleName(item.getAisleName());
                persistedItem.setAisleOrder(aisle.getAisle().getDisplayOrder());
                persistedItem.setSourceChain(serializeSourceChain(item.getSourceChain()));
                persistedItem.setIsChecked(false);
                items.add(persistedItem);
            }
        }

        // Save all items
        items = shoppingListItemRepository.saveAll(items);

        return convertToDTO(shoppingList, items);
    }

    /**
     * Toggle the checked state of a shopping list item.
     * Used for optimistic updates - frontend updates immediately, we persist in background.
     *
     * @param userId User ID
     * @param itemId Item ID
     * @return Updated item state (isChecked)
     */
    @Transactional
    public Boolean toggleItemChecked(Long userId, Long itemId) {
        Long effectiveOwnerId = getEffectiveMealPlanOwnerId(userId);

        ShoppingListItem item = shoppingListItemRepository.findByIdAndUserId(itemId, effectiveOwnerId)
            .orElseThrow(() -> new RuntimeException("Item not found or not owned by user"));

        item.setIsChecked(!item.getIsChecked());
        shoppingListItemRepository.save(item);

        return item.getIsChecked();
    }

    /**
     * Uncheck all items in a user's shopping list.
     *
     * @param userId User ID
     */
    @Transactional
    public void uncheckAllItems(Long userId) {
        Long effectiveOwnerId = getEffectiveMealPlanOwnerId(userId);

        shoppingListRepository.findByUserId(effectiveOwnerId)
            .ifPresent(list -> shoppingListItemRepository.uncheckAll(list.getId()));
    }

    /**
     * Delete the shopping list for a user.
     *
     * @param userId User ID
     */
    @Transactional
    public void deleteShoppingList(Long userId) {
        Long effectiveOwnerId = getEffectiveMealPlanOwnerId(userId);
        shoppingListRepository.deleteByUserId(effectiveOwnerId);
    }

    /**
     * Convert ShoppingList entity to DTO.
     */
    private PersistedShoppingListDTO convertToDTO(ShoppingList list, List<ShoppingListItem> items) {
        // Group items by aisle
        Map<Long, List<PersistedShoppingItemDTO>> itemsByAisle = items.stream()
            .map(this::convertItemToDTO)
            .collect(Collectors.groupingBy(
                item -> item.getAisleId() != null ? item.getAisleId() : -1L,
                LinkedHashMap::new,
                Collectors.toList()
            ));

        // Build aisle DTOs
        List<PersistedShoppingAisleDTO> aisles = items.stream()
            .collect(Collectors.groupingBy(
                item -> item.getAisleId() != null ? item.getAisleId() : -1L
            ))
            .entrySet().stream()
            .map(entry -> {
                ShoppingListItem firstItem = entry.getValue().get(0);
                return PersistedShoppingAisleDTO.builder()
                    .aisleId(firstItem.getAisleId())
                    .aisleName(firstItem.getAisleName())
                    .aisleOrder(firstItem.getAisleOrder())
                    .items(itemsByAisle.get(entry.getKey()))
                    .build();
            })
            .sorted(Comparator.comparing(a -> a.getAisleOrder() != null ? a.getAisleOrder() : Short.MAX_VALUE))
            .collect(Collectors.toList());

        return PersistedShoppingListDTO.builder()
            .id(list.getId())
            .startDate(list.getStartDate())
            .endDate(list.getEndDate())
            .generatedAt(list.getGeneratedAt())
            .aisles(aisles)
            .totalItems(items.size())
            .checkedItems((int) items.stream().filter(ShoppingListItem::getIsChecked).count())
            .build();
    }

    /**
     * Convert ShoppingListItem entity to DTO.
     */
    private PersistedShoppingItemDTO convertItemToDTO(ShoppingListItem item) {
        return PersistedShoppingItemDTO.builder()
            .id(item.getId())
            .ingredientId(item.getIngredientId())
            .ingredientName(item.getIngredientName())
            .quantity(item.getQuantity())
            .unit(item.getUnit())
            .aisleId(item.getAisleId())
            .aisleName(item.getAisleName())
            .sourceChain(deserializeSourceChain(item.getSourceChain()))
            .isChecked(item.getIsChecked())
            .build();
    }

    /**
     * Serialize source chain list to JSON string.
     */
    private String serializeSourceChain(List<Long> sourceChain) {
        if (sourceChain == null || sourceChain.isEmpty()) {
            return null;
        }
        try {
            return objectMapper.writeValueAsString(sourceChain);
        } catch (JsonProcessingException e) {
            log.warn("Failed to serialize sourceChain: {}", e.getMessage());
            return null;
        }
    }

    /**
     * Deserialize source chain JSON string to list.
     */
    private List<Long> deserializeSourceChain(String sourceChain) {
        if (sourceChain == null || sourceChain.isEmpty()) {
            return null;
        }
        try {
            return objectMapper.readValue(sourceChain, new TypeReference<List<Long>>() {});
        } catch (JsonProcessingException e) {
            log.warn("Failed to deserialize sourceChain: {}", e.getMessage());
            return null;
        }
    }
}
