# FoodBytes Client

React 18 frontend application for FoodBytes meal planning system.

## Tech Stack

- **React 18** - UI framework
- **React Router v6** - Client-side routing
- **Axios** - HTTP client
- **date-fns** - Date manipulation
- **Vite** - Build tool and dev server

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

The application will be available at `http://localhost:3000`

### Build

```bash
npm run build
```

Build output will be in the `dist/` directory.

### Preview Production Build

```bash
npm run preview
```

## Project Structure

```
client/
├── public/              # Static assets
│   └── index.html      # HTML template
├── src/
│   ├── components/     # React components
│   │   ├── auth/       # Authentication components
│   │   ├── calendar/   # Calendar/planner components
│   │   ├── common/     # Reusable UI components
│   │   ├── layout/     # Layout components (header, nav)
│   │   ├── recipes/    # Recipe components
│   │   └── shopping/   # Shopping list components
│   ├── contexts/       # React contexts
│   │   ├── AuthContext.jsx
│   │   └── PlannerContext.jsx
│   ├── hooks/          # Custom React hooks
│   │   ├── useAuth.js
│   │   ├── useRecipes.js
│   │   ├── useMealPlan.js
│   │   └── useShoppingList.js
│   ├── pages/          # Page components
│   │   ├── LoginPage.jsx
│   │   ├── RecipesPage.jsx
│   │   ├── PlannerPage.jsx
│   │   ├── ShoppingPage.jsx
│   │   └── ProfilePage.jsx
│   ├── services/       # API services
│   │   ├── api.js
│   │   ├── authService.js
│   │   ├── recipeService.js
│   │   └── mealPlanService.js
│   ├── styles/         # Global styles
│   │   ├── variables.css
│   │   ├── global.css
│   │   └── responsive.css
│   ├── App.jsx         # Main App component
│   └── main.jsx        # Entry point
├── Dockerfile          # Multi-stage Docker build
├── nginx.conf          # Nginx configuration for production
├── vite.config.js      # Vite configuration
└── package.json        # Dependencies and scripts
```

## Features

### Authentication
- OAuth login (Google, GitHub)
- Cookie-based session management
- Protected routes

### Recipes
- Browse recipes by meal type
- Filter by breakfast, lunch, dinner, snacks
- Adjust serving sizes
- View detailed ingredients and instructions
- Admin: Toggle recipe visibility

### Meal Planner
- Weekly calendar view
- Add/remove meals by day
- Assign recipes to specific meal types
- Visual date navigation

### Shopping List
- Auto-aggregated from meal plan
- Grouped by grocery aisle
- Color-coded by aisle
- Check off items
- Date range selection (3/7/14 days)
- Copy to clipboard

### Design
- Mobile-first responsive design
- Touch-friendly (44x44px minimum targets)
- Bottom navigation on mobile
- Dark mode support (prefers-color-scheme)
- Accessible (ARIA labels, keyboard navigation)

## API Integration

All API calls use `withCredentials: true` for cookie-based authentication.

**Base URL:** `/api` (proxied to backend at `http://localhost:8080`)

### Endpoints

- `GET /api/auth/me` - Get current user
- `POST /api/auth/logout` - Logout
- `GET /api/recipes` - Get all recipes
- `GET /api/recipes/:id` - Get recipe by ID
- `GET /api/meal-plans` - Get meal plans by date range
- `POST /api/meal-plans` - Create meal plan
- `DELETE /api/meal-plans/:id` - Delete meal plan

## Docker

### Build Image

```bash
docker build -t foodbytes-client .
```

### Run Container

```bash
docker run -p 80:80 foodbytes-client
```

## Environment Variables

No environment variables required. API proxy is configured in `vite.config.js` for development and `nginx.conf` for production.

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## License

Proprietary - FoodBytes v8.1.2
