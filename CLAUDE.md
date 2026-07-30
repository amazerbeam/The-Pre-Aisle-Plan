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
- **Linked recipes (extras):** `recipe_ingredients` rows can reference an `ingredient_id`, a `linked_recipe_id`, or **both** (FR-103 dual-path: homemade link plus a store-bought fallback). Any nutrition computation MUST include raw ingredients **plus** the prorated contribution of linked recipes (`quantity_grams / linked_total_yield`). **Nutrition — kcal and macros alike — always comes from the homemade linked recipe, never from the store-bought ingredient**, even when the user has selected store-bought. `MacroCalculationService` enforces this by testing `isLinkedRecipe()` before `isRawIngredient()`; `MacroCalculationServiceTest` pins it. The store-bought path exists for the shopping list only (`HomemadeSelectionsContext`, localStorage). A store-bought ingredient whose per-100g macros diverge from its homemade counterpart is therefore not a nutrition bug — but a store-bought row naming the wrong *product* is a shopping-list bug.
- **`recipes.calories` is whole-recipe kcal, NOT per-serving — and is no longer the display source.** As of 2026-07-30 the backend derives calories from ingredients + prorated homemade extras via `MacroCalculationService.calculateRecipeTotalCalories` / `calculateCaloriesPerServing` (Atwater: 4P + 4C + 9F on unrounded totals, mirroring `client/src/constants/macroTargets.js` → `KCAL_PER_GRAM`). `RecipeDTO.calories` and `RecipeSummaryDTO.calories` still carry **whole-recipe** kcal because the frontend renders per-serving as `calories / default_servings` — do not change that unit. The stored column survives as the admin-editable value (`RecipeAdminDTO.calories` is the one place that still reads it) and as an audit reference. When inserting a recipe still store `kcal_per_serving × default_servings`, and compute it on the **homemade** basis: an audit on 2026-07-30 found 20 of the 48 recipes with extras had this column entered on the store-bought basis, which is what made the recipe card and the macro traffic-light disagree (Greek Chicken Gyros showed 650 kcal beside badges computed against 765). Nothing yet guards the column at write time, so it can still drift — the derived display is what users see. Full evidence: `.claude/contract/2026-07-30-linked-extras-macro-kcal-audit/findings.md`.
  - **A separate, still-live failure mode on the same column: per-serving stored instead of whole-recipe.** `RecipeAdminDTO.calories` round-trips through hand-entry via `createRecipe`/`updateRecipe`, so an admin can still enter the per-serving figure by mistake, which halves the displayed calories and pushes macro percentages over 100% on the weekly summary (caught 2026-05-08 on recipes 187–201). This is distinct from the store-bought-basis bug above — audit for it separately: `SELECT id, name, calories, ROUND((SUM(quantity_grams×macro/100)*4 ...)) AS computed FROM ... HAVING calories/computed < 0.7` — anything ≈ 0.5 is the per-srv bug.
- **Recipe variants (FR-099):** A `RecipeFamily` groups Light / Moderate / Balanced versions of the same dish. Default rendering is the **Moderate** variant (`is_default = 1` on Moderate only) — see `.claude/rules/recipe-variants.md`.
- **Meal plan sharing:** `users.meal_plan_owner_id` — when set, a user reads/writes the owner's meal plan entries instead of their own. Toggled via a direct DB update; there is no admin UI.
- **Persisted shopping list:** `shopping_lists` + `shopping_list_items`. One list per user; checked state is persisted with optimistic UI updates via `/api/shopping-list/*`.

### Recipe creation — non-negotiable targets
When adding or modifying a recipe, every variant must satisfy:

| Check | Target | Reject if |
|---|---|---|
| Calories — Light | 450–550/serving | — |
| Calories — Moderate | 550–650/serving | — |
| Calories — Balanced | 700–800/serving | — |
| Protein | ≥35 g/serving | <35 |
| Fat % of kcal | 25–35 % | >35 |
| Carbs % of kcal | 40–50 % | <38 (1–2% slack OK) |

> **Calories are a target, not a reject condition.** A variant outside its kcal band does not fail an audit and does not block `macros_audited`. Protein, fat % and carbs % rejects below still apply in full. See `.claude/rules/recipe-variants.md` → "Calories are a target, not a reject condition (audit policy, 2026-07-30)".

Common levers: air-fry instead of pan-fry, sub egg whites for whole eggs, add a starch (toast/potato/rice) for carbs, scale lean protein. If a recipe fails, redesign — don't ship it with caveats. Verify macros for the **whole recipe including linked-recipe extras**, not just direct ingredients.

**Provenance (verified 2026-05-12):**
- **Protein ≥35 g/serving** — USDA 2025–2030 (1.2–1.6 g/kg/day → 32–43 g across 3 meals for an 80 kg adult) + Moore/Morton MPS literature (20–40 g/meal sweet spot).
- **Fat 25–35 % of kcal** — Upper half of USDA AMDR (20–35 %).
- **Carbs 40–50 % of kcal** — **Intentionally below USDA AMDR floor (45–65 %)** to favour protein on a deficit; not formal AMDR compliance.
- **Per-serving kcal bands (450–550 / 550–650 / 700–800)** — Project-internal calibration; 3 × Moderate ≈ 1650–1950 kcal/day, consistent with NHLBI 500–1000 kcal/day deficit guidance.
- **Former reject thresholds (Light: above 600, Moderate: above 750, Balanced: above 900)** — Project-internal; meal-plan ceiling so a single recipe can't blow the daily budget when stacked with two others. No external source. **Superseded 2026-07-30:** kcal is now a target, not a reject — see `.claude/rules/recipe-variants.md` → "Calories are a target, not a reject condition (audit policy, 2026-07-30)".
- **Daily kcal floor (men <1500, women <1200)** — Verbatim from NIH/NHLBI obesity-treatment guidelines.

### User health/diet preferences (relevant to recipe work)
- Prefers clean ingredients (e.g. pure tamarind block over jarred paste with stabilizers). Quality fats: butter, olive oil, ghee — not seed-oil blends.
- Asia Market (asiamarket.ie) for Asian ingredients; Tesco Ireland for everyday.



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
