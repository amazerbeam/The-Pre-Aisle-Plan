# FoodBytes Frontend - Quick Start Guide

## Prerequisites
- Node.js 18+ installed
- Backend running on localhost:8080
- Google OAuth configured in backend

## Installation (2 minutes)

```bash
# Navigate to client directory
cd C:\Users\jossd\Documents\MyWebSites\FoodBytes\client

# Install dependencies
npm install

# Start development server
npm run dev
```

Open http://localhost:3000 in your browser!

## What You'll See

### 1. Home Page (Recipe Browser)
- **URL**: http://localhost:3000
- **Features**:
  - Date range picker (top)
  - Search bar
  - 4 meal type tabs (Breakfast, Lunch, Dinner, Snacks)
  - Recipe cards with servings control
  - "Add to Meal Plan" button (requires login)
  - "View Details" for ingredients and steps

### 2. Login Page
- **URL**: http://localhost:3000/login
- **Features**:
  - Google Sign-In button
  - Redirects to Google OAuth
  - Returns to home after successful login

### 3. Meal Plan Page (Protected)
- **URL**: http://localhost:3000/meal-plan
- **Features**:
  - Weekly calendar view (7 days)
  - Previous/Next week navigation
  - Meals grouped by type
  - Delete meal button
  - Total calories per day
  - Wake lock enabled

### 4. Shopping List (Protected)
- **URL**: http://localhost:3000/shopping
- **Features**:
  - Aggregated ingredients from meal plan
  - Grouped by 17 aisles (color-coded)
  - Checkboxes persist to localStorage
  - "Clear Checked" button
  - Wake lock enabled

### 5. Profile Page (Protected)
- **URL**: http://localhost:3000/profile
- **Features**:
  - User info display
  - Default servings setting
  - Save preferences button

## Bottom Navigation (Always Visible)

- **Recipes** - Browse and add recipes
- **Meal Plan** - View weekly calendar (login required)
- **Shopping** - See shopping list (login required)

## Key Features to Test

### FR-000: Global Date Range
1. Click date inputs at top of any page
2. Change dates
3. All views update automatically

### FR-001: Meal Type Tabs
1. On home page, click tabs
2. Only 4 tabs (no "All" tab)
3. Recipes filter by type

### FR-003: Collapsible Recipe Details
1. Click "View Details" on any recipe
2. See ingredients and steps
3. Click again to hide

### FR-004: Servings Control
1. Use +/- buttons on recipe card
2. Min: 1, Max: 10
3. Ingredients scale automatically in details

### FR-007: Day Assignment
1. Login first
2. Click "Add to Meal Plan" on a recipe
3. Click a day button (Mon-Sun)
4. Go to Meal Plan page to verify

### FR-012-017: Shopping List
1. Add recipes to meal plan
2. Go to Shopping page
3. See aggregated ingredients
4. Check items off
5. Refresh page - checkboxes persist

### FR-022: Wake Lock
1. Go to Meal Plan or Shopping page
2. Screen stays on (if supported)
3. Check console for "Wake Lock activated"

## Default Test Data

If your backend has seed data, you should see:
- Recipes in each meal type category
- User with email from Google account
- Empty meal plan (add recipes to populate)
- Empty shopping list (add meal plan to populate)

## Common Issues

### "Cannot GET /api/..."
- Backend not running
- Start backend on port 8080

### "Network Error"
- Check Vite proxy in vite.config.js
- Verify backend CORS settings

### OAuth Redirect Loop
- Google OAuth not configured
- Check backend application.yml

### Shopping List Empty
- Add recipes to meal plan first
- Check date range matches

### Wake Lock Not Working
- Only works in supported browsers
- Check browser console for support message

## File Structure

```
client/
├── public/
│   └── index.html              # HTML template
├── src/
│   ├── components/             # UI components
│   │   ├── auth/              # Authentication
│   │   ├── calendar/          # Calendar views
│   │   ├── common/            # Reusable UI
│   │   ├── layout/            # Layout structure
│   │   ├── recipes/           # Recipe components
│   │   └── shopping/          # Shopping list
│   ├── contexts/              # React contexts
│   │   ├── AuthContext.jsx    # User state
│   │   ├── DateRangeContext.jsx   # Date range
│   │   └── PlannerContext.jsx     # Meal plan
│   ├── hooks/                 # Custom hooks
│   ├── pages/                 # Route pages
│   ├── services/              # API calls
│   ├── styles/                # Global CSS
│   ├── utils/                 # Helper functions
│   ├── App.jsx                # Main app
│   └── main.jsx               # Entry point
├── index.html                 # Vite entry
├── package.json               # Dependencies
├── vite.config.js            # Vite config
└── README.md                  # Documentation
```

## Next Steps

1. **Test all features** - Use the checklist above
2. **Add recipes** - Use backend API or seed data
3. **Create meal plan** - Add recipes to calendar
4. **Generate shopping list** - View aggregated ingredients
5. **Customize** - Modify colors, layouts, features

## Building for Production

```bash
# Build optimized bundle
npm run build

# Preview production build
npm run preview
```

The `dist/` folder contains all static files ready for deployment.

## Need Help?

- Check **SETUP.md** for detailed setup instructions
- Review **PROJECT_SUMMARY.md** for complete documentation
- Check browser console for error messages
- Verify backend is running and accessible

## Development Tips

- **Hot Module Replacement** - Changes auto-reload
- **React DevTools** - Install browser extension
- **Network Tab** - Monitor API calls
- **Console** - Check for errors and logs
- **localStorage** - View shopping list state

## Key Keyboard Shortcuts

- `Ctrl+C` - Stop dev server
- `F12` - Open browser DevTools
- `Ctrl+Shift+R` - Hard refresh (clear cache)

## Testing Checklist

- [ ] Home page loads recipes
- [ ] Meal type tabs filter correctly
- [ ] Search finds recipes
- [ ] Login redirects to Google
- [ ] Login redirects back after auth
- [ ] Add recipe to meal plan works
- [ ] Calendar shows meals
- [ ] Delete meal works
- [ ] Shopping list aggregates ingredients
- [ ] Checkboxes persist after refresh
- [ ] Date range updates all views
- [ ] Logout clears session
- [ ] Protected routes redirect to login

Enjoy using FoodBytes!
