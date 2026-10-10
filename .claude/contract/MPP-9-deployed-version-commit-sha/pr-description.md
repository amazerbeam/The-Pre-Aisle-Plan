# MPP-9: show deployed version + build time in the app

Plan: `.claude/contract/MPP-9-deployed-version-commit-sha/plan.md`
Mockup: see the mockup path recorded in `plan.md` (Part 1).

## Summary
- `/api/health` now returns build info: `status`, `version`, `builtAt` (from the Maven build).
- Account menu shows a version line (`v1.1.0 · web <time> · api <time>`) with build times; a version mismatch between web and api is highlighted in amber.
- Versions unified at 1.1.0 across `pom.xml`, `package.json` and the health endpoint.
- New `CHANGELOG.md`; new `npm run check:version` script that fails when manifests drift.
- fb workflow and CLAUDE.md convention: SemVer bump + CHANGELOG entry required.
- Commit SHAs were deliberately dropped (ticket AC1 withdrawn by the developer on 2026-10-10).

## Deployment
- No migration. No Dockerfile or Railway settings change.
- Post-deploy check: Task 21 (open `/api/health`, expect `"version":"1.1.0"`, then check the account menu).

## Verification results
- Task 5: `HealthControllerTest` 3/3 pass.
- Task 8: `formatBuildTime` smoke printed `10 Oct 14:05 | null | null`.
- Task 12: build-time ISO baked into the client bundle.
- Task 14: `check:version` -> `Version OK: 1.1.0`; the drift check failed as designed.
- Task 18: no stale `1.0.0-MVP`; `__APP_*__` globals referenced only in `src/constants/buildInfo.js`; zero SHA plumbing hits; `console.log/debug` count 5 (baseline 6 or fewer).
- Task 19: full backend suite - run by QA in the final review.
- Task 20: `npm run build` succeeded (187 modules, built in 670ms); bundle contains `"1.1.0"`; `check:version` -> `Version OK: 1.1.0`.

## Manual checks (developer-owned)
- Task 12 Step 4: dev-server visual check of the account-menu line.
- Task 21: production check after both services redeploy.

## Convention note
Every contract now ends with Task M.1 (version bump + CHANGELOG); commits use `MPP-n: <summary>`.

## Suggested commit subject
`MPP-9: show deployed version + build time in the app`
