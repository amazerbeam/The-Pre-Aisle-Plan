# FoodBytes Client Setup Guide

## Quick Start

1. **Install Node.js** (if not already installed)
   - Download from https://nodejs.org/
   - Recommended version: 18.x or higher

2. **Navigate to the client directory**
   ```bash
   cd C:\Users\jossd\Documents\MyWebSites\FoodBytes\client
   ```

3. **Install dependencies**
   ```bash
   npm install
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   - Navigate to http://localhost:3000
   - The API proxy will forward requests to http://localhost:8080

## Important Notes

### Backend Requirement
The frontend expects the Spring Boot backend to be running on `localhost:8080`. Make sure to start the backend server before testing the frontend.

### OAuth Configuration
Google OAuth is configured to redirect through the backend at `/oauth2/authorization/google`. Ensure your backend OAuth configuration matches the requirements.

### Date Range (FR-000)
The app initializes with a default date range of today through today+6 days. This can be changed using the DateRangePicker component on any page.

### Meal Type Tabs (FR-001)
The recipe browser shows 4 meal type tabs: Breakfast, Lunch, Dinner, and Snacks. There is NO "All" tab as per requirements.

### Shopping List Persistence (FR-014)
Checked items in the shopping list are persisted to localStorage with a key based on the current date range: `shopping-list-{dateFrom}-{dateTo}`.

### Wake Lock (FR-022)
The meal plan and shopping pages implement wake lock to prevent screen dimming. This requires HTTPS in production or localhost in development.

## File Structure

```
client/
├── public/
│   └── index.html
├── src/
│   ├── components/
│   │   ├── auth/           # GoogleSignInButton, ProtectedRoute, GuestPrompt
│   │   ├── calendar/       # Calendar, CalendarDay, DateNavigator
│   │   ├── common/         # Button, Modal, Loading, Toast, DateRangePicker
│   │   ├── layout/         # Header, Footer, Navigation
│   │   ├── recipes/        # RecipeCard, RecipeList, RecipeDetail, etc.
│   │   └── shopping/       # ShoppingList, ShoppingItem, AisleGroup
│   ├── contexts/
│   │   ├── AuthContext.jsx
│   │   ├── DateRangeContext.jsx
│   │   └── PlannerContext.jsx
│   ├── hooks/
│   │   ├── useAuth.js
│   │   ├── useDateRange.js
│   │   ├── useMealPlan.js
│   │   ├── useShoppingList.js
│   │   └── useWakeLock.js
│   ├── pages/
│   │   ├── HomePage.jsx
│   │   ├── LoginPage.jsx
│   │   ├── MealPlanPage.jsx
│   │   ├── ShoppingPage.jsx
│   │   ├── ProfilePage.jsx
│   │   └── AuthCallback.jsx
│   ├── services/
│   │   ├── api.js
│   │   ├── authService.js
│   │   ├── recipeService.js
│   │   ├── mealPlanService.js
│   │   └── ingredientService.js
│   ├── styles/
│   │   ├── variables.css
│   │   ├── global.css
│   │   └── responsive.css
│   ├── utils/
│   │   ├── dateUtils.js
│   │   ├── aggregateIngredients.js
│   │   └── formatters.js
│   ├── App.jsx
│   └── main.jsx
├── index.html
├── package.json
├── vite.config.js
└── README.md
```

## Key Features Implemented

### FR-000: Global Date Range
- DateRangePicker component available on all pages
- Defaults to today through today+6
- Updates all views (recipes, meal plan, shopping)

### FR-001: Meal Type Tabs
- 4 tabs only: Breakfast, Lunch, Dinner, Snacks
- NO "All" tab

### FR-003: Collapsible Recipe Details
- "View Details" button on each recipe card
- Shows ingredients and steps when expanded

### FR-004: Servings Control
- +/- buttons with min 1, max 10
- Scales ingredients automatically

### FR-007: Day Assignment Buttons
- Mon-Sun buttons for adding recipes to meal plan
- Maps to current date range

### FR-012-017: Shopping List
- Aggregated ingredients from meal plan
- Grouped by aisle with color coding
- Checkboxes with localStorage persistence

### FR-022: Wake Lock
- Enabled on meal plan and shopping pages
- Prevents screen dimming during use

## API Endpoints Expected

The frontend expects the following API endpoints from the backend:

### Authentication
- `GET /api/auth/user` - Get current user
- `POST /api/auth/logout` - Logout
- `PUT /api/auth/preferences` - Update user preferences
- `GET /oauth2/authorization/google` - Google OAuth redirect

### Recipes
- `GET /api/recipes` - Get all recipes (with optional mealType param)
- `GET /api/recipes/{id}` - Get single recipe
- `GET /api/recipes/search` - Search recipes

### Meal Plan
- `GET /api/meal-plan?dateFrom={date}&dateTo={date}` - Get meal plan entries
- `POST /api/meal-plan` - Create entry
- `PUT /api/meal-plan/{id}` - Update entry
- `DELETE /api/meal-plan/{id}` - Delete entry

### Reference Data
- `GET /api/ingredients` - Get all ingredients
- `GET /api/aisles` - Get all aisles
- `GET /api/units` - Get all units
- `GET /api/meals` - Get meal types

## Troubleshooting

### Port Already in Use
If port 3000 is already in use, Vite will automatically try the next available port. Check the console output for the actual port.

### API Connection Issues
- Verify the backend is running on port 8080
- Check the Vite proxy configuration in `vite.config.js`
- Check browser console for CORS errors

### OAuth Redirect Loop
- Verify Google OAuth credentials are configured in the backend
- Check that redirect URIs are properly set in Google Cloud Console
- Ensure cookies are enabled in the browser

### Shopping List Not Persisting
- Check browser localStorage is enabled
- Verify the date range hasn't changed
- Check browser console for errors

## Production Build

1. Build the application:
   ```bash
   npm run build
   ```

2. The optimized files will be in the `dist/` directory

3. Serve the files using a static file server or integrate with your backend

4. Update the API base URL for production (modify `src/services/api.js`)

## Brand Colors

- Primary: `#a689c6` (lavender purple)
- 17 distinct aisle colors defined in `variables.css`
- All interactive elements meet 44px minimum touch target size
