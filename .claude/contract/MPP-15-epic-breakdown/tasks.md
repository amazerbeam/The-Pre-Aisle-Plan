# MPP-15 epic breakdown — Pip's room

> **This file is a ticket-creation worklist, not an `/fb-plan` implementation contract.** It has no `Status:` line and is never walked by `/fb-apply`. Each ticket below becomes one Jira child of MPP-15. Each of those later gets its own `/fb-plan` contract, version bump and (where noted) Railway migration.

**Created in Jira 2026-10-13:**
- Ticket keys: T*n* = MPP-(15+*n*), so T1 = MPP-16 … T17 = MPP-32.
- 28 Blocks links.
- MPP-11 DoD item 6 and the MPP-15 description were updated for the glow-up.

**Per-person Pip (decided 2026-10-13, MPP-33):**
- Each person on a shared meal plan ticks their own meals and has their own Pip: name, mood, meal times, streaks, awards, firsts, sprinkles, room, wardrobe and fitness.
- The meal plan, shopping list, templates and extra choices stay shared.
- MPP-33 (per-person eaten table + per-person Pip) blocks MPP-17, MPP-18, MPP-19, MPP-22, MPP-24 and MPP-31.
- Where this file says "owner" for Pip data, read "each person"; the Jira tickets are the up-to-date text.
- Mockups live in `mockups/` next to this file.

**Sources read:**
- Epic MPP-15.
- The parent pet epic MPP-11 and its rule: consistency-only rewards, no variety rewards.
- Phase A spec `.claude/contract/specs/2026-10-13-pip-room-spec.md`.
- Approved mockup `.claude/contract/MPP-15-epic-breakdown/mockups/pip-room-mockup-v5.html`.
- MPP-12/13/14 (eaten flag, meal times, pet page).
- `CLAUDE.md` (versioning, migrations, conventions).
- Existing hooks: `MealPlanTemplateController` `POST /api/meal-plan-templates`, `ShoppingListController` `POST /api/shopping-list/generate`.

`.claude/rules/*` are recipe/ingredient rules and don't apply to this epic.

**Build order** (from the epic, plus the glow-up added 2026-10-13): Phase A (tickets 1–4) → E (5–6) → D (7–9) → **F, glow-up (16–17)** → B (10) → C (11–12) → integration, polish and sign-off (13–15).

**Glow-up decisions (2026-10-13, mockup `.claude/contract/MPP-15-epic-breakdown/mockups/pip-progression-mockup.html`):**
- Pip's body changes with consistency. It is scored over a **rolling 30 days**: each day earns up to 3 points (followed the plan, no snacks, no alcohol), for 0–90 in total.
- Stages by score: 0–14 Mochi, 15–35 Warming up, 36–59 Toned, 60–89 Fit, **90 = Ripped** (every day perfect for a month).
- **Pip can go backwards** as the window rolls, but gently. Pip's lines stay kind ("Lost a little shape 😅 A few good days and we're back!").
- **Clothing rewards** are unlocked by specific achievements, kept forever, and wearable at any stage.
- This **replaces MPP-11's DoD item 6**, "The pet never … changes body shape".

---

## Checklist coverage

| # | Category | Tickets |
|---|---|---|
| 1 | Foundational scaffold | T1 (room engine + furniture catalogue) |
| 2 | Core domain/rules logic | T5 (habit streak rules + per-day log), T7 (plan streak + award ladder), T9 (firsts), T10 (currency rules), T16 (30-day fitness score → body stage) |
| 3 | Autonomous/reactive behaviour | T2 (Pip's routine by clock), T3 (cook-and-serve reacting to a logged meal). Both are **heuristic and scripted**: no pathfinding or AI, just fixed spots and a timed sequence. |
| 4 | User-facing interface | T4 (fridge view), T6 (check-in bubble), T8 (trophy cabinet), T11 (shop/upgrades), T12 (decor + edit mode), T16 (body stages everywhere Pip appears), T17 (wardrobe / dressing screen) |
| 5 | Visual/experience polish | T14 |
| 6 | Integration | T13 |
| 7 | Deploy/release | **No separate ticket.** Shipping is git push → Railway redeploy, and every `/fb-plan` contract already carries the version bump (CLAUDE.md → Versioning) and, where there is a schema change, the hand-off to apply the migration to Railway before the backend deploys. Tickets with migrations: T5, T7, T9, T10, T11, T12. |
| 8 | Verification & sign-off | T15 |

## Sequencing diagram (blocker → blocked)

```
SCAFFOLD
  T1 ──→ T2 ──→ T3
  T1 ──→ T4
  T1 ──→ T6
  T1 ──→ T8
  T1 ──→ T10

RULES (backend)
  T5 ──→ T6
  T5 ──→ T7 ──→ T8
  T7 ──→ T9 ──→ T8

GLOW-UP
  T1, T5, T7 ──→ T16 ──→ T17
  T8, T9 ──→ T17

ECONOMY
  T10 ──→ T11 ──→ T12

INTEGRATION / POLISH / SIGN-OFF
  T3, T4, T6, T8, T12, T16, T17 ──→ T13 ──→ T14 ──→ T15
```

Links to create (all "Blocks", blocker → blocked):
- T1→T2, T2→T3, T1→T4, T1→T6, T1→T8, T1→T10
- T5→T6, T5→T7, T7→T8, T7→T9, T9→T8
- T1→T16, T5→T16, T7→T16, T16→T17, T8→T17, T9→T17
- T10→T11, T11→T12
- T3→T13, T4→T13, T6→T13, T8→T13, T12→T13, T16→T13, T17→T13
- T13→T14, T14→T15

---

## T1 — Room scaffold: 3D corner room engine and furniture catalogue on the Pet page
- **Type:** Task · **Priority:** High · **Parent:** MPP-15 · **Skill:** react-frontend
- **Blocked by:** none · **Blocks:** T2, T4, T6, T8, T10, T16

### Problem Statement
Pip currently stands in front of a flat CSS backdrop (`.pet-room*` in `PetView.css`). Every later MPP-15 feature (routine, fridge, cabinet, shop) needs a common room to plug into. That means one projection, one set of 3D drawing primitives and one data shape for upgradeable furniture. Without it, each ticket would invent its own incompatible drawing code.

### User Story
As a FoodBytes user, I want Pip to live in a cosy 3D room on his page, so that he feels like a companion with a home rather than an icon.

### Acceptance Criteria
1. `/pet` renders an SVG room in place of the CSS room: an angled corner with left wall, right wall and diamond floor, using the mockup's projection in a `0 0 360 330` viewBox.
2. A reusable module (e.g. `components/pet/room/iso.js`) exposes `P(u,v,h)`, `box`, `cyl`, `ellH`, `rectU`/`rectV`/`rectH` and billboard placement, ported from the v5 mockup.
3. A furniture catalogue defines bed, fridge, cooker and trophy cabinet at levels 1–4, using the mockup's art. The room renders level 1 for every station via a `levels` prop that defaults to all 1s.
4. Objects are drawn back-to-front: the fridge (nearer) overlaps the cooker, never the reverse (regression from mockup v3).
5. The window, rug and Pip (on the rug, current mood face via the existing `MochiFace`) appear. Speech bubble top-right, inside the room.
6. At 320 px width there is no horizontal scroll and the room scales with the card. Footer tab and `PetReaction` are unchanged.

### Scope Boundaries
**In scope:** iso engine module; furniture catalogue (4 stations × 4 levels); `PetRoom` component; removing the `.pet-room*` CSS; Pip placed on the rug.
**Out of scope:** Pip moving (T2), animations (T3), fridge tap (T4), cabinet tap (T8), empty decor spots (T12), any backend change.

### Dependencies & Risks
- Frontend only, so no migration. Version bump: Task → MINOR.
- Art source is the approved mockup v5. Visual tweaks are deferred to T14 rather than blocking here.
- Risk: SVG polygon count on low-end phones. Default: render once and memoise per level set.

### Design Assets
`.claude/contract/MPP-15-epic-breakdown/mockups/pip-room-mockup-v5.html` (levels 1–4 switch). Spec: `.claude/contract/specs/2026-10-13-pip-room-spec.md`.

---

## T2 — Pip's daily routine: rug, cooker at meal times, asleep in bed at night
- **Type:** Story · **Priority:** High · **Parent:** MPP-15 · **Skill:** react-frontend
- **Blocked by:** T1 · **Blocks:** T3

### Problem Statement
A room is only alive if Pip uses it. His position should follow the user's own day, driven by the MPP-13 meal times already on `PetDTO.mealTimes`, so the pet feels tied to the meal plan rather than idling.

### User Story
As a user, I want Pip to be at the cooker around my meal times and asleep at night, so that he reflects my routine.

### Acceptance Criteria
1. A pure helper `pipPosition(now, mealTimes)` returns `rug | cooker | bed`, with a `.check.mjs` next to `petMood.check.mjs`.
2. **Cooker:** 30 min before to 30 min after each breakfast/lunch/dinner time. **Bed:** dinner time + 3 h until breakfast time − 1 h. **Rug:** otherwise.
3. With times 08:00/13:00/19:00: 12:45 → cooker, 15:00 → rug, 23:00 → bed, 06:30 → bed, 07:15 → rug (all in the check file).
4. Asleep: new `sleep` face added to `MochiFace`, the room dims, the window shows a moon and "z z" floats above Pip.
5. At the cooker Pip shows the happy face and the pot steams. Position updates on the minute via `useMinuteClock`.
6. `prefers-reduced-motion` disables the steam and z animations.

### Scope Boundaries
**In scope:** position helper + checks, sleep face, night scene, cooker idle scene.
**Out of scope:** the walk/cook sequence on a logged meal (T3); mood logic changes.

### Dependencies & Risks
- Default windows are ±30 min and dinner + 3 h. They are named constants in `constants/pet.js` so they can be retuned.
- Meal times are the meal-plan **owner's**, the same as the mood (`PetContext`).

### Design Assets
Mockup v5 → "Time of day" switch.

---

## T3 — Pip cooks and serves after a meal is logged as eaten
- **Type:** Story · **Priority:** High · **Parent:** MPP-15 · **Skill:** react-frontend
- **Blocked by:** T2 · **Blocks:** T13

### Problem Statement
Marking a meal eaten (MPP-12) only flips Pip's mood today. Watching Pip cook the meal makes logging feel rewarding and reinforces the habit the epic exists for.

### User Story
As a user, when I log a meal as eaten, I want to see Pip walk to the cooker, cook it and serve it, so that logging feels like it matters.

### Acceptance Criteria
1. On `/pet`, each breakfast/lunch/dinner entry marked eaten since this browser last saw the room plays the sequence once:
   - Pip hops rug → cooker (~1.3 s).
   - He cooks with the pot steaming (~2 s).
   - A plate appears on the counter with "<Meal> is served! 🍽️".
   - He hops back.
2. Several new eaten meals play one sequence that names the latest one, not a queue of animations.
3. "Last seen" is per-viewer `localStorage` wrapped in try/catch. If storage is unavailable, at most one replay happens per page load.
4. Reloading after the sequence does not replay it.
5. Under `prefers-reduced-motion` the sequence shows the served state without movement.

### Scope Boundaries
**In scope:** the sequence on `/pet`, the "seen" marker, the plate art.
**Out of scope:** an inline animation inside `MealEatenSection` (open question below); fridge decrement visuals (T4 derives from data anyway).

### Dependencies & Risks
- Default: play only on `/pet`. Whether to also play a mini version next to `PetReaction` is left open in the spec. Revisit at T14.
- Animation uses CSS transitions on a wrapper `<g>`, as in the mockup.

### Design Assets
Mockup v5 → "Log a meal as eaten".

---

## T4 — Pip's fridge: tap to see how much of this week's planned food is left
- **Type:** Story · **Priority:** High · **Parent:** MPP-15 · **Skill:** react-frontend
- **Blocked by:** T1 · **Blocks:** T13

### Problem Statement
The fridge should be a glanceable view of how the week's plan is going. It fills when a week is planned and empties as planned meals are eaten, without depending on the shopping list.

### User Story
As a user, I want to tap Pip's fridge and see how full it is, so that I know how much of my planned week is left and when the next shop is due.

### Acceptance Criteria
1. Pure helper `fridgeFill(weekPlan, today)` returns `{ planned, remaining, pct, filledSlots }`, with a `.check.mjs`.
   - `planned` = breakfast/lunch/dinner entries in the fridge window.
   - `remaining` = not yet eaten.
   - `filledSlots = round(15 × remaining / planned)`, at least 1 while `remaining > 0`, and 0 when nothing is planned.
2. 21 planned and 6 eaten → "71% full · 15 of 21 planned meals left", with 11 of 15 slots filled.
3. Tapping the fridge (a real button, keyboard-reachable) opens a full-screen fridge view inside the room card with 15 slots on 3 shelves and "Back to room". Focus returns to the fridge on close.
4. A gauge on top of the fridge shows the same %: green above 50 %, amber above 20 %, red at 20 % or below. At 20 % or below Pip's idle bubble says "The fridge is getting empty 👀".
5. The note text covers fully stocked / plenty left / running low / empty. Nothing planned shows an empty fridge with "Plan your week to stock the fridge".

### Scope Boundaries
**In scope:** fill helper + checks, gauge, fridge view, low-stock bubble.
**Out of scope:** linking to real shopping-list items; refill on "shopping done" (refill is implicit from the plan); fridge upgrades (T11).

### Dependencies & Risks
- Default fridge window: the meal-plan week containing today, using the same start day as the meal-plan page. This is an open question in the spec, kept as one helper so it's easy to change.
- Uses the owner's plan via `PetContext`/`MealPlanContext`, with no new fetch.

### Design Assets
Mockup v5 → tap the fridge; "Meals planned this week" switch.

---

## T5 — Habit streaks backend: snack-free and alcohol-free check-ins
- **Type:** Task · **Priority:** Medium · **Parent:** MPP-15 · **Skill:** java-backend
- **Blocked by:** none · **Blocks:** T6, T7, T16

### Problem Statement
The daily snack/alcohol check-in needs durable, server-side streaks so they survive devices and reinstalls. The catch-up and backdating rules must live in one tested place, not in the UI.

### User Story
As a user, I want my snack-free and alcohol-free streaks saved on my account, so that they're correct on any device.

### Acceptance Criteria
1. Migration `database/migrations/<date>-mpp-<n>-pet-habit-streaks.sql` adds a **per-day log** `(user_id, habit, day, clean)`, unique on `(user_id, habit, day)`, with `habit ∈ {SNACK, ALCOHOL}`. It also adds a summary row per `(user_id, habit)` (current streak start, best, last answered date). The per-day log is what T16's rolling 30-day score reads. `ddl-auto: validate` passes.
2. `GET /api/pet/habits` returns for each habit: `current`, `best`, `lastAnsweredDate`, `askToday` (true when not answered today) and `coversFrom` (day after `lastAnsweredDate`).
3. `POST /api/pet/habits/{habit}/answer`:
   - `{ clean: true }` credits every day from `coversFrom` to today, so a skipped day never breaks the streak.
   - `{ clean: false, lapseDate }` (validated `coversFrom ≤ lapseDate ≤ today`) credits clean days before the lapse, restarts the streak from `lapseDate`, and keeps `best`.
4. Answering twice on the same day is idempotent: the second clean answer doesn't double count.
5. Service tests cover clean, skip-then-clean, lapse today, backdated lapse, and repeat answers. `mvn test` is green.

### Scope Boundaries
**In scope:** entity, repository, service rules, controller, DTOs, migration, tests.
**Out of scope:** the bubble UI (T6), awards/milestones (T7).

### Dependencies & Risks
- **Default: habits are per user (the caller), not per meal-plan owner.** Linked accounts share Pip and the plan, but a partner's snacks shouldn't break your streak. This is an explicit exception to the owner resolution in `PetService`, so flag it in the contract.
- "Today" uses the server's date in the user's zone. Default Europe/Dublin until a per-user zone exists.
- The migration must be applied to Railway before the backend deploys.

### Design Assets
N/A (backend). Behaviour reference: mockup v5 check-in.

---

## T6 — Pip's daily check-in in his speech bubble
- **Type:** Story · **Priority:** Medium · **Parent:** MPP-15 · **Skill:** react-frontend
- **Blocked by:** T1, T5 · **Blocks:** T13

### Problem Statement
The user wants Pip to ask about snacks and alcohol once a day and to celebrate clean days, without a form taking up space under the room.

### User Story
As a user, I want Pip to ask me once a day whether I had snacks or alcohol, and to cheer me on or kindly let me start over, so that I stick with it.

### Acceptance Criteria
1. When `askToday` is true, Pip's bubble asks "Did you have any snacks today?" with **No 🙌 / Yes / Not now**, then the same for alcohol. Wording uses `coversFrom`: "today", "since yesterday", "since Wednesday".
2. **No** shows praise, e.g. "5 days snack-free! So proud of you 💜".
3. **Yes** asks "That's ok! When did you have it?" with a date input (default today, min `coversFrom`, max today) and **Save**. Pip replies "We can start over 💜 … your best is still N".
4. **Not now** hides the question until the next day: "No worries, I'll ask tomorrow 💜".
5. No check-in card or chips appear outside the room (UI space requirement). The bubble is keyboard-operable and the date input is labelled.

### Scope Boundaries
**In scope:** bubble question flow, answer calls to T5, reactions.
**Out of scope:** award announcements and the cabinet (T7/T8).

### Dependencies & Risks
- Never shaming. Lapses are always "that's ok, we can start over".
- If the API fails, the bubble falls back to the default greeting and asks again on the next visit.

### Design Assets
Mockup v5 → Pip's bubble, "Next day ▶".

---

## T7 — Plan streak and the repeating milestone ladder
- **Type:** Task · **Priority:** Medium · **Parent:** MPP-15 · **Skill:** java-backend
- **Blocked by:** T5 · **Blocks:** T8, T9, T16

### Problem Statement
Trophies and ribbons need one rules engine:
- a "followed the plan" streak derived from eaten flags,
- one milestone ladder shared by all three streaks, repeating every 30 days,
- an award ledger that counts how many times each award was earned.

### User Story
As a user, I want to earn trophies and ribbons for keeping my streaks, again and again, so that there's always a next goal.

### Acceptance Criteria
1. Ladder constant: 1, 3, 5 and 7 days, then 2 weeks, 3 weeks and 1 month (30). Cycle length is 30: streak day `s` maps to ladder day `((s−1) mod 30)+1`, so day 31 re-earns the 1-day award.
2. Plan streak: a day counts when every planned breakfast/lunch/dinner that day is marked eaten. Days with nothing planned neither count nor break it.
3. Migration adds an award ledger. Each row is (user, streak type PLAN/SNACK/ALCOHOL, milestone, streak start date, cycle index), unique, so awarding is idempotent.
4. `GET /api/pet/awards` returns, per streak type: `current`, `best`, `counts {milestone: n}` and `next {milestone, inDays}`.
5. Tests cover crossing day 30 into day 31, re-earning after a lapse, and idempotency. `mvn test` is green.

### Scope Boundaries
**In scope:** plan streak computation, ladder rules, ledger, awards endpoint, migration.
**Out of scope:** cabinet UI (T8), firsts (T9), any currency payout for awards.

### Dependencies & Risks
- **Default plan-streak definition** (open in the spec): every planned B/L/D for the day eaten. It lives in one method so it can be changed.
- Plan streak is for the meal-plan **owner** (shared plan). Snack/alcohol are per user (T5).
- Migration applied to Railway before deploy.

### Design Assets
N/A (backend). Reference: mockup v5 cabinet.

---

## T8 — Trophy cabinet: tap to see trophies, ribbons and streaks
- **Type:** Story · **Priority:** Medium · **Parent:** MPP-15 · **Skill:** react-frontend
- **Blocked by:** T1, T7, T9 · **Blocks:** T13, T17

### Problem Statement
Earned awards need a home. The cabinet in the room should open into a full-screen view of every streak, award and next goal.

### User Story
As a user, I want to tap Pip's trophy cabinet and see my trophies, ribbons and streaks, so that I can see my progress and what to aim for next.

### Acceptance Criteria
1. The cabinet is a keyboard-reachable button. It opens a full-screen view inside the room card with "Back to room", and focus returns to the cabinet on close.
2. Three shelves:
   - 📅 Followed the plan (trophies), 🍪 No snacks (ribbons), 🍷 No alcohol (ribbons).
   - Each shows "Now N days · best M" and "next: <milestone> in X days".
3. Each of the 7 awards shows a gold **×N** badge when earned and is greyed when N = 0.
4. The note "The ladder starts again after a month…" is shown, and a "Firsts — things to try" shelf lists T9's items as earned / to do.
5. When a new award is earned (from T6's answer or the plan streak), Pip's bubble announces it: "🎉 New ribbon: 1 week snack-free (×2)!".

### Scope Boundaries
**In scope:** cabinet view, award rendering, the new-award bubble.
**Out of scope:** cabinet upgrades (T11).

### Dependencies & Risks
- The cabinet art in the room stays level 1 until T11.

### Design Assets
Mockup v5 → tap the cabinet; "+7 clean days ⏩".

---

## T9 — "Firsts": one-off achievements for trying FoodBytes features
- **Type:** Task · **Priority:** Medium · **Parent:** MPP-15 · **Skill:** java-backend
- **Blocked by:** T7 · **Blocks:** T8, T17

### Problem Statement
The cabinet's "things to try" list nudges users toward features that support consistency. To show earned/to-do, the server must know when each first happened.

### User Story
As a user, I want the cabinet to show which FoodBytes features I've tried and which I haven't, so that I discover tools that help me plan.

### Acceptance Criteria
1. Four firsts are recorded once per user, with a timestamp:
   - **Make a template:** `POST /api/meal-plan-templates`.
   - **Generate a shopping list:** `POST /api/shopping-list/generate`.
   - **Plan a full week:** a 7-day window with B/L/D all planned.
   - **Cook a homemade extra:** an eaten entry whose recipe has a linked extra chosen as homemade (MPP-10 server-side extra choices).
2. Recording is a side effect in the services, not the controllers, and never fails the original request.
3. `GET /api/pet/awards` (T7) includes `firsts: [{key, earnedAt|null}]`.
4. Existing users get firsts backfilled where the data already proves them (templates, generated list, full week).

### Scope Boundaries
**In scope:** firsts table + migration, recording hooks, backfill, API field.
**Out of scope:** any first that rewards trying new recipes or cuisines (MPP-11 rule).

### Dependencies & Risks
- Default: firsts are per meal-plan owner, because templates, lists and plans are shared.
- Migration applied to Railway before deploy.

### Design Assets
N/A.

---

## T10 — Sprinkles: a consistency-only currency
- **Type:** Story · **Priority:** Low · **Parent:** MPP-15 · **Skill:** java-backend, react-frontend
- **Blocked by:** T1 · **Blocks:** T11

### Problem Statement
Upgrades need a currency earned only from consistency. It must be tamper-proof against un-ticking and re-ticking a meal.

### User Story
As a user, I want to earn sprinkles for logging meals, planning my week and cooking homemade, so that I can upgrade Pip's room.

### Acceptance Criteria
1. Migration adds a ledger with entries `(owner, source_type, source_id, amount, created_at)` and a unique `(owner, source_type, source_id)`, so each source pays once ever.
2. Earning rules, as named constants:
   - Meal logged eaten: 10.
   - Logged by its meal time: +5.
   - Full week planned: 20.
   - Homemade extra cooked: +5.
3. Un-ticking an eaten meal does not refund or re-earn.
4. `GET /api/pet` includes `sprinkles` (balance). The room shows a small sprinkles counter.
5. Tests cover each rule and the re-tick case. No rule rewards variety.

### Scope Boundaries
**In scope:** ledger, earning hooks, balance in the pet payload, counter UI.
**Out of scope:** spending (T11); awards paying sprinkles (not decided, so not built).

### Dependencies & Risks
- **The amounts are illustrative** (from the research proposal) and are retunable constants. Target is about 300/week from about 21 logged meals.
- Balance belongs to the meal-plan owner (shared pet).
- Migration applied to Railway before deploy.

### Design Assets
N/A beyond the counter. Use the room's existing bubble/hint styling.

---

## T11 — Shop: upgrade Pip's bed, fridge, cooker and trophy cabinet
- **Type:** Story · **Priority:** Low · **Parent:** MPP-15 · **Skill:** java-backend, react-frontend
- **Blocked by:** T10 · **Blocks:** T12

### Problem Statement
The upgrade path (levels 1–4 per station) already exists as art from T1. Users need a way to spend sprinkles to unlock it, and the result must persist.

### User Story
As a user, I want to spend sprinkles to upgrade Pip's furniture, so that his room gets nicer as I stay consistent.

### Acceptance Criteria
1. Migration adds station levels per owner (bed, fridge, cooker, cabinet), all starting at 1.
2. `POST /api/pet/stations/{station}/upgrade` debits the cost and raises the level by one, transactionally. It rejects at level 4 or with too few sprinkles. Costs are constants: 300 → L2, 600 → L3, 1200 → L4.
3. A shop sheet opened from the room lists each station's current level, the next level's preview and its cost.
4. The room renders the owned levels through T1's `levels` prop. Upgrades are never lost.
5. Linked accounts see the same levels.

### Scope Boundaries
**In scope:** station levels, the upgrade endpoint, the shop sheet, the room reading levels.
**Out of scope:** decor and styles (T12); paid purchases.

### Dependencies & Risks
- Costs are illustrative and retunable.
- The shop sheet needs a quick mockup review (memory: mockup before UI code). Flag it in the contract.
- Migration applied to Railway before deploy.

### Design Assets
Upgrade art: mockup v5 levels 1–4. The shop sheet still needs a mockup.

---

## T12 — Decor spots, wall and floor styles, and edit mode
- **Type:** Story · **Priority:** Low · **Parent:** MPP-15 · **Skill:** java-backend, react-frontend
- **Blocked by:** T11 · **Blocks:** T13

### Problem Statement
Focus Friend's long-term pull is decorating. The room has three fixed empty spots (left wall, right wall, floor) plus wall and floor finishes for users to personalise.

### User Story
As a user, I want to buy decorations and change Pip's wall and floor colours, so that the room feels like mine.

### Acceptance Criteria
1. A catalogue of decor items, each tied to one spot type (left wall, right wall, floor), and of wall and floor styles, each with a price constant.
2. Migration adds owned items and the placement per spot per owner. Buying debits sprinkles. Owned items are kept forever.
3. Edit mode (from the room) shows the dashed empty spots and lets the user place, swap or clear an owned item in each spot.
4. The room renders placed decor and the chosen styles. Linked accounts see the same room.

### Scope Boundaries
**In scope:** decor catalogue, purchase, placement, styles, edit mode.
**Out of scope:** free placement anywhere, more spots, more rooms.

### Dependencies & Risks
- **Pause condition, visual judgement:** the decor catalogue (which items, how many, art) needs a mockup the developer approves before code. Raise it at `/fb-plan` time.
- Migration applied to Railway before deploy.

### Design Assets
Spot positions: mockup v5 "Show empty decor spots". The item catalogue still needs a mockup.

---

## T13 — Integrate the room: one pet payload and cross-feature consistency
- **Type:** Task · **Priority:** Low · **Parent:** MPP-15 · **Skill:** java-backend, react-frontend
- **Blocked by:** T3, T4, T6, T8, T12, T16, T17 · **Blocks:** T14

### Problem Statement
By T12 the room reads from `/pet`, `/pet/habits`, `/pet/awards`, sprinkles and stations, and each piece was built separately. This ticket wires them into one coherent page load and reconciles mismatches.

### User Story
As a user, I want Pip's room to load quickly and behave consistently, so that every part of it agrees with the others.

### Acceptance Criteria
1. The Pet page loads the room's data in at most two requests: `GET /api/pet` is extended or one room endpoint is added. No waterfall of 5 calls.
2. Bubble priority is defined and implemented: cook sequence > new award > check-in question > fridge-low > time-of-day greeting.
3. Linked accounts: shared things (plan streak, fridge, sprinkles, stations, decor, firsts) match on both accounts, and personal things (snack/alcohol) don't leak.
4. The footer tab, `PetReaction` and mood still behave as in MPP-14.

### Scope Boundaries
**In scope:** payload consolidation, bubble priority, sharing audit, regression pass.
**Out of scope:** new features.

### Dependencies & Risks
- Mismatches found here become fixes in this ticket, unless they are large. Large ones are logged as Bugs under MPP-15.

### Design Assets
N/A.

---

## T14 — Visual and motion polish pass for Pip's room
- **Type:** Task · **Priority:** Low · **Parent:** MPP-15 · **Skill:** react-frontend
- **Blocked by:** T13 · **Blocks:** T15

### Problem Statement
Each surface shipped with a functional default (the "state a default, don't stall" principle). The room as a whole needs one pass for spacing, colour, interactive states and motion, so it reads as finished.

### User Story
As a user, I want Pip's room to look and feel polished, so that it's a pleasure to open every day.

### Acceptance Criteria
1. Hover/focus/pressed states exist for the fridge, cabinet, shop and edit controls, with visible focus rings.
2. Animation timings (hop, steam, cook, serve) feel consistent and none exceeds 3 s end to end. Reduced-motion is respected everywhere.
3. Dark mode: the room, the overlays and the bubble are legible in both themes.
4. The phone check at 320 / 375 / 414 px has no clipping and no horizontal scroll. The developer signs off on screenshots.
5. Decide (and record the decision) whether to add the mini cook animation next to `PetReaction` (T3 open question).

### Scope Boundaries
**In scope:** visual and motion refinement, dark mode, accessibility states.
**Out of scope:** new art for new items.

### Dependencies & Risks
- **Pause condition, visual judgement:** the developer reviews before/after screenshots. Ask whether to skip if time is short.

### Design Assets
Mockup v5 as the baseline.

---

## T15 — MPP-15 sign-off: play-test the epic's Definition of Done
- **Type:** Task · **Priority:** Low · **Parent:** MPP-15 · **Skill:** none (developer play-test; `/fb-*` QA as support)
- **Blocked by:** T14 · **Blocks:** none

### Problem Statement
The per-ticket tests prove each part works. Sign-off proves the epic delivered what MPP-15 promised, end to end, on the deployed app.

### User Story
As the developer, I want to verify every MPP-15 Definition of Done item on the live app, so that the epic can be closed with confidence.

### Acceptance Criteria
1. Each of MPP-15's 8 Definition of Done items is checked on the deployed Railway app, with pass/fail and evidence (a screenshot or note) in a comment on MPP-15.
2. A linked-account pair is tested: shared vs personal data behaves as T13 defines.
3. The deployed web and api versions are at least the version of the last MPP-15 child (CLAUDE.md → "Is my fix live?").
4. Every failure is logged as a Bug under MPP-15 before closing the epic.

### Scope Boundaries
**In scope:** end-to-end verification against the DoD.
**Out of scope:** re-running per-ticket unit tests; new features.

### Dependencies & Risks
- Needs all Railway migrations from T5, T7, T9, T10, T11 and T12 applied.

### Design Assets
N/A.

---

## T16 — Pip's glow-up: body stages follow a 30-day fitness score
- **Type:** Story · **Priority:** Medium · **Parent:** MPP-15 · **Skill:** java-backend, react-frontend
- **Blocked by:** T1, T5, T7 · **Blocks:** T17, T13

### Problem Statement
The user wants consistency rewarded visually. Pip should slim down and muscle up the more consistent the user is, reach "Ripped" after a perfect month, and lose shape gently if they slip. Today his body is fixed (MPP-14 AC 9).

### User Story
As a user, I want Pip to get fitter the more days I follow the plan and skip snacks and alcohol, so that I can see my consistency paying off.

### Acceptance Criteria
1. The backend computes a **fitness score** over the last 30 completed days (today is excluded until answered). Per day: +1 if the plan was followed (T7 definition), +1 if snack-free and +1 if alcohol-free (T5 per-day log). Range 0–90. Returned on `GET /api/pet` as `fitness { score, stage }`.
2. Stages: 0–14 Mochi, 15–35 Warming up, 36–59 Toned, 60–89 Fit, 90 Ripped. Thresholds are named constants. Tests cover each boundary, the window rolling forward, and dropping a stage.
3. `MochiPet` takes a `stage` (1–5) and draws the mockup's parametric body:
   - shoulder width, waist and height per stage;
   - arms from stage 2, flexing from stage 4;
   - ab and pec lines from stage 3.

   The face, colour and outline stay the same. Used in the room, the footer tab and `PetReaction`.
4. When the stage changes since the last visit, Pip says so once:
   - Going up: "Getting stronger! 💪".
   - Going down: "Lost a little shape 😅 A few good days and we're back!".
   - Reaching Ripped: "Perfect month! Look at these guns 💪".

   The messages never shame.
5. The mood faces (MPP-14) still apply on every body. The `mini` variant crops correctly at every stage.

### Scope Boundaries
**In scope:** score + stage API, the parametric body in `MochiPet`, the stage-change bubble.
**Out of scope:** clothing (T17); any reward for food variety.

### Dependencies & Risks
- **Supersedes MPP-11 DoD item 6** ("never changes body shape") and MPP-14 AC 9 (identical body path). Update MPP-11's description when this ticket is created.
- Score inputs: plan days are the meal-plan **owner's**; snack/alcohol are the **viewer's** own (T5). Default: a linked partner sees their own Pip shape. This conflicts with "one shared Pip", so flag it at `/fb-plan`. The alternative is to use the owner's habits.
- Unanswered days (skipped check-ins later caught up) count once answered. Days never answered score 0 for that habit.

### Design Assets
`.claude/contract/MPP-15-epic-breakdown/mockups/pip-progression-mockup.html`, sections 1–2 (stages + three-slider simulator).

---

## T17 — Wardrobe: unlock clothes and dress Pip
- **Type:** Story · **Priority:** Medium · **Parent:** MPP-15 · **Skill:** java-backend, react-frontend
- **Blocked by:** T16, T8, T9 · **Blocks:** T13

### Problem Statement
Achievements need a tangible, fun reward beyond the cabinet. Clothes Pip can wear, unlocked by specific achievements and wearable on any body stage, give that.

### User Story
As a user, I want to unlock clothes for Pip by hitting my goals and choose what he wears, so that he reflects what I've achieved.

### Acceptance Criteria
1. A catalogue with four slots (head, top, bottom, extras), each item tied to an unlock condition:
   - **Head:** chef hat (first homemade extra), sweatband (1 week snack-free), cap (5 days alcohol-free), headband (3 weeks followed the plan).
   - **Top:** apron (3 days followed the plan), T-shirt (first full week planned), running vest (2 weeks followed the plan), tank top (2 weeks snack-free).
   - **Bottom:** gym shorts (1 week alcohol-free).
   - **Extras:** wristbands (3 weeks alcohol-free), gold medal (any 1-month streak), champion belt (perfect month).

   Conditions are data, not code branches.
2. Unlocks are granted when the matching award or first is earned (T7/T9) and are **kept forever**, even if Pip loses shape (T16).
3. A "Dress Pip" screen opens from the room. It has a live preview, chips per slot showing locked/unlocked with the unlock condition, and one item per slot except extras (any combination). The chosen outfit persists.
4. Pip wears his outfit in the room, the footer tab and `PetReaction`. Tops and bands are clipped to the body so they fit every stage.
5. A new unlock is announced in Pip's bubble ("🎉 New outfit: Sweatband!").

### Scope Boundaries
**In scope:** catalogue, unlock grants + migration, equip API, dressing screen, rendering on all stages.
**Out of scope:** buying clothes with sprinkles (could be added in T11/T12); clothes tied to food variety.

### Dependencies & Risks
- Default: wardrobe and outfit belong to the meal-plan owner, like the room. This needs to be decided together with T16's shared-vs-personal question.
- Art: the mockup's 11 items are the baseline. The cap was redrawn on 2026-10-13 after feedback. Final art is reviewed in T14.
- Migration applied to Railway before deploy.

### Design Assets
`.claude/contract/MPP-15-epic-breakdown/mockups/pip-progression-mockup.html`, section 3 (dressing room).
