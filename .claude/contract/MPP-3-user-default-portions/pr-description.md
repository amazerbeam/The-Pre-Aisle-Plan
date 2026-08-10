# MPP-3: User-configurable default portions from the account menu

**Plan:** [`plan.md`](./plan.md) (this folder)
**Ticket:** https://amazerbeam.atlassian.net/browse/MPP-3

## Summary

`users.default_servings` existed as a dead `INT` column — no backend or frontend code path ever read or wrote it. This PR widens it to `DECIMAL(4,2)` and finally wires it up end to end:

- New `PATCH /api/users/me/preferences` endpoint to save/clear the preference (0.25–20.00, or `null` to clear).
- The value now rides along on `/api/auth/me` and `/api/auth/login` (`UserDTO.defaultServings`).
- `MealPlanService.resolveServings` gained a tier: an omitted servings value on a new meal-plan entry now resolves to the requesting user's preference before falling back to the recipe's own `default_servings`.
- A new "Default portions" control in the account menu (above Sign Out), backed by `AuthContext.saveDefaultServings`.
- Recipe cards and the optimistic meal-plan row now *seed their starting servings value* from the preference via `resolveStartingServings`.

**This changes the starting value only — the scaling basis is unchanged.** Ingredient quantities and per-serving calories still divide by the recipe's own `defaultServings` everywhere (`RecipeCard.jsx`, `RecipeViewModal.jsx`, `useRecipeStackServings.js`). Confirmed by grep audit in Phase 7 — see Verification below.

## ⚠️ Migration — apply to Railway BEFORE this branch deploys

`foodbytes-app/database/migrations/2026-08-09_user_default_servings_preference.sql` **must be applied to the Railway MySQL before the backend redeploys.** Hibernate runs `ddl-auto: validate`; the entity is now `BigDecimal` (`DECIMAL(4,2)`), and if the live column is still `INT` the backend will refuse to start.

The migration does two things:
1. Widens `default_servings` from `INT` to `DECIMAL(4,2)` (matches `meal_plan_entries.servings`'s precision — 0.25 quarter-portion steps).
2. **Resets all 11 current production rows to `NULL`.** They currently hold the untouched column default of `1`, not anyone's actual choice — nothing has ever written to this column. `NULL` is the canonical "never set" value the new fallback logic depends on (AC 9).

The reset is guarded by an `information_schema` check on the column still being `int` — **this makes the destructive `UPDATE` one-shot.** Once the migration runs and the column becomes `decimal`, re-running the file is a no-op and will not wipe any real preference a user sets afterward.

**Local-dev deviation, called out explicitly:** during this implementation the migration was applied only to the **local Docker MySQL** (`foodbytes-db` container), as a developer-directed deviation for local dev/testing — not to Railway. **The live Railway MySQL still has `default_servings` as `INT` and still needs this migration applied before any deploy of this branch.**

## Verification results (real output, gathered in this session)

**Backend suite — `mvn test`:** `BUILD FAILURE` — `Tests run: 64, Failures: 4, Errors: 0, Skipped: 0`, across **8** test classes (`AuthControllerLoginTest`, `MealPlanCreateRequestTest`, `EntityIdentityTest`, `MacroCalculationServiceTest`, `MealPlanServiceTest`, `RecipeServiceMacroAuditTest`, `ShoppingListServiceTest`, `UserServiceTest` — the last is new, added by this PR). All 4 failures are in `AuthControllerLoginTest`, each `Status expected:<X> but was:<403>` — the known pre-existing CSRF/security-slice gap (`@WebMvcTest(AuthController.class)` doesn't import the app's `SecurityConfig`, so Spring Boot's default CSRF-enabled chain applies instead of the real one). **Every other class, including the two new test classes this PR adds (`UserServiceTest`, and the new cases in `MealPlanServiceTest`), passes with 0 failures.** Not a regression from this PR's production code — see "Known pre-existing findings" below.

**Client build — `npm run build`:** `✓ 182 modules transformed`, `✓ built in 773ms`, no errors, no unresolved-import warnings.

**Frontend check files:**
- `node src/utils/servingsUtils.check.mjs` → `servingsUtils.check.mjs: all assertions passed`
- `node src/utils/macroStatus.check.mjs` → `All macro traffic-light checks passed.` (10 individual assertion groups, all green)

Both exited 0.

## Two interpretation calls for future contributors

1. **AC 6 (extras are exempt from the preference):** there is no `is_extra` column on recipes. Extras/component recipes (pesto, pita, dough, sauces) are identified by the `extras` meal type via `COMPONENT_MEAL_TYPE` (`constants/macroTargets.js`), matched case-insensitively since the API returns both `"extras"` and `"Extras"` depending on the shape. See `resolveStartingServings`'s `isExtrasOnly` helper.
2. **Preference ownership under `meal_plan_owner_id` sharing:** when a user's meal-plan reads/writes are redirected to an owner (via `users.meal_plan_owner_id`), it is the **requesting** user's default-portions preference that applies to a new entry — not the plan owner's. The person clicking "add to meal plan" is the one who set the preference and the one who will cook.

## New convention

`resolveStartingServings` in `client/src/utils/servingsUtils.js` is now the single place the "starting servings value" decision lives (recipe default vs. user preference vs. extras exemption). New servings controls should call it rather than reading `recipe.defaultServings` directly, so this logic doesn't fork across call sites.

## Known pre-existing findings surfaced during this work (not regressions from MPP-3)

1. **`AuthControllerLoginTest` CSRF/security-slice gap.** `@WebMvcTest(AuthController.class)` builds a sliced Spring context that does not import the app's `@Configuration SecurityConfig` (which disables CSRF for `/api/**`). Spring Boot's autoconfigured default security chain applies instead — CSRF-enabled, no knowledge of the app's `permitAll` rules — so all 4 tests in this class fail with 403 instead of exercising the intended login behavior. This predates this PR (it previously masked as a context-load failure before this PR's Task 7 added the missing `@MockBean`s); fixing it (e.g. `@AutoConfigureMockMvc(addFilters = false)` or importing `SecurityConfig` into the slice) is out of scope here and needs its own follow-up.
2. **`MealPlanContext.jsx` is already ~559 lines**, past the size budget the original plan assumed (it was already at 555 lines at `HEAD`, before this PR's +6-line change) — pre-existing debt from earlier work on this branch, not grown meaningfully by this PR. Splitting it is out of scope here.

🤖 Generated with [Claude Code](https://claude.com/claude-code)
