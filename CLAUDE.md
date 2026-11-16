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
  mockup/          Interactive HTML mockups of the client UI — must match the live app (see "Mockups")
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

# Backend dev (Maven wrapper isn't checked in — use `mvn` directly or rebuild via Docker).
# For Google login to work locally see "Running the backend locally with Google login" below.
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

### Running the backend locally with Google login

A bare `mvn spring-boot:run` does **not** read `.env`, so Google OAuth gets the `application.yml` placeholders and login breaks. `java` and `mvn` are also not on PATH. To get a working local login against the Vite dev server, start the backend from the repo root in PowerShell like this:

```powershell
Get-Content .env | Where-Object { $_ -match '^\s*([A-Z_]+)=(.*)$' } | ForEach-Object { Set-Item "env:$($Matches[1])" $Matches[2].Trim() }
$env:FRONTEND_URL = "http://localhost:5173"   # post-login redirect; default is :3000 (the Docker frontend)
$env:JAVA_HOME = "C:\Program Files\Eclipse Adoptium\jdk-17.0.20.8-hotspot"
$env:PATH = "$env:JAVA_HOME\bin;C:\Users\jossd\tools\apache-maven-3.9.9\bin;$env:PATH"
cd foodbytes-app\foodbytes-api; mvn spring-boot:run
```

**Pet free mode (testing).** Add `$env:PET_FREE_MODE = "true"` before `mvn spring-boot:run` to unlock Pip's whole room shop for every user on that backend: every decor item and wall/floor style is owned, station upgrades cost nothing, and the Upgrades tab shows level chips that set any station to any level 1–4 (`PUT /api/pet/stations/{station}/level`, which returns 403 when free mode is off). The room shows a 🧪 Free mode badge, and the backend logs a WARN at startup. Nothing is recorded as bought and no sprinkles move, but the placements and levels you set are real rows in the local DB. It's off unless the env var is set, so **never set it on Railway**. Use it to test room art and layout at every level (MPP-40 and later room work).

What each failure looks like:
- **"Access blocked: Authorization Error … The OAuth client was not found (401 invalid_client)"**: `GOOGLE_CLIENT_ID` was not loaded, so `.env` was skipped.
- **Google sign-in completes, then the browser lands on a dead `localhost:3000`**: `FRONTEND_URL` was not set to `http://localhost:5173`. The JWT cookie is for `localhost` on any port, so once the redirect goes to :5173 you are logged in.
- **`[invalid_request]` in the backend log after a restart**: that is a stale callback from a login started before the restart. Start the login again.

## Architecture

### Stack
- **Frontend**: React 18 + Vite + React Router v6, Axios. No CSS framework — plain CSS in `src/styles/`.
- **Backend**: Spring Boot 3.2, Spring Security + OAuth2 client (Google), Spring Data JPA, JJWT, springdoc OpenAPI.
- **DB**: MySQL 8. Hibernate `ddl-auto: validate` — schema is **not** auto-managed; SQL migrations are applied manually.
- **Auth**: Google OAuth → backend issues a JWT delivered as an httpOnly cookie. Frontend uses `withCredentials: true` and never sees the JWT directly. Guest mode is a localStorage flag handled entirely client-side.

### Frontend structure (`client/src/`)
- `App.jsx` is the root: it gates on auth (`useAuth`) and shows either `LandingPageAnimation` (first-time guests) or the routed app (`/`, `/mealplan`, `/pet`, `/shopping`).
- **Contexts** are the source of truth for cross-cutting state: `AuthContext`, `MealPlanContext`, `ShoppingListContext`, `HomemadeSelectionsContext`. Components subscribe rather than fetching directly.
- **Services** (`services/api.js` + per-domain modules) wrap Axios. `api.js` sets `baseURL: '/api'` and `withCredentials: true`; Vite proxies `/api`, `/oauth2`, `/login` → `:8080` in dev.
- Components are grouped by feature: `auth/`, `mealplan/`, `recipes/`, `shopping/`, `onboarding/`, `admin/`, plus `common/` and `layout/`.

### Themes — the client has several

The client is **multi-theme**. Treat every UI change as a change to *all* themes, not to one look. Themes today: **Default** (the original purple *My Pantry Plan* look, the fallback) and **Cyberpunk** (*FOODBYTES · Night Kitchen*, pixel/neon) and **Parchment** (*The Kitchen Grimoire*: parchment, ink, wax and leather, a generic period look with no franchise marks). More will be added. Cyberpunk shipped by contract `.claude/contract/2026-11-14-cyberpunk-reskin/` (v1.31.0); Parchment by `.claude/contract/2026-11-15-parchment-theme/`.

**File layout** (`client/src/styles/themes/`):
- `default.css` — every token on `:root` (~190, grouped by area, including role tokens added by the sweep). The Default look and the fallback for every other theme.
- `<id>.css` (`cyberpunk.css`) — reassigns tokens under `:root[data-theme="<id>"]`: palette, card stops, fonts, glow, remaps, the `body.lowfx` block.
- `parchment.css` and `parchment/` — Parchment's token block and override bundle (the same six area files as Cyberpunk, without `hud.css`).
- `<id>/` (`cyberpunk/index.css` importing `shell.css`, `recipes.css`, `mealplan.css`, `recipe-view.css`, `shopping.css`, `dialogs.css`) — theme-only looks that tokens can't express. `main.jsx` imports it right after `App`, so it loads after the component CSS and wins ties.
- `previews.css` — `.theme-preview--<id>` tile art for the picker.

**Runtime pieces:**
- `constants/themes.js` — the `THEMES` registry. Fields: `id`, `label`, `themeColor`, `fontsHref` (lazy web fonts, or `null`), `iconSet` (`line` | `pixel` | `engraved`), `effects`, `ticker`, `ambient` (class of the fixed effect layer `App.jsx` renders: `'city-rain'`, `'candlelight'` or `null`), `copy` (`{ nav: {recipes, mealplan, shopping}, pages: {recipes|mealplan|shopping: {title, sub}} }`, read through `utils/themeCopy.js`; themes without it keep the plain strings), `brand { name, wordmark { before, accent, after, accentClass }, sub, loginTitle, loginSub }`. Also `THEME_STORAGE_KEY` (`fb.display.theme`), `LOW_FX_STORAGE_KEY` (`fb.display.lowFx`), `LOW_FX_BODY_CLASS` (`lowfx`), `DEFAULT_THEME_ID`, `themeById`.
- `contexts/ThemeContext.jsx` — `ThemeProvider` / `useTheme()` (`themeId`, `theme`, `setTheme`, `lowFx`, `toggleLowFx`); applies via `utils/theme.js` (`data-theme` on `<html>`, `theme-color` meta, font stylesheet) and `utils/lowFx.js` (`body.lowfx`).
- `index.html` inline boot script sets `data-theme` and `theme-color` before first paint (no flash). Its `ids` list must match the registry.
- UI: `layout/UserMenu` (avatar menu: servings, meal times, `ThemePicker`, `LowFxControl`, version, sign out), `HeaderBrand`, `Ticker`, `common/PixelIcon` + `constants/pixelIcons.js`, `PixelBrandMark`.

**Rules (binding):**
- **Colours live only in `client/src/styles/themes/`.** Component CSS reads tokens and never contains a literal colour (black shadows excepted). Pip's room (`components/pet/`) is the other exception, see below.
- **Default must not drift.** A new token's Default value is the exact literal it replaced (the sweep moved values, it did not retune them). Changing the Default look is its own decision, never a side effect of theme work.
- **Every selector in `styles/themes/<id>/` is prefixed `:root[data-theme="<id>"]`.** The one deliberate exception: base element defaults in `shell.css` use `:where(:root[data-theme="cyberpunk"])` (zero specificity) so component CSS can still override them. Component CSS stays theme-agnostic.
- **Theme-specific markup** (brand, icon set, ticker, effects) branches on fields of the `THEMES` registry via `useTheme()`, never on a theme id string.
- **Choice is per device** (`fb.display.theme`). **Low FX** (`fb.display.lowFx`, `body.lowfx`) only affects themes with `effects`: it stops theme animations (rain, flicker, ticker) and glow, not functional spinners. Reduced motion is honoured in every theme.
- **Static brand assets stay on Default**: favicon, PWA icons, manifest name/colours, `index.html` title, and the login dialog's plate-P mark. Only `theme-color` follows the theme at runtime.
- **Pip's room art keeps its own palette in every theme** (room SVG, Fridge interior, Trophy cabinet scene, head bar, Dress Pip stage: the Default tokens are re-declared on those selectors in `PetView.css`). The room UI chrome (sheets, pills, bars, chips) follows the theme through `--pet-<area>[-<tone>]-<role>` tokens in `styles/themes/*.css`. Room art is drawn by a per-line pack: `components/pet/room/roomPacks.js` → `roomPack(theme.pipLine)` (herb / dragon / robot, per-item herb fallback); names per line in `constants/petRoomLabels.js`.
- **No `mask` on elements that contain fixed popups.** Cyberpunk's receipt zigzag uses conic-gradient backgrounds because a mask would clip the fixed breakdown popup.
- **`npm run check:themes`** (`client/scripts/check-themes.mjs`) must pass: WCAG AA contrast for each theme's text/background pairs, plus registry ↔ theme CSS ↔ `index.html` boot list agreement. Known misses are listed in the `KNOWN_EXCEPTIONS` map and print WARN without failing; today there is exactly one, `default|text-secondary|bg-secondary` (4.45:1, pre-existing Default look, accepted 2026-11-15, to be fixed in its own ticket). Expected output: that WARN plus `Themes OK: 3 themes, 189 contrast pairs`. Never add an exception for a new theme; fix the token.
- **Themes borrow a genre's feel, never its property:** no franchise names, marks, characters or lookalike fonts; open-licence fonts only.
- Every theme must work at 320–1280px with popups usable on mobile.

**Adding a theme:** registry entry in `constants/themes.js` → `styles/themes/<id>.css` (reassign tokens under `:root[data-theme="<id>"]`) → optional `styles/themes/<id>/` overrides, imported from `<id>/index.css` and `main.jsx` → `.theme-preview--<id>` tile art in `previews.css` → id (and its `theme-color`) in the `index.html` boot script, colour in its `c` map → a `PAIRS.<id>` list in `check-themes.mjs` → if the theme brings a new `pipLine`, register its room pack in `roomPacks.js` and its names in `petRoomLabels.js` → `npm run check:room` green → update the mockup (`foodbytes-app/mockup/`) → `npm run check:themes` green.

### Mockups — keep them in step with the live app

`foodbytes-app/mockup/` holds the interactive HTML mockups (`app-mockup.html` = full app, Cyberpunk; `parchment-theme.html` = full app, Parchment; `user-menu-themes.html` = user menu + theme picker; see its `README.md`). They are the starting point for every UI change, so they **must match what is live**:
- New UI work starts by changing the mockup there (not in Downloads), getting it reviewed, then planning against it.
- Any ticket that changes the client UI also updates the mockup in the same ticket; if the implementation diverged from the mockup for a good reason, update the mockup before the ticket closes. `/fb-plan` contracts that touch the UI include a mockup-sync task.
- Known gap: `app-mockup.html` draws Cyberpunk and `parchment-theme.html` draws Parchment; for Default the live app is the reference until Default screens are added.
- Root `mockups/` is a historical folder, not this one.
- **New clothes and items come from video games and cartoons.** Before designing any new Pip wardrobe item, room decor or other collectable (or redesigning one), search video games and cartoons for how they handle that kind of item, and base the mockup options on what you find. Each option in the mockup names its inspiration (e.g. *Inspired by: wizard hats in Stardew Valley and Animal Crossing*). Borrow the idea and feel, never the property: no franchise names, marks, characters or lookalikes (see Themes).

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
- Prefers clean ingredients (e.g. pure tamarind block over jarred paste with stabilizers).
- Asia Market (asiamarket.ie) for Asian ingredients; Tesco Ireland for everyday.



## Database & Deployment

- Production frontend, backend, and MySQL all run on **Railway**. Backend redeploys on git push.
- DB schema is in `foodbytes-app/database/schema.sql`; ad-hoc changes go into `foodbytes-app/database/migrations/` and must be **applied manually** to the Railway MySQL (Hibernate is in `validate` mode, so a migration that isn't applied to the live DB will break startup).
- After a schema change, the backend may need a manual redeploy on Railway.
- OAuth redirect URIs are environment-specific (`OAUTH_REDIRECT_URI` env var). Login flakiness has historically been fixable by refreshing `GOOGLE_CLIENT_SECRET`.

### Local test database

A local copy of the live DB runs in the Docker container **`foodbytes-db`** (root `docker-compose.yml`), so migrations and features can be tested before touching Railway.

- **Connection:** `localhost:3306`, database `foodbytes`, user `foodbytes` / `foodbytes123` (root: `rootpassword`). These match the `application.yml` defaults, so `mvn spring-boot:run` connects with no env vars. Docker Desktop must be running.
- **Query it:** `docker exec foodbytes-db mysql -uroot -prootpassword foodbytes -e "..."` (no `mysql` client on the host PATH).
- **Test a migration:** `docker exec -i foodbytes-db mysql -uroot -prootpassword foodbytes < foodbytes-app/database/migrations/<file>.sql`. Applying locally does **not** replace the Railway apply — that is still required before the backend deploys.
- **Refresh from live:** the developer exports via MySQL Workbench → Server → Data Export (`railway` schema, per-table project folder). Then back up local, concatenate the `railway_*.sql` files (skip `sys_*`), strip `GTID_PURGED` lines (live is MySQL 9.x, local 8.0), wrap in `SET FOREIGN_KEY_CHECKS=0/1`, drop + recreate `foodbytes`, and pipe it in. Claude cannot dump Railway itself (blocked as a production read), so the export is always the developer's step.
- **State:** last refreshed 2026-10-12 (20 tables, 800 meal-plan entries) with the MPP-12 migration applied.

## Versioning & deploy verification

- **Where the version lives:** `foodbytes-app/client/package.json` → `version` and `foodbytes-app/foodbytes-api/pom.xml` → the project `<version>` (under `<artifactId>foodbytes-api</artifactId>`). They must be identical; `cd foodbytes-app/client && npm run check:version` fails if they, or the top line of `CHANGELOG.md`, disagree. Each manifest feeds its own build (Vite `define` reads package.json; Spring Boot build-info reads pom.xml) because Railway builds each service from its own folder, so a shared root file would be outside both Docker contexts. Never hard-code the version anywhere else.
- **Bump rules (SemVer, one bump per ticket):** Bug → PATCH (1.3.0 → 1.3.1). Story or Task → MINOR and reset PATCH (1.3.1 → 1.4.0). MAJOR only on an explicit decision. Work with no Jira key: a bug fix bumps PATCH, anything else MINOR. Every fb contract carries the bump as Final-verification Task M.1 (`.claude/commands/fb-plan.md`), and `/fb-apply` QA gates on `check:version`.
- **CHANGELOG.md** (repo root): newest first, one line per ticket, `<version> — <MPP-n>: <summary>` (use the plan slug instead of the key when there is no ticket).
- **Commit messages carry the ticket key:** `MPP-n: <summary>`, so a ticket's commits are findable with `git log --grep "MPP-n:"`.
- **What is deployed:** the account menu's last row shows `v<version> · web <build time> · api <build time>` (the viewer's local time). Amber means the two Railway services report different versions; usually one is still deploying. `GET /api/health` returns `version` and `builtAt`. No commit SHAs are recorded (decided on MPP-9).
- **Is my fix live?** Look up the ticket's version in `CHANGELOG.md`. The fix is live once the deployed version is at least that version: use the web version for a frontend fix and the api version for a backend fix. Two deploys of the same version (a push that skipped the bump) can only be told apart by build time, which is one more reason never to skip the bump.

## Conventions

- Frontend state for cross-cutting concerns lives in a Context — don't introduce a new global store.
- Backend controllers stay thin; business logic in `service/`. Don't put queries in controllers.
- New endpoints live under `/api/...` so the Vite proxy and Axios base URL keep working.
- The `Claude/agents/` directory contains domain-specific agent prompts and notes. Treat it as reference material, not code — don't refactor it.
