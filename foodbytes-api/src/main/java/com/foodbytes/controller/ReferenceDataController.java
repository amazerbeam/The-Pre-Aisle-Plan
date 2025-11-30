package com.foodbytes.controller;

import com.foodbytes.model.Aisle;
import com.foodbytes.model.Ingredient;
import com.foodbytes.model.Meal;
import com.foodbytes.model.Unit;
import com.foodbytes.repository.AisleRepository;
import com.foodbytes.repository.IngredientRepository;
import com.foodbytes.repository.MealRepository;
import com.foodbytes.repository.UnitRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class ReferenceDataController {

    private final MealRepository mealRepository;
    private final AisleRepository aisleRepository;
    private final UnitRepository unitRepository;
    private final IngredientRepository ingredientRepository;

    @GetMapping("/meals")
    public ResponseEntity<List<Map<String, Object>>> getMeals() {
        List<Meal> meals = mealRepository.findAllByOrderByDisplayOrderAsc();
        return ResponseEntity.ok(meals.stream()
                .map(m -> {
                    Map<String, Object> map = new HashMap<>();
                    map.put("id", m.getId());
                    map.put("key", m.getKey());
                    map.put("name", m.getName());
                    map.put("displayOrder", m.getDisplayOrder());
                    return map;
                })
                .collect(Collectors.toList()));
    }

    @GetMapping("/aisles")
    public ResponseEntity<List<Map<String, Object>>> getAisles() {
        List<Aisle> aisles = aisleRepository.findAllByOrderByDisplayOrderAsc();
        return ResponseEntity.ok(aisles.stream()
                .map(a -> {
                    Map<String, Object> map = new HashMap<>();
                    map.put("id", a.getId());
                    map.put("key", a.getKey());
                    map.put("name", a.getName());
                    map.put("displayOrder", a.getDisplayOrder());
                    map.put("color", a.getColor());
                    return map;
                })
                .collect(Collectors.toList()));
    }

    @GetMapping("/units")
    public ResponseEntity<List<Map<String, Object>>> getUnits() {
        List<Unit> units = unitRepository.findAll();
        return ResponseEntity.ok(units.stream()
                .map(u -> {
                    Map<String, Object> map = new HashMap<>();
                    map.put("id", u.getId());
                    map.put("key", u.getKey());
                    map.put("value", u.getValue());
                    map.put("category", u.getCategory());
                    return map;
                })
                .collect(Collectors.toList()));
    }

    @GetMapping("/ingredients")
    public ResponseEntity<List<Map<String, Object>>> getIngredients() {
        List<Ingredient> ingredients = ingredientRepository.findAllWithAisle();
        return ResponseEntity.ok(ingredients.stream()
                .map(i -> {
                    Map<String, Object> map = new HashMap<>();
                    map.put("id", i.getId());
                    map.put("key", i.getKey());
                    map.put("name", i.getName());
                    map.put("aisle", i.getAisle().getName());
                    map.put("aisleColor", i.getAisle().getColor());
                    return map;
                })
                .collect(Collectors.toList()));
    }
}
