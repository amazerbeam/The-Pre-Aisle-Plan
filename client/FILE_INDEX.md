# FoodBytes Client - Complete File Index

**Total Files: 89**

## Root Files (7)
- `.eslintrc.cjs` - ESLint configuration for code quality
- `.gitignore` - Git ignore patterns
- `FILE_INDEX.md` - This file
- `index.html` - Vite entry HTML
- `package.json` - NPM dependencies and scripts
- `PROJECT_SUMMARY.md` - Complete project documentation
- `QUICKSTART.md` - Quick start guide
- `README.md` - Project README
- `SETUP.md` - Detailed setup instructions
- `vite.config.js` - Vite build configuration

## Public Directory (1)
- `public/index.html` - HTML template with Google Fonts

## Source - Components (50 files)

### Auth Components (6)
- `src/components/auth/GoogleSignInButton.jsx` - Google OAuth button
- `src/components/auth/GoogleSignInButton.module.css`
- `src/components/auth/GuestPrompt.jsx` - Guest sign-in prompt
- `src/components/auth/GuestPrompt.module.css`
- `src/components/auth/ProtectedRoute.jsx` - Route protection HOC

### Calendar Components (6)
- `src/components/calendar/Calendar.jsx` - Weekly calendar grid
- `src/components/calendar/Calendar.module.css`
- `src/components/calendar/CalendarDay.jsx` - Single day view
- `src/components/calendar/CalendarDay.module.css`
- `src/components/calendar/DateNavigator.jsx` - Week navigation
- `src/components/calendar/DateNavigator.module.css`

### Common Components (10)
- `src/components/common/Button.jsx` - Reusable button
- `src/components/common/Button.module.css`
- `src/components/common/DateRangePicker.jsx` - Global date range
- `src/components/common/DateRangePicker.module.css`
- `src/components/common/Loading.jsx` - Loading spinner
- `src/components/common/Loading.module.css`
- `src/components/common/Modal.jsx` - Modal dialog
- `src/components/common/Modal.module.css`
- `src/components/common/Toast.jsx` - Toast notifications
- `src/components/common/Toast.module.css`

### Layout Components (6)
- `src/components/layout/Footer.jsx` - Bottom navigation
- `src/components/layout/Footer.module.css`
- `src/components/layout/Header.jsx` - Top header
- `src/components/layout/Header.module.css`
- `src/components/layout/Navigation.jsx` - Layout wrapper
- `src/components/layout/Navigation.module.css`

### Recipe Components (14)
- `src/components/recipes/DayButtons.jsx` - 7 day assignment buttons
- `src/components/recipes/DayButtons.module.css`
- `src/components/recipes/IngredientList.jsx` - Scaled ingredient list
- `src/components/recipes/IngredientList.module.css`
- `src/components/recipes/MealTypeTabs.jsx` - 4 meal type tabs
- `src/components/recipes/MealTypeTabs.module.css`
- `src/components/recipes/RecipeCard.jsx` - Recipe card with features
- `src/components/recipes/RecipeCard.module.css`
- `src/components/recipes/RecipeDetail.jsx` - Collapsible details
- `src/components/recipes/RecipeDetail.module.css`
- `src/components/recipes/RecipeList.jsx` - Recipe grid
- `src/components/recipes/RecipeList.module.css`
- `src/components/recipes/ServingsControl.jsx` - +/- servings
- `src/components/recipes/ServingsControl.module.css`

### Shopping Components (6)
- `src/components/shopping/AisleGroup.jsx` - Aisle group header
- `src/components/shopping/AisleGroup.module.css`
- `src/components/shopping/ShoppingItem.jsx` - Single item with checkbox
- `src/components/shopping/ShoppingItem.module.css`
- `src/components/shopping/ShoppingList.jsx` - Main shopping list
- `src/components/shopping/ShoppingList.module.css`

## Source - Contexts (3)
- `src/contexts/AuthContext.jsx` - User authentication state
- `src/contexts/DateRangeContext.jsx` - Global date range state
- `src/contexts/PlannerContext.jsx` - Meal plan CRUD operations

## Source - Hooks (5)
- `src/hooks/useAuth.js` - Auth context consumer
- `src/hooks/useDateRange.js` - Date range context consumer
- `src/hooks/useMealPlan.js` - Meal plan context consumer
- `src/hooks/useShoppingList.js` - Shopping list aggregation
- `src/hooks/useWakeLock.js` - Wake Lock API wrapper

## Source - Pages (11)
- `src/pages/AuthCallback.jsx` - OAuth callback handler
- `src/pages/HomePage.jsx` - Recipe browser page
- `src/pages/HomePage.module.css`
- `src/pages/LoginPage.jsx` - Login page
- `src/pages/LoginPage.module.css`
- `src/pages/MealPlanPage.jsx` - Weekly calendar page
- `src/pages/MealPlanPage.module.css`
- `src/pages/ProfilePage.jsx` - User profile page
- `src/pages/ProfilePage.module.css`
- `src/pages/ShoppingPage.jsx` - Shopping list page
- `src/pages/ShoppingPage.module.css`

## Source - Services (5)
- `src/services/api.js` - Axios instance with interceptors
- `src/services/authService.js` - Authentication API calls
- `src/services/ingredientService.js` - Ingredient/aisle/unit API calls
- `src/services/mealPlanService.js` - Meal plan CRUD API calls
- `src/services/recipeService.js` - Recipe API calls

## Source - Styles (3)
- `src/styles/global.css` - Global resets and utilities
- `src/styles/responsive.css` - Responsive breakpoint utilities
- `src/styles/variables.css` - CSS custom properties

## Source - Utils (3)
- `src/utils/aggregateIngredients.js` - Ingredient aggregation logic
- `src/utils/dateUtils.js` - Date manipulation utilities
- `src/utils/formatters.js` - Display formatters

## Source - App (3)
- `src/App.jsx` - Main app with router and providers
- `src/App.module.css` - App-level styles
- `src/main.jsx` - React entry point

---

## File Statistics by Type

| Type | Count | Purpose |
|------|-------|---------|
| `.jsx` | 39 | React components |
| `.module.css` | 28 | Component styles |
| `.js` | 8 | Services, hooks, utils |
| `.css` | 3 | Global styles |
| `.md` | 5 | Documentation |
| `.json` | 1 | Package config |
| `.html` | 2 | HTML templates |
| `.cjs` | 1 | ESLint config |
| Other | 2 | Vite config, gitignore |

**Total: 89 files**

## Component Breakdown

| Category | Components | Files |
|----------|-----------|-------|
| Auth | 3 | 6 |
| Calendar | 3 | 6 |
| Common | 5 | 10 |
| Layout | 3 | 6 |
| Recipes | 7 | 14 |
| Shopping | 3 | 6 |
| Pages | 6 | 11 |
| **Total** | **30** | **59** |

## Lines of Code (Estimated)

| Category | Estimated LOC |
|----------|---------------|
| Components | ~3,500 |
| Styles | ~1,500 |
| Services | ~300 |
| Utils | ~200 |
| Contexts | ~200 |
| Hooks | ~150 |
| Config | ~100 |
| Documentation | ~2,000 |
| **Total** | **~7,950** |

## Key Architectural Files

1. **Entry Points**
   - `src/main.jsx` - React mount point
   - `index.html` - Vite entry
   - `src/App.jsx` - Router and providers

2. **State Management**
   - `src/contexts/AuthContext.jsx` - User state
   - `src/contexts/DateRangeContext.jsx` - Date range
   - `src/contexts/PlannerContext.jsx` - Meal plan

3. **API Layer**
   - `src/services/api.js` - Axios config
   - `src/services/*Service.js` - API methods

4. **Routing**
   - `src/App.jsx` - Route definitions
   - `src/components/auth/ProtectedRoute.jsx` - Auth guard

5. **Build Config**
   - `vite.config.js` - Dev server and build
   - `package.json` - Dependencies
   - `.eslintrc.cjs` - Code quality

## Feature Implementation Files

### FR-000: Global Date Range
- `src/contexts/DateRangeContext.jsx`
- `src/components/common/DateRangePicker.jsx`
- `src/hooks/useDateRange.js`

### FR-001: Meal Type Tabs
- `src/components/recipes/MealTypeTabs.jsx`
- `src/components/recipes/MealTypeTabs.module.css`

### FR-003: Collapsible Details
- `src/components/recipes/RecipeDetail.jsx`
- `src/components/recipes/RecipeDetail.module.css`

### FR-004: Servings Control
- `src/components/recipes/ServingsControl.jsx`
- `src/components/recipes/ServingsControl.module.css`

### FR-007: Day Assignment
- `src/components/recipes/DayButtons.jsx`
- `src/components/recipes/DayButtons.module.css`

### FR-012-017: Shopping List
- `src/components/shopping/ShoppingList.jsx`
- `src/components/shopping/ShoppingItem.jsx`
- `src/components/shopping/AisleGroup.jsx`
- `src/utils/aggregateIngredients.js`
- `src/hooks/useShoppingList.js`

### FR-022: Wake Lock
- `src/hooks/useWakeLock.js`
- Used in `src/pages/MealPlanPage.jsx`
- Used in `src/pages/ShoppingPage.jsx`

## Critical Dependencies

From `package.json`:
- `react@^18.2.0` - UI library
- `react-dom@^18.2.0` - DOM rendering
- `react-router-dom@^6.20.0` - Client routing
- `axios@^1.6.2` - HTTP client
- `date-fns@^2.30.0` - Date utilities
- `vite@^5.0.8` - Build tool

## Import Relationships

```
main.jsx
  └─ App.jsx
      ├─ AuthProvider (contexts/AuthContext.jsx)
      │   └─ authService (services/authService.js)
      ├─ DateRangeProvider (contexts/DateRangeContext.jsx)
      ├─ PlannerProvider (contexts/PlannerContext.jsx)
      │   └─ mealPlanService (services/mealPlanService.js)
      └─ Pages
          ├─ HomePage
          │   ├─ MealTypeTabs
          │   ├─ RecipeList
          │   │   └─ RecipeCard
          │   │       ├─ ServingsControl
          │   │       ├─ DayButtons
          │   │       └─ RecipeDetail
          │   │           └─ IngredientList
          │   └─ DateRangePicker
          ├─ MealPlanPage
          │   └─ Calendar
          │       ├─ DateNavigator
          │       └─ CalendarDay
          ├─ ShoppingPage
          │   └─ ShoppingList
          │       └─ AisleGroup
          │           └─ ShoppingItem
          └─ LoginPage
              └─ GoogleSignInButton
```

## Testing Strategy

Each component should be tested for:
1. **Rendering** - Component displays correctly
2. **Props** - All props handled properly
3. **State** - Local state updates work
4. **Events** - Click handlers fire correctly
5. **Integration** - Works with contexts
6. **Responsive** - Mobile/tablet/desktop layouts

## Maintenance Notes

### To Add a New Component
1. Create `Component.jsx` in appropriate directory
2. Create `Component.module.css` for styles
3. Export from component file
4. Import where needed

### To Add a New Page
1. Create `PageName.jsx` in `src/pages/`
2. Create `PageName.module.css` for styles
3. Add route in `src/App.jsx`
4. Add navigation link if needed

### To Add a New API Endpoint
1. Add method to appropriate service in `src/services/`
2. Use existing `api` instance
3. Handle errors appropriately
4. Update contexts if state needed

### To Modify Styling
1. Global changes → `src/styles/variables.css`
2. Component changes → Component's `.module.css` file
3. Responsive changes → `src/styles/responsive.css`

---

*This index generated for FoodBytes Client v1.0.0*
*Last updated: 2025-11-30*
