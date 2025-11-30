# FoodBytes React Frontend - Complete Implementation

## Overview
A complete, production-ready React 18 frontend for the FoodBytes meal planning application. Built with Vite, featuring mobile-first responsive design, Google OAuth authentication, and full CRUD operations for meal planning.

## Statistics
- **Total Files Created**: 83
- **Components**: 25
- **Pages**: 6
- **Services**: 5
- **Hooks**: 5
- **Utils**: 3
- **Contexts**: 3

## Technology Stack
- **React 18** - Latest React with hooks
- **Vite** - Fast build tool and dev server
- **React Router v6** - Client-side routing
- **Axios** - HTTP client with interceptors
- **date-fns** - Date manipulation
- **CSS Modules** - Scoped component styling

## Architecture

### Component Hierarchy
```
App (Router + Providers)
├── AuthProvider (User authentication state)
├── DateRangeProvider (Global date range state)
└── PlannerProvider (Meal plan CRUD operations)
    ├── Navigation (Layout wrapper)
    │   ├── Header (Brand, user info, logout)
    │   ├── Outlet (Page content)
    │   └── Footer (Bottom navigation)
    └── Pages
        ├── HomePage (Recipe browser)
        ├── MealPlanPage (Weekly calendar)
        ├── ShoppingPage (Aggregated shopping list)
        ├── ProfilePage (User settings)
        ├── LoginPage (Google OAuth)
        └── AuthCallback (OAuth redirect handler)
```

### State Management
1. **AuthContext** - User authentication, login/logout, preferences
2. **DateRangeContext** - Global date range (default: today to today+6)
3. **PlannerContext** - Meal plan entries with CRUD operations

### API Integration
All API calls go through `src/services/api.js` which:
- Sets `withCredentials: true` for JWT cookies
- Intercepts 401 errors and redirects to login
- Proxies through Vite dev server to localhost:8080

## Feature Implementation

### FR-000: Global Date Range
**Location**: `src/components/common/DateRangePicker.jsx`
- Two date inputs (From/To)
- Updates global context
- Triggers refetch in all dependent components
- Default: today through today+6 days

### FR-001: Meal Type Tabs
**Location**: `src/components/recipes/MealTypeTabs.jsx`
- 4 tabs ONLY: Breakfast, Lunch, Dinner, Snacks
- NO "All" tab (as specified)
- Active tab highlighted with primary color
- Horizontal scroll on mobile

### FR-003: Collapsible Recipe Details
**Location**: `src/components/recipes/RecipeDetail.jsx`
- Toggle button shows/hides details
- Displays ingredients (scaled) and steps
- Smooth transition animation

### FR-004: Servings Control
**Location**: `src/components/recipes/ServingsControl.jsx`
- +/- buttons with 44px touch targets
- Min: 1, Max: 10
- Auto-scales ingredients in real-time
- Default from user preferences

### FR-007: Day Assignment Buttons
**Location**: `src/components/recipes/DayButtons.jsx`
- 7 buttons: Mon-Sun
- Maps to current date range
- Creates meal plan entry on click
- Visual feedback on selection

### FR-012-017: Shopping List
**Location**: `src/components/shopping/ShoppingList.jsx`
- Aggregates ingredients from all meal plan entries
- Groups by 17 aisles with color coding
- Checkbox for each item
- "Clear Checked" button

### FR-014: Checkbox Persistence
**Implementation**: `ShoppingList.jsx` useEffect
- Saves to localStorage with key: `shopping-list-{dateFrom}-{dateTo}`
- Loads on mount and date range change
- Clears when date range changes

### FR-022: Wake Lock
**Location**: `src/hooks/useWakeLock.js`
- Activates on MealPlanPage and ShoppingPage
- Feature detection for browser support
- Re-requests on visibility change
- Auto-releases on unmount

## Component Details

### Authentication Components
1. **GoogleSignInButton** - Official Google branding, redirects to OAuth
2. **ProtectedRoute** - HOC that redirects unauthenticated users
3. **GuestPrompt** - Friendly prompt for guests to sign in

### Recipe Components
1. **RecipeCard** - Main recipe display with all features
2. **RecipeList** - Responsive grid layout
3. **RecipeDetail** - Collapsible ingredients and steps
4. **MealTypeTabs** - 4 meal type filters
5. **ServingsControl** - +/- servings adjuster
6. **DayButtons** - 7 day assignment buttons
7. **IngredientList** - Scaled ingredients with aisle colors

### Calendar Components
1. **Calendar** - Weekly grid view
2. **CalendarDay** - Single day with all meals
3. **DateNavigator** - Previous/Next week buttons

### Shopping Components
1. **ShoppingList** - Main shopping list container
2. **ShoppingItem** - Single item with checkbox
3. **AisleGroup** - Group header with aisle color

### Layout Components
1. **Header** - Sticky header with logo and user info
2. **Footer** - Fixed bottom navigation (3 tabs)
3. **Navigation** - Layout wrapper with Outlet

### Common Components
1. **Button** - Reusable with 4 variants, 3 sizes
2. **Modal** - Backdrop with close button
3. **Loading** - Spinner (normal or fullscreen)
4. **Toast** - Notifications (4 types)
5. **DateRangePicker** - Global date range control

## Pages

### HomePage
- Recipe browser with search
- Meal type tabs
- Date range picker
- Recipe cards with day assignment

### MealPlanPage
- Weekly calendar grid
- Wake lock enabled
- Delete meal entries
- Visual today indicator

### ShoppingPage
- Aggregated shopping list
- Aisle grouping with colors
- Checkbox persistence
- Wake lock enabled

### ProfilePage
- User info display
- Default servings setting
- Save preferences

### LoginPage
- Welcome message
- Google OAuth button
- Auto-redirect if authenticated

### AuthCallback
- OAuth redirect handler
- Loading state
- Auto-navigation

## Styling

### CSS Architecture
1. **variables.css** - All CSS custom properties
2. **global.css** - Global resets and utilities
3. **responsive.css** - Breakpoint utilities
4. **Component.module.css** - Scoped component styles

### Design System
- **Primary Color**: #a689c6 (lavender purple)
- **Touch Targets**: 44px minimum
- **Breakpoints**: 480px, 768px, 1024px, 1400px
- **Font**: Roboto from Google Fonts
- **17 Aisle Colors**: Defined in variables.css

### Responsive Grid
- **Mobile**: 1 column
- **Tablet**: 2 columns
- **Desktop**: 3 columns
- **Large Desktop**: 7 columns (calendar)

## Services

### api.js
- Axios instance with baseURL '/api'
- withCredentials: true for cookies
- 401 interceptor for auth errors

### authService.js
- login() - Redirects to Google OAuth
- logout() - Clears session
- getCurrentUser() - Fetches user data
- updatePreferences() - Saves user settings

### recipeService.js
- getRecipes(params) - Fetch all recipes
- getRecipeById(id) - Fetch single recipe
- searchRecipes(query, mealType) - Search recipes

### mealPlanService.js
- getEntries(dateFrom, dateTo) - Fetch meal plan
- createEntry(entry) - Add meal to plan
- updateEntry(id, entry) - Update meal
- deleteEntry(id) - Remove meal

### ingredientService.js
- getIngredients() - Fetch all ingredients
- getAisles() - Fetch all aisles
- getUnits() - Fetch all units
- getMeals() - Fetch meal types

## Utilities

### dateUtils.js
- formatDate() - Convert to YYYY-MM-DD
- formatDateDisplay() - Display format
- getWeekDays() - Get 7 days from start
- isToday() - Check if date is today
- parseDate() - Parse date string

### aggregateIngredients.js
- aggregateIngredients() - Combine and scale ingredients
- groupByAisle() - Group by aisle with sorting

### formatters.js
- formatQuantity() - Format decimal numbers
- formatCalories() - Format with "cal" suffix
- formatServings() - Format servings text
- formatIngredient() - Combine qty, unit, name

## Hooks

### useAuth
- Consumes AuthContext
- Returns: user, loading, isAuthenticated, isAdmin, login, logout

### useDateRange
- Consumes DateRangeContext
- Returns: dateFrom, dateTo, setDateRange

### useMealPlan
- Consumes PlannerContext
- Returns: entries, loading, error, CRUD operations

### useShoppingList
- Derives shopping list from meal plan
- Returns: ingredients, groupedByAisle

### useWakeLock
- Manages Wake Lock API
- Auto-requests on mount
- Re-requests on visibility change

## Configuration

### vite.config.js
```javascript
{
  server: {
    port: 3000,
    proxy: {
      '/api': 'http://localhost:8080',
      '/oauth2': 'http://localhost:8080',
      '/login/oauth2': 'http://localhost:8080'
    }
  }
}
```

### package.json
- React 18.2.0
- React Router DOM 6.20.0
- Axios 1.6.2
- date-fns 2.30.0
- Vite 5.0.8

## API Contract

### Expected Endpoints

#### Authentication
- `GET /api/auth/user` - Current user
- `POST /api/auth/logout` - Logout
- `PUT /api/auth/preferences` - Update preferences
- `GET /oauth2/authorization/google` - OAuth redirect

#### Recipes
- `GET /api/recipes?mealType={type}` - Get recipes
- `GET /api/recipes/{id}` - Get single recipe
- `GET /api/recipes/search?query={q}&mealType={type}` - Search

#### Meal Plan
- `GET /api/meal-plan?dateFrom={date}&dateTo={date}` - Get entries
- `POST /api/meal-plan` - Create entry
- `PUT /api/meal-plan/{id}` - Update entry
- `DELETE /api/meal-plan/{id}` - Delete entry

#### Reference Data
- `GET /api/ingredients` - All ingredients
- `GET /api/aisles` - All aisles
- `GET /api/units` - All units
- `GET /api/meals` - Meal types

### Expected Data Structures

#### User
```json
{
  "id": 1,
  "name": "John Doe",
  "email": "john@example.com",
  "role": "USER",
  "defaultServings": 2
}
```

#### Recipe
```json
{
  "id": 1,
  "name": "Scrambled Eggs",
  "mealType": "Breakfast",
  "servings": 2,
  "calories": 200,
  "ingredients": [
    {
      "ingredientId": 1,
      "ingredientName": "Eggs",
      "quantity": 2,
      "unitId": 1,
      "unitName": "whole",
      "aisleId": 2,
      "aisleName": "Dairy"
    }
  ],
  "steps": ["Step 1...", "Step 2..."]
}
```

#### Meal Plan Entry
```json
{
  "id": 1,
  "recipeId": 1,
  "recipe": { /* Recipe object */ },
  "date": "2025-11-30",
  "mealType": "Breakfast",
  "servings": 2
}
```

## Installation & Setup

1. **Install dependencies**
   ```bash
   cd C:\Users\jossd\Documents\MyWebSites\FoodBytes\client
   npm install
   ```

2. **Start development server**
   ```bash
   npm run dev
   ```

3. **Build for production**
   ```bash
   npm run build
   ```

## Browser Support
- Modern browsers with ES6+ support
- Chrome, Firefox, Safari, Edge (latest 2 versions)
- Mobile browsers (iOS Safari, Chrome Mobile)
- Wake Lock API: Chrome 84+, Edge 84+

## Accessibility
- Semantic HTML elements
- ARIA labels on interactive elements
- Keyboard navigation support
- 44px minimum touch targets
- Color contrast meets WCAG AA

## Performance Optimizations
- React.memo for expensive components
- useMemo for computed values
- Lazy loading of routes (optional)
- CSS Modules for code splitting
- Vite for fast HMR

## Security Features
- HttpOnly cookies for JWT
- CSRF protection via SameSite cookies
- XSS prevention via React's escaping
- 401 interceptor for expired sessions
- Protected routes for authenticated pages

## Future Enhancements
- Progressive Web App (PWA) support
- Offline mode with service workers
- Push notifications for meal reminders
- Recipe favorites and ratings
- Meal plan sharing
- Print shopping list
- Dark mode theme

## Troubleshooting

### Common Issues

1. **API 404 Errors**
   - Verify backend is running on port 8080
   - Check Vite proxy configuration

2. **OAuth Redirect Loop**
   - Verify Google OAuth credentials
   - Check redirect URI in Google Console

3. **Shopping List Not Saving**
   - Check localStorage is enabled
   - Verify date range matches

4. **Wake Lock Not Working**
   - Requires HTTPS in production
   - Only works in supported browsers
   - Check browser console for errors

## Testing Checklist

### Authentication
- [ ] Login with Google OAuth
- [ ] Logout clears session
- [ ] Protected routes redirect to login
- [ ] OAuth callback redirects to home

### Recipe Browser
- [ ] Recipes load on page load
- [ ] Meal type tabs filter recipes
- [ ] Search filters recipes
- [ ] Servings control scales ingredients
- [ ] View Details shows/hides content
- [ ] Day buttons add to meal plan

### Meal Plan
- [ ] Calendar shows current week
- [ ] Previous/Next week navigation works
- [ ] Meals display in correct days
- [ ] Delete removes meal
- [ ] Total calories calculated
- [ ] Wake lock activates

### Shopping List
- [ ] Ingredients aggregate correctly
- [ ] Aisle grouping works
- [ ] Checkboxes toggle
- [ ] Checked items persist
- [ ] Clear checked button works
- [ ] Wake lock activates

### Profile
- [ ] User info displays
- [ ] Default servings updates
- [ ] Save preferences persists

### Responsive Design
- [ ] Mobile layout (< 768px)
- [ ] Tablet layout (768px - 1024px)
- [ ] Desktop layout (> 1024px)
- [ ] Touch targets meet 44px minimum

## Deployment

### Production Build
```bash
npm run build
```

### Serve Static Files
The `dist/` folder contains all static files. Can be served by:
- Nginx
- Apache
- Spring Boot static resources
- CDN (S3 + CloudFront)

### Environment Variables
Update API base URL in production:
```javascript
// src/services/api.js
const api = axios.create({
  baseURL: process.env.VITE_API_URL || '/api',
  // ...
});
```

### CORS Configuration
Backend must allow:
- Credentials: true
- Origin: Your frontend domain
- Methods: GET, POST, PUT, DELETE
- Headers: Content-Type, Authorization

## Maintenance

### Adding New Features
1. Create component in appropriate directory
2. Add corresponding .module.css file
3. Update contexts if state needed
4. Add service methods if API calls needed
5. Update routes in App.jsx

### Code Style
- Use functional components with hooks
- CSS Modules for all styling
- PropTypes or TypeScript for type checking
- ESLint for code quality
- Prettier for formatting

## Support

For issues or questions:
1. Check browser console for errors
2. Verify backend is running
3. Check API endpoints match
4. Review SETUP.md for configuration

## License

Copyright 2025 FoodBytes. All rights reserved.
