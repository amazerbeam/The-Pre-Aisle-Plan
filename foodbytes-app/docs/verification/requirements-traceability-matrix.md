# Requirements Traceability Matrix (RTM)

## FoodBytes Macro Features - FR-080, FR-081, FR-082

Generated: 2025-12-09
Updated: 2025-12-09 (Implementation Complete)

---

## FR-080: Ingredient Macro Data

**Status:** IMPLEMENTED
**Phase:** Database, Backend
**Priority:** High

### Acceptance Criteria

| # | Criterion | Status | Implementation | Evidence |
|---|-----------|--------|----------------|----------|
| 1 | `ingredients` table includes new columns: `protein_per_100g`, `carbs_per_100g`, `fat_per_100g` | IMPLEMENTED | `database/schema.sql` lines 66-69 | Schema updated |
| 2 | All values stored as DECIMAL(5,2) for precision | IMPLEMENTED | `database/schema.sql` | `DECIMAL(5,2) NOT NULL DEFAULT 0.00` |
| 3 | Macro data populated for all existing ingredients | IMPLEMENTED | `database/seed.sql` lines 59-190 | 94 ingredients with macro data |
| 4 | Admin ingredient editing form includes macro input fields | NOT_STARTED | - | Future FR (out of scope) |
| 5 | Recipe macro totals calculated: SUM(ingredient.macro * quantity / 100) | IMPLEMENTED | `MacroCalculationService.java` | `calculatePerServingMacros()` method |
| 6 | Per-serving macros calculated: recipe_total_macro / default_servings | IMPLEMENTED | `MacroCalculationService.java` | Division by servings in calculation |

---

## FR-081: Daily Macro Popup (Meal Plan View)

**Status:** IMPLEMENTED
**Phase:** Frontend
**Priority:** Medium

### Acceptance Criteria

| # | Criterion | Status | Implementation | Evidence |
|---|-----------|--------|----------------|----------|
| 1 | Daily calorie text in Meal Plan is clickable (cursor: pointer) | IMPLEMENTED | `MealPlanDay.jsx`, `MealPlanDay.css` | `.day-calories-clickable` class |
| 2 | Clicking opens a popup/modal with macro breakdown | IMPLEMENTED | `DailyMacroPopup.jsx` | Component renders on click |
| 3 | Popup displays: Day name and date | IMPLEMENTED | `DailyMacroPopup.jsx` lines 68-72 | Header with dayOfWeek and date |
| 4 | Popup displays: Total calories | IMPLEMENTED | `DailyMacroPopup.jsx` lines 81-84 | `.macro-total-value` |
| 5 | Popup displays: Protein (grams and percentage) | IMPLEMENTED | `DailyMacroPopup.jsx` lines 87-98 | Protein card with g and % |
| 6 | Popup displays: Carbohydrates (grams and percentage) | IMPLEMENTED | `DailyMacroPopup.jsx` lines 100-111 | Carbs card with g and % |
| 7 | Popup displays: Fat (grams and percentage) | IMPLEMENTED | `DailyMacroPopup.jsx` lines 113-124 | Fat card with g and % |
| 8 | Macros calculated from ingredient data (FR-080 dependency) | IMPLEMENTED | `MealPlanService.java` | Uses `MacroCalculationService` |
| 9 | Popup closes on: backdrop click, X button, ESC key | IMPLEMENTED | `DailyMacroPopup.jsx` lines 14-38 | Event listeners for all |
| 10 | Styling consistent with existing popups (brand colors) | IMPLEMENTED | `DailyMacroPopup.css` | Brand color #4a3f80 |

---

## FR-082: Weekly Macro Summary (Meal Plan View)

**Status:** IMPLEMENTED
**Phase:** Frontend
**Priority:** Medium

### Acceptance Criteria

| # | Criterion | Status | Implementation | Evidence |
|---|-----------|--------|----------------|----------|
| 1 | Weekly "Total" text in Meal Plan is clickable (cursor: pointer) | IMPLEMENTED | `MealPlanCalendar.jsx`, `MealPlanCalendar.css` | `.week-calories-clickable` class |
| 2 | Clicking opens a popup/modal with weekly macro summary | IMPLEMENTED | `WeeklyMacroPopup.jsx` | Component renders on click |
| 3 | Popup displays: Week date range (e.g., "Dec 9 - Dec 15") | IMPLEMENTED | `WeeklyMacroPopup.jsx` line 84 | `formatDateRange()` in header |
| 4 | Popup displays: Total weekly calories | IMPLEMENTED | `WeeklyMacroPopup.jsx` line 100 | Weekly Totals section |
| 5 | Popup displays: Total weekly protein, carbs, fat | IMPLEMENTED | `WeeklyMacroPopup.jsx` lines 103-122 | Summary grid items |
| 6 | Popup displays: Daily averages for all macros | IMPLEMENTED | `WeeklyMacroPopup.jsx` lines 126-175 | Daily Average section |
| 7 | Macros calculated from ingredient data (FR-080 dependency) | IMPLEMENTED | `MealPlanService.java` | Uses `MacroCalculationService` |
| 8 | Popup closes on: backdrop click, X button, ESC key | IMPLEMENTED | `WeeklyMacroPopup.jsx` lines 13-37 | Event listeners for all |

---

## Coverage Summary

| Requirement | Total Criteria | Implemented | Coverage |
|-------------|----------------|-------------|----------|
| FR-080 | 6 | 5 | 83% (admin form deferred) |
| FR-081 | 10 | 10 | 100% |
| FR-082 | 8 | 8 | 100% |
| **TOTAL** | **24** | **23** | **96%** |

---

## Implementation Artifacts

### Database
- Schema file: `foodbytes-app/database/schema.sql` (lines 59-74)
- Seed data: `foodbytes-app/database/seed.sql` (lines 59-190)

### Backend (Java)
- Ingredient model: `foodbytes-api/src/main/java/com/foodbytes/model/Ingredient.java`
- MacroCalculationService: `foodbytes-api/src/main/java/com/foodbytes/service/MacroCalculationService.java`
- MealPlanService: `foodbytes-api/src/main/java/com/foodbytes/service/MealPlanService.java`
- MealPlanDayDTO: `foodbytes-api/src/main/java/com/foodbytes/dto/MealPlanDayDTO.java`
- MealPlanWeekDTO: `foodbytes-api/src/main/java/com/foodbytes/dto/MealPlanWeekDTO.java`

### Frontend (React)
- DailyMacroPopup: `client/src/components/mealplan/DailyMacroPopup.jsx`
- DailyMacroPopup CSS: `client/src/components/mealplan/DailyMacroPopup.css`
- WeeklyMacroPopup: `client/src/components/mealplan/WeeklyMacroPopup.jsx`
- WeeklyMacroPopup CSS: `client/src/components/mealplan/WeeklyMacroPopup.css`
- MealPlanDay: `client/src/components/mealplan/MealPlanDay.jsx` (updated)
- MealPlanDay CSS: `client/src/components/mealplan/MealPlanDay.css` (updated)
- MealPlanCalendar: `client/src/components/mealplan/MealPlanCalendar.jsx` (updated)
- MealPlanCalendar CSS: `client/src/components/mealplan/MealPlanCalendar.css` (updated)

---

## Verification Log

| Date | Requirement | Action | Result |
|------|-------------|--------|--------|
| 2025-12-09 | All | RTM Created | - |
| 2025-12-09 | FR-080 | Database schema updated | PASS |
| 2025-12-09 | FR-080 | Seed data with macros added | PASS |
| 2025-12-09 | FR-080 | Ingredient.java model updated | PASS |
| 2025-12-09 | FR-080 | MacroCalculationService created | PASS |
| 2025-12-09 | FR-080 | MealPlanService updated | PASS |
| 2025-12-09 | FR-081 | MealPlanDayDTO updated | PASS |
| 2025-12-09 | FR-081 | DailyMacroPopup created | PASS |
| 2025-12-09 | FR-081 | MealPlanDay made clickable | PASS |
| 2025-12-09 | FR-082 | MealPlanWeekDTO updated | PASS |
| 2025-12-09 | FR-082 | WeeklyMacroPopup created | PASS |
| 2025-12-09 | FR-082 | MealPlanCalendar made clickable | PASS |

---

## Outstanding Items

1. **FR-080 Criterion 4**: Admin ingredient editing form - deferred to future requirement
2. **Testing**: E2E tests pending - invoke @testing-agent

---

## Next Steps

1. Run @testing-agent for E2E verification
2. Deploy and manually verify popups display correctly
3. Verify macro calculations match expected values
