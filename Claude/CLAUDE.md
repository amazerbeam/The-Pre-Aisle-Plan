# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

FoodBytes is a client-side meal planning and recipe management single-page application built with vanilla HTML/CSS/JavaScript (no framework or build tools). Version 8.1.2.

## File Structure

- **index.html** - Main application file containing all UI structure and ~2000 lines of embedded JavaScript for app logic
- **recipes.js** - Recipe data (41 recipes), ingredient definitions (200+ items), and aisle mappings for shopping list organization
- **styles.css** - Complete styling including mobile-responsive design and aisle color coding

## Development

No build pipeline or package manager - just static HTML/CSS/JS files. Open index.html directly in browser for development.

**GitHub Remote:** https://github.com/amazerbeam/The-Pre-Aisle-Plan.git

## Architecture

### Data Flow
1. User selects meal tab → `selectMeal()` → `renderRecipes()` filters and displays recipes
2. User assigns recipe to day → `assignRecipeToDay()` → Updates `planner` array → Persists to localStorage
3. Shopping list view → `renderShoppingList()` aggregates ingredients from `planner` → Groups by grocery aisle

### Key State (Global Variables in index.html)
- `planner` - Weekly meal plan array (days with assigned recipes)
- `localServingsMap` - Recipe ID to serving count mapping
- `shoppingListState` - Ingredient checkbox states for shopping list
- `allowCheatMeals` - Limits "cheat" recipe selections per week

### Local Storage Keys
- `mealPlanner` - Persisted weekly meal plan
- `shoppingListState` - Shopping list checkbox states

### recipes.js Structure
- `UNIT` - Standardized measurement units (g, ml, cup, tsp, piece, etc.)
- `AISLE` - 17 grocery store aisles with ordering for shopping list sorting
- `INGREDIENTS` - 200+ ingredient definitions mapping to standardized names and aisles
- `recipeData` - Array of 41 recipes with: id, meal categories, recipe name, defaultServings, calories, ingredients array, steps array, optional isCheat flag
- `N()` helper function - Creates ingredient objects with validation
- `getAisleInfoByName()` - Maps ingredient names to aisle info

### Key Features
- Recipe scaling (adjust servings → ingredient quantities recalculate)
- Shopping list aggregation with aisle sorting (17 color-coded sections)
- Shareable meal plans via base64-encoded URL query parameter `?planner=...`
- Wake lock API for mobile (keeps screen awake)
- Clipboard integration for copying recipes/shopping lists

## Code Conventions

- UI rendering functions follow `render*()` naming pattern
- DOM manipulation uses createElement/appendChild patterns
- Event handlers are inline or attached via addEventListener
- State persisted to localStorage as JSON strings
