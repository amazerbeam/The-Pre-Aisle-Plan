---
name: java-backend
description: Apply FoodBytes Spring Boot 3.2 / Java 17 backend conventions for controllers, services, JPA entities, OAuth2 + JWT security, and DTO patterns. Use when adding or editing code under foodbytes-api/, designing /api endpoints, modifying entities or repositories, wiring Spring Security, or reviewing backend PRs in the FoodBytes app.
allowed-tools: Read, Grep, Glob, Write, Edit, Bash(mvn:*)
metadata:
  type: reference
---

# Java Backend (FoodBytes)

Conventions for the FoodBytes Spring Boot API (`foodbytes-app/foodbytes-api/`). Read this before writing or editing anything under `src/main/java/com/foodbytes/`.

## Use when

- Adding or editing controllers, services, repositories, entities, DTOs, or security under `foodbytes-api/`.
- Designing new `/api/...` endpoints or modifying existing ones.
- Touching JPA entities, JPQL, or repository methods.
- Reviewing OAuth2 / JWT / `@PreAuthorize` wiring.

## Do not use when

- Frontend work in `client/` — use `react-frontend`.
- SQL migrations or recipe data integrity — those have dedicated rules in `.claude/rules/`.

## Stack (authoritative — match what's in the repo)

- Java 17, Spring Boot 3.2, Maven (no wrapper checked in — use `mvn` directly).
- Spring Data JPA + Hibernate. **`ddl-auto: validate`** — the schema is **not** auto-managed. Any entity change requires a matching SQL migration applied manually to the Railway MySQL, otherwise startup fails.
- Spring Security + Spring OAuth2 client (Google) + JJWT 0.12.x. Auth = OAuth → backend issues JWT delivered as **httpOnly cookie**. Sessions are stateless.
- Lombok, springdoc-openapi, validation starter, actuator.

## Layered structure

```
src/main/java/com/foodbytes/
  controller/   thin — parse request, call service, return ResponseEntity
  service/      business logic + transactions; never reach into another controller
  repository/   Spring Data JPA interfaces; custom JPQL via @Query
  model/        JPA entities (e.g. Recipe, RecipeIngredient, RecipeFamily, MealPlanEntry, User)
  dto/          request/response shapes — controllers never expose entities directly
  security/     JwtTokenProvider, JwtAuthenticationFilter, CustomOAuth2UserService, UserPrincipal
  config/       SecurityConfig wires it all together
  exception/    GlobalExceptionHandler + domain exceptions
```

Endpoints all live under `/api/...` so the Vite dev proxy and Axios base URL keep working. Existing surface: `/api/auth`, `/api/recipes`, `/api/recipe-families`, `/api/meal-plans`, `/api/shopping-list`, `/api/ingredients`, `/api/units`, `/api/aisles`, `/api/health`.

## Approach

1. **Read first, write second.** Before adding a controller or service, Read the closest existing one (e.g. `RecipeController`, `MealPlanService`) and match its style — constructor injection via `@RequiredArgsConstructor`, `ResponseEntity<>` returns, `@PreAuthorize("hasRole('ADMIN')")` on mutating endpoints, `@AuthenticationPrincipal UserPrincipal user`.
2. **Keep controllers thin.** No business logic, no JPA queries, no transactions in controllers. Push everything into a `service/` class. If you find yourself writing more than orchestration in a controller, stop and move it.
3. **Entities don't cross the wire.** Every controller returns a DTO from `dto/`. New endpoints get a new DTO if the existing shape doesn't fit — don't leak entity fields like `password` analogues, audit timestamps, or lazy associations.
4. **Schema changes = migration + entity update + manual apply.** Any new column / table requires:
   - SQL file under `foodbytes-app/database/migrations/` (date-prefixed).
   - Matching `@Entity` field with correct `@Column(name = ...)`.
   - User applies it to Railway MySQL before redeploy. Tell the user explicitly when a migration must be applied.
5. **Security rules:**
   - Public reads (`GET /api/recipes/**`, `/api/health`, `/api/auth/**`) are `permitAll`. Mutations require auth.
   - Admin-only operations get `@PreAuthorize("hasRole('ADMIN')")` at the method level.
   - Identify the user via `@AuthenticationPrincipal UserPrincipal` — never read the JWT yourself in business code.
   - CORS allow-credentials is true; don't add new origins without checking `application.yml` and Railway env vars.
6. **Transactions:** mutating service methods are `@Transactional`. Read methods can be `@Transactional(readOnly = true)` when they touch lazy associations.
7. **Recipe domain quirks the backend must respect** (these surface as bugs if ignored):
   - `recipes.calories` is **whole-recipe kcal**, not per-serving. When inserting/updating a recipe, store `kcal_per_serving × default_servings`.
   - `recipe_ingredients` may have `ingredient_id` OR `linked_recipe_id` (or both, FR-103 dual-path). Macro/calorie computation must include linked recipes prorated by `quantity_grams / linked_total_yield`. Don't trust stored `recipes.calories` blindly — recompute via `MacroCalculationService`.
   - `RecipeFamily` groups Light/Moderate/Balanced; default rendering target is **Moderate**.
   - `users.meal_plan_owner_id`: when set, that user reads/writes the owner's meal plan entries instead of their own. Service code must honor it.
8. **Tests run with `mvn test`.** No wrapper is checked in. Single test: `mvn test -Dtest=ClassName#method`. There is no frontend test suite.

## Output

When implementing a backend change, deliver:

- Controller / service / repository / entity / DTO edits matching neighboring file conventions.
- A migration SQL file under `foodbytes-app/database/migrations/` if the schema changed, **with an explicit reminder to the user that it must be applied to Railway before redeploy** (otherwise Hibernate `validate` blows up at startup).
- Test additions or updates in `src/test/java/com/foodbytes/` for non-trivial service logic.
- An end-of-turn note covering: what changed, whether `mvn test` was run, and any manual deploy/migration steps the user owes.

## Shared rules (read on demand)

Project-wide rules live at `.claude/rules/`. Before answering, scan `.claude/rules/` (Glob `.claude/rules/*.md`) and Read any file whose topic matches the decision — including rules added after this skill was written. See `.claude/rules/README.md` for the index.

Especially relevant when backend work touches recipe data:
- `.claude/rules/linked-recipe-extras.md` — `quantity_grams` semantics for linked recipes; macro proration.
- `.claude/rules/recipe-variants.md` — Light/Moderate/Balanced family invariants; default = Moderate.
- `.claude/rules/homemade-first-and-ingredient-dedup.md` — ingredient dedup before insert; prefer linked sub-recipes over raw ingredients.

## Success criteria

- Edit lives under `foodbytes-app/foodbytes-api/src/main/java/com/foodbytes/` in the correct layer (controller / service / repository / model / dto / security / config / exception).
- Controllers return `ResponseEntity<DTO>` and contain no JPA calls (`Grep -n "Repository\\.\\|EntityManager" foodbytes-api/src/main/java/com/foodbytes/controller` → no hits in new code).
- Mutating endpoints carry `@PreAuthorize` where appropriate; user identity comes from `@AuthenticationPrincipal UserPrincipal`.
- Every new entity field has a matching column in a migration file under `foodbytes-app/database/migrations/`.
- New endpoint paths start with `/api/`.
- `mvn test` (or the targeted `-Dtest=` form) was run and reported in the summary; or its absence was explicitly noted.
- Recipe writes store **whole-recipe** kcal and respect linked-recipe extras for macro computation.
