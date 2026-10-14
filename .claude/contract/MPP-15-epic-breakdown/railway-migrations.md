# MPP-15 — migrations to apply to Railway at merge to master

Apply in this order to the Railway MySQL (`railway` schema) BEFORE the merged backend deploys. Every one has already been applied and tested on the local `foodbytes-db`.

| Order | Ticket | File | Applied locally | Applied to Railway |
|---|---|---|---|---|
| 1 | MPP-33 | foodbytes-app/database/migrations/2026-10-13-mpp33-meal-plan-entry-eaten-per-user.sql | 2026-10-13 | — |
| 2 | MPP-20 | foodbytes-app/database/migrations/2026-10-13-mpp20-pet-habit-streaks.sql | 2026-10-13 | — |
| 3 | MPP-22 | foodbytes-app/database/migrations/2026-10-13-mpp22-pet-awards.sql | 2026-10-13 | — |
| 4 | MPP-24 | foodbytes-app/database/migrations/2026-10-13-mpp24-pet-firsts.sql | 2026-10-13 | — |
