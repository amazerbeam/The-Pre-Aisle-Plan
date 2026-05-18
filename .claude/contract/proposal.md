# Proposal: Email + password login (second auth path alongside Google OAuth)

## Subtask reference
Local spec — no Jira ticket. Source: `.claude/contract/2026-05-18-password-auth-spec.md`.

## Restated goal
Add a self-contained email/password sign-in path to FoodBytes so users without a Google account can log in. The change is purely additive: the existing Google OAuth flow keeps working untouched, and the new path issues the **same** JWT httpOnly cookie (`jwt`, 7-day, httpOnly+Secure, path `/`) that `OAuth2AuthenticationSuccessHandler` already produces. Once that cookie is set, every downstream piece (`JwtAuthenticationFilter`, frontend `withCredentials`, `AuthContext`, `/api/*` endpoints) behaves identically regardless of how the user authenticated. Immediate trigger: seed one trusted friend who has no Google account; the chosen shape is also the durable production shape so signup/reset/rate-limit can be added later as additive features without rework.

## In scope
- Hand-written SQL migration adding `users.password_hash VARCHAR(255) NULL` and relaxing `users.google_id` to `NULL`-able (keeping its `UNIQUE` index — MySQL allows multiple NULLs in a UNIQUE index).
- JPA `User` entity updates: add `passwordHash` field; change `googleId` to nullable.
- New endpoint `POST /api/auth/login` accepting `{ email, password }` → 200 + JWT cookie on success; 401 with generic body on bad credentials, unknown email, or Google-only account (`password_hash IS NULL`); 400 on missing/blank fields.
- New `PasswordAuthService` (or inlined into `UserService` — see Risks) holding lookup, BCrypt verify, and JWT issuance.
- `SecurityConfig` updates: permit `/api/auth/login`, expose `BCryptPasswordEncoder` as a `@Bean`.
- Shared cookie-writing helper extracted from `OAuth2AuthenticationSuccessHandler` so the password path and the OAuth path cannot drift on cookie attributes.
- Extend `LoginModal.jsx` with a collapsible "Sign in with email" section (email + password + submit) — no new route, no new top-level page.
- New `passwordLogin(email, password)` method on `AuthContext`; calls `POST /api/auth/login`, refreshes user state via the existing `checkAuthStatus` on success.
- Seeding mechanism for the friend: a one-off Java `main()` (`PasswordHashGenerator.java`) that prints a BCrypt hash for a chosen password, plus a documented `INSERT INTO users ...` to run against Railway MySQL.

## Explicitly out of scope
- Self-signup / registration endpoint and UI.
- Password reset (forgotten-password) flow and any email-sending infrastructure.
- Email verification.
- Rate limiting, account lockout, captcha, brute-force protection.
- 2FA / TOTP.
- Admin UI for managing users or rotating passwords.
- Migrating existing Google-OAuth users to also have a password.
- Any change to the Google OAuth flow itself beyond extracting the shared cookie helper.

## Pattern Reference (from spec)
- `foodbytes-app/foodbytes-api/src/main/java/com/foodbytes/security/OAuth2AuthenticationSuccessHandler.java` — cookie shape (`jwt`, httpOnly, Secure, path `/`, maxAge `7 * 24 * 60 * 60`).
- `foodbytes-app/foodbytes-api/src/main/java/com/foodbytes/security/JwtTokenProvider.java` — token issuance.
- `foodbytes-app/foodbytes-api/src/main/java/com/foodbytes/controller/AuthController.java` — existing auth controller; extend rather than create a sibling.
- `foodbytes-app/foodbytes-api/src/main/java/com/foodbytes/config/SecurityConfig.java` — permit-list and bean wiring.
- `foodbytes-app/foodbytes-api/src/main/java/com/foodbytes/service/UserService.java` — user lookup pattern.
- `foodbytes-app/client/src/components/auth/LoginModal.jsx` + `LoginModal.css` — auth UI surface.
- `foodbytes-app/client/src/contexts/AuthContext.jsx` — auth state and refresh.
- `foodbytes-app/database/migrations/` — manual-apply migration convention.

## Constraints flagged on the spec
- Hibernate `ddl-auto: validate` — migration MUST be applied to Railway MySQL **before** the backend redeploys, or startup fails.
- The new endpoint MUST set the **same** JWT cookie attributes the OAuth handler sets — name, httpOnly, Secure, path, expiry. Divergence breaks `JwtAuthenticationFilter` for password-auth users.
- Google-OAuth users have `password_hash = NULL` and the login endpoint MUST reject them with the same generic 401 as wrong-password (no account-type enumeration).
- Email lookup is case-insensitive — store as-typed but compare with `LOWER()`.
- BCrypt with Spring Security's default cost factor (10).
- The seed flow (one-off `main()`) MUST NOT be reachable as an HTTP endpoint.
- Site is currently single-user (owner) + one trusted friend; rate limiting deferred consciously; must be revisited before any public launch.

## Assumptions made
- **`googleId` becomes nullable, `email` stays the login key.** DB check confirmed `google_id` is currently `NOT NULL UNIQUE` and `email` is already `UNIQUE`. The migration drops only the `NOT NULL` from `google_id`; the existing UNIQUE index on it is kept (NULLs are allowed multiple times in MySQL UNIQUE indexes).
- **Extend `AuthController` rather than create a new controller.** It already owns `/api/auth/me`, `/api/auth/logout`, `/api/auth/status` — `POST /api/auth/login` belongs in the same class.
- **Extend `LoginModal.jsx` rather than create a `/login` route.** The existing auth surface is modal-based; a separate route would orphan the OAuth button. The password form lives inside the modal as a collapsible "Use email & password instead" section.
- **`PasswordAuthService` is a new class, not a method on `UserService`.** Keeps password-verify logic and BCrypt encoder injection out of `UserService` (which is currently a thin lookup/create service). Pulls cleanly later when signup/reset arrive.
- **Cookie helper extracted to `JwtCookieService` (new).** Both `OAuth2AuthenticationSuccessHandler` and the new login endpoint call into it. Shared helper is the single source of truth for cookie attributes — prevents drift.
- **JWT expiry reused from `${jwt.expiration}` config** — same lifetime as Google login (currently 7 days from cookie maxAge; JWT exp is config-driven separately).
- **No frontend route guard for `/login`** — there isn't one; the modal opens from the existing Header / RecipeList "Sign in" affordances.
- **Integration test only, no FE test.** Per `CLAUDE.md`, the frontend has no automated test suite. Backend has `mvn test`; a `WebMvcTest` covering the success / wrong-password / unknown-email / google-only cases is sufficient for an auth surface.
- **Seed via `INSERT`, not `UPDATE`.** The friend has no existing row; we insert a fresh users row with `google_id = NULL`, `password_hash = <bcrypt>`, his real email + name. He gets the same defaults (`default_servings = 1`, `is_admin = false`).
- **Migration filename: `2026-05-18_password_auth.sql`** under `foodbytes-app/database/migrations/`, matching the existing date-prefixed convention.

## Cross-code alignment audit (FE ↔ BE ↔ DB)
- **`users.password_hash`** does not exist today → migration adds it → JPA `User.passwordHash` references it → only `PasswordAuthService` reads it → no FE field. ✅ Pending migration.
- **`users.google_id` nullability** changes from `NOT NULL` to `NULL` → JPA `User.googleId` annotation must drop `nullable = false` → `CustomOAuth2UserService.findOrCreateUser(googleId, ...)` is unaffected (Google flow always supplies one). ✅
- **`users.email` UNIQUE** already exists ✅ (verified via `DESCRIBE users`).
- **Cookie name `jwt`** matches across `OAuth2AuthenticationSuccessHandler`, `AuthController.logout`, and `JwtAuthenticationFilter`. New endpoint and helper must use the same literal. ✅ Captured in helper.
- **Endpoint path `/api/auth/login`** vs SecurityConfig — currently `/api/auth/status` and `/api/auth/logout` are explicitly permitted; `/api/auth/login` is **not** in the permit list and would default to `.anyRequest().authenticated()`. Migration step required in SecurityConfig.
- **Frontend `api.js` `baseURL: '/api'` + `withCredentials: true`** — already correct; `AuthContext.passwordLogin` calls `api.post('/auth/login', ...)` directly. ✅
