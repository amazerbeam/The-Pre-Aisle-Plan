# FoodBytes Requirements Specification

> Extracted from codebase analysis following requirements-agent.yaml methodology

## Project Information

| Field | Value |
|-------|-------|
| **Name** | FoodBytes |
| **Version** | 8.1.2 |
| **Analyzed Date** | 2025-11-29 |
| **Description** | Meal planning and recipe management single-page application |
| **Source Files** | recipes.js, index.html, styles.css |

---

# Functional Requirements

## Recipe Management

### FR-001: Browse Recipes by Meal Category
**Priority:** High

**Description:** Users can browse recipes filtered by meal type using tab navigation

**User Story:** As a user, I want to browse recipes by meal category (Breakfast, Lunch, Dinner, Snacks) so that I can quickly find appropriate recipes for each meal.

**Acceptance Criteria:**
- Tab buttons display for each meal category (Breakfast, Lunch, Dinner, Snacks)
- Clicking a tab filters and displays only recipes belonging to that meal type
- Active tab is visually distinguished from inactive tabs
- Recipes are sorted alphabetically within each category
- Cheat meal recipes appear after regular recipes

**Source Evidence:**
- `renderTabs()`
- `selectMeal(meal)`
- `renderRecipes(meal)`
- `recipeData[].meal`

---

### FR-002: Search Recipes by Name
**Priority:** Medium

**Description:** Users can search for recipes using a text search input

**User Story:** As a user, I want to search recipes by name so that I can quickly find a specific recipe without browsing categories.

**Acceptance Criteria:**
- Search bar is accessible from bottom navigation
- Search filters recipes case-insensitively by recipe name
- Results update as user types (real-time filtering)
- "No recipes found" message displays when search yields no results
- Clearing search returns user to previous meal category view

**Source Evidence:**
- `#recipe-search` element
- Input event handler (lines 139-157)
- `#search-bar` element

---

### FR-003: View Recipe Details
**Priority:** High

**Description:** Users can expand recipe cards to view full ingredients list and cooking steps

**User Story:** As a user, I want to view complete recipe details including ingredients and cooking instructions so that I can prepare the meal.

**Acceptance Criteria:**
- Each recipe card has a collapsible details section
- Details section shows complete ingredients list with quantities and units
- Details section shows numbered cooking steps
- Toggle button switches between "Show Details" and "Hide Details"
- Ingredient quantities are scaled based on current serving size

**Source Evidence:**
- `createCollapsibleContent(entry, servings)`
- `createToggleButton()`
- `recipeData[].ingredients`
- `recipeData[].steps`

---

### FR-004: Adjust Serving Sizes with Ingredient Scaling
**Priority:** High

**Description:** Users can adjust the number of servings and see ingredient quantities automatically recalculated

**User Story:** As a user, I want to adjust the serving size of a recipe so that ingredient quantities automatically scale for my needs.

**Acceptance Criteria:**
- Each recipe displays a servings input control
- Default value matches recipe's defaultServings
- Changing servings recalculates all ingredient quantities proportionally
- Minimum serving size is 1
- Scaled quantities show appropriate precision (whole numbers or 1 decimal)
- Calorie display updates based on serving adjustment

**Source Evidence:**
- `createServingsInput(entry)`
- `localServingsMap`
- Calculation: `quantity * (servings / defaultServings)`

---

### FR-005: Copy Recipe to Clipboard
**Priority:** Medium

**Description:** Users can copy a formatted recipe (title, ingredients, steps) to their clipboard

**User Story:** As a user, I want to copy a recipe to my clipboard so that I can share it via text message or email.

**Acceptance Criteria:**
- Copy button is visible in recipe header
- Clicking copy formats recipe with title, scaled ingredients, and steps
- Format includes emoji header for visual appeal
- Button shows "Copied!" confirmation for 2 seconds
- Clipboard API failure shows error alert

**Source Evidence:**
- `addCopyButton()` / `copyRecipeToClipboard()`
- `navigator.clipboard.writeText()`

---

### FR-006: Fullscreen Recipe View
**Priority:** Medium

**Description:** Users can view a recipe in fullscreen mode for distraction-free cooking

**User Story:** As a user, I want to view a recipe in fullscreen mode so that I can focus on cooking without UI distractions.

**Acceptance Criteria:**
- Maximize button opens fullscreen recipe overlay
- Fullscreen view displays recipe title, servings info, and calories
- Ingredients list shows scaled quantities
- Cooking steps are numbered and clearly displayed
- Close button (X) exits fullscreen mode
- Screen wake lock activates in fullscreen mode (if supported)

**Source Evidence:**
- `openFullscreen(entry)`
- `closeFullscreen()`
- `#fullscreen-recipe` element

---

## Meal Planning

### FR-007: Assign Recipes to Weekly Calendar
**Priority:** High

**Description:** Users can assign recipes to specific days of the week (Monday-Sunday)

**User Story:** As a user, I want to assign recipes to specific days of the week so that I can plan my meals in advance.

**Acceptance Criteria:**
- Each recipe card displays 7 day buttons (Mon-Sun)
- Clicking a day button assigns the recipe to that day
- Button state changes to "selected" (purple) when assigned
- Recipe's current serving size is saved with the assignment
- Multiple recipes can be assigned to the same day
- Assignment persists to localStorage immediately

**Source Evidence:**
- `createDayButtons(entry, servings)`
- `assignRecipeToDay()`
- `planner[]` variable
- localStorage key: `mealPlanner`

---

### FR-008: Remove Recipes from Calendar
**Priority:** High

**Description:** Users can remove previously assigned recipes from a day

**User Story:** As a user, I want to remove a recipe from my meal plan so that I can change my planned meals.

**Acceptance Criteria:**
- Clicking an already-selected day button removes the recipe
- Button state changes back to "unselected" (gray)
- Day entry is cleaned up if no recipes remain for that day
- Change persists to localStorage immediately

**Source Evidence:**
- `assignRecipeToDay()` toggle behavior

---

### FR-009: View Full Weekly Meal Plan
**Priority:** High

**Description:** Users can view their complete weekly meal plan in a calendar modal

**User Story:** As a user, I want to view my entire week's meal plan at once so that I can see what I've planned.

**Acceptance Criteria:**
- Meal Plan button in footer opens calendar modal
- Modal displays all 7 days (Monday-Sunday)
- Each day shows assigned recipes with meal type and serving size
- Daily calorie total is displayed for each day
- Modal can be closed to return to recipe browsing
- Wake lock activates when modal is visible (if supported)

**Source Evidence:**
- `renderFullCalendar()`
- `toggleFullMealPlan()`
- `#full-mealplan` element

---

### FR-010: Calculate Daily Calorie Totals
**Priority:** Medium

**Description:** System calculates and displays total calories for each day based on assigned recipes

**User Story:** As a user, I want to see the total calories for each day so that I can track my nutritional intake.

**Acceptance Criteria:**
- Each day in meal plan shows sum of all recipe calories
- Calories are calculated based on recipe's calories and serving size
- Per-serving calorie info shows for individual recipes
- Total updates automatically when recipes are added/removed

**Source Evidence:**
- Calculation: `entry.calories / entry.defaultServings * servings`
- Day-box calorie totals in `renderFullCalendar()`

---

### FR-011: Enforce Cheat Meal Limits
**Priority:** Low

**Description:** System limits users to one cheat meal recipe per meal type per week

**User Story:** As a user, I want the system to limit my cheat meals so that I maintain healthy eating habits.

**Acceptance Criteria:**
- Recipes with `isCheat=true` are identified as cheat meals
- Maximum 1 cheat breakfast, 1 cheat lunch, 1 cheat dinner per week
- Attempting to add excess cheat meal shows warning alert
- Alert message specifies which meal type limit is exceeded
- Non-cheat recipes are not restricted

**Source Evidence:**
- `allowCheatMeals` variable
- `recipeData[].isCheat` property
- Validation logic (lines 797-822)

---

## Shopping List

### FR-012: Generate Aggregated Shopping List
**Priority:** High

**Description:** System generates a unified shopping list from all recipes in the meal plan

**User Story:** As a user, I want a consolidated shopping list from my meal plan so that I can efficiently shop for groceries.

**Acceptance Criteria:**
- Shopping List view accessible from bottom navigation
- All ingredients from planned recipes are aggregated
- Same ingredients from multiple recipes are combined (quantities summed)
- Quantities reflect recipe serving sizes from meal plan
- List updates automatically when meal plan changes

**Source Evidence:**
- `renderShoppingList()`
- `ingredientTotals` Map with key = `name|unit`
- Calculation: `quantity * servings / defaultServings`

---

### FR-013: Group Ingredients by Grocery Aisle
**Priority:** High

**Description:** Shopping list items are organized by grocery store aisle

**User Story:** As a user, I want my shopping list organized by store aisle so that I can shop more efficiently.

**Acceptance Criteria:**
- Ingredients are grouped by their assigned aisle
- 17 aisles available (Meat, Poultry, Veg, Fruit, Fish, Dairy, etc.)
- Aisle sections display in store-walking order (order 1-17)
- Each item shows colored left border matching its aisle
- Unknown ingredients default to "Misc" aisle

**Source Evidence:**
- `getAisleInfoByName(name)`
- `AISLE` object with order property
- `INGREDIENTS[].aisle` mapping

---

### FR-014: Check Off Purchased Items
**Priority:** Medium

**Description:** Users can mark shopping list items as purchased

**User Story:** As a user, I want to check off items as I shop so that I can track what I've already purchased.

**Acceptance Criteria:**
- Each ingredient has a checkbox
- Clicking anywhere on item row toggles checkbox
- Checked state persists to localStorage
- Checked items move to bottom of list within their aisle
- Visual styling distinguishes checked vs unchecked items

**Source Evidence:**
- Checkbox change event handler (lines 677-681)
- localStorage key: `shoppingListState`
- `shoppingListState` Map

---

### FR-015: Uncheck All Shopping Items
**Priority:** Low

**Description:** Users can reset all shopping list checkboxes at once

**User Story:** As a user, I want to uncheck all items at once so that I can start fresh for a new shopping trip.

**Acceptance Criteria:**
- "Uncheck All" button visible in shopping list view
- Confirmation dialog appears before unchecking
- All items reset to unchecked state
- localStorage updated with cleared state
- List re-renders with all items unchecked

**Source Evidence:**
- "Uncheck All" button element
- `#uncheck-confirm-popup` dialog
- Handler (lines 619-627)

---

### FR-016: Copy Shopping List to Clipboard
**Priority:** Medium

**Description:** Users can copy the entire shopping list formatted for sharing

**User Story:** As a user, I want to copy my shopping list so that I can share it or access it on another device.

**Acceptance Criteria:**
- Copy button visible in shopping list header
- Copied format includes all ingredients with quantities
- Format uses markdown-style with emoji header
- Button shows "Copied!" confirmation for 2 seconds
- Only unchecked items are included in copied list

**Source Evidence:**
- Handler (lines 721-738)
- `navigator.clipboard.writeText()`

---

### FR-017: Sort Shopping List by Aisle and Check Status
**Priority:** Medium

**Description:** Shopping list sorts unchecked items first, then by aisle order

**User Story:** As a user, I want unchecked items shown first so that I can quickly see what I still need to buy.

**Acceptance Criteria:**
- Unchecked items appear before checked items
- Within unchecked items, sort by aisle order (1-17)
- Within checked items, maintain aisle order
- Sort updates when checkbox state changes

**Source Evidence:**
- Sort logic (line 665 in `renderShoppingList()`)

---

## Data Persistence & Sharing

### FR-018: Persist Meal Plan to Local Storage
**Priority:** High

**Description:** System automatically saves meal plan to browser localStorage

**User Story:** As a user, I want my meal plan saved automatically so that it persists when I close and reopen the browser.

**Acceptance Criteria:**
- Meal plan saves to localStorage after every change
- Plan loads from localStorage on page load
- Corrupted data is handled gracefully with fallback to empty plan
- localStorage key is `mealPlanner`

**Source Evidence:**
- `localStorage.setItem("mealPlanner", JSON.stringify(planner))`
- Load logic (lines 191-198)
- try-catch with `console.error`

---

### FR-019: Persist Shopping List State to Local Storage
**Priority:** Medium

**Description:** System saves shopping list checkbox states to localStorage

**User Story:** As a user, I want my checked-off items remembered so that I can continue where I left off.

**Acceptance Criteria:**
- Checkbox states save immediately on change
- States load from localStorage on page load
- localStorage key is `shoppingListState`
- Data stored as JSON array of `[key, boolean]` pairs

**Source Evidence:**
- `shoppingListState` Map
- `localStorage.setItem("shoppingListState", JSON.stringify([...shoppingListState]))`

---

### FR-020: Generate Shareable Meal Plan URL
**Priority:** Low

**Description:** Users can generate a URL that encodes their complete meal plan for sharing

**User Story:** As a user, I want to generate a shareable link so that I can share my meal plan with friends or family.

**Acceptance Criteria:**
- Share button visible in meal plan view
- Clicking generates URL with base64-encoded planner data
- URL is automatically copied to clipboard
- Success message confirms URL was copied
- URL uses `?planner=` query parameter

**Source Evidence:**
- `generateShareURL()`
- Encoding: `btoa(JSON.stringify(planner))`
- `navigator.clipboard.writeText()`

---

### FR-021: Import Meal Plan from Shared URL
**Priority:** Low

**Description:** System loads a shared meal plan when URL contains encoded planner data

**User Story:** As a user, I want to import a meal plan from a shared link so that I can use plans shared by others.

**Acceptance Criteria:**
- System checks for `?planner=` URL parameter on page load
- Base64 data is decoded to meal plan array
- Confirmation dialog asks user before importing
- Import replaces current meal plan
- Invalid/corrupted URLs fallback gracefully with warning

**Source Evidence:**
- Check: `window.location.search` for `?planner=`
- Decode: `atob()` with `JSON.parse()`
- `#message-popup` dialog
- try-catch with `console.warn`

---

## Mobile Features

### FR-022: Screen Wake Lock During Cooking
**Priority:** Low

**Description:** System keeps screen awake when viewing meal plan or fullscreen recipe

**User Story:** As a user, I want my screen to stay on while viewing recipes so that I don't have to keep unlocking my phone while cooking.

**Acceptance Criteria:**
- Wake lock requests when fullscreen recipe opens
- Wake lock requests when meal plan modal becomes visible
- Wake lock releases when views close
- Feature detection handles unsupported browsers gracefully
- Errors are logged but don't interrupt user experience

**Source Evidence:**
- `requestWakeLock()`
- `releaseWakeLock()`
- `navigator.wakeLock.request('screen')`
- Feature detection: `if ('wakeLock' in navigator)`

---

# Non-Functional Requirements

## Performance

### NFR-001: Client-Side Rendering
**Category:** Performance

**Description:** Application operates entirely client-side with no backend dependencies

**Measurable Criteria:**
- Zero network requests required after initial page load
- All recipe data bundled in recipes.js (< 50KB)
- Page functions fully offline after first load

**Source Evidence:** Single HTML file with inline JS and external recipes.js; all 44 recipes embedded in recipeData array

---

### NFR-002: Instant Ingredient Scaling
**Category:** Performance

**Description:** Ingredient quantity calculations complete instantly on serving change

**Measurable Criteria:**
- Calculations complete in < 16ms (single frame)
- No visible lag when adjusting servings slider
- DOM updates are minimal and targeted

**Source Evidence:** Simple multiplication (`quantity * factor`); createElement/appendChild for targeted updates

---

## Usability

### NFR-003: Mobile-First Responsive Design
**Category:** Usability

**Description:** Application is optimized for mobile devices with responsive breakpoints

**Measurable Criteria:**
- Touch targets minimum 44x44 pixels
- Font sizes readable without zooming (16px+ body text)
- Layouts adapt to screens from 320px to 1920px width
- Safe area insets respected for notched devices

**Source Evidence:** `@media (max-width: 480px)` breakpoints; `env(safe-area-inset-top)` for notch support; `100dvh` for dynamic viewport height

---

### NFR-004: Thumb-Accessible Navigation
**Category:** Usability

**Description:** Primary navigation is positioned at bottom of screen for easy thumb access

**Measurable Criteria:**
- Bottom navigation fixed at screen bottom
- Three main actions accessible with single thumb tap
- Navigation visible on all views

**Source Evidence:** Footer with `position: sticky; bottom: 0`; buttons for Meal Plan, Search, Shopping

---

### NFR-005: Visual Aisle Color Coding
**Category:** Usability

**Description:** Shopping list items have color-coded borders indicating grocery store aisle

**Measurable Criteria:**
- 17 distinct colors for 17 aisles
- Colors are distinguishable and accessible
- Color applied as left border on list items

**Source Evidence:** Border-left colors for each aisle class (Veg=#2ecc71, Meat=#e74c3c, Dairy=#8e44ad, etc.)

---

## Reliability

### NFR-006: Graceful API Fallbacks
**Category:** Reliability

**Description:** Application handles missing or unsupported browser APIs gracefully

**Measurable Criteria:**
- Wake lock failure does not break cooking view
- Clipboard failure shows user-friendly error message
- Missing localStorage degrades to session-only storage

**Source Evidence:** Feature detection before API use; `if ('wakeLock' in navigator)`; `.catch(() => alert('Failed to copy'))`

---

### NFR-007: Data Recovery on Load
**Category:** Reliability

**Description:** Application recovers saved data from localStorage on every page load

**Measurable Criteria:**
- Meal plan restored from localStorage on load
- Shopping list state restored on load
- Corrupted JSON handled with fallback to defaults

**Source Evidence:** `JSON.parse(localStorage.getItem('mealPlanner'))`; try-catch with empty array default; `console.error` for debugging

---

## Compatibility

### NFR-008: LocalStorage Requirement
**Category:** Compatibility

**Description:** Application requires browser localStorage support for core functionality

**Measurable Criteria:**
- localStorage must be available and writable
- Minimum 5MB storage quota assumed
- Private/incognito mode may limit persistence

**Source Evidence:** `localStorage.setItem/getItem` throughout; data (meal plan + shopping state) < 100KB typical

---

### NFR-009: Progressive Enhancement for Modern APIs
**Category:** Compatibility

**Description:** Modern browser APIs enhance but don't gate core functionality

**Measurable Criteria:**
- Core features work without Wake Lock API
- Core features work without Clipboard API (copy fails gracefully)
- ES6+ JavaScript required (const, let, arrow functions, Maps)

**Source Evidence:** Optional APIs: Wake Lock, Clipboard; Required: localStorage, ES6 features

---

## Maintainability

### NFR-010: Centralized Ingredient Definitions
**Category:** Maintainability

**Description:** All ingredient data is centralized in recipes.js with consistent structure

**Measurable Criteria:**
- Single source of truth for ingredient names
- Single source of truth for aisle assignments
- Adding new ingredient requires only recipes.js edit

**Source Evidence:** `INGREDIENTS` object with 170+ items; `AISLE` object with 17 categories; `N()` function for ingredient creation

---

### NFR-011: Data Validation Helpers
**Category:** Maintainability

**Description:** Helper functions validate and normalize ingredient data

**Measurable Criteria:**
- `N()` function validates ingredient key existence
- `getAisleInfoByName()` provides safe aisle lookup
- Invalid data logs errors for debugging

**Source Evidence:** `N(key, quantity, unit)` with validation; `getAisleInfoByName(name)` with fallback; `console.error` for missing ingredients

---

# Data Requirements

## Entity: Recipe

A meal recipe with ingredients and cooking instructions

| Attribute | Type | Constraints | Description |
|-----------|------|-------------|-------------|
| id | integer | unique, positive, required | Unique recipe identifier |
| meal | string \| array\<string\> | required, values: breakfast/lunch/dinner/snacks | Meal category or categories |
| recipe | string | required, non-empty | Display name of the recipe |
| defaultServings | integer | required, positive (typically 2-6) | Base number of servings |
| calories | integer | required, positive | Total calories for all defaultServings |
| ingredients | array\<IngredientReference\> | required, non-empty | List of ingredients with quantities |
| steps | array\<string\> | required, non-empty | Ordered cooking instructions |
| isCheat | boolean | optional, default false | Flag for "cheat meal" recipes |

**Relationships:** Has many IngredientReference (via ingredients array)

---

## Entity: Ingredient

A food ingredient with aisle assignment

| Attribute | Type | Constraints | Description |
|-----------|------|-------------|-------------|
| key | string | unique, uppercase, required | Constant name (e.g., "ROLLED_OATS") |
| name | string | unique, required | Display name (e.g., "Rolled oats") |
| aisle | Aisle | required, valid aisle reference | Grocery store aisle location |

**Relationships:** Belongs to Aisle (via aisle property)

**Total Count:** 170+ ingredients defined

---

## Entity: IngredientReference

An ingredient usage in a recipe with quantity

| Attribute | Type | Constraints | Description |
|-----------|------|-------------|-------------|
| name | string | required, must match Ingredient.name | Ingredient display name |
| quantity | number | required, positive (can be decimal) | Amount for recipe's defaultServings |
| unit | string | required, must be valid Unit value | Measurement unit abbreviation |

**Relationships:** References Ingredient (via name), References Unit (via unit)

---

## Entity: Aisle

A grocery store aisle for shopping list organization

| Attribute | Type | Constraints | Description |
|-----------|------|-------------|-------------|
| key | string | unique, uppercase | Constant name (e.g., "DAIRY") |
| name | string | required | Display name (e.g., "Dairy") |
| order | integer | unique, range 1-17 | Sort order for shopping list |

**Total Count:** 17 aisles

| Order | Aisle |
|-------|-------|
| 1 | Meat |
| 2 | Poultry |
| 3 | Veg |
| 4 | Fruit |
| 5 | Fish |
| 6 | Dairy |
| 7 | Frozen |
| 8 | Herbs & Spices |
| 9 | Oils & Fats |
| 10 | Tins & Jars |
| 11 | Grains & Pasta |
| 12 | Condiments & Sauces |
| 13 | Bakery |
| 14 | Nuts |
| 15 | Seeds |
| 16 | Beverages |
| 17 | Misc |

---

## Entity: Unit

A measurement unit for ingredient quantities

| Attribute | Type | Constraints | Description |
|-----------|------|-------------|-------------|
| key | string | unique, uppercase | Constant name (e.g., "GRAM") |
| value | string | required | Display abbreviation (e.g., "g") |

**Total Count:** 23 units

| Category | Units |
|----------|-------|
| Weight | GRAM (g), KILOGRAM (kg), OUNCE (oz), POUND (lb) |
| Volume (Metric) | MILLILITER (ml), LITER (l) |
| Volume (Imperial) | TEASPOON (tsp), TABLESPOON (tbsp), CUP (cup) |
| Count | PIECES (piece), SLICES (slice), HANDFUL, SMALL, MEDIUM, LARGE |
| Container | TIN, CAN, PACK |
| Cooking | PINCH, DASH, SPRIG, CLOVE, LEAF |
| Other | HEAD, STALK, NONE ("") |

---

## Entity: MealPlanEntry

A recipe assignment to a day in the weekly meal plan

| Attribute | Type | Constraints | Description |
|-----------|------|-------------|-------------|
| day | string | required, one of: Mon/Tue/Wed/Thu/Fri/Sat/Sun | Day of the week |
| recipes | array\<PlannedRecipe\> | required | Recipes assigned to this day |

**Storage:** localStorage key `mealPlanner`

---

## Entity: PlannedRecipe

A recipe in the meal plan with serving size

| Attribute | Type | Constraints | Description |
|-----------|------|-------------|-------------|
| id | integer | required, must match Recipe.id | Reference to recipe |
| servings | integer | required, positive | Number of servings planned |

---

## Entity: ShoppingListState

Checkbox states for shopping list items

| Attribute | Type | Constraints | Description |
|-----------|------|-------------|-------------|
| key | string | format: "ingredientName\|unit" | Unique identifier for ingredient+unit |
| checked | boolean | default false | Whether item has been purchased |

**Storage:** localStorage key `shoppingListState`

**Structure:** Map\<string, boolean\> serialized as array of [key, value] pairs
