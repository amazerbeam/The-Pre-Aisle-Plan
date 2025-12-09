# FoodBytes Requirements Specification

> Extracted from codebase analysis following requirements-agent.yaml methodology

---

## Requirement Numbering Guidelines

### DO:
- Ensure requirement numbers are **unique** across the entire document
- Pick the next increment when adding a new requirement (e.g., if FR-035 exists, next is FR-036)
- Keep sequence numbers **contiguous** with no gaps
- When moving a requirement between sections (Backlog → In Progress → Complete), **keep its original number**

### DO NOT:
- Reuse the same requirement number for different requirements
- Leave gaps in the sequence (e.g., FR-001, FR-002, FR-005 is wrong)
- Renumber requirements when moving between sections

---

## Project Information

| Field | Value |
|-------|-------|
| **Name** | The Pre-Aisle Plan |
| **Version** | 9.2.0 |
| **Analyzed Date** | 2025-11-30 |
| **Description** | Meal planning and recipe management application with date-based calendar, user authentication, and admin recipe management |
| **Architecture** | Hybrid client-server (vanilla HTML/CSS/JS frontend, Node.js/Express backend, MySQL database) |
| **Source Files** | recipes.js, index.html, styles.css, server/ (backend) |

---

## In Progress - Start

| Req # | Description |
|-------|-------------|
| FR-029 | Screen Wake Lock with Lock Emoji Animation |

## In Progress - Finish

---

## Completed - Start

| Req # | Description |
|-------|-------------|
| FR-001 | Sign In / Guest Access |
| FR-002 | Browse Recipes by Meal Category |
| FR-003 | View Recipe Details |
| FR-004 | Adjust Serving Sizes |
| FR-005 | Search Recipes |
| FR-006 | Footer Navigation |
| FR-007 | Shared Start Date with Fixed 7-Day Range |
| FR-014 | Assign Recipes to Days of the Week |
| FR-015 | Remove Recipes from Calendar |
| FR-016 | View Meal Plan Calendar |
| FR-017 | Calculate Daily Calorie Totals |
| FR-019 | Generate Aggregated Shopping List |
| FR-020 | Group Ingredients by Grocery Aisle |
| FR-021 | Check Off Purchased Items |
| FR-022 | Uncheck All Shopping Items |
| FR-024 | Sort Shopping List by Aisle, Ingredient Name, and Check Status |
| FR-037 | Single Recipe Per Meal Slot with Swap Behavior |
| FR-038 | Recipes Navigation Button in Footer |
| FR-039 | Logo Click Navigates to Recipes |
| FR-040 | Hide Empty Meal Types in Meal Plan |
| FR-041 | Random Food Emojis Per Meal Type (Meal Plan View Only) |
| NFR-016 | Simplified Day Button Styling (No Animations, No Loading Effects) |
| FR-049 | Expand Recipe to Fullscreen (Recipe Cards) |
| FR-013 | Fullscreen Recipe View (Popup Modal with Variant Support) |
| FR-033 | Recipe Editing (Admin Only) - Detailed Edit Flow |
| FR-036 | Fixed Per-Serving Calorie Display (No Scaling) |
| FR-042 | Ingredient Breakdown Popup (Long Press) |
| FR-043 | Linked Recipe Variants (Recipe Families) |
| FR-044 | Ingredient Autocomplete (Admin Recipe Editing) |
| FR-045 | Unit Autocomplete (Admin Recipe Editing) |
| FR-046 | Recipe Step Editing (Admin Only) |
| FR-047 | Create New Recipe (Admin Only) |
| FR-048 | Landing Page Animation (Guest Homepage) |
| FR-050 | Day Calorie Preview in Recipes View (above day buttons) |
| Database: Users | Store user accounts from Google OAuth |
| Database: Recipes | Store recipe data (migrated from recipes.js) |

## Completed - Finish

---

## All Requirements - Start

---

# Functional Requirements

## Recipe Management

### FR-001: Sign In / Guest Access

**Priority:** Critical

**Description:** Users can access the app by signing in with Google or continuing as a guest

**User Story:** As a user, I want to choose between signing in with Google or browsing as a guest so that I can access recipes quickly.

**Acceptance Criteria:**
- Sign In button visible in **top right corner** of the header
- Clicking Sign In shows modal with two options:
  - **"Sign in with Google"** - Uses official Google branding/button
  - **"Continue as Guest"** - Allows browsing without authentication
- Signed-in users see benefits listed:
  - "More recipes" (future feature)
  - "Shopping List" (future feature)
  - "Meal Plans" (future feature)
- After sign-in, button changes to show user name/avatar with dropdown for logout
- Guest users can browse all visible recipes
- Session persists across browser sessions for signed-in users

**UI Reference:** Keep the UI style from `/Legacy/index.html`

---

### FR-002: Browse Recipes by Meal Category

**Priority:** Critical

**Description:** Users can browse recipes filtered by meal type using tab navigation

**User Story:** As a user, I want to browse recipes by meal category so that I can find appropriate recipes for each meal.

**Acceptance Criteria:**
- **Four tab buttons:** [Breakfast] [Lunch] [Dinner] [Snacks]
- **Breakfast loads by default** on page load
- Clicking a tab filters and displays only recipes belonging to that meal type
- Active tab is visually distinguished (uses brand color `#4a3f80`)
- Each recipe card displays:
  - Recipe name
  - Calories per serving
  - Servings control (adjustable)
  - "Show Details" button (expandable)
- **NO day-of-week buttons** (see FR-014 in Backlog)
- **NO meal plan assignment** (see FR-014 in Backlog)

**UI Reference:** Keep the UI style from `/Legacy/index.html`

---

### FR-003: View Recipe Details

**Priority:** Critical

**Description:** Users can expand recipe cards to view ingredients and cooking steps

**User Story:** As a user, I want to view complete recipe details so that I can prepare the meal.

**Acceptance Criteria:**
- Each recipe card has a collapsible details section
- Details section shows:
  - Complete ingredients list with quantities and units
  - Numbered cooking steps
- Toggle button switches between "Show Details" and "Hide Details"
- Ingredient quantities scale based on current serving size

---

### FR-004: Adjust Serving Sizes

**Priority:** High

**Description:** Users can adjust servings and see ingredient quantities recalculate

**User Story:** As a user, I want to adjust serving size so that ingredient quantities scale automatically.

**Acceptance Criteria:**
- Each recipe displays a servings input control
- Default value is 1 serving (or recipe's default)
- Changing servings recalculates all ingredient quantities
- Calorie display remains fixed (per-serving, does not scale) - see FR-036

---

### FR-005: Search Recipes

**Priority:** Medium

**Description:** Users can search recipes by name

**User Story:** As a user, I want to search recipes by name so that I can quickly find specific recipes.

**Acceptance Criteria:**
- Search bar accessible from bottom navigation (Search icon)
- Search filters recipes case-insensitively by name
- Results update as user types
- "No recipes found" message when no results
- Clearing search returns to previous meal category view

---

### FR-006: Footer Navigation

**Priority:** High

**Description:** Bottom navigation with key actions

**User Story:** As a user, I want easy access to main functions from the bottom of the screen.

**Acceptance Criteria:**
- Fixed footer at bottom with three buttons:
  - **[Meal Plan]** - Shows message "Coming soon - Sign in to unlock!"
  - **[Search]** - Opens search bar
  - **[Shopping]** - Shows message "Coming soon - Sign in to unlock!"
- For signed-in users, "Coming soon" buttons show "Feature coming soon!" instead
- Uses brand color `#4a3f80` for active/highlighted elements

---

### FR-008: Browse Recipes by Meal Category
**Priority:** High

**Description:** Users can browse recipes filtered by meal type using tab navigation

**User Story:** As a user, I want to browse recipes by meal category (Breakfast, Lunch, Dinner, Snacks) so that I can quickly find appropriate recipes for each meal.

**Acceptance Criteria:**
- **ONLY four tab buttons:** Breakfast, Lunch, Dinner, Snacks
- **NO "All Recipes" tab** - users must select a specific meal category
- Default tab on load is Breakfast
- Clicking a tab filters and displays only recipes belonging to that meal type
- **Each recipe MUST be assigned to at least one meal category** - recipes without a meal assignment will not display
- Active tab is visually distinguished from inactive tabs
- Recipes are sorted alphabetically within each category
- Cheat meal recipes appear after regular recipes
- Each recipe card displays:
  - Recipe name
  - Calories
  - Servings control
  - "View Details" button
  - **Day-of-week assignment buttons** (see FR-014)

**Source Evidence:**
- `renderTabs()`
- `selectMeal(meal)`
- `renderRecipes(meal)`
- `recipe_meals` junction table (links recipes to meal types)

---

### FR-009: Search Recipes by Name
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

### FR-010: View Recipe Details
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

### FR-011: Adjust Serving Sizes with Ingredient Scaling
**Priority:** High

**Description:** Users can adjust the number of servings and see ingredient quantities automatically recalculated

**User Story:** As a user, I want to adjust the serving size of a recipe so that ingredient quantities automatically scale for my needs.

**Acceptance Criteria:**
- Each recipe displays a servings input control
- **Default value is the user's Default Servings preference** (from profile, see FR-031)
- If user has no preference set, default to 1 serving
- Guest users default to 1 serving
- Changing servings recalculates all ingredient quantities proportionally
- Minimum serving size is 1
- Maximum serving size is 10 (or reasonable max)
- Scaled quantities show appropriate precision (whole numbers or 1 decimal)
- Calorie display remains fixed (per-serving, does not scale) - see FR-036

**Source Evidence:**
- `createServingsInput(entry)`
- `localServingsMap`
- User's `default_servings` preference
- Ingredient calculation: `quantity * (servings / defaultServings)`

---

### FR-012: Copy Recipe to Clipboard
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

### FR-013: Fullscreen Recipe View (Popup Modal with Variant Support)
**Priority:** Medium

**Category:** Recipe Management

**Description:** Users can view a recipe in a fullscreen popup modal for distraction-free cooking. The popup displays recipe details with white text on a dark background, supports recipe family variant switching without closing, and uses 99% viewport height with even margins.

**User Story:** As a user, I want to view a recipe in fullscreen mode so that I can focus on cooking without UI distractions, and switch between recipe variants without losing my place.

**Acceptance Criteria:**
- Maximize/expand button opens fullscreen recipe popup modal
- Popup uses dark/brand background with **white text (#ffffff)** for all content
- Popup displays:
  - Recipe name (with variant dropdown if recipe has variants - see FR-043)
  - Calories per serving in white text (see FR-036)
  - Servings info
  - Ingredients list with scaled quantities
  - Numbered cooking steps
- **Variant dropdown** appears next to recipe name IF recipe belongs to a recipe family (has linked variants)
- Variant dropdown styled **identically to RecipeCard.jsx dropdown**
- Selecting a variant updates popup content **in-place without closing the popup**
- Close button (X) exits fullscreen mode
- Popup closes on: X button click, backdrop click, or ESC key press
- Screen wake lock activates in fullscreen mode (if supported)
- Popup height is **max-height: 99vh** with **0.5vh margin evenly distributed top and bottom**
- Content scrolls within the fixed-height popup container

**DO:**
- Use white text color (#ffffff) for ALL text in the popup (recipe name, cal/serving, ingredients, steps)
- If recipe has variants (belongs to recipe family per FR-043), display the variant dropdown in the popup header
- Style the variant dropdown identically to the dropdown in `RecipeCard.jsx`
- Keep popup open when user selects a different variant - only update the recipe content in-place
- Set popup max-height: 99vh (99% of viewport height)
- Apply 0.5vh margin evenly to top and bottom (tiny visible margins on both sides)
- Center popup both horizontally and vertically on the viewport
- Allow popup content to scroll if it exceeds the fixed height
- Reuse `RecipeViewModal` component for consistency
- **Use exact same calorie text format as RecipeCard: `{calories} cal` (e.g., "650 cal")**
- **When variant is selected in modal, fetch the new variant's full recipe data (ingredients, steps) and update the modal content WITHOUT closing the modal**
- **Handle variant switching entirely within RecipeCard/RecipeViewModal - do NOT rely on parent component to swap recipes**
- **The modal must remain open even when the underlying recipe ID changes due to variant selection**

**DO NOT:**
- Do NOT use dark/black text on the dark overlay background - text must be white
- Do NOT omit the variant dropdown for recipes that belong to a recipe family
- Do NOT close the popup when user changes variant - update content in-place only
- Do NOT use height: 100vh or 100% - must be 99vh max with visible margins
- Do NOT use uneven margins (e.g., more margin at bottom than top)
- Do NOT extend popup beyond viewport edges
- Do NOT style variant dropdown differently from RecipeCard dropdown
- **Do NOT use "cal/serving" format in the modal - use "cal" only to match RecipeCard**
- **Do NOT let the parent component unmount/remount RecipeCard when variant is selected in fullscreen modal**
- **Do NOT call parent's onSelectVariant when changing variants in fullscreen - handle it internally by fetching recipe data directly**

**Cross-References:**
- FR-043: Linked Recipe Variants (variant dropdown behavior and styling)
- FR-036: Fixed Per-Serving Calorie Display (cal/serving calculation)
- FR-049: Expand Recipe to Fullscreen (expand button on recipe cards)

**Source Evidence:**
- `openFullscreen(entry)`
- `closeFullscreen()`
- `RecipeViewModal.jsx` component
- User feedback: "cal/serving text color should be white"
- User feedback: "cal with family recipe should have the dropdown same as Recipe card view"
- User feedback: "When variant recipe is changed keep popup open"
- User feedback: "popup should be 99% of the screen height, need max height. Leave tiny margin evenly top and bottom"
- User feedback (2025-12-05): "When the full screen is open and the user changes the Cal, the full screen should stay open, just reload the new recipe in place of the old one"
- User feedback (2025-12-05): "The dropdown to get the variant meal should simply read 'x cal' same as the card"

**Status:** Completed

---

### FR-043: Linked Recipe Variants (Recipe Families)
**Priority:** Medium

**Category:** Recipe Management

**Description:** Recipes can be grouped into "recipe families" to represent different calorie-tier variants of the same base meal. A dropdown selector next to the recipe name allows users to switch between **Light**, **Standard**, and **Full** versions based on their daily calorie budget.

**User Story:** As a user, I want to choose different calorie versions of the same meal (Light for calorie-saving days, Standard for normal days, Full for training days) so I can practice flexible dieting while enjoying the same dishes.

**Acceptance Criteria:**
- Recipes can be linked together into a "recipe family" (group of related variants)
- Each recipe family has ONE recipe marked as the "default" (Standard version)
- **Cheat meals (is_cheat = TRUE) are excluded** — no variants for treats
- Dropdown appears next to recipe name ONLY if the recipe has linked variants
- Dropdown lists variants using **standard labels: "Light", "Standard", "Full"**
- Standard (default) recipe appears first in dropdown
- Selecting a variant from dropdown:
  - Replaces current recipe card with selected variant
  - Maintains current servings selection (carries over to variant)
  - Preserves day assignments (if recipe was assigned to days, variant inherits those assignments with confirmation)
- Admin can create/edit recipe families and set default recipe
- Admin can add/remove recipes from a family
- Variants show visual indicator (e.g., badge or icon) that they belong to a family

**Calorie Tier Definitions:**
| Tier | Target Calories | When To Choose |
|------|-----------------|----------------|
| **Light** | ~400-500 cal | Big breakfast/lunch, calorie-saving day |
| **Standard** | ~550-700 cal | Normal day (default) |
| **Full** | ~750-900 cal | Light earlier meals, training day |

**Example Use Case:**
**Recipe Family:** "Chicken Curry"
- **Light:** Chicken Curry (no rice) — 550 cal
- **Standard:** Chicken Curry + Rice — 700 cal (Default)
- **Full:** Chicken Curry + Rice + Naan — 850 cal

User's day: Big breakfast (500 cal) → sees "Chicken Curry" with dropdown → selects "Light" → gets curry without rice (550 cal) → stays within daily budget

**Database Schema:**

**Table: `recipe_families`**
```sql
CREATE TABLE recipe_families (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    family_name VARCHAR(255) NOT NULL,  -- e.g., "Curry Sauce Variants"
    description TEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

**Table: `recipe_family_members`** (junction table)
```sql
CREATE TABLE recipe_family_members (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    family_id BIGINT NOT NULL,
    recipe_id BIGINT NOT NULL,
    is_default BOOLEAN DEFAULT FALSE,
    variant_label VARCHAR(100) NULL,  -- MUST be: "Light", "Standard", or "Full"
    display_order INT DEFAULT 0,      -- Order: Standard (1), Light (2), Full (3)
    CONSTRAINT fk_family FOREIGN KEY (family_id) REFERENCES recipe_families(id) ON DELETE CASCADE,
    CONSTRAINT fk_recipe FOREIGN KEY (recipe_id) REFERENCES recipes(id) ON DELETE CASCADE,
    UNIQUE KEY unique_recipe_in_family (family_id, recipe_id),
    INDEX idx_family_id (family_id),
    INDEX idx_recipe_id (recipe_id)
);
```

**Constraint:** Each family must have exactly ONE default recipe (enforced in application logic)

**DO:**
- Show dropdown ONLY if recipe has linked variants (check `recipe_family_members` table)
- Display Standard (default) recipe first in dropdown
- Use ONLY these variant labels: **"Light", "Standard", "Full"**
- **Exclude cheat meals** — recipes with `is_cheat = TRUE` cannot be added to families
- Allow admin to create families and link recipes via admin panel
- Validate that each family has exactly one default recipe (Standard)
- When switching variants, carry over current servings value
- Show family indicator badge (e.g., "3 variants" or link icon) on recipe cards
- Log variant switches in analytics (optional - track popular variants)
- Include all family variants in recipe search results (treat as separate recipes)

**DO NOT:**
- Do NOT show dropdown if recipe has no linked variants (dropdown appears conditionally)
- Do NOT allow multiple default recipes in same family (validation error)
- Do NOT allow a recipe to belong to multiple families (1 recipe = 1 family maximum)
- Do NOT add cheat meals to recipe families (is_cheat = TRUE recipes are excluded)
- Do NOT use variant labels other than "Light", "Standard", "Full"
- Do NOT automatically switch variants when navigating between views (preserve user selection)
- Do NOT show non-default variant recipes as separate cards in browse/list views (only default variant shows as card, others appear only in dropdown)
- Do NOT merge recipe IDs (each variant is a distinct recipe with its own ID, ingredients, steps)
- Do NOT require users to set a variant when assigning to meal plan (default is fine)
- Do NOT display recipe names in dropdown - show only "variantLabel — XXX cal" format (e.g., "Light — 550 cal")
- Do NOT pass base recipe ID to meal plan after variant selection - always use the SELECTED variant's recipe ID
- Do NOT show base recipe's calories after variant selection - calories must update to show variant's per-serving calories
- Do NOT open base recipe in Edit mode after variant selection - Edit button must pass the selected variant's ID

**UI Placement:**
- **Recipe Card Header:** Recipe name followed by dropdown (if variants exist)
  - Example: `[Chicken Curry ▼]`
- **Dropdown Options:**
  ```
  Standard — 700 cal
  Light — 550 cal
  Full — 850 cal
  ```
- **Dropdown shows:** Label + calories for easy decision-making

**Admin Panel Features:**
- Create new recipe family with name and description
- Add existing non-cheat recipes to family
- Set default recipe for family (Standard version)
- Assign variant labels (Light, Standard, Full only)
- Reorder variants in dropdown (display_order)
- Remove recipes from family
- Delete entire family (unlinks all recipes, doesn't delete recipes)
- **Validation:** Prevent adding recipes where is_cheat = TRUE

**Edge Cases:**
- Recipe removed from family: Dropdown disappears from that recipe's card
- Default recipe deleted: Prompt admin to set new default before allowing deletion
- User has variant assigned to meal plan, then variant deleted: Keep assignment with recipe name (graceful degradation)
- Family with only 1 recipe: No dropdown shown (need 2+ for dropdown)

**Source Evidence:**
- User request: "I want to be able to create different versions of the same meal. These recipes would be linked."
- Calorie-tier system: "Light, Standard, and Full. That's what we needed. Perfect."
- Use case: "if I wanted to eat a bigger breakfast or lunch but then wanted to eat the curry... I'd chose the vegetarian version, or if I had a lighter lunch I'd chose the chicken version with rice"
- Cheat exclusion: "We don't want to do this for cheat meals, they are not for this."
- Database design: "we need a link table to link all the recipes and we need to mark one as the default"

**Status:** Completed

**Implementation:**
- Database: Added `recipe_families` and `recipe_family_members` tables to `schema.sql`
- Backend: Created `RecipeFamily.java`, `RecipeFamilyMember.java` entities; `RecipeVariantDTO.java`, `RecipeFamilyDTO.java`, `RecipeFamilyMemberDTO.java` DTOs; `RecipeFamilyRepository.java`, `RecipeFamilyMemberRepository.java`; `RecipeFamilyService.java` with CRUD and variant lookup; `RecipeFamilyController.java` with admin endpoints at `/api/admin/recipe-families`
- Frontend: Updated `RecipeCard.jsx` to show variant dropdown when recipe has 2+ variants; added `RecipeDTO` fields for `variantLabel` and `variants`; added CSS for variant selector
- API: `GET /api/admin/recipe-families`, `POST/PUT/DELETE` for family management, member operations

---

## Global Date Range

### FR-007: Shared Start Date with Fixed 7-Day Range
**Priority:** High

**Description:** A single "From" date picker controls the start of a fixed 7-day planning window across all three main views: Recipes, Shopping List, and Meal Plan

**User Story:** As a user, I want to set my start date once and have a 7-day meal plan automatically generated so that my recipes, shopping list, and meal plan are always synchronized.

**Acceptance Criteria:**
- **"From" date picker only** - start of the planning period
- **"To" date is automatically calculated** as From date + 6 days (7 days total)
- **NO separate "To" date picker** - end date is always fixed at 7 days
- **Default:** Current date as "From" date (showing current day through 6 days ahead)
- Date range is displayed prominently showing "From [date] - To [calculated date]"
- Changing the "From" date **immediately updates all three views:**
  - **Recipes view:** Day buttons (Mon-Sun) reflect the 7-day window starting from "From" date
  - **Shopping List:** Only shows ingredients for recipes in the 7-day window
  - **Meal Plan:** Only shows the 7 days starting from "From" date
- Start date persists in user session
- Authenticated users: start date preference saved to account
- Guest users: start date stored in localStorage

**Source Evidence:**
- Global date range state
- `dateFrom` variable (primary)
- `dateTo` calculated as `dateFrom + 6 days`
- Single date picker component

---

## Meal Planning

### FR-014: Assign Recipes to Days of the Week
**Priority:** High

**Description:** Users can assign recipes to specific days within the 7-day planning window using day-of-week buttons (Mon-Sun)

**User Story:** As a user, I want to quickly assign recipes to days of the week so that I can easily plan my meals.

**Acceptance Criteria:**
- Each recipe card displays **7 day buttons: Mon, Tue, Wed, Thu, Fri, Sat, Sun**
- Day buttons correspond to the **7 days starting from the "From" date** (see FR-007)
- Clicking a day button assigns the recipe to that specific date
- **Clicking an already-assigned day removes the recipe** (toggle behavior)
- Visual indicator shows which days the recipe is assigned to (highlighted/filled button)
- Recipe's current serving size is saved with the assignment
- Recipe is assigned to the meal type matching the current tab (e.g., if viewing Breakfast tab, assigns to Breakfast slot)
- **Assigning a recipe automatically updates:**
  - The Shopping List (ingredients added)
  - The Meal Plan calendar view
- Authenticated users' assignments sync to server database
- Guest users can browse recipes but cannot save assignments

**Source Evidence:**
- `createDayButtons(entry, servings)`
- `assignRecipeToDay()`
- `planner[]` variable (date-indexed)
- Server API: meal plan endpoints

---

### FR-015: Remove Recipes from Calendar
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

### FR-016: View Meal Plan Calendar
**Priority:** High

**Description:** Users can view their meal plan for the 7-day planning window showing all assigned recipes

**User Story:** As a user, I want to view my meal plan so that I can see what I've planned for the week.

**Acceptance Criteria:**
- Meal Plan button in footer opens calendar view
- **Uses the shared 7-day window** starting from "From" date (see FR-007)
- Displays all 7 days in the planning window
- Current date is visually highlighted (if within range)
- Each date shows assigned recipes organized by meal type (Breakfast, Lunch, Dinner, Snacks)
- Each recipe entry shows: recipe name and serving size
- Daily calorie total is displayed for each date
- Can remove recipes directly from the meal plan view
- Visual distinction between past, current, and future dates
- Changing the "From" date updates the meal plan view to show new 7-day window
- Wake lock activates when calendar is visible (if supported)
- **Clicking on a recipe entry opens a fullscreen modal showing full recipe details** (ingredients, steps, calories per serving)

**DO:**
- Show cursor: pointer on meal plan recipe entries to indicate they are clickable
- Open fullscreen modal overlay when clicking on recipe entry (not the remove button)
- Display recipe name, calories per serving, servings count in modal header
- Show scaled ingredients based on entry's servings count
- Show all recipe steps/instructions
- Close modal on ESC key, backdrop click, or close button

**DO NOT:**
- Do NOT open modal when clicking the remove (×) button - that should only remove the entry
- Do NOT require additional API call to view recipe - use data already in the meal plan entry
- Do NOT show edit functionality in the view modal - this is read-only

**Source Evidence:**
- `renderCalendar()`
- `#calendar-view` element
- Server API: GET meal plan with start date (returns 7-day window)
- RecipeViewModal component: fullscreen recipe view opened from MealPlanEntry

---

### FR-017: Calculate Daily Calorie Totals
**Priority:** Medium

**Description:** System calculates and displays total calories for each day based on assigned recipes

**User Story:** As a user, I want to see the total calories for each day so that I can track my nutritional intake.

**Acceptance Criteria:**
- Each day in meal plan shows sum of per-serving calories for all assigned recipes
- Daily total assumes 1 serving per meal (does not multiply by servings) - see FR-036
- Per-serving calorie info shows for individual recipes
- Total updates automatically when recipes are added/removed

**Source Evidence:**
- Calculation: `entry.calories / entry.defaultServings` (per-serving, not scaled)
- Day-box calorie totals in `renderFullCalendar()`

---

### FR-018: Enforce Cheat Meal Limits
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

### FR-036: Fixed Per-Serving Calorie Display (No Scaling)
**Priority:** High

**Category:** Recipe Display

**Description:** Calorie displays always show per-serving values and do NOT scale when users adjust serving sizes. The calorie number remains constant regardless of servings selected.

**User Story:** As a user, I want to see calories per serving (fixed) so that I know my personal calorie intake regardless of how many people I'm cooking for.

**Acceptance Criteria:**
- Recipe cards display calories per serving (not total)
- **Adjusting servings does NOT change the calorie number displayed** (calorie value is constant)
- Calorie display format remains as "X cal" (no label change needed)
- Daily calorie totals in Meal Plan assume 1 serving per meal
- Fullscreen recipe view shows per-serving calories (fixed, not scaled)
- Shopping list view shows per-serving calories (if displayed)

**Rationale:** Scaling calories with servings is confusing and incorrect. If cooking for 4 people, each person still eats 1 portion. The individual calorie intake per person remains the same regardless of total servings prepared. Users care about their own calorie intake, not the total calories consumed by everyone at the table.

**DO:**
- Display calories as `recipe.calories / recipe.defaultServings` (per-serving calculation)
- Calculate per-serving calories ONCE when recipe loads
- Store per-serving calorie value separately from servings state
- Keep calorie display independent from servings input/slider
- Show same calorie number whether servings = 1, 2, 4, or 10
- Apply same logic to all views: Recipe cards, Fullscreen view, Meal Plan calendar

**DO NOT:**
- Do NOT multiply calories by current servings (e.g., `calories * (servings / defaultServings)`)
- Do NOT update calorie display when servings input changes
- Do NOT recalculate calories based on servings state
- Do NOT show "total calories for all servings" anywhere
- Do NOT add a toggle between "per serving" and "total" calories (always show per-serving)

**Example:**
- Recipe: "Pasta Carbonara" with `defaultServings: 2`, `calories: 800`
- Per-serving calories: 800 / 2 = **400 cal**
- **User selects 1 serving:** Display "400 cal" ✅
- **User selects 2 servings:** Display "400 cal" ✅ (NOT "800 cal" ❌)
- **User selects 4 servings:** Display "400 cal" ✅ (NOT "1600 cal" ❌)

**Source Evidence:**
- Recipe card calorie display
- Fullscreen recipe view
- Meal plan daily totals calculation
- User feedback: "The calories count should not increase when servings are increased. If you think about it this does not make sense, each person will only eat 1 portion and they would not care about how many calories everyone at the table are eating."

**Status:** Completed

**Implementation:** Fixed `RecipeCard.jsx` line 15-16 to calculate per-serving calories without scaling by servings. All other views (MealPlanEntry, MealPlanDay, MealPlanCalendar) were already correctly implemented.

---

### FR-037: Single Recipe Per Meal Slot with Swap Behavior
**Priority:** High

**Category:** Meal Planning

**Description:** Each day can only have one recipe assigned per meal type (Breakfast, Lunch, Dinner, Snacks). If a slot is already occupied, the day button appears greyed out for other recipes but remains clickable - clicking it swaps/replaces the current recipe.

**User Story:** As a user, I want to assign only one recipe per meal slot so that my meal plan is clear, and I want to easily swap recipes without having to remove the old one first.

**Acceptance Criteria:**
- [x] A day can only have ONE recipe per meal type (e.g., cannot have 2 breakfasts on Monday)
- [x] When a meal slot is occupied, the day button for that slot appears **greyed out** (not disabled) for other recipes
- [x] Clicking a greyed-out day button **replaces** the current recipe with the new one (swap behavior)
- [x] After swapping, the previously assigned recipe's day button becomes greyed out, and the new recipe's button becomes selected
- [x] No confirmation dialog required for swap - immediate replacement
- [x] Visual states: **unselected** (available), **selected** (this recipe assigned), **greyed-out** (another recipe assigned)

**Source Evidence:** User request; enhances FR-014

**Status:** Completed

---

### FR-040: Hide Empty Meal Types in Meal Plan
**Priority:** Medium

**Category:** Meal Planning

**Description:** Meal types with no assigned recipes should not display in the Meal Plan calendar view.

**User Story:** As a user, I want to see only meal types that have recipes assigned so that my meal plan is uncluttered.

**Acceptance Criteria:**
- [x] If no recipes are assigned for Snacks (any day), Snacks row/section is hidden from meal plan
- [x] Same applies to Breakfast, Lunch, Dinner - only show if at least one recipe assigned
- [x] Each day only shows meal types that have recipes assigned for that day
- [x] If all meal types are empty for a day, show minimal placeholder or hide day entirely
- [x] When a recipe is assigned to a meal type, that section appears in the view

**Source Evidence:** User request - "I selected no Snacks, but it's showing for each day"

**Status:** Completed

---

### FR-041: Random Food Emojis Per Meal Type (Meal Plan View Only)
**Priority:** Low

**Category:** UX Enhancement

**Description:** Display themed food emojis in the Meal Plan calendar view next to meal type headers, providing visual variety.

**User Story:** As a user, I want to see fun food emojis in my Meal Plan calendar so that the interface feels more lively.

**Acceptance Criteria:**
- [x] Emojis appear in the Meal Plan calendar view next to each meal type header (Breakfast, Lunch, Dinner, Snacks)
- [x] Each meal type has a themed emoji pool:
  - Breakfast: 🍳🥞🧇🥣🥐🍩☕🥯 (8+ options)
  - Lunch: 🥗🥪🍲🌯🥙🍱🥡 (7+ options)
  - Dinner: 🍝🍕🍔🍖🥘🍛🍣🌮 (8+ options)
  - Snacks: 🍎🍌🥜🍿🧁🍪🍫🥤 (8+ options)
- [x] Emoji selection is consistent per date+meal combination (same date/meal always shows same emoji)
- [x] Emojis are randomized across different dates for variety

**DO:**
- Add emojis to `MealPlanDay.jsx` component in the meal type header section
- Create an emoji utility function that returns consistent emoji based on date + meal type hash
- Use emojis only as visual decoration alongside meal type labels

**DO NOT:**
- Do NOT add emojis to day assignment buttons in the Recipes view (DayAssignmentButtons.jsx)
- Do NOT add emojis to recipe cards
- Do NOT add emojis to the footer navigation
- Do NOT make emojis change on every re-render (must be consistent for same date/meal)

**Source Evidence:** User clarification - "this should only be in 'Meal Plan'" (not on recipe day buttons)

**Status:** Completed

---

### FR-050: Day Calorie Preview in Recipes View
**Priority:** Medium

**Category:** Meal Planning / UX Enhancement

**Description:** Display a small calorie total above each day button (Mon-Sun) in the Recipes view, showing the cumulative calories already assigned to that day. This allows users to track their daily calorie intake while selecting meals without needing to navigate to the Meal Plan view.

**User Story:** As a user, I want to see the current calorie total for each day while browsing recipes so that I can make informed meal selections without switching between views.

**Acceptance Criteria:**
- [x] Small text displaying calories appears **above** each day button (Mon-Sun)
- [x] Format: `X cal` (e.g., "450 cal", "0 cal" if no meals assigned)
- [x] Calorie total is the **sum of all meals assigned to that day** (Breakfast + Lunch + Dinner + Snacks)
- [x] Calorie display updates immediately when a recipe is assigned or removed from that day
- [x] When switching meal tabs (Breakfast → Lunch → Dinner → Snacks), the day calorie totals remain visible and reflect all meal types, not just the current tab
- [x] Text is subtle/muted styling (smaller font, lighter color) so it doesn't distract from the day buttons
- [x] Only visible to authenticated users (day buttons hidden for guests per existing behavior)
- [x] "0 cal" shown for days with no meals assigned (always visible)

**Example Flow:**
1. User is on Breakfast tab, assigns "Oats" (350 cal) to Monday → Monday shows "350 cal"
2. User switches to Lunch tab → Monday still shows "350 cal" (from Breakfast)
3. User assigns "Salad" (450 cal) to Monday for Lunch → Monday now shows "800 cal"
4. User can now see they have 800 cal planned for Monday while choosing Dinner

**DO:**
- Position calorie text directly above the day button, centered
- Use the existing `getDailyCalories(planDate)` from MealPlanContext
- Keep styling consistent with day button design (flat, no animations)
- Update totals in real-time after assignment (use weekPlan state)
- Use small font size (11-12px) and muted color (e.g., #666 or lighter)

**DO NOT:**
- Do NOT show calories for guest users (they can't assign meals anyway)
- Do NOT add click behavior to the calorie text
- Do NOT show calorie text in a popup/tooltip (must be always visible)
- Do NOT use animations or transitions on calorie updates
- Do NOT show "cal/serving" - show total calories assigned for the day
- Do NOT filter by meal type - always show cumulative total for ALL meals on that day

**Technical Context:**
- `DayAssignmentButtons.jsx` is the target component
- `MealPlanContext.jsx` already has `getDailyCalories(planDate)` method
- `weekPlan.days[].totalCalories` contains server-calculated daily totals
- weekDays array contains date strings and day names

**Cross-References:**
- FR-014: Assign Recipes to Days of the Week (day button functionality)
- FR-017: Calculate Daily Calorie Totals (calorie calculation logic)
- FR-036: Fixed Per-Serving Calorie Display (calorie display format)
- NFR-016: Simplified Day Button Styling (no animations)

**Source Evidence:** User request - "when I am creating a meal plan I will have an idea of how many calories I need to add/reduce based on what is selected, without having to go to the 'meal plan' tab"

**Status:** Completed

**Implementation:**
- Modified `DayAssignmentButtons.jsx`: Added `getDailyCalories` from MealPlanContext, wrapped each button in `.day-container` div with `.day-calories` span showing cumulative daily calories
- Modified `DayAssignmentButtons.css`: Added `.day-container` (flex column layout) and `.day-calories` (11px, #666 muted color) styling with mobile responsive adjustments (10px on mobile)
- No backend changes required - uses existing `getDailyCalories(planDate)` which reads server-calculated totals from `weekPlan.days[].totalCalories`

---

## Shopping List

### FR-019: Generate Aggregated Shopping List
**Priority:** High

**Description:** System generates a unified shopping list from recipes in the meal plan using the shared 7-day planning window (see FR-007)

**User Story:** As a user, I want a consolidated shopping list for my planned meals so that I can shop efficiently.

**Acceptance Criteria:**
- Shopping List view accessible from bottom navigation
- **Uses the shared 7-day window** starting from "From" date (see FR-007)
- **NO preset buttons** (no "3 days", "1 week", "2 weeks" buttons)
- **NO separate date pickers** - uses the global "From" date with auto-calculated 7-day window
- Only ingredients from recipes within the 7-day window are aggregated
- Same ingredients from multiple recipes are combined (quantities summed)
- Quantities reflect recipe serving sizes from meal plan
- **Quantities are formatted with clean number display** (see DO/DO NOT sections)
- List updates automatically when:
  - "From" date changes (new 7-day window)
  - Recipes are added/removed from meal plan
  - Serving sizes are changed

**DO:**
- Format whole numbers without decimal points: `1` not `1.00`, `100` not `100.00`
- Strip trailing zeros from decimals: `2.5` not `2.50`, `1.25` not `1.2500`
- Round to 2 decimal places maximum for display: `1.33` not `1.333333`
- Display format: `[quantity] [unit]` (e.g., "1 tbsp", "2.5 cups", "1200 ml")
- Apply formatting in the shopping list rendering logic (display layer only)

**DO NOT:**
- Do NOT display `.00` for whole numbers (show `1 tbsp` not `1.00 tbsp`)
- Do NOT show trailing zeros after decimal point (show `2.5` not `2.50`)
- Do NOT show more than 2 decimal places (show `0.33` not `0.333333`)
- Do NOT use scientific notation (show `1200 ml` not `1.2e3 ml`)

**Source Evidence:**
- `renderShoppingList(dateFrom)` - calculates dateTo internally as dateFrom + 6 days
- `ingredientTotals` Map with key = `name|unit`
- Calculation: `quantity * servings / defaultServings`
- Single "From" date picker input
- User feedback: "my shopping list item count is showing like 1.00 tbps. I want 1 tbps. 2.50 I want 2.5. 1200.00 ml"

---

### FR-020: Group Ingredients by Grocery Aisle
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

### FR-021: Check Off Purchased Items
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

### FR-022: Uncheck All Shopping Items
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

### FR-023: Copy Shopping List to Clipboard
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

### FR-024: Sort Shopping List by Aisle, Ingredient Name, and Check Status
**Priority:** Medium

**Description:** Shopping list sorts by check status, then aisle order, then ingredient name alphabetically

**User Story:** As a user, I want unchecked items shown first and same ingredients grouped together so that I can shop efficiently even when an ingredient has multiple unit types.

**Acceptance Criteria:**
- Unchecked items appear before checked items
- Within each check status group, sort by aisle order (1-17)
- Within each aisle, sort alphabetically by ingredient name
- Same ingredient with different units appears together (e.g., "Carrot 1 piece" and "Carrot 200g" are adjacent)
- Sort updates when checkbox state changes

**Source Evidence:**
- Sort logic in `renderShoppingList()`

---

### FR-042: Ingredient Breakdown Popup (Long Press)
**Priority:** Medium

**Category:** Shopping List

**Description:** Users can long press (press and hold for 3 seconds) on any ingredient in the shopping list to see a breakdown popup showing which meals use that ingredient and how much each meal requires.

**User Story:** As a user, I want to long press an ingredient in my shopping list so that I can see which meals require that ingredient and how much each meal needs, helping me understand why I need that quantity.

**Acceptance Criteria:**
- Long press (3 seconds) on any shopping list ingredient triggers breakdown popup
- Works on both desktop (mouse down) and mobile (touch/finger down)
- Popup displays:
  - Ingredient name and total aggregated quantity as header
  - List of meals that use this ingredient
  - Quantity required for each meal
  - Meal name with quantity (e.g., "Pizza: 1 tbsp", "Stir Fry: 3 tbsp")
- Popup closes when user clicks/taps anywhere (on popup or outside)
- Popup positioned near the ingredient item (above or below, based on available space)
- Visual feedback during long press (e.g., subtle highlight or progress indicator)
- If user releases before 3 seconds, popup does not appear (normal click behavior for checkbox)

**DO:**
- Use `mousedown`/`touchstart` event with timer (3000ms timeout)
- Cancel timer on `mouseup`/`touchend` if released before 3 seconds
- Query meal plan entries that use this ingredient within the current shopping list date range
- Calculate per-meal quantities (ingredient quantity × servings / defaultServings)
- Format quantities with clean number display (apply FR-019 formatting rules: no trailing zeros)
- Show meal type emoji or icon next to meal name for visual clarity
- Close popup on any click/tap event (add overlay with click handler)
- Position popup dynamically based on viewport space available
- Add visual feedback during long press (e.g., opacity change or border highlight)

**DO NOT:**
- Do NOT trigger popup on normal click (< 3 seconds) - preserve checkbox toggle behavior
- Do NOT show popup if ingredient is not used in any meals (shouldn't happen, but handle gracefully)
- Do NOT allow multiple popups to be open simultaneously
- Do NOT block scrolling when popup is open (popup should scroll with list)
- Do NOT make popup modal (user should be able to dismiss by clicking anywhere)
- Do NOT show popup for checked (purchased) items - only unchecked items need breakdown
- Do NOT use conflicting positioning (e.g., inline absolute positioning WITH flex centering on overlay)
- Do NOT make popup too small on desktop - use min-width: 320px, max-width: 500px

**Desktop Layout:**
- Center popup using overlay's `display: flex; align-items: center; justify-content: center;`
- Do NOT add inline `style` positioning to popup element - let CSS handle centering
- Use min-width: 320px, max-width: 500px, width: 90% for responsive sizing

**Edge Cases:**
- Ingredient used in multiple meals: Show all meals in list
- Ingredient with different serving sizes across meals: Show each meal's calculated amount
- Very long meal names: Truncate with ellipsis if needed
- Small screen (mobile): Ensure popup fits within viewport, allow vertical scrolling if needed
- User drags/scrolls during long press: Cancel timer, do not show popup

**Source Evidence:**
- User request: "If the user presses and holds an Ingredient for 3 seconds in the shopping list (Mouse down or finger down) all the meals and quantities will show in a pop up"
- Example: "[] 8 Tbsp of Olive Oil → Pizza: 1 tbsp, Stir Fry: 3 tbsp"

**Status:** Completed

**Implementation:**
- Backend: Created `IngredientBreakdownDTO.java`, `MealIngredientUsageDTO.java`, `ShoppingListService.getIngredientBreakdown()` method, and `GET /api/meal-plan/shopping-list/ingredient-breakdown` endpoint
- Frontend: Created `IngredientBreakdownPopup.jsx` component with long-press detection in `ShoppingListItem.jsx` (3-second timer, visual feedback, mobile/desktop support)

---

## Data Persistence & Sharing

### FR-025: Persist Meal Plan to Server Database
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

### FR-026: Persist Shopping List State to Local Storage
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

### FR-027: Generate Shareable Meal Plan URL
**Priority:** Low

**Description:** Users can generate a URL that encodes their 7-day meal plan for sharing

**User Story:** As a user, I want to generate a shareable link so that I can share my meal plan with friends or family.

**Acceptance Criteria:**
- Share button visible in meal plan view
- Shares the current 7-day window (from "From" date, see FR-007)
- Clicking generates URL with base64-encoded planner data including the 7 days of dates
- URL is automatically copied to clipboard
- Success message confirms URL was copied
- URL uses `?planner=` query parameter with date-indexed data

**Source Evidence:**
- `generateShareURL(dateFrom)` - shares 7-day window starting from dateFrom
- Encoding: `btoa(JSON.stringify(plannerWithDates))`
- `navigator.clipboard.writeText()`

---

### FR-028: Import Meal Plan from Shared URL
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

### FR-029: Screen Wake Lock During Cooking with Lock Emoji Animation
**Priority:** Low

**Description:** System keeps screen awake when viewing meal plan or fullscreen recipe. When the user opens the menu, a lock emoji animation plays to indicate the wake lock status.

**User Story:** As a user, I want my screen to stay on while viewing recipes so that I don't have to keep unlocking my phone while cooking, and I want to see a visual indicator (animated lock emoji) when the wake lock is active.

**Acceptance Criteria:**
- Wake lock requests when fullscreen recipe opens
- Wake lock requests when meal plan modal becomes visible
- Wake lock releases when views close
- Feature detection handles unsupported browsers gracefully
- Errors are logged but don't interrupt user experience
- [ ] When user opens the menu, display a lock emoji animation:
  - [ ] Start with unlocked emoji (🔓) at 1x scale
  - [ ] Scale up to 1.1x
  - [ ] Scale down to 0.9x
  - [ ] Flash white
  - [ ] Transform to locked emoji (🔒)
  - [ ] Return to 1x scale
  - [ ] Total animation duration: 1 second

**Source Evidence:**
- `requestWakeLock()`
- `releaseWakeLock()`
- `navigator.wakeLock.request('screen')`
- Feature detection: `if ('wakeLock' in navigator)`
- CSS keyframe animation for lock emoji transition

**Status:** In Progress

---

## Navigation

### FR-038: Recipes Navigation Button in Footer
**Priority:** High

**Category:** Navigation

**Description:** Add a "Recipes" button to the bottom footer navigation bar, positioned alongside the existing "Meal Plan", "Search", and "Shopping" buttons.

**User Story:** As a user, I want a Recipes button in the footer navigation so that I can easily return to browse recipes from any screen.

**Acceptance Criteria:**
- [x] "Recipes" button appears in the footer navigation bar at the bottom of the screen
- [x] Button is positioned as the first item (leftmost) in the footer, before "Meal Plan"
- [x] Button uses identical styling as other footer buttons (`.footer-btn` CSS class)
- [x] Button includes an SVG icon (utensils/fork-knife icon)
- [x] Button includes "Recipes" text label below the icon
- [x] Button has active/highlighted state when user is on Recipes view (home route `/`)
- [x] Clicking navigates to Recipes view

**DO:**
- Place the button in `Footer.jsx` component
- Use the existing `.footer-btn` CSS class for consistent styling
- Follow the same icon + label pattern as Meal Plan, Search, Shopping buttons
- Add `.active` class when on home route `/`

**DO NOT:**
- Do NOT place this button in a header or top bar
- Do NOT place this button inside MealPlanCalendar or any other view-specific component
- Do NOT create custom styling - must match existing footer buttons exactly
- Do NOT add this button to multiple locations

**Source Evidence:** User clarification - "it should be at the bottom footer beside 'Meal Plan' 'Search' & 'Shopping' and be the same style"

**Status:** Completed

---

### FR-039: Logo Click Navigates to Recipes
**Priority:** Medium

**Category:** Navigation

**Description:** Clicking the FoodBytes/Pre-Aisle Plan logo should navigate the user back to the Recipes view from any screen.

**User Story:** As a user, I want to click the logo to return to Recipes so that I have a familiar navigation pattern.

**Acceptance Criteria:**
- [x] Logo in header is clickable
- [x] Clicking logo from Meal Plan view closes it and returns to Recipes
- [x] Clicking logo from Shopping List view closes it and returns to Recipes
- [x] Returns to previously active meal tab (or Breakfast as default)

**Source Evidence:** User request - "Clicking on FoodBytes Logo should bring user back to Recipes too"

**Status:** Completed

---

### FR-048: Landing Page Animation (Guest Homepage)
**Priority:** High

**Category:** Navigation / Onboarding

**Description:** An animated landing page sequence that introduces guests to FoodBytes, highlighting the problem with modern nutrition education and presenting FoodBytes as the solution. The animation plays automatically when a guest visits the homepage.

**User Story:** As a new visitor, I want to understand why FoodBytes exists and what it can do for me so that I'm motivated to sign up or explore the app.

**Acceptance Criteria:**

**Animation Sequence:**

**Phase 1: The Problem (Depressing Tone)**
1. Fade in: **"Most people have no idea what they're eating."**
2. Pause 2 seconds, then fade in below: **"And it's not their fault."**
3. Pause 2 seconds, fade both out

**Phase 2: The Problems List (Depressing Tone)**
Each problem fades in, pauses 1.5 seconds, then fades out before the next:
- "Schools never taught us nutrition"
- "Portion sizes are wildly distorted"
- "Food labels are designed to confuse"
- "Cooking skills weren't passed down"
- "Nutrition advice changes every year"
- "Tracking calories feels like a full-time job"

Final problem statement fades in:
- **"You're not lazy. You're not stupid. The system is broken."**
- Pause 2 seconds, fade out

**Phase 3: The Solution (Uplifting/Happy Tone)**
1. Fade in: **"The Solution"** (larger, brighter styling)
2. Pause 1 second, fade in below: **"Join FoodBytes"** (brand styling)
3. Pause 2 seconds, fade both out

**Phase 4: Features (Uplifting Tone)**
Each feature fades in, pauses 1.5 seconds, then fades out before the next:
- "Curated recipes with real calorie and macro data"
- "Meal planning that hits your targets automatically"
- "Shopping lists organized by aisle"
- "No calorie counting — just pick meals and eat"
- "Learn to cook through simple, repeatable recipes"
- "Build habits that actually stick"

**Phase 5: Final Summary**
1. All benefits appear as bullet point list (fade in together):
   - ✓ Curated recipes with real nutrition data
   - ✓ Automatic meal planning
   - ✓ Smart shopping lists by aisle
   - ✓ No calorie counting required
   - ✓ Simple, repeatable recipes
   - ✓ Build lasting habits
2. Below the list, fade in tagline: **"Stop guessing. Start knowing."**
3. Below tagline, fade in two buttons side by side:
   - **[Log In]** (primary button, brand color)
   - **[Continue as Guest]** (secondary button, outline style)

**Visual Design:**
- Dark/muted background for Phase 1-2 (depressing tone)
- Transition to lighter/brighter background for Phase 3-5 (happy tone)
- Text centered on screen
- Large, readable typography (minimum 24px for body, 36px+ for headlines)
- Smooth fade transitions (300-500ms duration)
- Brand colors for "FoodBytes" and CTA buttons

**User Controls:**
- **Skip button** in corner: "Skip intro →" (takes user directly to Phase 5 summary)
- Animation does NOT replay on subsequent visits (store flag in localStorage)
- Returning guests see Phase 5 summary immediately (or go straight to recipes if logged in)

**DO:**
- Use CSS animations/transitions for smooth fades
- Center content vertically and horizontally
- Make text large and readable on mobile
- Store `hasSeenIntro` flag in localStorage after first view
- Allow skipping at any point
- Ensure animation is accessible (respects `prefers-reduced-motion`)

**DO NOT:**
- Do NOT auto-play sound or music
- Do NOT make animation unskippable
- Do NOT replay animation on every visit
- Do NOT make phases too fast (users need time to read)
- Do NOT block the entire app during animation (skip should always work)
- Do NOT use heavy JavaScript animation libraries (CSS is sufficient)

**Timing Summary:**
| Phase | Duration |
|-------|----------|
| Phase 1 (Hook) | ~6 seconds |
| Phase 2 (Problems) | ~15 seconds (6 items × 2.5s each) |
| Phase 3 (Solution intro) | ~5 seconds |
| Phase 4 (Features) | ~15 seconds (6 items × 2.5s each) |
| Phase 5 (Summary + CTA) | Stays on screen |
| **Total** | ~41 seconds (skippable) |

**Accessibility:**
- If `prefers-reduced-motion` is enabled, skip directly to Phase 5
- All text must have sufficient contrast ratio (4.5:1 minimum)
- Skip button must be keyboard accessible
- CTA buttons must be focusable and have clear focus states

**Source Evidence:**
- User request: "I'd like to see 'Most people have no idea what they're eating. And it's not their fault' then a list of the problems. Then join food bytes and the solutions"
- Conversation about the difficulty of understanding nutrition without proper education
- User insight: "Diet is learned habits, if you don't know how to cook how are you suppose to figure this out. I have to build a website to get an understanding of this."

**Status:** Completed

**Implementation:**
- Component: `client/src/components/onboarding/LandingPageAnimation.jsx`
- Stylesheet: `client/src/components/onboarding/LandingPageAnimation.css`
- App.jsx updated to conditionally render landing page for first-time guests
- 5-phase animation with skip functionality, localStorage persistence, and reduced motion support

---

### FR-049: Expand Recipe to Fullscreen (Recipe Cards)
**Priority:** Medium

**Category:** Recipe Management / UI

**Description:** Each recipe card in the Recipes view displays an expand icon in the top-right corner. Clicking this icon opens the recipe in a fullscreen modal view, allowing users to see the full recipe details without scrolling within the card.

**User Story:** As a user, I want to expand a recipe to fullscreen so that I can easily read all the details while cooking.

**Acceptance Criteria:**
- Every recipe card displays an expand icon (⤢) in the **top-right corner**
- Icon uses a subtle style that doesn't distract from the recipe content
- Icon has a hover effect (color change to brand primary)
- Clicking the icon opens a **fullscreen modal** with:
  - Recipe name
  - Calories per serving
  - Ingredients list (scaled to current serving selection)
  - Cooking instructions/steps
- Modal can be closed via:
  - Close button (X) in top-right corner
  - Clicking the backdrop overlay
  - Pressing the Escape key
- Modal reuses the same `RecipeViewModal` component used for meal plan entries (FR-014)

**DO:**
- Position the expand icon absolutely in the top-right corner of the card
- Use an SVG icon for crisp rendering at any size
- Pass the current serving count to the modal for proper ingredient scaling
- Include proper ARIA labels for accessibility

**DO NOT:**
- Do NOT make the icon too large (should be subtle)
- Do NOT block other card interactions (Edit button, calorie dropdown)
- Do NOT create a separate modal component (reuse RecipeViewModal)

**Source Evidence:**
- User request: "the recipe cards on the Recipe viewer should on the top right corner of every recipe have a [ ] icon, that will expand the recipe into full screen"
- RecipeCard.jsx: expand-button, showFullscreen state
- RecipeViewModal.jsx: reused from FR-014 implementation

**Status:** Complete

---

## User Authentication

### FR-030: User Registration and Login (Google OAuth Only)
**Priority:** High

**Description:** Users can create accounts and log in using Google OAuth only

**User Story:** As a user, I want to log in with my Google account so that I can save my meal plans and access them from any device.

**Acceptance Criteria:**
- **Google Sign-In button only** - no GitHub or other providers
- **Use official Google branding** - official Google "G" logo and styling
- Button text must be "Sign in with Google" (not "Login with Google")
- Follow Google's Brand Guidelines for the sign-in button
- New users automatically registered on first Google OAuth login
- JWT tokens stored in httpOnly cookies for session management
- User profile displays name and email from Google
- Logout button clears session and returns user to guest mode
- Guest users can browse recipes but cannot save meal plans
- Session persists across browser sessions until explicit logout

**Source Evidence:**
- Google OAuth callback handlers
- JWT token storage in httpOnly cookies
- User session state management
- Google Sign-In button component

---

### FR-031: View and Edit User Profile
**Priority:** Medium

**Description:** Authenticated users can view their profile information and configure preferences

**User Story:** As a user, I want to see my profile and configure my preferences so that I can personalize my experience.

**Acceptance Criteria:**
- Profile displays user name and email
- Shows OAuth provider used (Google only)
- Shows account creation date
- Shows admin status if applicable
- **Default Servings setting** allows user to set their preferred default serving size
- Default Servings applies to all recipes when viewing (overrides recipe's defaultServings)
- Default Servings can be set from 1 to 10 (or reasonable max)
- Default Servings persists to user account in database
- New users default to 1 serving
- Logout option available from profile

**Source Evidence:**
- User profile component
- Server API: GET current user
- Server API: PUT user preferences

---

## Admin Features

### FR-032: GOD Mode Admin Access
**Priority:** High

**Description:** Designated admin user(s) have elevated privileges to manage recipes

**User Story:** As an admin, I want special access so that I can manage and improve recipes for all users.

**Acceptance Criteria:**
- Admin role stored in database (`is_admin` flag on user record)
- Admin status assigned directly in database (not self-service)
- Admin users see "Edit Recipe" button on recipe cards
- Admin users see "Add Recipe" button in recipe tabs area
- Admin users can access recipe management functions
- Non-admin users see recipes as read-only

**Source Evidence:**
- `is_admin` column in users table
- Admin role check middleware
- Conditional UI rendering based on admin status

---

### FR-033: Recipe Editing (Admin Only)
**Priority:** High

**Category:** Admin Features

**Description:** Admin users can edit existing recipes through a structured popup interface with separate forms for Steps, Ingredients, and Recipe Info.

**User Story:** As an admin, I want to edit recipe details through an organized interface so that I can easily manage recipe content without confusion.

**Acceptance Criteria:**

**Edit Flow:**
- Admin clicks "Edit" button on recipe card
- Popup opens showing 3 option buttons: **[Steps]** **[Ingredients]** **[Recipe Info]**
- A **[Delete]** button appears separately, styled in **red** and positioned away from the other options
- Selecting an option opens that specific edit form
- Each form has a **"← Back"** button at top to return to the 3-option menu
- **Unsaved changes warning**: If user has unsaved changes and tries to close/navigate away, show "You have unsaved changes. Discard changes?"
- After saving: Show **success/error message**, success returns to 3-option menu

**Recipe Info Form:**
- Recipe name (text input, required)
- Default servings (number input)
- Calories (number input)
- Meal types: Breakfast, Lunch, Dinner, Snacks (checkboxes, at least one required)
- Cheat meal flag (checkbox)
- Visibility: Live/Hidden toggle (see FR-035)
- Save button commits all changes

**Ingredients Form (see FR-044 for autocomplete details):**
- **Sticky "Add Ingredient" button** at top of form (always visible when scrolling)
- Add ingredient: Choose position (Bottom / Start / After Ingredient X)
- Each ingredient row: `[↑↓ arrows] [Ingredient autocomplete] [Quantity input] [Unit autocomplete] [Delete X]`
- Up/down arrows to reorder ingredients (auto-renumbers sort_order)
- Delete button removes ingredient immediately (no confirmation)
- **Before save**: If creating new ingredients or units, show confirmation:
  > "You are creating the following new items:
  > - **Ingredients:** [list]
  > - **Units:** [list]
  >
  > Continue?"
- Save button commits all changes

**Steps Form (see FR-046 for details):**
- **Sticky "Add Step" button** at top of form (always visible when scrolling)
- Add step: Choose position (Bottom / Start / After Step X)
- Each step row: `[↑↓ arrows] [Step #] [Editable text area]`
- Up/down arrows to reorder steps (auto-renumbers)
- Empty steps removed on save, server renumbers remaining steps
- Save button commits all changes

**Delete Recipe:**
- **Hard delete** - recipe permanently removed from database
- **Confirmation required**: "Are you sure you want to permanently delete [Recipe Name]?"
- Deletes recipe and all associated data (ingredients, steps, meal assignments)

**DO:**
- Use popup/modal for all edit forms
- Validate required fields before save (name, at least 1 meal type, at least 1 ingredient, at least 1 step)
- Show loading state during save operations
- Return to 3-option menu on successful save
- Keep form state until explicitly saved or discarded

**DO NOT:**
- Do NOT allow saving with empty required fields
- Do NOT close popup without warning if unsaved changes exist
- Do NOT allow non-admin users to access any edit functionality

**Source Evidence:**
- Recipe edit form component
- Server API: POST/PUT/DELETE recipe endpoints
- Admin authorization middleware

**Status:** Completed

---


### FR-035: Recipe Visibility Toggle (Admin Only)
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
- Admin recipe management view can filter by Live/Hidden status

**Source Evidence:**
- `is_live` column in recipes table
- Admin-only visibility toggle UI component
- Recipe query filters by `is_live=1` for non-admin users
- Admin sees all recipes regardless of `is_live` value

---

### FR-044: Ingredient Autocomplete (Admin Recipe Editing)
**Priority:** High

**Category:** Admin Features

**Description:** When editing recipe ingredients, an autocomplete field suggests existing ingredients from the database. If the user types something not in the database, they are informed they're creating a new ingredient and must select an aisle.

**User Story:** As an admin, I want ingredient suggestions while editing recipes so that I use consistent ingredient names and avoid creating duplicates.

**Acceptance Criteria:**

**Autocomplete Behavior:**
- Autocomplete triggers after **2 characters** typed OR on **focus/click**
- **Contains matching**: Typing "carr" matches "Carrot", "Baby Carrot", etc.
- Suggestions displayed in dropdown below the input field
- Maximum 10 suggestions shown at once
- Selecting a suggestion auto-fills the ingredient name
- Selecting a suggestion also **pre-selects the ingredient's default unit** (if defined)

**Duplicate Detection:**
- **70% similarity threshold** triggers a warning (using fuzzy matching / Levenshtein distance)
- Warning message: "This is similar to existing ingredient '[name]'. Are you sure you want to create a new one?"
- User can proceed despite warning (not blocked)

**New Ingredient Flow:**
- If typed text doesn't match any existing ingredient, show message: "Creating new ingredient: [name]"
- User must select an **aisle** for the new ingredient (dropdown of 17 aisles)
- **Default unit** is set automatically from the unit selected in the current recipe ingredient row (first usage sets the default)
- New ingredient created on recipe save (not immediately)

**DO:**
- Search ingredient names case-insensitively
- Highlight matching text in suggestions (e.g., bold the "carr" in "Carrot")
- Show aisle name next to each suggestion for context (e.g., "Carrot (Veg)")
- Debounce API calls (300ms delay after typing stops)
- Cache ingredient list on page load for faster suggestions

**DO NOT:**
- Do NOT create ingredients immediately - wait until recipe save
- Do NOT allow saving without an aisle for new ingredients
- Do NOT block creation entirely on 70% match (warn only)
- Do NOT show duplicate warning for exact matches (that's a different error)

**API Endpoints:**
- `GET /api/admin/ingredients/search?q=[query]` - Returns matching ingredients
- `GET /api/admin/ingredients` - Returns all ingredients (for caching)
- `POST /api/admin/ingredients` - Creates new ingredient (called during recipe save)

**Source Evidence:**
- User request for autocomplete when editing ingredients
- NFR-010 centralized ingredient definitions
- Fuzzy matching logic in `IngredientService`

**Status:** Completed

---

### FR-045: Unit Autocomplete (Admin Recipe Editing)
**Priority:** High

**Category:** Admin Features

**Description:** When editing recipe ingredients, an autocomplete field suggests existing units from the database. Same behavior as ingredient autocomplete.

**User Story:** As an admin, I want unit suggestions while editing recipes so that I use consistent unit abbreviations.

**Acceptance Criteria:**

**Autocomplete Behavior:**
- Autocomplete triggers after **1 character** typed OR on **focus/click**
- **Contains matching**: Typing "t" matches "tsp", "tbsp", etc.
- Shows all units on focus (since there are only ~20 units)
- Selecting a suggestion auto-fills the unit field

**New Unit Flow:**
- If typed text doesn't match any existing unit, show message: "Creating new unit: [value]"
- New unit created on recipe save (not immediately)
- Confirmation shown before save if creating new units

**DO:**
- Show unit display value in suggestions (e.g., "g", "ml", "tsp")
- Allow both typing and dropdown selection
- Pre-select ingredient's default unit when ingredient is selected (if available)

**DO NOT:**
- Do NOT require minimum characters on focus (show all options)
- Do NOT create units immediately - wait until recipe save

**API Endpoints:**
- `GET /api/admin/units` - Returns all units
- `POST /api/admin/units` - Creates new unit (called during recipe save)

**Source Evidence:**
- Same UX as ingredient autocomplete
- NFR-015 centralized unit definitions

**Status:** Completed

---

### FR-046: Recipe Step Editing (Admin Only)
**Priority:** High

**Category:** Admin Features

**Description:** Admin users can edit, reorder, add, and remove cooking steps through a dedicated popup form.

**User Story:** As an admin, I want to manage recipe steps in an organized way so that I can easily update cooking instructions.

**Acceptance Criteria:**

**Step Editing Form:**
- Opens as popup when admin selects "Steps" from edit menu
- **Sticky "Add Step" button** at top (always visible when scrolling)
- Each step displays as: `[↑ ↓] [Step #] [Editable text area]`
- Text area allows multi-line step instructions

**Reordering:**
- Up/down arrow buttons move step position
- Step numbers **auto-renumber** after reorder (1, 2, 3, ... always sequential)
- Visual feedback when step moves (brief highlight)

**Adding Steps:**
- Click "Add Step" button → popup asks "Add to position?"
- Options: **"Bottom"** | **"Start"** | **"After Step X"** (dropdown of existing steps)
- New step appears at selected position with empty text area
- Focus moves to new step's text area

**Removing Steps:**
- Clear step text to mark for removal (or explicit delete button)
- **Immediate removal** from UI (no confirmation dialog)
- Can undo by not saving (unsaved changes warning applies)
- On save, server removes empty steps and renumbers remaining

**Save Behavior:**
- Single "Save" button commits all changes
- Empty steps automatically removed
- Server renumbers steps to ensure sequential (1, 2, 3...)
- Success message shown, returns to edit menu

**DO:**
- Allow steps to have empty lines within text (multi-paragraph)
- Preserve whitespace/formatting in step text
- Show step count in form header (e.g., "Steps (5)")
- **Place Save/Cancel buttons in a sticky footer** - always visible while scrolling
- Use min-width: 700px on desktop for better step editing UX

**DO NOT:**
- Do NOT allow saving with zero steps (minimum 1 required)
- Do NOT show confirmation for individual step deletions
- Do NOT auto-save (only save on explicit Save button)
- Do NOT place action buttons inside scrollable content area - buttons must be in sticky footer
- Do NOT make modal too narrow on desktop - step editing needs room for textarea and controls

**Desktop Layout:**
- Modal max-width: 750px on screens >= 800px wide (wider than default 600px)
- Save/Cancel buttons in sticky footer with `position: sticky; bottom: 0;`
- Steps list should scroll independently, with header and footer fixed

**Source Evidence:**
- User request for step editing with reorder capability
- FR-033 recipe editing requirements

**Status:** Completed

---

### FR-047: Create New Recipe (Admin Only)
**Priority:** High

**Category:** Admin Features

**Description:** Admin users can create new recipes through an "Add Recipe" button in the recipe tabs area.

**User Story:** As an admin, I want to create new recipes so that I can expand the recipe library.

**Acceptance Criteria:**

**Add Recipe Button:**
- "Add Recipe" button visible in **recipe tabs area** (near Breakfast/Lunch/Dinner/Snacks tabs)
- Button only visible to admin users
- Clicking opens the recipe edit popup with empty form

**Minimum Requirements:**
- **Recipe name** is required
- At least **1 ingredient** required
- At least **1 step** required
- At least **1 meal type** must be selected (checkboxes)

**Default Values:**
- **isLive = false (Hidden)** - new recipes start hidden
- **Cannot be saved as Live** - must be created as Hidden first
- Default servings: 2
- Calories: 0 (must be set by admin)
- Cheat meal: unchecked

**Create Flow:**
1. Admin clicks "Add Recipe"
2. Empty edit popup opens with 3 options: [Steps] [Ingredients] [Recipe Info]
3. Admin fills in Recipe Info (name required)
4. Admin adds at least 1 ingredient
5. Admin adds at least 1 step
6. Admin saves - recipe created as Hidden
7. Admin can later edit and set to Live when ready

**Validation:**
- Show error if saving without required fields
- Show which fields are missing (e.g., "Recipe name is required")
- Prevent save until minimum requirements met

**DO:**
- Pre-fill default servings as 2
- Show "New Recipe" or similar in popup header
- Allow admin to cancel without saving (with unsaved changes warning)

**DO NOT:**
- Do NOT allow new recipes to be saved as Live
- Do NOT allow saving without name, 1+ ingredient, 1+ step
- Do NOT show Delete button for new recipes (not yet created)

**Source Evidence:**
- User request for Add Recipe functionality
- FR-033 recipe editing requirements
- FR-035 visibility requirements (new recipes default to Hidden)

**Status:** Completed

---

# Database Schema

## Database: Users Table

**Priority:** Critical

**Description:** Store user accounts from Google OAuth

**Table: `users`**

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | INT | PK, AUTO_INCREMENT | Unique user ID |
| email | VARCHAR(255) | UNIQUE, NOT NULL | Email from Google |
| name | VARCHAR(255) | NOT NULL | Display name from Google |
| google_id | VARCHAR(255) | UNIQUE, NOT NULL | Google OAuth ID |
| avatar_url | VARCHAR(500) | NULLABLE | Profile picture URL |
| is_admin | BOOLEAN | DEFAULT FALSE | Admin flag for future use |
| created_at | DATETIME | NOT NULL | Account creation time |
| last_login | DATETIME | NULLABLE | Most recent login |

---

## Database: Recipes Table

**Priority:** Critical

**Description:** Store recipe data (migrated from recipes.js)

**Table: `recipes`**

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | INT | PK, AUTO_INCREMENT | Unique recipe ID |
| name | VARCHAR(255) | NOT NULL | Recipe name |
| default_servings | INT | NOT NULL, DEFAULT 2 | Base serving count |
| calories | INT | NOT NULL | Total calories for default servings |
| is_cheat | BOOLEAN | DEFAULT FALSE | Cheat meal flag |
| is_live | BOOLEAN | DEFAULT TRUE | Visibility flag |
| created_at | DATETIME | NOT NULL | Creation time |
| updated_at | DATETIME | NOT NULL | Last update time |

**Table: `recipe_meals`** (junction table)

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| recipe_id | INT | FK → recipes.id | Recipe reference |
| meal_type | ENUM | 'breakfast','lunch','dinner','snacks' | Meal category |

**Table: `aisles`** (lookup table)

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | INT UNSIGNED | PK, AUTO_INCREMENT | Unique aisle ID |
| key | VARCHAR(50) | UNIQUE, NOT NULL | Constant key (e.g., "DAIRY") |
| name | VARCHAR(100) | NOT NULL | Display name (e.g., "Dairy") |
| display_order | TINYINT UNSIGNED | NOT NULL | Sort order for shopping list (1-17) |

**Table: `units`** (lookup table)

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | INT UNSIGNED | PK, AUTO_INCREMENT | Unique unit ID |
| key | VARCHAR(50) | UNIQUE, NOT NULL | Constant key (e.g., "GRAM") |
| value | VARCHAR(20) | NOT NULL | Display value (e.g., "g") |

**Table: `ingredients`** (lookup table)

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | INT UNSIGNED | PK, AUTO_INCREMENT | Unique ingredient ID |
| key | VARCHAR(100) | UNIQUE, NOT NULL | Constant key (e.g., "ROLLED_OATS") |
| name | VARCHAR(255) | UNIQUE, NOT NULL | Display name (e.g., "Rolled oats") |
| aisle_id | INT UNSIGNED | FK → aisles.id, NOT NULL | Grocery aisle reference |
| default_unit_id | INT UNSIGNED | FK → units.id, NULLABLE | Default unit for this ingredient (set from first usage) |

**Table: `recipe_ingredients`** (junction table)

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | INT UNSIGNED | PK, AUTO_INCREMENT | Unique ID |
| recipe_id | INT UNSIGNED | FK → recipes.id | Recipe reference |
| ingredient_id | INT UNSIGNED | FK → ingredients.id | Ingredient reference |
| quantity | DECIMAL(10,2) | NOT NULL | Amount |
| unit_id | INT UNSIGNED | FK → units.id | Unit reference |
| sort_order | SMALLINT UNSIGNED | NOT NULL, DEFAULT 0 | Display order |

**Table: `recipe_steps`**

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | INT | PK, AUTO_INCREMENT | Unique ID |
| recipe_id | INT | FK → recipes.id | Recipe reference |
| step_number | INT | NOT NULL | Step order |
| instruction | TEXT | NOT NULL | Step text |

---

# Non-Functional Requirements

## Architecture

### NFR-001: Hybrid Client-Server Architecture
**Category:** Architecture

**Description:** Application uses client-side rendering with server-side data persistence and authentication

**Measurable Criteria:**
- Frontend remains vanilla HTML/CSS/JS (no framework required)
- Backend: Node.js + Express REST API
- Database: MySQL for users, meal plans, and recipes
- Recipe data may remain in recipes.js initially (migration optional)
- API endpoints secured with JWT authentication
- Guest browsing requires no authentication
- Authenticated features require valid JWT token

**Source Evidence:** server/ directory with Express application; MySQL database schema; JWT middleware

---

## Performance

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

### NFR-016: Simplified Day Button Styling (No Animations, No Loading Effects)
**Category:** Usability

**Description:** Day selection buttons in the Recipes view should use simplified, flat design matching the Legacy implementation - no click animations, no ripple effects, no transitions, and no animated loading states.

**Measurable Criteria:**
- No click animation (no scale, no ripple, no circle effect)
- No hover transitions or transform effects
- No focus ring animation
- **No loading animations or effects** (no spinners, no scaling, no "loading" class with visual effects)
- **Loading states use simple `disabled` attribute only**
- Flat button design with four clear visual states:
  - **Unselected:** Light background (#eee), dark text (#333)
  - **Selected:** Brand purple (#4a3f80), white text, bold
  - **Already-selected (another recipe):** Gray background (#ccc), muted text (#666)
  - **Disabled/Loading:** Simple opacity reduction (`opacity: 0.6`), `cursor: not-allowed`, no animations
- Simple hover state: slight background color change only, no transition timing
- Consistent padding and border-radius with Legacy (padding: 8px 14px, border-radius: 6px)

**DO:**
- Add explicit `transition: none` to day button CSS in `DayAssignmentButtons.css`
- Use `!important` if needed to override global button styles from `global.css`
- Keep button styling flat and simple
- Match the Legacy `/Legacy/styles.css` button appearance
- **When button is processing (loading), add `disabled` attribute**
- **Use simple disabled styling:** `opacity: 0.6` and `cursor: not-allowed` only
- **Use `pointer-events: none` during loading** to prevent multiple clicks

**DO NOT:**
- Do NOT rely on global button styles (they may include transitions that need overriding)
- Do NOT add CSS transitions, transforms, or animations to day buttons
- Do NOT add ripple effects or material design interactions
- Do NOT add scale effects on click or hover
- **Do NOT add a "loading" class with visual effects** (scale, transform, animations)
- **Do NOT show spinners or loading indicators** on day buttons
- **Do NOT animate the button during loading states**
- **Do NOT enlarge, shrink, or transform buttons** when clicked or loading

**Source Evidence:**
- User request - "I don't like the clicks animation or the circle in the Day buttons. Check the behaviors in /Legacy/index.html"
- Reference: `/Legacy/styles.css` lines 181-212
- User clarification - "The issue with the buttons enlarging seems to be a loading state. when loading the buttons should simply be disabled. It's appending a 'loading' class to the files."

**Implementation:**
- Modified `foodbytes-app/client/src/components/recipes/DayAssignmentButtons.jsx` (line 112): Removed 'loading' class from className
- Modified `foodbytes-app/client/src/components/recipes/DayAssignmentButtons.css` (lines 65-73): Removed `.day-button.loading` rule, enhanced `:disabled` state with opacity: 0.6, cursor: not-allowed, pointer-events: none
- Verified against Legacy reference: All styling matches `/Legacy/styles.css` lines 181-212

**Status:** Completed

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

**Description:** All ingredient data is centralized in the database with validation to prevent duplicates

**Measurable Criteria:**
- Single source of truth: `ingredients` table (id, key, name, aisle_id)
- **No duplicate ingredient names allowed** - enforced by:
  - Database UNIQUE constraint on `name` column (exact match)
  - `IngredientService` fuzzy matching (catches "Carrots" vs "Carrot")
- All ingredient names should be singular form (e.g., "Carrot" not "Carrots")
- Recipes reference ingredients by `ingredient_id` FK, not free-text
- Single source of truth for aisle assignments via `aisle_id` FK
- Adding new ingredient requires:
  1. POST `/api/admin/ingredients/validate?name=` (pre-validation)
  2. POST `/api/admin/ingredients` (create with auto-generated key)
- `IngredientService.validateAndGetByKey()` enforces key validation at recipe creation

**Implementation:**
- Database: `ingredients` table with 90 ingredients, 17 aisles
- Backend: `IngredientService` with fuzzy matching (Levenshtein distance)
- API: `/api/admin/ingredients/*` endpoints for CRUD + validation
- Thresholds: 50% similarity to suggest, 70% to block as duplicate

**Source Evidence:**
- `seed.sql` - ingredients table with 90 items
- `IngredientRepository.java` - search queries
- `IngredientService.java` - validation logic
- `IngredientController.java` - admin endpoints

---

### NFR-011: Data Validation Helpers
**Category:** Maintainability

**Description:** Backend services validate and normalize ingredient data

**Measurable Criteria:**
- `IngredientService.validateAndGetByKey()` validates ingredient key exists
- `IngredientService.validateNewIngredient()` checks for duplicates before creation
- `IngredientService.normalizeName()` converts to singular form, title case
- `IngredientService.findSimilar()` provides fuzzy matching for duplicate detection
- Invalid data throws `IllegalArgumentException` with descriptive message
- All validation errors logged for debugging

**Source Evidence:** `IngredientService.java` with validation methods; `IngredientController.java` exposes `/validate` endpoint

---

### NFR-015: Centralized Unit Definitions
**Category:** Maintainability

**Description:** All measurement units are defined in the database to prevent duplicates in shopping lists

**Measurable Criteria:**
- Single source of truth: `units` table (id, key, value)
- **No duplicate unit representations allowed** (e.g., cannot have both "unit" and "units")
- All units are singular/invariant form (e.g., "piece" not "pieces", "g" not "grams")
- Recipes reference units by `unit_id` FK, not free-text strings
- Shopping list aggregation uses exact unit matching (same ingredient + same unit = combine quantities)
- Different units for same ingredient display as separate line items but grouped together

**Source Evidence:** `seed.sql` - units table with 18 standardized values (g, ml, tsp, tbsp, piece, small, medium, large, handful, clove, head, stalk, slice, leaf, tin, cup, pinch, oz)

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


### NFR-014: Data Retention Policy
**Category:** Reliability

**Description:** Meal plan history is retained for rolling 6 months

**Measurable Criteria:**
- Scheduled job archives meal plan entries older than 6 months
- Archived data moved to archive table or deleted (configurable)
- Users can export their data before archival (optional)
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
| calories | integer | required, positive | Total calories for all defaultServings (displayed as per-serving to users - see FR-036) |
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
| oauth_provider | string | required, value: GOOGLE only | OAuth provider (Google only - no GitHub) |
| oauth_id | string | required | Provider's unique user identifier |
| is_admin | boolean | default false | GOD mode flag for recipe editing |
| default_servings | integer | default 1, range 1-10 | User's preferred default serving size for all recipes |
| created_at | datetime | required | Account creation timestamp |
| last_login | datetime | nullable | Most recent login timestamp |

**Storage:** MySQL `users` table

**Relationships:** Has many MealPlanEntry (via user_id)

---

## All Requirements - Finish
