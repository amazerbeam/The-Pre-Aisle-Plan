# First-login onboarding: decisions (2026-11-15/16)

See `journeys.md` for the journey map.

## Scope: three pieces
1. **Stir Frys system template** (backend + client)
2. **First-login guided tour** (client, plus a server onboarding flag)
3. **Live user wipe** (go-live step, SQL only)

## Decisions
| # | Decision | Choice |
|---|---|---|
| 1 | Wipe live users except the developer and Karen | Yes. **Workbench backup first.** Delete script generated from live `information_schema` FKs; the developer runs it from Downloads. |
| 2 | Order | Features first; wipe at go-live so returning users get the new experience. |
| 3 | Stir Frys on first login | **Snapshot.** Applied as a copy into the new user's plan; they can edit it freely. |
| 4 | Stir Frys visibility | **Shared read-only** in every user's Apply-template list, always the owner's current version. Only the owner edits; nobody can delete it. |
| 5 | Which days get seeded | **Mon–Sun of the login week** (days before login day are filled too). |
| 6 | Tour style | **Do-it-yourself**: highlight a real control and wait for the user's tap; the work is saved. |
| 7 | Tour structure | **Core tour on first login** (pick a meal → meal plan → generate shopping list), then a **"Getting started" checklist** in the account menu (view recipe, edit plan, save template, copy week, …). Each item launches a mini-tour and ticks itself off. |

## Live facts
- Stir Frys = `meal_plan_templates.id = 1`, `user_id = 1`, 21 entries (full week), last updated 2026-11-13.

## Open for the plan
- Schema: flag on `meal_plan_templates` (e.g. `is_system`) vs config pointing at template id 1.
- Server onboarding state: `users.onboarding_completed_at` + per-checklist-item progress (reuse `pet_firsts` where keys overlap).
- Week model clash: app weeks start today, templates/copy week are Monday-based; the tour must handle it.
- Mobile meal plan has no "Build shopping list" button; the core tour's last hop needs one, or must go via the nav.
- Do the existing two users (the developer, Karen) get the tour? Default: no, but offer a "Replay tour" entry in the checklist.
- Mockup first (`foodbytes-app/mockup/`), in all three themes.
