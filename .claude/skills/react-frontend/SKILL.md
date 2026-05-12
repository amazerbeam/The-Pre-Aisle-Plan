---
name: react-frontend
description: Apply FoodBytes React 18 + Vite + PWA frontend conventions for components, contexts, services, responsive CSS, cookie-based auth, and Progressive Web App behavior (manifest, service worker, offline, installability). Use when building or editing client/src components, wiring API calls via Axios, adding calendar/meal-plan/shopping-list features, designing mobile-first layouts, configuring PWA assets, or reviewing frontend PRs in the FoodBytes app.
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
- **PWA: `vite-plugin-pwa` with Workbox.** The app ships as an installable Progressive Web App — manifest, service worker, icons, and offline fallbacks are required. Treat any new frontend work as PWA-first: if a feature can't work offline, it must degrade gracefully (cached shell + clear offline UI), not white-screen.
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
4. **Mobile-first responsive CSS — PWA touch rules are non-negotiable.** Base styles target mobile; add `@media (min-width: 480px / 768px / 1024px / 1280px)` for larger.
   - **Every interactive element ≥44×44px.** Use `min-width: 44px; min-height: 44px;` on buttons, icon triggers, and clickable text affordances. Tight visual designs (e.g. a 32px icon) keep the 32px visual but expand the hit area to 44px via padding or a wrapper.
   - **Never rely on `:hover` alone for state.** Wrap hover styles in `@media (hover: hover)` so touch devices don't inherit sticky hover. Pair every hover with an `:active` (and `[aria-expanded]` / `[aria-pressed]` where applicable) so touch users get the same affordance.
   - Use `:focus-visible` (not bare `:focus`) for keyboard outlines so they don't appear on touch taps.
   - Add `touch-action: manipulation` and `-webkit-tap-highlight-color: transparent` on interactive elements to kill the 300ms tap delay and the grey iOS flash inside the installed PWA.
   - Known violations to look for and fix when nearby (do not leave them once you've touched the file): `meal-plan-menu-trigger` (was 32×32, hover-only), `day-calories` / `day-calories-clickable` (was 4×8 padding on 13px text — well under 44px). Both have been corrected; use them as the reference pattern.
5. **Accessibility is non-optional.** Semantic HTML (`header`, `nav`, `main`, `article`), ARIA labels on icon-only buttons, keyboard navigation, focus management in modals, WCAG AA contrast.
6. **Admin features render conditionally on `isAdmin`** — never via a separate route guard alone.
7. **PWA-first.** Every frontend change must keep the app installable and offline-resilient:
   - `vite-plugin-pwa` is the source of truth for the service worker and manifest — configured in `vite.config.js`. Don't hand-roll a `sw.js` or register a service worker manually in `main.jsx`; let the plugin's `registerType: 'autoUpdate'` handle it, with a `<UpdatePrompt />` UI for new-version refresh.
   - **Manifest** (`vite.config.js` → `VitePWA({ manifest })`): `name: 'FoodBytes'`, `short_name: 'FoodBytes'`, `display: 'standalone'`, `theme_color` matches the current brand color, `start_url: '/'`, `scope: '/'`, icons at 192/512 (plus a `maskable` 512). Icons live in `client/public/icons/`.
   - **Caching strategy** (Workbox via the plugin):
     - App shell (HTML/JS/CSS/fonts/icons) → `precache` via `workbox.globPatterns`.
     - `/api/recipes`, `/api/recipe-families`, `/api/ingredients`, `/api/units`, `/api/aisles` → `NetworkFirst` with a ~7-day cache, so the meal-plan/recipe browsing keeps working offline.
     - `/api/meal-plans`, `/api/shopping-list` (user-mutable state) → `NetworkOnly` (or `NetworkFirst` with a very short TTL) — never serve stale meal-plan data as if it were live.
     - `/api/auth/*`, `/oauth2/*`, `/login/*` → **never cache**. Add to `navigateFallbackDenylist` so the SW does not intercept the OAuth redirect dance.
   - **Offline UX**: show an offline banner via an `online`/`offline` event listener (a hook like `useOnlineStatus` belongs in `hooks/`). Mutations attempted offline must surface a clear "you're offline — change not saved" toast, not silently fail. Don't build a background-sync queue unless the user explicitly asks.
   - **Install prompt**: capture `beforeinstallprompt` in a context (or extend `AuthContext`) and expose a "Install app" affordance in the layout for eligible browsers. Hide it on iOS Safari (no event) — use an Apple-touch-icon + a one-time hint instead.
   - **iOS niceties**: `<link rel="apple-touch-icon">`, `apple-mobile-web-app-capable`, `apple-mobile-web-app-status-bar-style` meta tags in `index.html`. Test installability via Chrome DevTools → Application → Manifest.
   - **Auth + PWA gotcha**: the JWT lives in an httpOnly cookie. Standalone-mode iOS occasionally drops third-party-style cookies — keep all auth requests same-origin (which the Vite proxy / Railway reverse proxy already enforce). Don't introduce a cross-origin API call from the PWA.
   - **Versioning**: bump `package.json` version when shipping a SW change so the `autoUpdate` flow registers a new precache.
8. **Recipe data quirks the UI must respect:**
   - `recipes.calories` is **whole-recipe kcal**, not per-serving. Render per-serving as `calories / default_servings`.
   - Linked-recipe extras (`linked_recipe_id`) contribute to macros — don't display a recipe's nutrition by summing only direct ingredients.
   - Variants (Light / Moderate / Balanced) come from `RecipeFamily`; default render is **Moderate**.

## PWA setup (bootstrap once, then maintain)

If `vite-plugin-pwa` isn't yet wired in (`Grep "vite-plugin-pwa" client/package.json` → no hits), set it up before shipping the feature:

1. `npm install -D vite-plugin-pwa` in `foodbytes-app/client/`.
2. `vite.config.js` → import `VitePWA` and add to `plugins` with `registerType: 'autoUpdate'`, the manifest above, and Workbox `runtimeCaching` rules per the strategy in point 7.
3. `client/public/icons/icon-192.png`, `icon-512.png`, `icon-maskable-512.png` — placeholders are acceptable if real artwork isn't ready; flag this in the summary.
4. `index.html` → add the Apple meta tags and `<link rel="manifest">` (the plugin injects manifest, but Apple tags are manual).
5. `main.jsx` → import `virtual:pwa-register` and wire an `UpdatePrompt` component (toast: "New version available — reload?").
6. Add `useOnlineStatus` hook and an offline banner mounted in `App.jsx`.

After bootstrap, the rule is simply: don't regress any of the above when adding features.

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
- PWA stays green: `vite-plugin-pwa` is configured (`Grep "VitePWA" client/vite.config.js` → 1 hit), manifest lists 192 + 512 + maskable icons, OAuth paths are in `navigateFallbackDenylist`, user-mutable `/api/meal-plans` and `/api/shopping-list` are NOT cached as `CacheFirst`/`StaleWhileRevalidate`, and a Lighthouse PWA audit on the built app would still report installable.
