# FoodBytes Client - Complete File Structure

## Summary
- **Total Files:** 70
- **JavaScript/JSX Files:** 37
- **CSS Files:** 24
- **Configuration Files:** 6
- **Documentation:** 2
- **HTML:** 1

## Directory Structure

```
client/
├── public/
│   └── index.html                          # HTML entry point with viewport meta
│
├── src/
│   ├── components/
│   │   ├── auth/
│   │   │   ├── LoginButton.jsx             # OAuth login buttons (Google/GitHub)
│   │   │   ├── LoginButton.css
│   │   │   ├── ProtectedRoute.jsx          # Route guard for authenticated users
│   │   │   ├── UserProfile.jsx             # User profile display with logout
│   │   │   └── UserProfile.css
│   │   │
│   │   ├── calendar/
│   │   │   ├── Calendar.jsx                # Weekly calendar view with navigation
│   │   │   ├── Calendar.css
│   │   │   ├── CalendarDay.jsx             # Single day with meals
│   │   │   ├── CalendarDay.css
│   │   │   ├── DatePicker.jsx              # Date input component
│   │   │   └── DatePicker.css
│   │   │
│   │   ├── common/
│   │   │   ├── Button.jsx                  # Reusable button with variants
│   │   │   ├── Button.css
│   │   │   ├── Loading.jsx                 # Loading spinner
│   │   │   ├── Loading.css
│   │   │   ├── Modal.jsx                   # Dialog overlay
│   │   │   └── Modal.css
│   │   │
│   │   ├── layout/
│   │   │   ├── Header.jsx                  # Top navigation with logo & user menu
│   │   │   ├── Header.css
│   │   │   ├── Navigation.jsx              # Desktop horizontal navigation
│   │   │   ├── Navigation.css
│   │   │   ├── MobileNav.jsx               # Bottom navigation for mobile
│   │   │   └── MobileNav.css
│   │   │
│   │   ├── recipes/
│   │   │   ├── RecipeList.jsx              # Grid of recipes with meal type filters
│   │   │   ├── RecipeList.css
│   │   │   ├── RecipeCard.jsx              # Recipe card with servings & actions
│   │   │   ├── RecipeCard.css
│   │   │   ├── RecipeDetail.jsx            # Full recipe with ingredients & steps
│   │   │   ├── RecipeDetail.css
│   │   │   ├── RecipeEditor.jsx            # Admin recipe edit form
│   │   │   └── RecipeEditor.css
│   │   │
│   │   └── shopping/
│   │       ├── ShoppingList.jsx            # Aggregated shopping list by aisle
│   │       ├── ShoppingList.css
│   │       ├── DateRangePicker.jsx         # Date range selector (3/7/14 days)
│   │       ├── DateRangePicker.css
│   │       ├── ShoppingItem.jsx            # Single shopping item with checkbox
│   │       └── ShoppingItem.css
│   │
│   ├── contexts/
│   │   ├── AuthContext.jsx                 # User auth state & methods
│   │   └── PlannerContext.jsx              # Meal plan state & CRUD operations
│   │
│   ├── hooks/
│   │   ├── useAuth.js                      # Access auth context
│   │   ├── useRecipes.js                   # Recipe fetching & filtering
│   │   ├── useMealPlan.js                  # Access planner context
│   │   └── useShoppingList.js              # Aggregate & sort shopping list
│   │
│   ├── pages/
│   │   ├── LoginPage.jsx                   # Login page with OAuth buttons
│   │   ├── LoginPage.css
│   │   ├── RecipesPage.jsx                 # Recipe browsing page
│   │   ├── PlannerPage.jsx                 # Meal planner page
│   │   ├── ShoppingPage.jsx                # Shopping list page
│   │   ├── ProfilePage.jsx                 # User profile page
│   │   └── ProfilePage.css
│   │
│   ├── services/
│   │   ├── api.js                          # Axios instance with interceptors
│   │   ├── authService.js                  # Auth API calls
│   │   ├── recipeService.js                # Recipe API calls
│   │   └── mealPlanService.js              # Meal plan API calls
│   │
│   ├── styles/
│   │   ├── variables.css                   # CSS custom properties (colors, spacing, etc.)
│   │   ├── global.css                      # Base styles & resets
│   │   └── responsive.css                  # Media queries & breakpoints
│   │
│   ├── App.jsx                             # Main app component with routing
│   ├── App.css                             # App-level styles
│   └── main.jsx                            # React entry point
│
├── .dockerignore                           # Docker ignore patterns
├── .eslintrc.json                          # ESLint configuration
├── .gitignore                              # Git ignore patterns
├── Dockerfile                              # Multi-stage Docker build
├── nginx.conf                              # Nginx config for production
├── package.json                            # Dependencies & scripts
├── vite.config.js                          # Vite configuration with proxy
├── README.md                               # Project overview
├── DEVELOPMENT.md                          # Development guide
└── FILE_STRUCTURE.md                       # This file
```

## Key Features by File

### Authentication Flow
- `LoginPage.jsx` - OAuth login page
- `LoginButton.jsx` - Provider-specific login buttons
- `AuthContext.jsx` - Auth state management
- `ProtectedRoute.jsx` - Route protection
- `authService.js` - Auth API integration

### Recipe Management
- `RecipeList.jsx` - Browse & filter recipes
- `RecipeCard.jsx` - Recipe summary with actions
- `RecipeDetail.jsx` - Full recipe view
- `RecipeEditor.jsx` - Admin recipe editing
- `recipeService.js` - Recipe API integration
- `useRecipes.js` - Recipe state & logic

### Meal Planning
- `Calendar.jsx` - Weekly calendar view
- `CalendarDay.jsx` - Daily meal slots
- `PlannerContext.jsx` - Meal plan state
- `mealPlanService.js` - Meal plan API
- `useMealPlan.js` - Meal plan operations

### Shopping List
- `ShoppingList.jsx` - Aggregated list by aisle
- `ShoppingItem.jsx` - Individual item with checkbox
- `DateRangePicker.jsx` - Date range selection
- `useShoppingList.js` - Aggregation & sorting logic

### Layout & Navigation
- `Header.jsx` - Top bar with logo & user menu
- `Navigation.jsx` - Desktop navigation
- `MobileNav.jsx` - Mobile bottom navigation

### Shared Components
- `Button.jsx` - Reusable button component
- `Modal.jsx` - Dialog/modal overlay
- `Loading.jsx` - Loading spinner

### Styling System
- `variables.css` - Design tokens (17 aisle colors, spacing, typography)
- `global.css` - Base styles, resets, utilities
- `responsive.css` - Mobile-first breakpoints (480px, 768px, 1024px)

### Configuration
- `vite.config.js` - Dev server with API proxy to backend
- `nginx.conf` - Production server config with SPA fallback
- `Dockerfile` - Multi-stage build (Node + Nginx)
- `.eslintrc.json` - Linting rules for React
- `package.json` - React 18, router v6, axios, date-fns

## API Integration Points

All services use `withCredentials: true` for cookie-based auth:

**Auth Service** (`authService.js`)
- `GET /api/auth/me` - Get current user
- `GET /api/auth/google` - Google OAuth (redirect)
- `GET /api/auth/github` - GitHub OAuth (redirect)
- `POST /api/auth/logout` - Logout

**Recipe Service** (`recipeService.js`)
- `GET /api/recipes` - Get all recipes
- `GET /api/recipes/:id` - Get recipe by ID
- `POST /api/recipes` - Create recipe (admin)
- `PUT /api/recipes/:id` - Update recipe (admin)
- `PATCH /api/recipes/:id/visibility` - Toggle visibility (admin)
- `DELETE /api/recipes/:id` - Delete recipe (admin)

**Meal Plan Service** (`mealPlanService.js`)
- `GET /api/meal-plans?start_date=X&end_date=Y` - Get meal plans
- `POST /api/meal-plans` - Create meal plan
- `PUT /api/meal-plans/:id` - Update meal plan
- `DELETE /api/meal-plans/:id` - Delete meal plan
- `POST /api/meal-plans/bulk` - Bulk create

## Responsive Breakpoints

- **Mobile**: < 768px (default, mobile-first)
- **Tablet**: 768px - 1023px
- **Desktop**: 1024px+

Special handling:
- Bottom navigation on mobile
- Top navigation on tablet+
- Touch targets 44x44px minimum
- Swipe-friendly horizontal scrolling on mobile filters

## Color System

17 aisle colors defined as CSS variables:
- Produce (green), Bakery (orange), Meat (red), Seafood (blue)
- Dairy (yellow), Frozen (cyan), Canned (brown), Dry Goods (tan)
- Snacks (amber), Beverages (purple), Condiments (lime), Baking (pink)
- Spices (coral), Ethnic (orchid), Health (lime), Household (sky), Other (gray)

## State Management

**Global State (Context API)**
- `AuthContext` - User authentication & authorization
- `PlannerContext` - Meal plans for current date range

**Local State (Component useState)**
- UI state (modals, forms, loading)
- Filter selections
- Date ranges
- Checkbox states (shopping list)

**Persistent State (localStorage)**
- Shopping list checked items

## Build Output

Development:
```bash
npm run dev  # Vite dev server on :3000
```

Production:
```bash
npm run build  # Output to dist/
```

Docker:
```bash
docker build -t foodbytes-client .  # Multi-stage: Node build → Nginx serve
docker run -p 80:80 foodbytes-client
```

## Dependencies

**Runtime:**
- react: ^18.3.1
- react-dom: ^18.3.1
- react-router-dom: ^6.26.0
- axios: ^1.7.2
- date-fns: ^3.6.0

**Development:**
- vite: ^5.3.3
- @vitejs/plugin-react: ^4.3.1
- eslint: ^8.57.0
- eslint-plugin-react: ^7.34.3
- eslint-plugin-react-hooks: ^4.6.2

**Production Server:**
- nginx:alpine (Docker image)

## Version

FoodBytes v8.1.2 - React Client
