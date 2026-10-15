# MPP-42: Earn tab, weekly shopping-list sprinkles and a count-up on Pip

Plan: [plan.md](plan.md)  |  Version: 1.28.0 (Story, MINOR bump from 1.27.0)

## Summary
- New Earn tab in Pip's Shop showing server-sourced sprinkle amounts, the good-week rule, a recent list (own rows, last 14 days) and a "good to know" section; the old footnote now links to it.
- Weekly shopping-list rewards: generating the list pays every plan member once per week; finishing the shopping pays every member once per week (re-checked after commit, AFTER_COMMIT listener; a failure never fails the request).
- New `GET /api/pet/sprinkles/recent` endpoint.
- A sprinkle count-up plays when you return to Pip.
- Meal payouts are unchanged.

## Migration
`foodbytes-app/database/migrations/2026-10-15-mpp42-sprinkles-shopping-sources.sql`: applied to the local `foodbytes-db` only. It reaches Railway as go-live row 12 in `mpp15-railway-golive.sql` and must be applied before the merged backend deploys (`ddl-auto: validate`). Note: Railway already holds `pet_sprinkles` while the tracker says rows 8-10 are unapplied; this needs reconciling before go-live.

## Verification
- `mvn test`: 440 run, 0 failures, 0 errors, BUILD SUCCESS
- `npm run build`: built in 935ms, no errors
- `npm run check:version`: Version OK: 1.28.0
- `check:sprinkles`, `check:bubble`, `check:awards`, `check:room`: all pass
- `build-golive.mjs --check`: Go-live OK: 12 migrations
- Manual browser checks: not run by the implementer; see the manual checklist at the end of tasks.md.

## For future contributors
Any shared-plan weekly reward uses `SprinkleService.payPlan` with a Monday epoch-day key; its wording lives client-side in `utils/sprinkleHistory.js`.

## Suggested commit subject
`MPP-42: Earn tab, weekly shopping-list sprinkles and a count-up on Pip`
