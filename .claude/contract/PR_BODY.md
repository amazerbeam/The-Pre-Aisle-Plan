# Email + password login (second auth path alongside Google OAuth)

## Spec

- Proposal: [`.claude/contract/proposal.md`](.claude/contract/proposal.md)
- Design: [`.claude/contract/design.md`](.claude/contract/design.md)

## Summary

Adds password-auth path. New `POST /api/auth/login`, new `password_hash` column, `google_id` relaxed to nullable, extracted `JwtCookieService` shared by both auth paths, LoginModal extended.

## Migration callout

`2026-05-18_password_auth.sql` MUST be applied to Railway MySQL before the backend redeploys (Hibernate `validate`).

The migration:
- Relaxes `users.google_id` to `NULL` (UNIQUE index kept; MySQL allows multiple NULLs).
- Adds nullable `users.password_hash VARCHAR(255)`.

If the backend redeploys before the migration is applied, Hibernate will fail to start.

## Smoke-test results

- **Google OAuth login** — Manual: pending the developer running the full stack. The refactor to `JwtCookieService.writeJwtCookie(...)` is mechanical and preserves observable behaviour (same cookie name, attributes, max-age).
- **Password login (seeded friend)** — Manual: pending the developer running the stack with a seeded user (see Task 12).
- **Backend test suite** — `mvn` is not on PATH on the implementer's Windows machine; deferred to CI / a developer machine. New `AuthControllerLoginTest` covers success, wrong password, unknown email, and missing fields (4 cases).
- **Frontend production build** — Verified locally: `npm run build` succeeds (168 modules, built in ~1.1s, no errors).
- **Stale cookie grep** — `grep -rn 'new Cookie("jwt"'` returns only `AuthController.logout` (cookie clearing). `JwtCookieService` uses the `COOKIE_NAME` constant; `OAuth2AuthenticationSuccessHandler` correctly no longer creates a cookie inline.

## Note for future contributors

Cookie attributes (name, max-age, HttpOnly/Secure/Path) live in `JwtCookieService`:

- `JwtCookieService.COOKIE_NAME`
- `JwtCookieService.COOKIE_MAX_AGE_SECONDS`

Change them there, not inline. Both the OAuth success handler and the new password login flow call `JwtCookieService.writeJwtCookie(user, response)` — there is now a single source of truth for the JWT cookie shape.
