# MPP-25: Sprinkles — a consistency-only currency (v1.19.0)

Plan: [plan.md](plan.md)

## Summary
- New `pet_sprinkles` ledger table (one row per reward, unique per user/source/source id) with a backfill.
- Earning rules: 10 per main meal eaten, +5 if ticked on time, +5 for a homemade extra, +20 for a full planned Monday-Sunday week (paid to every plan member).
- Un-ticking never refunds; re-ticking never re-pays (idempotent insert).
- `sprinkles` is now returned by `GET /api/pet` and `PUT /api/pet/name`.
- Room counter in `PetRoom`. Deviation: placed top-LEFT because the speech bubble (`.pet-bubble`) already occupies top-right.
- Version 1.18.0 -> 1.19.0 (Story, MINOR).

## Migration (Railway)
`2026-10-14-mpp25-pet-sprinkles.sql` is row 7 of `.claude/contract/MPP-15-epic-breakdown/railway-migrations.md`. Apply to Railway after rows 1-6 and BEFORE the merged backend deploys (`ddl-auto: validate`). Applied locally 2026-10-14 only.
Fix found during the local apply: the backfill `INSERT ... SELECT` needed `ON DUPLICATE KEY UPDATE pet_sprinkles.id = pet_sprinkles.id` (bare `id` was ambiguous).

## Verification
- Full `mvn test`: 325 run, 0 failures, 0 errors, BUILD SUCCESS.
- `npm run build`: green. `npm run check:version`: Version OK: 1.19.0.
- Grep audits: no stale 5-arg `PetPolicy.toDTO`; no hard-coded amounts in `insertIfAbsent`; no `console.log/debug` in PetContext, MealEatenSection, PetRoom, PetView or petRoom.js (pre-existing hits only in useWakeLock.js and api.js).
- Manual browser check (Task 13): PENDING, to be done by the developer. No results recorded.

## Convention
A new reward source adds a `SprinkleSource` value, a `SprinklePolicy` constant, and a widened `chk_pet_sprinkles_source` CHECK. Never a variety-based source (cuisine / new-food).

## Suggested commit subject
`MPP-25: Sprinkles — a consistency-only currency`
