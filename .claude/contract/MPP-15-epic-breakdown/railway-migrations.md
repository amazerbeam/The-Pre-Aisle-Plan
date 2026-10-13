# MPP-15 — migrations to apply to Railway at merge to master

Apply in this order to the Railway MySQL (`railway` schema) BEFORE the merged backend deploys. Every one has already been applied and tested on the local `foodbytes-db`.

| Order | Ticket | File | Applied locally | Applied to Railway |
|---|---|---|---|---|
| 1 | MPP-33 | foodbytes-app/database/migrations/2026-10-13-mpp33-meal-plan-entry-eaten-per-user.sql | 2026-10-13 | — |
