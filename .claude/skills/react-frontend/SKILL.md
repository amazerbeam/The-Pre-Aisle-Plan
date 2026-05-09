---
name: react-frontend
description: Apply FoodBytes React 18 + Vite frontend conventions for components, contexts, services, responsive CSS, and cookie-based auth. Use when building or editing client/src components, wiring API calls via Axios, adding calendar/meal-plan/shopping-list features, designing mobile-first layouts, or reviewing frontend PRs in the FoodBytes app.
allowed-tools: Read, Grep, Glob, Write, Edit
metadata:
  type: reference
---

# React Frontend (FoodBytes)

Conventions for the FoodBytes web client (`foodbytes-app/client/`). Read this before writing or editing anything under `client/src/`.

## Use when

- Adding or editing components, hooks, contexts, or services in `client/src/`.
- Wiring a new `/api/...` call from the frontend.
- Building calendar, meal-plan, shopping-list, recipe, or auth UI.
- Reviewing responsive/accessibility behavior on a frontend change.

## Do not use when

- Backend (`foodbytes-api/`), SQL migrations, or recipe macro/data work — those have their own owners.
- Changes outside `foodbytes-app/client/`.

## Stack (authoritative — match what's in the repo)

- React 18 + Vite + React Router v6, Axios, date-fns.
- **Styling: plain CSS in `src/styles/` and per-component CSS files.** The repo does **not** use CSS Modules despite older agent notes — follow the existing pattern in neighboring components, don't introduce `*.module.css`.
- State: React Context + hooks. Existing contexts: `AuthContext`, `MealPlanContext`, `ShoppingListContext`, `HomemadeSelectionsContext`. Don't add a new global store — extend a context.
- No test runner is wired into `client/package.json`; do not claim a test passed unless you actually ran something.

## Project layout

```
client/src/
  components/   auth/  mealplan/  recipes/  shopping/  onboarding/  admin/  common/  layout/
  contexts/     AuthContext, MealPlanContext, ShoppingListContext, HomemadeSelectionsContext
  hooks/        useAuth, useMealPlan, useRecipes, useShoppingList
  services/     api.js (Axios) + per-domain modules
  styles/       global CSS
  App.jsx       gates on auth → LandingPageAnimation or routed app
```

Routes: `/`, `/search`, `/mealplan`, `/shopping`. New top-level routes are rare — prefer extending existing screens.

## Approach

1. **Read first, write second.** Before touching a feature, Read the relevant context (e.g. `MealPlanContext.jsx`) and the most-similar existing component. Match its patterns — file naming, prop shape, CSS approach, error handling. Don't import an unfamiliar library when the codebase already uses one.
2. **Cross-cutting state goes in a Context, not props drilled down.** If state is already in a context, subscribe via the existing hook (`useMealPlan`, etc.) — don't refetch from the API in the component.
3. **API calls go through `services/api.js`.** Base URL is `/api`, `withCredentials: true`. Vite proxies `/api`, `/oauth2`, `/login` → `:8080` in dev. Never hardcode `http://localhost:8080`. Never read or set the JWT manually — auth is httpOnly-cookie based; the 401 interceptor handles redirects.
4. **Mobile-first responsive CSS.** Base styles target mobile; add `@media (min-width: 480px / 768px / 1024px / 1280px)` for larger. Touch targets ≥44px. Avoid hover-only interactions.
5. **Accessibility is non-optional.** Semantic HTML (`header`, `nav`, `main`, `article`), ARIA labels on icon-only buttons, keyboard navigation, focus management in modals, WCAG AA contrast.
6. **Admin features render conditionally on `isAdmin`** — never via a separate route guard alone.
7. **Recipe data quirks the UI must respect:**
   - `recipes.calories` is **whole-recipe kcal**, not per-serving. Render per-serving as `calories / default_servings`.
   - Linked-recipe extras (`linked_recipe_id`) contribute to macros — don't display a recipe's nutrition by summing only direct ingredients.
   - Variants (Light / Moderate / Balanced) come from `RecipeFamily`; default render is **Moderate**.

## Output

When implementing a frontend change, deliver:

- The component/hook/service edit, matching neighboring file conventions.
- Any context update if state is cross-cutting.
- Plain CSS following the existing per-component pattern.
- A note in your end-of-turn summary covering: what changed, what you verified manually (or that you couldn't verify because there's no test runner / no dev server running), and any responsive/a11y considerations skipped.

## Shared rules (read on demand)

Project-wide rules live at `.claude/rules/`. Before answering, scan `.claude/rules/` (Glob `.claude/rules/*.md`) and Read any file whose topic matches the decision — including rules added after this skill was written. See `.claude/rules/README.md` for the index.

Especially relevant when frontend work touches recipe display:
- `.claude/rules/linked-recipe-extras.md` — macro calculation must include linked recipes.
- `.claude/rules/recipe-variants.md` — Light/Moderate/Balanced semantics; default is Moderate.

## Success criteria

- Edit lives under `foodbytes-app/client/src/` and matches neighboring file structure (`Glob client/src/**/<area>/*.jsx`).
- API calls go through `services/api.js`; no direct `axios.create` elsewhere, no hardcoded backend URL (`Grep -n "localhost:8080" client/src` → no new hits).
- No new `*.module.css` files introduced (`Glob client/src/**/*.module.css` → list unchanged).
- Cross-cutting state read from an existing context via its hook, not refetched.
- Recipe kcal rendered as `calories / default_servings`, not raw `calories`.
- Mobile-first CSS with ≥44px touch targets; semantic HTML and ARIA on interactive elements.
