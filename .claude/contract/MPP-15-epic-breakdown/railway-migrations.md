# MPP-15 — migrations to apply to Railway at merge to master

Apply in this order to the Railway MySQL (`railway` schema) BEFORE the merged backend deploys. Every one has already been applied and tested on the local `foodbytes-db`.

**At go-live, run one file:** `foodbytes-app/database/mpp15-railway-golive.sql`. It is generated from this table, so do not edit it by hand, and every section in it is idempotent.

**Whenever you add a row to this table**, regenerate it:

```
node foodbytes-app/database/build-golive.mjs
```

`--check` exits 1 if the go-live file is stale, or if a `*-mppNN-*.sql` migration dated 2026-10-13 or later is missing from this table.

Railway already had everything up to MPP-14 when checked on 2026-10-14 (read-only). That covers MPP-10/12/13/14 and the Picanha recipe migrations, so this table is the complete set.

| Order | Ticket | File | Applied locally | Applied to Railway |
|---|---|---|---|---|
| 1 | MPP-33 | foodbytes-app/database/migrations/2026-10-13-mpp33-meal-plan-entry-eaten-per-user.sql | 2026-10-13 | — |
| 2 | MPP-35 | foodbytes-app/database/migrations/2026-10-14-mpp35-carry-over-shared-ticks.sql | 2026-10-14 | — |
| 3 | MPP-20 | foodbytes-app/database/migrations/2026-10-13-mpp20-pet-habit-streaks.sql | 2026-10-13 | — |
| 4 | MPP-22 | foodbytes-app/database/migrations/2026-10-13-mpp22-pet-awards.sql | 2026-10-13 | — |
| 5 | MPP-24 | foodbytes-app/database/migrations/2026-10-13-mpp24-pet-firsts.sql | 2026-10-13 | — |
| 6 | MPP-31 | foodbytes-app/database/migrations/2026-10-14-mpp31-user-pet-fully-grown-at.sql | 2026-10-14 | — |
| 7 | MPP-32 | foodbytes-app/database/migrations/2026-10-14-mpp32-pet-wardrobe.sql | 2026-10-14 | — |
| 8 | MPP-25 | foodbytes-app/database/migrations/2026-10-14-mpp25-pet-sprinkles.sql | 2026-10-14 | — |
| 9 | MPP-26 | foodbytes-app/database/migrations/2026-10-14-mpp26-pet-station-levels.sql | 2026-10-14 | — |
| 10 | MPP-27 | foodbytes-app/database/migrations/2026-10-14-mpp27-pet-room-decor.sql | 2026-10-14 | — |
| 11 | MPP-40 | foodbytes-app/database/migrations/2026-10-15-mpp40-pet-room-decor-spots.sql | 2026-10-15 | — |
