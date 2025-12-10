# Backend Design: Macro Nutrient Features (FR-080, FR-081, FR-082)

**Date:** 2025-12-09
**Author:** Java Backend Agent
**Status:** Design Document
**Version:** 1.0

---

## Table of Contents
1. [Overview](#overview)
2. [Requirements Summary](#requirements-summary)
3. [Model Updates](#model-updates)
4. [DTO Updates](#dto-updates)
5. [Service Layer Design](#service-layer-design)
6. [API Response Changes](#api-response-changes)
7. [Calculation Algorithms](#calculation-algorithms)
8. [Database Migration](#database-migration)
9. [Requirements Traceability](#requirements-traceability)

---

## Overview

This design document outlines the backend implementation for adding macronutrient (protein, carbohydrates, fat) tracking to the FoodBytes application. The feature set includes:

- **FR-080:** Add macro data to ingredients and calculate recipe macros
- **FR-081:** Provide daily macro breakdown in meal plan API
- **FR-082:** Provide weekly macro summary with daily averages

### Key Design Principles
- Use `BigDecimal` for all macro calculations to ensure precision
- Maintain backwards compatibility with existing API contracts
- Follow Spring Boot best practices for entity design
- Calculate macros dynamically from ingredient data (no manual entry)

---

## Requirements Summary

### FR-080: Ingredient Macro Data
- Add `protein_per_100g`, `carbs_per_100g`, `fat_per_100g` to Ingredient model
- Store values as `DECIMAL(5,2)` for precision (e.g., 31.50g)
- Calculate recipe macros: `SUM(ingredient.macro * quantity / 100)`
- Calculate per-serving macros: `recipe_total_macro / default_servings`

### FR-081: Daily Macro Popup (Meal Plan View)
- Frontend will display clickable daily calorie totals
- Backend must provide: `totalProtein`, `totalCarbs`, `totalFat` per day
- Macros calculated from recipe entries assigned to that day
- Values returned as grams (whole numbers)

### FR-082: Weekly Macro Summary (Meal Plan View)
- Frontend will display clickable weekly total calories
- Backend must provide: `weekTotalProtein`, `weekTotalCarbs`, `weekTotalFat`
- Calculate daily averages based on days with meals (not always 7 days)
- Values returned as grams (whole numbers) for totals and averages

---

## Model Updates

### 1. Ingredient.java

**File:** `foodbytes-api/src/main/java/com/foodbytes/model/Ingredient.java`

**Changes:**
```java
package com.foodbytes.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.math.BigDecimal;

@Entity
@Table(name = "ingredients")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Ingredient {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "`key`", unique = true, nullable = false, length = 100)
    private String key;

    @Column(unique = true, nullable = false)
    private String name;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "aisle_id", nullable = false)
    private Aisle aisle;

    // FR-080: Macro data per 100g
    @Column(name = "protein_per_100g", precision = 5, scale = 2, nullable = false)
    private BigDecimal proteinPer100g = BigDecimal.ZERO;

    @Column(name = "carbs_per_100g", precision = 5, scale = 2, nullable = false)
    private BigDecimal carbsPer100g = BigDecimal.ZERO;

    @Column(name = "fat_per_100g", precision = 5, scale = 2, nullable = false)
    private BigDecimal fatPer100g = BigDecimal.ZERO;
}
```

**Rationale:**
- `BigDecimal` ensures precise decimal calculations (e.g., 31.50g protein)
- `DECIMAL(5,2)` allows values from 0.00 to 999.99 (sufficient for macros per 100g)
- Default to `BigDecimal.ZERO` to avoid null checks in calculations
- Non-nullable to ensure data integrity (existing records default to 0)

---

## DTO Updates

### 1. MacroNutrientsDTO.java (NEW)

**File:** `foodbytes-api/src/main/java/com/foodbytes/dto/MacroNutrientsDTO.java`

```java
package com.foodbytes.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.math.BigDecimal;

/**
 * DTO for macro nutrient data (FR-080, FR-081, FR-082).
 * Contains protein, carbs, and fat values.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class MacroNutrientsDTO {
    private Integer protein;  // Grams (rounded to whole number)
    private Integer carbs;    // Grams (rounded to whole number)
    private Integer fat;      // Grams (rounded to whole number)
}
```

**Rationale:**
- Reusable DTO for recipe, daily, and weekly macro data
- Integer types for frontend display (no decimals needed for grams)
- Simple structure for JSON serialization

---

### 2. MealPlanDayDTO.java

**File:** `foodbytes-api/src/main/java/com/foodbytes/dto/MealPlanDayDTO.java`

**Changes:**
```java
package com.foodbytes.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;

/**
 * DTO for a single day in the meal plan (FR-016, FR-081).
 * Contains all entries grouped by meal type plus daily macro totals.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class MealPlanDayDTO {
    private LocalDate date;
    private String dayOfWeek;         // "Mon", "Tue", "Wed", etc.
    private Boolean isToday;          // Highlight current day in calendar
    private Map<String, List<MealPlanEntryDTO>> mealsByType; // Grouped by breakfast, lunch, dinner, snacks
    private Integer totalCalories;    // FR-017: Sum of per-serving calories for this day

    // FR-081: Daily macro breakdown
    private Integer totalProtein;     // Total protein in grams for this day
    private Integer totalCarbs;       // Total carbs in grams for this day
    private Integer totalFat;         // Total fat in grams for this day
}
```

**Rationale:**
- Add three new integer fields for daily macro totals
- Maintains backwards compatibility (new fields will be null in old clients)
- Values calculated by summing macros from all meal entries for the day

---

### 3. MealPlanWeekDTO.java

**File:** `foodbytes-api/src/main/java/com/foodbytes/dto/MealPlanWeekDTO.java`

**Changes:**
```java
package com.foodbytes.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.time.LocalDate;
import java.util.List;

/**
 * DTO for the full 7-day meal plan response (FR-007, FR-016, FR-082).
 * Contains the start/end dates, all 7 days, and weekly macro summary.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class MealPlanWeekDTO {
    private LocalDate startDate;      // FR-007: "From" date
    private LocalDate endDate;        // FR-007: Calculated as startDate + 6 days
    private List<MealPlanDayDTO> days; // Always 7 days, even if empty
    private Integer weekTotalCalories; // FR-017: Sum of all daily totals

    // FR-082: Weekly macro totals
    private Integer weekTotalProtein;   // Total protein in grams for the week
    private Integer weekTotalCarbs;     // Total carbs in grams for the week
    private Integer weekTotalFat;       // Total fat in grams for the week

    // FR-082: Daily averages (based on days with meals only)
    private Integer avgDailyCalories;   // Average daily calories
    private Integer avgDailyProtein;    // Average daily protein in grams
    private Integer avgDailyCarbs;      // Average daily carbs in grams
    private Integer avgDailyFat;        // Average daily fat in grams
    private Integer daysWithMeals;      // Number of days that have at least one meal (used for average calculation)
}
```

**Rationale:**
- Add weekly totals and daily averages for FR-082
- `daysWithMeals` helps frontend understand how averages were calculated
- Averages based only on days with meals (not empty days) per requirements

---

### 4. RecipeDTO.java

**File:** `foodbytes-api/src/main/java/com/foodbytes/dto/RecipeDTO.java`

**Changes:**
```java
package com.foodbytes.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class RecipeDTO {
    private Long id;
    private String name;
    private Integer defaultServings;
    private Integer calories;
    private Boolean isCheat;
    private List<String> mealTypes;
    private List<IngredientDTO> ingredients;
    private List<String> steps;

    // FR-043: Recipe variant info (null if recipe is not part of a family)
    private String variantLabel;           // e.g., "Vegetarian" (null for non-family or default)
    private List<RecipeVariantDTO> variants;  // All variants in the family (empty if not in family)

    // FR-080: Per-serving macro data
    private Integer proteinPerServing;    // Protein in grams per serving
    private Integer carbsPerServing;      // Carbs in grams per serving
    private Integer fatPerServing;        // Fat in grams per serving
}
```

**Rationale:**
- Add per-serving macro fields to recipe responses
- Values calculated from ingredient quantities (see calculation algorithms)
- Maintains backwards compatibility (new fields ignored by old clients)

---

### 5. IngredientDTO.java

**File:** `foodbytes-api/src/main/java/com/foodbytes/dto/IngredientDTO.java`

**Changes:**
```java
package com.foodbytes.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class IngredientDTO {
    private Long id;
    private String name;
    private String aisle;
    private BigDecimal quantity;
    private String unit;

    // FR-080: Macro data per 100g (for admin editing)
    private BigDecimal proteinPer100g;
    private BigDecimal carbsPer100g;
    private BigDecimal fatPer100g;
}
```

**Rationale:**
- Expose ingredient macro data for admin editing forms
- `BigDecimal` used for precise entry (e.g., 31.50g)
- Optional fields (null if not populated)

---

## Service Layer Design

### 1. MacroCalculationService.java (NEW)

**File:** `foodbytes-api/src/main/java/com/foodbytes/service/MacroCalculationService.java`

**Purpose:** Centralized service for all macro-related calculations

```java
package com.foodbytes.service;

import com.foodbytes.model.Recipe;
import com.foodbytes.model.RecipeIngredient;
import com.foodbytes.dto.MacroNutrientsDTO;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;

/**
 * Service for calculating macronutrient data (FR-080, FR-081, FR-082).
 */
@Service
@RequiredArgsConstructor
public class MacroCalculationService {

    /**
     * FR-080: Calculate per-serving macros for a recipe.
     * Formula: SUM(ingredient.macro * quantity / 100) / default_servings
     *
     * @param recipe Recipe entity with ingredients loaded
     * @return MacroNutrientsDTO with per-serving macros (rounded to whole numbers)
     */
    public MacroNutrientsDTO calculatePerServingMacros(Recipe recipe) {
        if (recipe.getDefaultServings() == null || recipe.getDefaultServings() == 0) {
            return new MacroNutrientsDTO(0, 0, 0);
        }

        BigDecimal totalProtein = BigDecimal.ZERO;
        BigDecimal totalCarbs = BigDecimal.ZERO;
        BigDecimal totalFat = BigDecimal.ZERO;

        for (RecipeIngredient ri : recipe.getIngredients()) {
            BigDecimal quantity = ri.getQuantity(); // Already in correct unit (converted to grams)

            // Calculate macros: (macro_per_100g * quantity) / 100
            BigDecimal ingredientProtein = ri.getIngredient().getProteinPer100g()
                .multiply(quantity)
                .divide(BigDecimal.valueOf(100), 4, RoundingMode.HALF_UP);

            BigDecimal ingredientCarbs = ri.getIngredient().getCarbsPer100g()
                .multiply(quantity)
                .divide(BigDecimal.valueOf(100), 4, RoundingMode.HALF_UP);

            BigDecimal ingredientFat = ri.getIngredient().getFatPer100g()
                .multiply(quantity)
                .divide(BigDecimal.valueOf(100), 4, RoundingMode.HALF_UP);

            totalProtein = totalProtein.add(ingredientProtein);
            totalCarbs = totalCarbs.add(ingredientCarbs);
            totalFat = totalFat.add(ingredientFat);
        }

        // Divide by servings to get per-serving values
        BigDecimal servings = BigDecimal.valueOf(recipe.getDefaultServings());
        BigDecimal proteinPerServing = totalProtein.divide(servings, 2, RoundingMode.HALF_UP);
        BigDecimal carbsPerServing = totalCarbs.divide(servings, 2, RoundingMode.HALF_UP);
        BigDecimal fatPerServing = totalFat.divide(servings, 2, RoundingMode.HALF_UP);

        return new MacroNutrientsDTO(
            proteinPerServing.setScale(0, RoundingMode.HALF_UP).intValue(),
            carbsPerServing.setScale(0, RoundingMode.HALF_UP).intValue(),
            fatPerServing.setScale(0, RoundingMode.HALF_UP).intValue()
        );
    }

    /**
     * FR-081: Calculate total macros for a list of recipes (daily total).
     * Sums per-serving macros from all recipes.
     *
     * @param recipes List of Recipe entities
     * @return MacroNutrientsDTO with total macros (rounded to whole numbers)
     */
    public MacroNutrientsDTO calculateTotalMacros(List<Recipe> recipes) {
        BigDecimal totalProtein = BigDecimal.ZERO;
        BigDecimal totalCarbs = BigDecimal.ZERO;
        BigDecimal totalFat = BigDecimal.ZERO;

        for (Recipe recipe : recipes) {
            MacroNutrientsDTO recipeMacros = calculatePerServingMacros(recipe);
            totalProtein = totalProtein.add(BigDecimal.valueOf(recipeMacros.getProtein()));
            totalCarbs = totalCarbs.add(BigDecimal.valueOf(recipeMacros.getCarbs()));
            totalFat = totalFat.add(BigDecimal.valueOf(recipeMacros.getFat()));
        }

        return new MacroNutrientsDTO(
            totalProtein.setScale(0, RoundingMode.HALF_UP).intValue(),
            totalCarbs.setScale(0, RoundingMode.HALF_UP).intValue(),
            totalFat.setScale(0, RoundingMode.HALF_UP).intValue()
        );
    }

    /**
     * FR-082: Calculate weekly macro totals from daily totals.
     *
     * @param dailyMacros List of MacroNutrientsDTO (one per day)
     * @return MacroNutrientsDTO with weekly totals
     */
    public MacroNutrientsDTO calculateWeeklyTotals(List<MacroNutrientsDTO> dailyMacros) {
        int totalProtein = dailyMacros.stream().mapToInt(MacroNutrientsDTO::getProtein).sum();
        int totalCarbs = dailyMacros.stream().mapToInt(MacroNutrientsDTO::getCarbs).sum();
        int totalFat = dailyMacros.stream().mapToInt(MacroNutrientsDTO::getFat).sum();

        return new MacroNutrientsDTO(totalProtein, totalCarbs, totalFat);
    }

    /**
     * FR-082: Calculate daily average macros (based on days with meals only).
     *
     * @param dailyMacros List of MacroNutrientsDTO (only days with meals)
     * @param daysWithMeals Number of days that have at least one meal
     * @return MacroNutrientsDTO with daily averages
     */
    public MacroNutrientsDTO calculateDailyAverages(List<MacroNutrientsDTO> dailyMacros, int daysWithMeals) {
        if (daysWithMeals == 0) {
            return new MacroNutrientsDTO(0, 0, 0);
        }

        MacroNutrientsDTO weeklyTotals = calculateWeeklyTotals(dailyMacros);

        int avgProtein = Math.round((float) weeklyTotals.getProtein() / daysWithMeals);
        int avgCarbs = Math.round((float) weeklyTotals.getCarbs() / daysWithMeals);
        int avgFat = Math.round((float) weeklyTotals.getFat() / daysWithMeals);

        return new MacroNutrientsDTO(avgProtein, avgCarbs, avgFat);
    }
}
```

**Key Design Decisions:**
- Centralized calculation logic for reusability and maintainability
- `BigDecimal` arithmetic with explicit rounding modes (HALF_UP)
- Intermediate calculations use 4 decimal places for precision
- Final results rounded to whole numbers (integers) for display
- Assumes ingredient quantities are already normalized to grams in database

---

### 2. MealPlanService.java Updates

**File:** `foodbytes-api/src/main/java/com/foodbytes/service/MealPlanService.java`

**Changes Required:**

```java
@Service
@RequiredArgsConstructor
public class MealPlanService {

    private final MealPlanEntryRepository mealPlanEntryRepository;
    private final MealRepository mealRepository;
    private final RecipeRepository recipeRepository;
    private final UserRepository userRepository;
    private final RecipeService recipeService;
    private final MacroCalculationService macroCalculationService; // NEW

    /**
     * FR-007, FR-016, FR-082: Get 7-day meal plan with macro data.
     */
    @Transactional(readOnly = true)
    public MealPlanWeekDTO getWeekPlan(Long userId, LocalDate startDate) {
        LocalDate endDate = startDate.plusDays(7);
        LocalDate today = LocalDate.now();

        List<MealPlanEntry> entries = mealPlanEntryRepository
            .findByUserIdAndDateRange(userId, startDate, endDate);

        // Group entries by date
        Map<LocalDate, List<MealPlanEntry>> byDate = entries.stream()
            .collect(Collectors.groupingBy(MealPlanEntry::getPlanDate));

        // Build 7 days with macro data
        List<MealPlanDayDTO> days = new ArrayList<>();
        List<MacroNutrientsDTO> dailyMacrosForWeek = new ArrayList<>();
        int daysWithMeals = 0;

        for (int i = 0; i < 7; i++) {
            LocalDate date = startDate.plusDays(i);
            List<MealPlanEntry> dayEntries = byDate.getOrDefault(date, List.of());

            MealPlanDayDTO dayDTO = buildDayDTO(date, dayEntries, today);
            days.add(dayDTO);

            // FR-081: Calculate daily macros
            if (!dayEntries.isEmpty()) {
                List<Recipe> dayRecipes = dayEntries.stream()
                    .map(MealPlanEntry::getRecipe)
                    .collect(Collectors.toList());

                MacroNutrientsDTO dailyMacros = macroCalculationService.calculateTotalMacros(dayRecipes);
                dayDTO.setTotalProtein(dailyMacros.getProtein());
                dayDTO.setTotalCarbs(dailyMacros.getCarbs());
                dayDTO.setTotalFat(dailyMacros.getFat());

                dailyMacrosForWeek.add(dailyMacros);
                daysWithMeals++;
            } else {
                // Empty day - set macros to 0
                dayDTO.setTotalProtein(0);
                dayDTO.setTotalCarbs(0);
                dayDTO.setTotalFat(0);
            }
        }

        // FR-082: Calculate weekly totals and averages
        MacroNutrientsDTO weeklyTotals = macroCalculationService.calculateWeeklyTotals(dailyMacrosForWeek);
        MacroNutrientsDTO dailyAverages = macroCalculationService.calculateDailyAverages(dailyMacrosForWeek, daysWithMeals);

        // Calculate weekly calorie average
        int weekTotalCalories = days.stream().mapToInt(MealPlanDayDTO::getTotalCalories).sum();
        int avgDailyCalories = daysWithMeals > 0 ? Math.round((float) weekTotalCalories / daysWithMeals) : 0;

        MealPlanWeekDTO weekDTO = new MealPlanWeekDTO();
        weekDTO.setStartDate(startDate);
        weekDTO.setEndDate(startDate.plusDays(6));
        weekDTO.setDays(days);
        weekDTO.setWeekTotalCalories(weekTotalCalories);

        // FR-082: Set weekly macro data
        weekDTO.setWeekTotalProtein(weeklyTotals.getProtein());
        weekDTO.setWeekTotalCarbs(weeklyTotals.getCarbs());
        weekDTO.setWeekTotalFat(weeklyTotals.getFat());
        weekDTO.setAvgDailyCalories(avgDailyCalories);
        weekDTO.setAvgDailyProtein(dailyAverages.getProtein());
        weekDTO.setAvgDailyCarbs(dailyAverages.getCarbs());
        weekDTO.setAvgDailyFat(dailyAverages.getFat());
        weekDTO.setDaysWithMeals(daysWithMeals);

        return weekDTO;
    }

    // Existing methods remain unchanged...
}
```

**Rationale:**
- Inject `MacroCalculationService` for macro calculations
- Calculate daily macros in the existing loop (efficient)
- Track days with meals for accurate averages (FR-082 requirement)
- Set macro values to 0 for empty days (consistent with calorie behavior)

---

### 3. RecipeService.java Updates

**File:** `foodbytes-api/src/main/java/com/foodbytes/service/RecipeService.java`

**Changes Required:**

```java
@Service
@RequiredArgsConstructor
public class RecipeService {

    private final RecipeRepository recipeRepository;
    private final MacroCalculationService macroCalculationService; // NEW
    // ... other dependencies

    /**
     * Convert Recipe entity to RecipeDTO with macro data (FR-080).
     */
    private RecipeDTO convertToDTO(Recipe recipe) {
        RecipeDTO dto = new RecipeDTO();
        dto.setId(recipe.getId());
        dto.setName(recipe.getName());
        dto.setDefaultServings(recipe.getDefaultServings());
        dto.setCalories(recipe.getCalories());
        dto.setIsCheat(recipe.isCheat());

        // ... existing mapping code for ingredients, steps, variants, etc.

        // FR-080: Calculate and set per-serving macros
        MacroNutrientsDTO macros = macroCalculationService.calculatePerServingMacros(recipe);
        dto.setProteinPerServing(macros.getProtein());
        dto.setCarbsPerServing(macros.getCarbs());
        dto.setFatPerServing(macros.getFat());

        return dto;
    }

    // Existing methods remain unchanged...
}
```

**Rationale:**
- Inject `MacroCalculationService` for macro calculations
- Calculate macros during DTO conversion (existing pattern)
- Macros calculated fresh from ingredient data (always accurate)

---

## API Response Changes

### GET /api/meal-plan

**Endpoint:** `GET /api/meal-plan?from={date}`

**Current Response Structure:**
```json
{
  "startDate": "2025-12-09",
  "endDate": "2025-12-15",
  "weekTotalCalories": 12950,
  "days": [
    {
      "date": "2025-12-09",
      "dayOfWeek": "Mon",
      "isToday": true,
      "totalCalories": 1850,
      "mealsByType": {
        "breakfast": [ /* entries */ ],
        "lunch": [ /* entries */ ],
        "dinner": [ /* entries */ ],
        "snacks": [ /* entries */ ]
      }
    }
    // ... 6 more days
  ]
}
```

**NEW Response Structure (FR-080, FR-081, FR-082):**
```json
{
  "startDate": "2025-12-09",
  "endDate": "2025-12-15",
  "weekTotalCalories": 12950,
  "weekTotalProtein": 910,
  "weekTotalCarbs": 1295,
  "weekTotalFat": 504,
  "avgDailyCalories": 1850,
  "avgDailyProtein": 130,
  "avgDailyCarbs": 185,
  "avgDailyFat": 72,
  "daysWithMeals": 7,
  "days": [
    {
      "date": "2025-12-09",
      "dayOfWeek": "Mon",
      "isToday": true,
      "totalCalories": 1850,
      "totalProtein": 130,
      "totalCarbs": 185,
      "totalFat": 72,
      "mealsByType": {
        "breakfast": [ /* entries */ ],
        "lunch": [ /* entries */ ],
        "dinner": [ /* entries */ ],
        "snacks": [ /* entries */ ]
      }
    }
    // ... 6 more days
  ]
}
```

**New Fields:**
- **Week Level:**
  - `weekTotalProtein` (Integer): Total protein for the week in grams
  - `weekTotalCarbs` (Integer): Total carbs for the week in grams
  - `weekTotalFat` (Integer): Total fat for the week in grams
  - `avgDailyCalories` (Integer): Average daily calories (based on days with meals)
  - `avgDailyProtein` (Integer): Average daily protein in grams
  - `avgDailyCarbs` (Integer): Average daily carbs in grams
  - `avgDailyFat` (Integer): Average daily fat in grams
  - `daysWithMeals` (Integer): Number of days with at least one meal assigned

- **Day Level:**
  - `totalProtein` (Integer): Total protein for the day in grams
  - `totalCarbs` (Integer): Total carbs for the day in grams
  - `totalFat` (Integer): Total fat for the day in grams

**Backwards Compatibility:** Existing API consumers will continue to work. New fields are additive and optional.

---

### GET /api/recipes/{id}

**Current Response:**
```json
{
  "id": 1,
  "name": "Chicken Curry",
  "defaultServings": 2,
  "calories": 1400,
  "isCheat": false,
  "mealTypes": ["lunch", "dinner"],
  "ingredients": [ /* ... */ ],
  "steps": [ /* ... */ ]
}
```

**NEW Response (FR-080):**
```json
{
  "id": 1,
  "name": "Chicken Curry",
  "defaultServings": 2,
  "calories": 1400,
  "proteinPerServing": 45,
  "carbsPerServing": 55,
  "fatPerServing": 18,
  "isCheat": false,
  "mealTypes": ["lunch", "dinner"],
  "ingredients": [ /* ... */ ],
  "steps": [ /* ... */ ]
}
```

**New Fields:**
- `proteinPerServing` (Integer): Protein per serving in grams
- `carbsPerServing` (Integer): Carbs per serving in grams
- `fatPerServing` (Integer): Fat per serving in grams

**Note:** These fields will be `0` if ingredient macro data is not populated yet.

---

## Calculation Algorithms

### Recipe Macro Calculation (FR-080)

**Formula:** `SUM(ingredient.macro * quantity / 100) / default_servings`

**Example:**
```
Recipe: Chicken Curry (2 servings)

Ingredients:
  - 300g Chicken Breast (31g protein, 0g carbs, 3.6g fat per 100g)
  - 200g White Rice (2.7g protein, 28g carbs, 0.3g fat per 100g)
  - 20g Olive Oil (0g protein, 0g carbs, 100g fat per 100g)

Calculation:
  Total Protein = (31 * 300 / 100) + (2.7 * 200 / 100) + (0 * 20 / 100)
                = 93 + 5.4 + 0 = 98.4g
  Per Serving   = 98.4 / 2 = 49.2g ≈ 49g

  Total Carbs   = (0 * 300 / 100) + (28 * 200 / 100) + (0 * 20 / 100)
                = 0 + 56 + 0 = 56g
  Per Serving   = 56 / 2 = 28g

  Total Fat     = (3.6 * 300 / 100) + (0.3 * 200 / 100) + (100 * 20 / 100)
                = 10.8 + 0.6 + 20 = 31.4g
  Per Serving   = 31.4 / 2 = 15.7g ≈ 16g

Result:
  proteinPerServing = 49
  carbsPerServing = 28
  fatPerServing = 16
```

**Implementation Notes:**
- Assumes ingredient quantities in database are normalized to grams
- If quantities are in different units (ml, cups, etc.), conversion to grams must happen first
- BigDecimal arithmetic used throughout for precision
- Final rounding uses HALF_UP mode (standard rounding)

---

### Daily Macro Totals (FR-081)

**Formula:** `SUM(recipe.macroPerServing)` for all recipes assigned to that day

**Example:**
```
Monday Meal Plan:
  - Breakfast: Oatmeal (8g protein, 27g carbs, 3g fat)
  - Lunch: Chicken Curry (49g protein, 28g carbs, 16g fat)
  - Dinner: Salmon (52g protein, 5g carbs, 18g fat)

Daily Totals:
  totalProtein = 8 + 49 + 52 = 109g
  totalCarbs = 27 + 28 + 5 = 60g
  totalFat = 3 + 16 + 18 = 37g
```

---

### Weekly Macro Summary (FR-082)

**Formulas:**
- Weekly Totals: `SUM(day.totalMacro)` for all 7 days
- Daily Averages: `weekTotalMacro / daysWithMeals`

**Example:**
```
Week Summary:
  - Days with meals: 5 (Monday-Friday)
  - Days without meals: 2 (Saturday-Sunday)

Weekly Totals:
  weekTotalProtein = 109 + 120 + 98 + 115 + 105 = 547g
  weekTotalCarbs = 60 + 75 + 55 + 70 + 65 = 325g
  weekTotalFat = 37 + 42 + 35 + 45 + 40 = 199g

Daily Averages (based on 5 days with meals):
  avgDailyProtein = 547 / 5 = 109.4g ≈ 109g
  avgDailyCarbs = 325 / 5 = 65g
  avgDailyFat = 199 / 5 = 39.8g ≈ 40g
```

**Important:** Averages calculated only from days with meals (FR-082 requirement)

---

## Database Migration

### Migration Script

**File:** `foodbytes-app/database/migrations/V008__add_ingredient_macros.sql`

```sql
-- FR-080: Add macro data columns to ingredients table
-- Migration: V008__add_ingredient_macros.sql
-- Date: 2025-12-09

ALTER TABLE ingredients
ADD COLUMN protein_per_100g DECIMAL(5,2) NOT NULL DEFAULT 0.00,
ADD COLUMN carbs_per_100g DECIMAL(5,2) NOT NULL DEFAULT 0.00,
ADD COLUMN fat_per_100g DECIMAL(5,2) NOT NULL DEFAULT 0.00;

-- Add indexes for potential future queries (optional optimization)
CREATE INDEX idx_ingredients_protein ON ingredients(protein_per_100g);
CREATE INDEX idx_ingredients_carbs ON ingredients(carbs_per_100g);
CREATE INDEX idx_ingredients_fat ON ingredients(fat_per_100g);

-- Note: Existing ingredients will have 0.00 for all macros
-- Admin must populate macro data via ingredient editing form
```

**Migration Notes:**
- **Backwards Compatible:** Default values prevent null errors
- **Data Population:** Requires manual admin input after deployment
- **Rollback Plan:** `ALTER TABLE ingredients DROP COLUMN protein_per_100g, DROP COLUMN carbs_per_100g, DROP COLUMN fat_per_100g;`

---

### Data Population Strategy

**Phase 1:** Deploy migration with default values (0.00)
- All recipes will show 0g macros initially
- Application remains functional

**Phase 2:** Admin populates macro data
- Admin ingredient editing form includes new macro fields
- Populate high-priority ingredients first (most common in recipes)
- Recipes using populated ingredients will show accurate macros

**Phase 3:** Validation
- Run data quality checks to identify missing macro data
- Prioritize remaining ingredients based on recipe usage

**SQL Query for Missing Macro Data:**
```sql
SELECT i.id, i.name, COUNT(ri.recipe_id) AS recipe_count
FROM ingredients i
LEFT JOIN recipe_ingredients ri ON ri.ingredient_id = i.id
WHERE i.protein_per_100g = 0 AND i.carbs_per_100g = 0 AND i.fat_per_100g = 0
GROUP BY i.id, i.name
ORDER BY recipe_count DESC;
```

---

## Requirements Traceability

### FR-080: Ingredient Macro Data

| Component | Implementation | Location |
|-----------|---------------|----------|
| Database Schema | Add `protein_per_100g`, `carbs_per_100g`, `fat_per_100g` columns | `Ingredient` table (migration V008) |
| Entity Model | Add BigDecimal fields with @Column annotations | `Ingredient.java` |
| Calculation Logic | Calculate recipe macros: `SUM(ingredient.macro * quantity / 100)` | `MacroCalculationService.calculatePerServingMacros()` |
| Per-Serving Macros | Divide recipe totals by `default_servings` | `MacroCalculationService.calculatePerServingMacros()` |
| DTO Exposure | Add macro fields to RecipeDTO | `RecipeDTO.java` (proteinPerServing, carbsPerServing, fatPerServing) |
| Admin Form | Include macro input fields in ingredient editing | Frontend (out of scope for this design) |

**Acceptance Criteria Coverage:**
- ✅ Ingredients table includes new columns
- ✅ All values stored as DECIMAL(5,2)
- ⏳ Macro data population (Phase 2 post-deployment)
- ⏳ Admin ingredient editing form (Frontend task)
- ✅ Recipe macro totals calculated automatically
- ✅ Per-serving macros calculated

---

### FR-081: Daily Macro Popup (Meal Plan View)

| Component | Implementation | Location |
|-----------|---------------|----------|
| Day DTO Fields | Add `totalProtein`, `totalCarbs`, `totalFat` | `MealPlanDayDTO.java` |
| Daily Calculation | Calculate daily totals from meal entries | `MealPlanService.getWeekPlan()` |
| API Response | Include daily macro fields in `/api/meal-plan` response | `MealPlanWeekDTO.days[]` |
| Frontend Popup | Clickable daily calorie with macro popup | Frontend (out of scope for this design) |

**Acceptance Criteria Coverage:**
- ✅ Backend provides daily macro totals (protein, carbs, fat)
- ✅ Macros calculated from ingredient data (FR-080)
- ✅ Values returned as grams (whole numbers)
- ⏳ Daily calorie text clickable (Frontend task)
- ⏳ Popup displays day name, date, macros (Frontend task)

---

### FR-082: Weekly Macro Summary (Meal Plan View)

| Component | Implementation | Location |
|-----------|---------------|----------|
| Week DTO Fields | Add weekly totals and daily averages | `MealPlanWeekDTO.java` |
| Weekly Calculation | Calculate totals and averages from daily data | `MealPlanService.getWeekPlan()` |
| Average Logic | Calculate averages based on days with meals only | `MacroCalculationService.calculateDailyAverages()` |
| API Response | Include weekly macro fields in `/api/meal-plan` response | `MealPlanWeekDTO` root level |
| Frontend Popup | Clickable weekly total with macro popup | Frontend (out of scope for this design) |

**Acceptance Criteria Coverage:**
- ✅ Backend provides weekly macro totals (protein, carbs, fat)
- ✅ Backend provides daily macro averages
- ✅ Macros calculated from ingredient data (FR-080)
- ✅ Daily averages based on days with meals (not empty days)
- ⏳ Weekly "Total" text clickable (Frontend task)
- ⏳ Popup displays week range, totals, averages (Frontend task)

---

## Testing Strategy

### Unit Tests

**MacroCalculationServiceTest.java**
- Test per-serving macro calculation with various ingredient quantities
- Test rounding behavior (HALF_UP)
- Test edge cases (0 servings, empty ingredients list)
- Test weekly totals and averages
- Test division by zero scenarios

**MealPlanServiceTest.java**
- Test daily macro calculation from meal entries
- Test weekly macro aggregation
- Test average calculation with partial week (some days empty)
- Test empty meal plan (all days empty)

### Integration Tests

**MealPlanControllerTest.java**
- Test `/api/meal-plan` response includes new macro fields
- Test macro values match expected calculations
- Verify backwards compatibility (existing fields unchanged)

**RecipeControllerTest.java**
- Test `/api/recipes/{id}` response includes per-serving macros
- Test macro values calculated from ingredient data

### Manual Testing Checklist

- [ ] Verify migration runs successfully
- [ ] Verify existing recipes show 0g macros before data population
- [ ] Populate test ingredient macro data via admin form
- [ ] Verify recipe macros calculate correctly after ingredient data populated
- [ ] Verify daily macro totals in meal plan response
- [ ] Verify weekly macro totals and averages in meal plan response
- [ ] Test with partial week (some days empty) - averages should exclude empty days
- [ ] Test with completely empty week - all values should be 0

---

## Future Enhancements (Out of Scope)

1. **Ingredient Macro Data Import**
   - Batch import ingredient macro data from CSV/JSON
   - Integration with USDA FoodData Central API

2. **Recipe Macro Targets**
   - Allow users to set daily macro targets
   - Highlight days that exceed/fall short of targets

3. **Macro Distribution Charts**
   - Visual pie chart showing macro percentages (protein/carbs/fat)
   - Weekly trend graphs for macro intake

4. **Meal-Level Macro Display**
   - Show macros per meal type (breakfast, lunch, dinner)
   - Meal-by-meal breakdown in daily popup

5. **Fiber and Micronutrients**
   - Extend ingredient model to include fiber, vitamins, minerals
   - Additional nutrient tracking in meal plan

---

## Appendix: Example Calculations

### Full Week Calculation Example

**Week: Dec 9 - Dec 15, 2025**

| Day | Meals | Calories | Protein | Carbs | Fat |
|-----|-------|----------|---------|-------|-----|
| Mon | 3 meals | 1850 | 130g | 185g | 72g |
| Tue | 3 meals | 1900 | 140g | 190g | 74g |
| Wed | 2 meals | 1200 | 90g | 120g | 50g |
| Thu | 3 meals | 1950 | 145g | 200g | 76g |
| Fri | 3 meals | 1800 | 125g | 180g | 70g |
| Sat | Empty | 0 | 0g | 0g | 0g |
| Sun | 1 meal | 650 | 50g | 65g | 25g |

**Weekly Totals:**
- weekTotalCalories: 9,350
- weekTotalProtein: 680g
- weekTotalCarbs: 940g
- weekTotalFat: 367g

**Daily Averages (6 days with meals):**
- avgDailyCalories: 1,558 (9,350 / 6)
- avgDailyProtein: 113g (680 / 6)
- avgDailyCarbs: 157g (940 / 6)
- avgDailyFat: 61g (367 / 6)
- daysWithMeals: 6

**Note:** Saturday (empty day) excluded from averages per FR-082

---

## Document Revision History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2025-12-09 | Java Backend Agent | Initial design document |

---

**End of Design Document**
