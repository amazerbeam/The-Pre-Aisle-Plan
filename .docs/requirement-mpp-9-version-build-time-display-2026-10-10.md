# Show deployed version + build time (MPP-9)

**Date:** 2026-10-10
**Status:** Approved (via /fb-plan, `.claude/contract/MPP-9-deployed-version-commit-sha/plan.md`)

## Problem / motivation
Nothing tells the developer which build is running on Railway. When MPP-8 still looked broken after its fix, there was no way to tell "fix wrong" from "fix not deployed". The version is also hard-coded in three places that disagree (package.json `1.0.0-mvp`, pom.xml `1.0.0-MVP`, a literal in HealthController).

## Scope
**In scope**
- Spring Boot build-info behind `/api/health` (`version`, `builtAt`)
- Vite `define` (version + build time), and a version line in the account menu
- One version number across package.json and pom.xml, enforced by `npm run check:version`
- `CHANGELOG.md`, the fb workflow bump step, the CLAUDE.md convention
**Out of scope / non-goals**
- Commit SHAs in any form (developer red-line 2026-10-10; ticket AC1 withdrawn)
- Dockerfile changes, release-please / semantic-release, git tags, GitHub Releases, CI, Actuator exposure, backfilling MPP-1…8

## Success criteria
- `GET /api/health` → JSON with string keys `status`, `version`, `builtAt`; `HealthControllerTest` passes.
- `mvn package` → `target/classes/META-INF/build-info.properties` contains `build.version=1.1.0` and a `build.time=` line.
- `npm run build` → `dist/assets/*.js` contains `"1.1.0"` and an ISO build timestamp.
- `npm run check:version` → `Version OK: 1.1.0`; exits 1 if package.json, pom.xml or the top CHANGELOG line differ.
- `Select-String` for `1.0.0-MVP` / `1.0.0-mvp` in HealthController, pom.xml and package.json → zero hits.
- Signed in, open the account menu → the line matches the mockup's "In sync" state; with the API stopped → `api unavailable`.

## Reference patterns
- `foodbytes-app/foodbytes-api/src/test/java/com/foodbytes/controller/ShoppingListControllerTest.java:25`: context-free controller test
- `foodbytes-app/foodbytes-api/src/main/java/com/foodbytes/dto/PasswordLoginRequest.java:1`: record DTO
- `foodbytes-app/client/src/utils/dateUtils.js:105`: `toLocale*` date formatting
- `foodbytes-app/client/package.json:9`: `check:*` node script convention
- `C:\Users\jossd\Downloads\mpp-9-version-line-mockup.html`: visual contract

## Constraints
- `/api/health` stays `permitAll` and returns HTTP 200 even without build-info (the Docker `HEALTHCHECK` curls it).
- "Is my fix live?" relies on the per-ticket version bump; build time is the tie-breaker within one version.
- No `.claude/rules/` file applies (no recipe/ingredient/macro data).

## Verification commands
See `tasks.md` in the plan folder: every task carries its own `Run:` / `Expected:`.

## Open questions
- None. Interview skipped: the Jira ticket's ACs and the developer's 2026-10-10 red-line answer definition-of-done, scope, constraints and blast radius.
