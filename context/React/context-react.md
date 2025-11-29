# React Context
> Reference material for react-frontend-agent

## Technology Stack
- **Framework**: React 18+ (web, NOT React Native)
- **Build Tool**: Vite or Create React App
- **Styling**: CSS Modules / Styled Components / Tailwind CSS
- **State Management**: React Context + useReducer (or Redux Toolkit)
- **Routing**: React Router v6
- **HTTP Client**: Axios or Fetch API
- **Date Handling**: date-fns or Day.js

## IMPORTANT: Web Application, Not Mobile App
- DO NOT use React Native
- DO NOT use Expo
- DO NOT use native mobile components
- DO use responsive CSS for mobile support
- DO use mobile-first design principles

## Project Structure
```
src/
├── components/
│   ├── common/           # Reusable UI components
│   │   ├── Button.jsx
│   │   ├── Modal.jsx
│   │   ├── DatePicker.jsx
│   │   └── Loading.jsx
│   ├── recipes/          # Recipe-related components
│   │   ├── RecipeCard.jsx
│   │   ├── RecipeList.jsx
│   │   ├── RecipeDetail.jsx
│   │   ├── RecipeEditor.jsx   # Admin only
│   │   └── IngredientList.jsx
│   ├── calendar/         # Calendar/planner components
│   │   ├── Calendar.jsx
│   │   ├── CalendarDay.jsx
│   │   ├── WeekView.jsx
│   │   ├── MonthView.jsx
│   │   └── DateNavigator.jsx
│   ├── shopping/         # Shopping list components
│   │   ├── ShoppingList.jsx
│   │   ├── ShoppingItem.jsx
│   │   ├── DateRangePicker.jsx
│   │   └── AisleGroup.jsx
│   ├── auth/             # Authentication components
│   │   ├── LoginButton.jsx
│   │   ├── UserProfile.jsx
│   │   └── ProtectedRoute.jsx
│   └── layout/           # Layout components
│       ├── Header.jsx
│       ├── Footer.jsx
│       ├── Navigation.jsx
│       └── MobileNav.jsx
├── contexts/
│   ├── AuthContext.jsx
│   ├── PlannerContext.jsx
│   └── ThemeContext.jsx
├── hooks/
│   ├── useAuth.js
│   ├── useMealPlan.js
│   ├── useRecipes.js
│   └── useShoppingList.js
├── services/
│   ├── api.js            # Axios instance with interceptors
│   ├── authService.js
│   ├── recipeService.js
│   ├── mealPlanService.js
│   └── shoppingService.js
├── utils/
│   ├── dateUtils.js
│   ├── formatters.js
│   └── validators.js
├── styles/
│   ├── variables.css
│   ├── global.css
│   └── responsive.css
├── App.jsx
└── main.jsx
```

## Responsive Design

### Breakpoints
```css
/* Mobile-first approach */
/* Base styles for mobile (< 480px) */

/* Small tablets */
@media (min-width: 480px) { }

/* Tablets */
@media (min-width: 768px) { }

/* Desktop */
@media (min-width: 1024px) { }

/* Large desktop */
@media (min-width: 1280px) { }
```

### Mobile-First Principles
1. Design for mobile screens first
2. Add complexity as screen size increases
3. Touch-friendly tap targets (min 44x44px)
4. Thumb-accessible navigation (bottom nav on mobile)
5. Readable font sizes without zooming (16px+ base)
6. Avoid hover-only interactions

### Example Responsive Component
```jsx
// RecipeCard.jsx
import styles from './RecipeCard.module.css';

const RecipeCard = ({ recipe, onSelect, onAssign }) => {
  return (
    <article className={styles.card}>
      <header className={styles.header}>
        <h3 className={styles.title}>{recipe.name}</h3>
        <span className={styles.calories}>{recipe.calories} cal</span>
      </header>
      <div className={styles.actions}>
        <button className={styles.detailsBtn} onClick={() => onSelect(recipe)}>
          View Details
        </button>
        <button className={styles.assignBtn} onClick={() => onAssign(recipe)}>
          Add to Plan
        </button>
      </div>
    </article>
  );
};
```

```css
/* RecipeCard.module.css */
.card {
  padding: 1rem;
  border-radius: 8px;
  background: var(--card-bg);
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.actions {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.detailsBtn, .assignBtn {
  padding: 0.75rem 1rem;
  min-height: 44px; /* Touch-friendly */
}

@media (min-width: 480px) {
  .actions { flex-direction: row; }
}

@media (min-width: 768px) {
  .card { padding: 1.5rem; }
  .title { font-size: 1.25rem; }
}
```

## Calendar Component Pattern
```jsx
// Calendar.jsx - Date-based meal planning
import { useState } from 'react';
import { format, addWeeks, subWeeks, startOfWeek, addDays } from 'date-fns';

const Calendar = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState('week');

  const navigateWeek = (direction) => {
    setCurrentDate(prev =>
      direction === 'next' ? addWeeks(prev, 1) : subWeeks(prev, 1)
    );
  };

  const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  return (
    <div className="calendar">
      <nav className="calendar-nav">
        <button onClick={() => navigateWeek('prev')}>← Previous</button>
        <h2>{format(currentDate, 'MMMM yyyy')}</h2>
        <button onClick={() => navigateWeek('next')}>Next →</button>
      </nav>
      <div className="calendar-grid">
        {weekDays.map(date => (
          <CalendarDay
            key={date.toISOString()}
            date={date}
            isToday={format(date, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd')}
          />
        ))}
      </div>
    </div>
  );
};
```

## API Integration Pattern
```javascript
// services/api.js
import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' }
});

// Add JWT to requests
api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 errors
api.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
```

## Key Features

### 1. Date-Based Calendar
- Week and month views
- Navigate to past (6 months history) and future
- Assign recipes to specific dates
- Visual distinction for past/current/future

### 2. Shopping List with Date Range
- Date range picker (from/to)
- Quick presets (3, 7, 14 days)
- Aggregate ingredients within range
- Aisle grouping with color coding

### 3. User Authentication
- OAuth login buttons (Google/GitHub)
- Protected routes for authenticated features
- Guest mode for browsing

### 4. Admin Features (GOD Mode)
- Recipe editor (visible only to admins)
- Audit log viewer
- Conditional rendering based on isAdmin

## Accessibility Requirements
- Semantic HTML (header, nav, main, article, etc.)
- ARIA labels where needed
- Keyboard navigation support
- Focus management in modals
- Color contrast ratios (WCAG AA)
- Screen reader friendly

## Testing
- Unit tests: Jest + React Testing Library
- E2E tests: Cypress or Playwright
- Test responsive layouts at all breakpoints
