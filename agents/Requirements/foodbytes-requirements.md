# FoodBytes Requirements Specification

> Extracted from codebase analysis following requirements-agent.yaml methodology

## Project Information

| Field | Value |
|-------|-------|
| **Name** | FoodBytes |
| **Version** | 9.0.0 |
| **Analyzed Date** | 2025-11-29 |
| **Description** | Meal planning and recipe management application with date-based calendar, user authentication, and admin recipe management |
| **Architecture** | Hybrid client-server (vanilla HTML/CSS/JS frontend, Node.js/Express backend, MySQL database) |
| **Source Files** | recipes.js, index.html, styles.css, server/ (backend) |

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

### FR-007: Assign Recipes to Calendar Dates
**Priority:** High

**Description:** Users can assign recipes to specific calendar dates (YYYY-MM-DD format)

**User Story:** As a user, I want to assign recipes to specific calendar dates so that I can plan my meals for any date, not just the current week.

**Acceptance Criteria:**
- Each recipe card displays a date picker or calendar grid for assignment
- Clicking a date assigns the recipe to that specific date
- Visual indicator shows when a recipe is assigned to a date
- Recipe's current serving size is saved with the assignment
- Multiple recipes can be assigned to the same date (different meal types)
- Dates persist indefinitely, not limited to a single week
- Authenticated users' assignments sync to server database
- Guest users can browse recipes but cannot save assignments

**Source Evidence:**
- `createDatePicker(entry, servings)`
- `assignRecipeToDate()`
- `planner[]` variable (date-indexed)
- Server API: meal plan endpoints

---

### FR-008: Remove Recipes from Calendar
**Priority:** High

**Description:** Users can remove previously assigned recipes from a date

**User Story:** As a user, I want to remove a recipe from my meal plan so that I can change my planned meals.

**Acceptance Criteria:**
- Clicking an already-assigned date removes the recipe from that date
- Visual indicator updates to show the recipe is no longer assigned
- Date entry is cleaned up if no recipes remain for that date
- Change syncs to server database for authenticated users

**Source Evidence:**
- `assignRecipeToDate()` toggle behavior
- Server API: DELETE meal plan endpoint

---

### FR-009: View Meal Plan Calendar
**Priority:** High

**Description:** Users can view their meal plan in a navigable calendar with week/month views and historical navigation

**User Story:** As a user, I want to view my meal plan as a calendar so that I can see what I've planned and review past meals.

**Acceptance Criteria:**
- Meal Plan button in footer opens calendar view
- Calendar displays current week by default with option for month view
- Previous/Next navigation arrows to move between weeks
- Jump to specific date via date picker
- Current date is visually highlighted
- Each date shows assigned recipes with meal type and serving size
- Daily calorie total is displayed for each date
- Navigate to previous weeks to view meal history (rolling 6 months)
- Past dates show assigned recipes as read-only history
- Visual distinction between past, current, and future dates
- Wake lock activates when calendar is visible (if supported)

**Source Evidence:**
- `renderCalendar()`
- `navigateCalendar(direction)`
- `#calendar-view` element
- Server API: GET meal plan with date range

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

### FR-012: Generate Aggregated Shopping List with Date Range
**Priority:** High

**Description:** System generates a unified shopping list from recipes in the meal plan, filtered by a selectable date range

**User Story:** As a user, I want a consolidated shopping list for a specific date range so that I can shop for only the meals I need.

**Acceptance Criteria:**
- Shopping List view accessible from bottom navigation
- Date range picker allows selecting start and end dates
- Quick presets available: "Next 3 days", "Next 7 days", "Next 14 days"
- Default date range is current date + 7 days
- Only ingredients from recipes within selected date range are aggregated
- Same ingredients from multiple recipes are combined (quantities summed)
- Quantities reflect recipe serving sizes from meal plan
- List updates automatically when date range or meal plan changes
- Date range preference persists for user convenience

**Source Evidence:**
- `renderShoppingList(dateFrom, dateTo)`
- `ingredientTotals` Map with key = `name|unit`
- Calculation: `quantity * servings / defaultServings`
- Date range filter UI component

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

### FR-018: Persist Meal Plan to Server Database
**Priority:** High

**Description:** System automatically saves authenticated users' meal plans to the server database

**User Story:** As a user, I want my meal plan saved to my account so that I can access it from any device.

**Acceptance Criteria:**
- Authenticated users' meal plans sync to MySQL database via REST API
- Plan loads from server on login
- Guest users can browse recipes but cannot save meal plans
- Changes sync to server after each modification
- Corrupted data is handled gracefully with fallback to empty plan
- localStorage used only for session tokens and temporary guest data
- Meal plan data retained for rolling 6 months (older data auto-archived)

**Source Evidence:**
- Server API: meal plan endpoints
- JWT authentication for API calls
- MySQL `meal_plan_entries` table

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

**Description:** Users can generate a URL that encodes a date range of their meal plan for sharing

**User Story:** As a user, I want to generate a shareable link so that I can share my meal plan with friends or family.

**Acceptance Criteria:**
- Share button visible in meal plan view
- User can select date range to share (default: current week)
- Clicking generates URL with base64-encoded planner data including dates
- URL is automatically copied to clipboard
- Success message confirms URL was copied
- URL uses `?planner=` query parameter with date-indexed data

**Source Evidence:**
- `generateShareURL(dateFrom, dateTo)`
- Encoding: `btoa(JSON.stringify(plannerWithDates))`
- `navigator.clipboard.writeText()`

---

### FR-021: Import Meal Plan from Shared URL
**Priority:** Low

**Description:** System loads a shared meal plan when URL contains encoded planner data with dates

**User Story:** As a user, I want to import a meal plan from a shared link so that I can use plans shared by others.

**Acceptance Criteria:**
- System checks for `?planner=` URL parameter on page load
- Base64 data is decoded to meal plan array with date information
- Confirmation dialog asks user before importing
- User can choose to import to original dates or shift to current week
- Import merges with or replaces current meal plan (user choice)
- Requires authentication to save imported plan
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

## User Authentication

### FR-023: User Registration and Login (OAuth)
**Priority:** High

**Description:** Users can create accounts and log in using OAuth providers (Google/GitHub)

**User Story:** As a user, I want to log in with my Google or GitHub account so that I can save my meal plans and access them from any device.

**Acceptance Criteria:**
- Login buttons displayed for Google and GitHub OAuth providers
- New users automatically registered on first OAuth login
- JWT tokens stored client-side for session management
- User profile displays name and email from OAuth provider
- Logout button clears session and returns user to guest mode
- Guest users can browse recipes but cannot save meal plans
- Session persists across browser sessions until explicit logout

**Source Evidence:**
- OAuth callback handlers
- JWT token storage in localStorage
- User session state management

---

### FR-024: View User Profile
**Priority:** Medium

**Description:** Authenticated users can view their profile information

**User Story:** As a user, I want to see my profile so that I know which account I'm logged in with.

**Acceptance Criteria:**
- Profile displays user name and email
- Shows OAuth provider used (Google/GitHub)
- Shows account creation date
- Shows admin status if applicable
- Logout option available from profile

**Source Evidence:**
- User profile component
- Server API: GET current user

---

## Admin Features

### FR-025: GOD Mode Admin Access
**Priority:** High

**Description:** Designated admin user(s) have elevated privileges to manage recipes

**User Story:** As an admin, I want special access so that I can manage and improve recipes for all users.

**Acceptance Criteria:**
- Admin role stored in database (`is_admin` flag on user record)
- Admin status assigned directly in database (not self-service)
- Admin users see "Edit Recipe" button on recipe cards
- Admin users can access recipe management functions
- Non-admin users see recipes as read-only
- Admin actions are logged for accountability

**Source Evidence:**
- `is_admin` column in users table
- Admin role check middleware
- Conditional UI rendering based on admin status

---

### FR-026: Recipe Editing (Admin Only)
**Priority:** High

**Description:** Admin users can create, update, and delete recipes

**User Story:** As an admin, I want to edit recipe details so that I can correct errors, improve instructions, or add new recipes.

**Acceptance Criteria:**
- Edit form allows modifying recipe name
- Edit form allows modifying default servings and calories
- Can add, remove, or modify ingredients (name, quantity, unit)
- Can add, remove, or reorder cooking steps
- Can toggle cheat meal flag
- Can toggle recipe visibility (Live/Hidden) - see FR-028
- Can assign recipe to meal categories
- Delete recipe performs soft delete (preserves for audit)
- Changes immediately visible to all users after save (for Live recipes)
- Only admin users can access edit functionality

**Source Evidence:**
- Recipe edit form component
- Server API: POST/PUT/DELETE recipe endpoints
- Admin authorization middleware

---

### FR-027: Recipe Edit Audit Trail
**Priority:** High

**Description:** All recipe modifications are logged to an audit table with full change history

**User Story:** As an admin, I want a complete history of recipe changes so that I can track who changed what and when, and review or revert changes if needed.

**Acceptance Criteria:**
- Every recipe create, update, and delete action is logged
- Audit record captures: admin user ID, recipe ID, action type, timestamp
- **Full diff stored**: Complete `old_values` and `new_values` JSON for every field changed
- Audit log viewable by admin users
- Can filter audit log by recipe, user, or date range
- Can view side-by-side comparison of changes
- Audit records are immutable (append-only, no edits or deletes)

**Source Evidence:**
- `recipe_audit_log` table
- Audit trigger on recipe modifications
- Audit log viewer component

---

### FR-028: Recipe Visibility Toggle (Admin Only)
**Priority:** High

**Description:** Admin users can set recipes as Live (visible to all users) or Hidden (visible only to admins)

**User Story:** As an admin, I want to hide recipes from regular users so that I can prepare and review recipes before making them publicly available.

**Acceptance Criteria:**
- Each recipe has a visibility status: Live (1) or Hidden (0)
- All new recipes default to Hidden (0)
- Only admin (GOD mode) users can toggle visibility status
- Hidden recipes are NOT visible to regular users in any view (browse, search, meal plan assignment)
- Hidden recipes ARE visible to admin users with a visual indicator (e.g., "Hidden" badge)
- Admin users see a toggle/button to change visibility status on recipe cards and edit form
- Visibility changes are logged in the audit trail (old_values/new_values includes is_live)
- Admin recipe management view can filter by Live/Hidden status

**Source Evidence:**
- `is_live` column in recipes table
- Admin-only visibility toggle UI component
- Recipe query filters by `is_live=1` for non-admin users
- Admin sees all recipes regardless of `is_live` value

---

# Non-Functional Requirements

## Architecture

### NFR-001: Hybrid Client-Server Architecture
**Category:** Architecture

**Description:** Application uses client-side rendering with server-side data persistence and authentication

**Measurable Criteria:**
- Frontend remains vanilla HTML/CSS/JS (no framework required)
- Backend: Node.js + Express REST API
- Database: MySQL for users, meal plans, recipes, and audit logs
- Recipe data may remain in recipes.js initially (migration optional)
- API endpoints secured with JWT authentication
- Guest browsing requires no authentication
- Authenticated features require valid JWT token

**Source Evidence:** server/ directory with Express application; MySQL database schema; JWT middleware

---

## Performance

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

**Description:** Application recovers saved data from server (authenticated) or localStorage (guest) on every page load

**Measurable Criteria:**
- Authenticated users: Meal plan loaded from server database on login
- Guest users: Browse-only mode, no persistent data
- Shopping list checkbox state restored from localStorage (local convenience)
- Server connection failures handled with retry logic and user notification
- Corrupted data handled with fallback to defaults

**Source Evidence:** Server API: GET meal plan; try-catch with error handling; localStorage for local preferences only

---

## Compatibility

### NFR-008: Server-Side Data Storage
**Category:** Compatibility

**Description:** Primary data storage is server-side MySQL database; localStorage used only for local preferences

**Measurable Criteria:**
- Meal plans stored in MySQL database (authenticated users)
- Recipe data stored in MySQL database (admin-managed)
- Audit logs stored in MySQL database
- localStorage used only for: JWT tokens, shopping list checkbox state, UI preferences
- Application degrades gracefully if localStorage unavailable
- Server database is single source of truth for user data

**Source Evidence:** MySQL database schema; Server API for CRUD operations; localStorage for session tokens only

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

## Security

### NFR-012: API Authentication and Authorization
**Category:** Security

**Description:** REST API endpoints are secured with proper authentication and role-based authorization

**Measurable Criteria:**
- All write endpoints require valid JWT token
- Admin endpoints verify `is_admin` flag before allowing access
- JWT tokens expire after reasonable period (e.g., 7 days)
- Refresh token mechanism for extended sessions
- No passwords stored (OAuth-only authentication)
- HTTPS required in production environment
- Rate limiting on authentication endpoints to prevent abuse

**Source Evidence:** JWT middleware; OAuth provider integration; Admin role check middleware

---

### NFR-013: Audit Data Integrity
**Category:** Security

**Description:** Recipe audit logs maintain complete, tamper-proof history with full change diffs

**Measurable Criteria:**
- Audit table uses auto-increment ID for ordering
- Timestamps stored in UTC timezone
- Foreign keys ensure referential integrity to users and recipes
- No DELETE or UPDATE operations permitted on audit table (append-only)
- `old_values` and `new_values` columns store complete JSON snapshots
- Audit records preserved even if related recipe is deleted (soft delete)
- Regular backup strategy for audit data

**Source Evidence:** `recipe_audit_log` table schema; Database constraints; Backup procedures

---

### NFR-014: Data Retention Policy
**Category:** Reliability

**Description:** Meal plan history is retained for rolling 6 months; audit logs retained indefinitely

**Measurable Criteria:**
- Scheduled job archives meal plan entries older than 6 months
- Archived data moved to archive table or deleted (configurable)
- Users can export their data before archival (optional)
- Audit logs are exempt from retention policy (kept indefinitely)
- Recipe data never auto-archived (admin-managed lifecycle)

**Source Evidence:** Scheduled archival job; Archive table schema; Data retention configuration

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
| is_live | boolean | optional, default false | Visibility flag: true (1) = visible to all users, false (0) = visible to admin only |

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

A recipe assignment to a specific calendar date for a user

| Attribute | Type | Constraints | Description |
|-----------|------|-------------|-------------|
| id | integer | PK, auto-increment | Unique entry identifier |
| user_id | integer | FK → User, required | Owner of this meal plan entry |
| date | date | required, format: YYYY-MM-DD | Calendar date for this entry |
| meal_type | string | required, one of: breakfast/lunch/dinner/snacks | Meal slot |
| recipe_id | integer | FK → Recipe, required | Reference to assigned recipe |
| servings | integer | required, positive | Number of servings planned |
| created_at | datetime | required | When entry was created |
| updated_at | datetime | required | When entry was last modified |

**Storage:** MySQL `meal_plan_entries` table

**Relationships:** Belongs to User (via user_id), References Recipe (via recipe_id)

**Retention:** Rolling 6 months (older entries auto-archived)

---

## Entity: ShoppingListState

Checkbox states for shopping list items (local convenience, not synced to server)

| Attribute | Type | Constraints | Description |
|-----------|------|-------------|-------------|
| key | string | format: "ingredientName\|unit" | Unique identifier for ingredient+unit |
| checked | boolean | default false | Whether item has been purchased |

**Storage:** localStorage key `shoppingListState`

**Structure:** Map\<string, boolean\> serialized as array of [key, value] pairs

---

## Entity: User

A registered user account (created via OAuth)

| Attribute | Type | Constraints | Description |
|-----------|------|-------------|-------------|
| id | integer | PK, auto-increment | Unique user identifier |
| email | string | unique, required | User's email from OAuth provider |
| name | string | required | Display name from OAuth provider |
| oauth_provider | string | required, one of: google/github | OAuth provider used for registration |
| oauth_id | string | required | Provider's unique user identifier |
| is_admin | boolean | default false | GOD mode flag for recipe editing |
| created_at | datetime | required | Account creation timestamp |
| last_login | datetime | nullable | Most recent login timestamp |

**Storage:** MySQL `users` table

**Relationships:** Has many MealPlanEntry (via user_id), Has many RecipeAuditLog (via user_id)

---

## Entity: RecipeAuditLog

Immutable audit record of recipe modifications (full diff)

| Attribute | Type | Constraints | Description |
|-----------|------|-------------|-------------|
| id | integer | PK, auto-increment | Unique audit record identifier |
| recipe_id | integer | FK → Recipe, required | Recipe that was modified |
| user_id | integer | FK → User, required | Admin user who made the change |
| action | string | required, one of: CREATE/UPDATE/DELETE | Type of modification |
| old_values | JSON | nullable | Complete snapshot of previous values (for UPDATE/DELETE) |
| new_values | JSON | nullable | Complete snapshot of new values (for CREATE/UPDATE) |
| timestamp | datetime | required, UTC | When the modification occurred |

**Storage:** MySQL `recipe_audit_log` table

**Relationships:** References Recipe (via recipe_id), References User (via user_id)

**Constraints:**
- Append-only table (no UPDATE or DELETE operations permitted)
- Retained indefinitely (exempt from data retention policy)
- `old_values` and `new_values` contain full JSON snapshots of all recipe fields
