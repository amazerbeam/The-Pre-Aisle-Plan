package com.foodbytes.controller;

import com.foodbytes.dto.AisleDTO;
import com.foodbytes.dto.IngredientDTO;
import com.foodbytes.dto.MealDTO;
import com.foodbytes.dto.UnitDTO;
import com.foodbytes.service.IngredientService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
@Slf4j
public class ReferenceDataController {

    private final IngredientService ingredientService;

    @GetMapping("/ingredients")
    public ResponseEntity<List<IngredientDTO>> getAllIngredients(
            @RequestParam(required = false) Long aisleId) {

        if (aisleId != null) {
            List<IngredientDTO> ingredients = ingredientService.getIngredientsByAisle(aisleId);
            return ResponseEntity.ok(ingredients);
        }

        List<IngredientDTO> ingredients = ingredientService.getAllIngredients();
        return ResponseEntity.ok(ingredients);
    }

    @GetMapping("/aisles")
    public ResponseEntity<List<AisleDTO>> getAllAisles() {
        List<AisleDTO> aisles = ingredientService.getAllAisles();
        return ResponseEntity.ok(aisles);
    }

    @GetMapping("/units")
    public ResponseEntity<List<UnitDTO>> getAllUnits() {
        List<UnitDTO> units = ingredientService.getAllUnits();
        return ResponseEntity.ok(units);
    }

    @GetMapping("/meals")
    public ResponseEntity<List<MealDTO>> getAllMeals() {
        List<MealDTO> meals = ingredientService.getAllMeals();
        return ResponseEntity.ok(meals);
    }
}
