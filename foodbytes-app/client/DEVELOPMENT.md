# FoodBytes Client - Development Guide

## Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Open browser to http://localhost:3000
```

## Architecture Overview

### State Management

The application uses React Context API for global state management:

1. **AuthContext** - User authentication state
   - Current user information
   - Login/logout methods
   - Admin role checking

2. **PlannerContext** - Meal planning state
   - Meal plans array
   - CRUD operations for meal plans
   - Helper methods for date-based queries

### Data Flow

```
User Action → Component → Hook → Service → API → Backend
                ↓                                    ↓
            Context Update ←────────────────── Response
                ↓
           UI Re-render
```

### Cookie-Based Authentication

- All API requests use `withCredentials: true`
- JWT stored in httpOnly cookies (server-side)
- No localStorage usage for tokens
- Automatic session management

### Key Patterns

#### Protected Routes
```jsx
<ProtectedRoute>
  <YourComponent />
</ProtectedRoute>
```

#### Using Hooks
```jsx
const { user, login, logout, isAdmin } = useAuth();
const { mealPlans, addMealPlan, removeMealPlan } = useMealPlan();
const { recipes, loading, error } = useRecipes('breakfast');
```

#### API Calls
```jsx
import recipeService from '../services/recipeService';

const recipes = await recipeService.getAll();
const recipe = await recipeService.getById(1);
```

## Component Structure

### Common Components

**Button** - Reusable button with variants
```jsx
<Button variant="primary" size="medium" onClick={handleClick}>
  Click Me
</Button>
```

**Modal** - Dialog overlay
```jsx
<Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Title">
  <p>Modal content</p>
</Modal>
```

**Loading** - Loading spinner
```jsx
<Loading size="medium" fullScreen text="Loading..." />
```

### Layout Components

- **Header** - Top navigation with logo and user menu
- **Navigation** - Desktop horizontal navigation
- **MobileNav** - Bottom navigation for mobile devices

### Feature Components

All feature components follow this structure:
```
ComponentName/
├── ComponentName.jsx
└── ComponentName.css
```

## Styling Guide

### CSS Variables

All design tokens are defined in `src/styles/variables.css`:
- Colors: `--color-primary`, `--color-secondary`, etc.
- Spacing: `--spacing-sm`, `--spacing-md`, etc.
- Typography: `--font-size-base`, `--font-weight-medium`, etc.
- Aisle colors: `--aisle-produce`, `--aisle-dairy`, etc.

### Mobile-First

Always start with mobile styles, then add breakpoints:
```css
.component {
  /* Mobile styles (default) */
}

@media (min-width: 768px) {
  .component {
    /* Tablet styles */
  }
}

@media (min-width: 1024px) {
  .component {
    /* Desktop styles */
  }
}
```

### Touch Targets

All interactive elements must meet minimum touch target size:
```css
button {
  min-height: var(--touch-target-min); /* 44px */
  min-width: var(--touch-target-min);
}
```

## API Integration

### Service Layer

Each resource has its own service file:
- `authService.js` - Authentication
- `recipeService.js` - Recipe CRUD
- `mealPlanService.js` - Meal plan CRUD

### Error Handling

All API errors are caught and handled:
```jsx
try {
  const data = await recipeService.getAll();
  setRecipes(data);
} catch (error) {
  setError(error.message);
}
```

### 401 Handling

The axios interceptor automatically redirects to login on 401:
```javascript
// In api.js
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);
```

## Testing Checklist

### Before Committing

- [ ] No console errors in browser
- [ ] All routes accessible
- [ ] Mobile navigation works
- [ ] Touch targets are 44x44px minimum
- [ ] Loading states display correctly
- [ ] Error states display correctly
- [ ] Forms validate properly
- [ ] API calls use withCredentials
- [ ] Protected routes redirect to login

### Responsive Testing

Test on these viewports:
- [ ] Mobile: 375px width
- [ ] Tablet: 768px width
- [ ] Desktop: 1024px+ width

### Browser Testing

- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)

## Common Tasks

### Adding a New Page

1. Create page component in `src/pages/`
2. Add route in `src/App.jsx`
3. Add navigation link in `Navigation.jsx` and `MobileNav.jsx`

### Adding a New API Endpoint

1. Add method to appropriate service file
2. Use in component via hook or direct import
3. Handle loading and error states

### Adding a New Component

1. Create component directory in appropriate section
2. Create `.jsx` and `.css` files
3. Import and use in parent component

### Modifying Styles

1. Check if CSS variable exists in `variables.css`
2. Use existing variable if available
3. Create new variable if needed
4. Apply mobile-first approach

## Deployment

### Development Build
```bash
npm run dev
```

### Production Build
```bash
npm run build
```

### Docker Build
```bash
docker build -t foodbytes-client .
docker run -p 80:80 foodbytes-client
```

## Troubleshooting

### CORS Errors
- Check vite.config.js proxy settings
- Ensure backend allows credentials

### 401 Errors
- Check cookie is being sent (withCredentials: true)
- Verify backend session middleware

### Route Not Found
- Check BrowserRouter is wrapping App
- Verify route path in App.jsx

### Styles Not Loading
- Check CSS import in component
- Verify CSS file path
- Check CSS variable is defined

## Best Practices

1. **Always use hooks** - Don't call services directly in components
2. **Extract reusable logic** - Create custom hooks for complex logic
3. **Keep components small** - Single responsibility principle
4. **Use semantic HTML** - Proper heading hierarchy, ARIA labels
5. **Handle all states** - Loading, error, empty, success
6. **Mobile-first CSS** - Start with mobile, add desktop styles
7. **Use CSS variables** - Don't hardcode colors/spacing
8. **Type safety** - Add JSDoc comments for complex functions
9. **Accessibility** - Test with keyboard navigation
10. **Performance** - Lazy load components when possible

## Resources

- [React Documentation](https://react.dev)
- [React Router Documentation](https://reactrouter.com)
- [Vite Documentation](https://vitejs.dev)
- [Axios Documentation](https://axios-http.com)
- [date-fns Documentation](https://date-fns.org)
