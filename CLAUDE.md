# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Shared rules — always consult

Project-wide rules live at `.claude/rules/`. Before acting on any task that touches recipes, ingredients, macros, meal plans, migrations, or other project data, scan that folder and Read any rule file whose topic matches the task. These rules apply whether or not a skill has been triggered. See `.claude/rules/README.md` for the index and convention.

## Repository Layout

This repo contains the **FoodBytes** recipe / meal-planning app. The active project lives in `foodbytes-app/`. Top-level files outside that directory (`Legacy/`, `Recipes_Transfer/`, `mockups/`, `logo-options.html`, `mockup-copy-week.html`) are historical artifacts — do not touch unless explicitly asked.

```
foodbytes-app/
  client/          React 18 + Vite frontend
  foodbytes-api/   Spring Boot 3.2 / Java 17 backend
  database/        MySQL schema + migrations (canonical SQL lives here, but is also tracked in the deployed Railway DB)
  docker-compose.yml
Claude/agents/     Per-domain agent prompts + context (Chef, React, Java, MySQL, UX, etc.)
docker-compose.yml (root) — preferred compose file; mounts foodbytes-app/database/*.sql
```

There are **two `docker-compose.yml` files**: the root one (used by `cmds.txt`) and one inside `foodbytes-app/`. They are similar but not identical (service names differ: root uses `client`/`api`/`db`; nested uses `frontend`/`backend`/`mysql`). When running `docker-compose` commands check which compose file the user means — most active commands use the **root** compose file.

## Common Commands

Run from the repo root unless noted.

```bash
# Frontend dev (hot reload, proxies /api, /oauth2, /login to :8080)
cd foodbytes-app/client && npm install && npm run dev      # http://localhost:5173

# Frontend production build
cd foodbytes-app/client && npm run build

# Backend dev (Maven wrapper isn't checked in — use `mvn` directly or rebuild via Docker)
cd foodbytes-app/foodbytes-api && mvn spring-boot:run      # http://localhost:8080

# Backend tests
cd foodbytes-app/foodbytes-api && mvn test
# Single test class:
cd foodbytes-app/foodbytes-api && mvn test -Dtest=ClassName
# Single method:
cd foodbytes-app/foodbytes-api && mvn test -Dtest=ClassName#methodName

# Full stack via Docker (root compose — frontend on :3000, api on :8080, mysql on :3306)
docker-compose up --build

# Rebuild just the frontend container (per cmds.txt)
docker-compose -f foodbytes-app/docker-compose.yml up -d --build frontend
```

There is no lint or test script wired into `client/package.json` — the frontend has no automated test suite at present.

## Architecture

### Stack
- **Frontend**: React 18 + Vite + React Router v6, Axios. No CSS framework — plain CSS in `src/styles/`.
- **Backend**: Spring Boot 3.2, Spring Security + OAuth2 client (Google), Spring Data JPA, JJWT, springdoc OpenAPI.
- **DB**: MySQL 8. Hibernate `ddl-auto: validate` — schema is **not** auto-managed; SQL migrations are applied manually.
- **Auth**: Google OAuth → backend issues a JWT delivered as an httpOnly cookie. Frontend uses `withCredentials: true` and never sees the JWT directly. Guest mode is a localStorage flag handled entirely client-side.

### Frontend structure (`client/src/`)
- `App.jsx` is the root: it gates on auth (`useAuth`) and shows either `LandingPageAnimation` (first-time guests) or the routed app (`/`, `/search`, `/mealplan`, `/shopping`).
- **Contexts** are the source of truth for cross-cutting state: `AuthContext`, `MealPlanContext`, `ShoppingListContext`, `HomemadeSelectionsContext`. Components subscribe rather than fetching directly.
- **Services** (`services/api.js` + per-domain modules) wrap Axios. `api.js` sets `baseURL: '/api'` and `withCredentials: true`; Vite proxies `/api`, `/oauth2`, `/login` → `:8080` in dev.
- Components are grouped by feature: `auth/`, `mealplan/`, `recipes/`, `shopping/`, `onboarding/`, `admin/`, plus `common/` and `layout/`.

### Backend structure (`foodbytes-api/src/main/java/com/foodbytes/`)
Standard layered Spring layout: `controller/` → `service/` → `repository/` → `model/` (JPA entities). `security/` holds the OAuth2 success/failure handlers, JWT filter/provider, and `UserPrincipal`. `config/SecurityConfig.java` wires everything.

Key domain entities: `Recipe`, `RecipeIngredient`, `RecipeStep`, `RecipeExtra`, `RecipeFamily` (variants like Light/Moderate/Balanced), `MealPlanEntry`, `ShoppingList`/`ShoppingListItem`, `Ingredient`, `Aisle`, `Unit`, `User`. Controllers expose `/api/auth`, `/api/recipes`, `/api/recipe-families`, `/api/meal-plans`, `/api/shopping-list`, `/api/ingredients`, `/api/units`, `/api/aisles`, `/api/health`.

### Recipe modeling — important quirks
- **Linked recipes (extras):** `recipe_ingredients` rows can reference either an `ingredient_id` OR a `linked_recipe_id` (e.g. a recipe pulls in "Bread" or "Pizza Dough" as an extra). Any nutrition/calorie computation MUST include both: raw ingredients **plus** the prorated contribution of linked recipes. Stored calorie totals on the `recipes` table have historically been wrong — re-derive from ingredients + extras rather than trusting the stored value.
- **`recipes.calories` is whole-recipe kcal, NOT per-serving.** The frontend renders per-serving as `calories / default_servings`. When inserting a recipe, store `kcal_per_serving × default_servings` in this column. Storing per-serving instead causes the UI to display half the real kcal and macro percentages to overflow 100 % on the weekly summary (caught 2026-05-08 on recipes 187–201). Audit query: `SELECT id, name, calories, ROUND((SUM(quantity_grams×macro/100)*4 ...)) AS computed FROM ... HAVING calories/computed < 0.7` — anything ≈ 0.5 is the per-srv bug.
- **Recipe variants (FR-099):** A `RecipeFamily` groups Light / Moderate / Balanced versions of the same dish. Default rendering is the Balanced variant.
- **Meal plan sharing:** `users.meal_plan_owner_id` — when set, a user reads/writes the owner's meal plan entries instead of their own. Toggled via a direct DB update; there is no admin UI.
- **Persisted shopping list:** `shopping_lists` + `shopping_list_items`. One list per user; checked state is persisted with optimistic UI updates via `/api/shopping-list/*`.

### Recipe creation — non-negotiable targets
When adding or modifying a recipe, every variant must satisfy:

| Check | Target | Reject if |
|---|---|---|
| Calories — Light | 450–550/serving | >600 |
| Calories — Moderate | 550–650/serving | >750 |
| Calories — Balanced | 700–800/serving | >900 |
| Protein | ≥35 g/serving | <35 |
| Fat % of kcal | 25–35 % | >35 |
| Carbs % of kcal | 40–50 % | <38 (1–2% slack OK) |

Common levers: air-fry instead of pan-fry, sub egg whites for whole eggs, add a starch (toast/potato/rice) for carbs, scale lean protein. If a recipe fails, redesign — don't ship it with caveats. Verify macros for the **whole recipe including linked-recipe extras**, not just direct ingredients.

### User health/diet preferences (relevant to recipe work)
- Prefers clean ingredients (e.g. pure tamarind block over jarred paste with stabilizers). Quality fats: butter, olive oil, ghee — not seed-oil blends.
- Asia Market (asiamarket.ie) for Asian ingredients; Tesco Ireland for everyday.

Personal diet/weight files live in `Claude/agents/Chef/` (`my-diet-plan.md`, `wife-diet-plan.md`, `weight-progress-chart.html`) — read these before discussing weight progress.

## Database & Deployment

- Production frontend, backend, and MySQL all run on **Railway**. Backend redeploys on git push.
- DB schema is in `foodbytes-app/database/schema.sql`; ad-hoc changes go into `foodbytes-app/database/migrations/` and must be **applied manually** to the Railway MySQL (Hibernate is in `validate` mode, so a migration that isn't applied to the live DB will break startup).
- After a schema change, the backend may need a manual redeploy on Railway.
- OAuth redirect URIs are environment-specific (`OAUTH_REDIRECT_URI` env var). Login flakiness has historically been fixable by refreshing `GOOGLE_CLIENT_SECRET`.

## Conventions

- Frontend state for cross-cutting concerns lives in a Context — don't introduce a new global store.
- Backend controllers stay thin; business logic in `service/`. Don't put queries in controllers.
- New endpoints live under `/api/...` so the Vite proxy and Axios base URL keep working.
- The `Claude/agents/` directory contains domain-specific agent prompts and notes. Treat it as reference material, not code — don't refactor it.
