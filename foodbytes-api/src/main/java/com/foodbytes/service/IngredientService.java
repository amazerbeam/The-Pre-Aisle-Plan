package com.foodbytes.service;

import com.foodbytes.dto.AisleDTO;
import com.foodbytes.dto.IngredientDTO;
import com.foodbytes.dto.MealDTO;
import com.foodbytes.dto.UnitDTO;
import com.foodbytes.model.Aisle;
import com.foodbytes.model.Ingredient;
import com.foodbytes.model.Meal;
import com.foodbytes.model.Unit;
import com.foodbytes.repository.AisleRepository;
import com.foodbytes.repository.IngredientRepository;
import com.foodbytes.repository.MealRepository;
import com.foodbytes.repository.UnitRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class IngredientService {

    private final IngredientRepository ingredientRepository;
    private final AisleRepository aisleRepository;
    private final UnitRepository unitRepository;
    private final MealRepository mealRepository;

    @Transactional(readOnly = true)
    public List<IngredientDTO> getAllIngredients() {
        List<Ingredient> ingredients = ingredientRepository.findAll();
        return ingredients.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<IngredientDTO> getIngredientsByAisle(Long aisleId) {
        List<Ingredient> ingredients = ingredientRepository.findByAisleIdOrderByName(aisleId);
        return ingredients.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<AisleDTO> getAllAisles() {
        List<Aisle> aisles = aisleRepository.findAllByOrderByDisplayOrder();
        return aisles.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<UnitDTO> getAllUnits() {
        List<Unit> units = unitRepository.findAll();
        return units.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<MealDTO> getAllMeals() {
        List<Meal> meals = mealRepository.findAllByOrderByDisplayOrder();
        return meals.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    private IngredientDTO convertToDTO(Ingredient ingredient) {
        return IngredientDTO.builder()
                .id(ingredient.getId())
                .key(ingredient.getKey())
                .name(ingredient.getName())
                .aisleId(ingredient.getAisle().getId())
                .aisleName(ingredient.getAisle().getName())
                .aisleColor(ingredient.getAisle().getColor())
                .build();
    }

    private AisleDTO convertToDTO(Aisle aisle) {
        return AisleDTO.builder()
                .id(aisle.getId())
                .key(aisle.getKey())
                .name(aisle.getName())
                .displayOrder(aisle.getDisplayOrder())
                .color(aisle.getColor())
                .build();
    }

    private UnitDTO convertToDTO(Unit unit) {
        return UnitDTO.builder()
                .id(unit.getId())
                .key(unit.getKey())
                .value(unit.getValue())
                .category(unit.getCategory())
                .build();
    }

    private MealDTO convertToDTO(Meal meal) {
        return MealDTO.builder()
                .id(meal.getId())
                .key(meal.getKey())
                .name(meal.getName())
                .displayOrder(meal.getDisplayOrder())
                .build();
    }
}
