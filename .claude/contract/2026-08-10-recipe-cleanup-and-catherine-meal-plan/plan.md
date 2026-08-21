# Plan: Delete 6 unused recipe families + build Catherine Duffy a 1400kcal Monday meal plan

Plan folder: `.claude/contract/2026-08-10-recipe-cleanup-and-catherine-meal-plan/`

**Status: COMPLETE** — executed live against Railway MySQL on 2026-08-10.
- All 6 families / 14 recipes deleted, confirmed 0 remaining.
- Catherine's 2026-08-17 meal plan inserted (`meal_plan_entries` ids 1611-1613).
- Template "1400 Cal High Protein Day" created (id 4), Monday entries inserted (`meal_plan_template_entries` ids 135-137).

---

## Part 1 — Alignment

### Task reference

No Jira ticket — ad-hoc live-DB request raised directly in conversation, following the recipe macro audit done under MPP-4.

> **Objective:** Two independent pieces of live-database work: (1) remove 6 recipe families the developer doesn't want in the catalogue, cleanly and without silently breaking anyone else's meal-plan history; (2) build a new, macro-conscious ~1400kcal day for a second app user (Catherine Duffy) on Monday 2026-08-17, and save it as a reusable weekly template on her account.

### Background

A macro/structure audit of the full recipe catalogue (run after MPP-4 closed) surfaced pre-existing violations across ~15 families unrelated to that epic. The developer reviewed the list and asked to delete 6 specific families:

- `Miso Glazed Salmon`, `Salmon & Asparagus`, `Teriyaki Salmon`, `Salmon en Papillote` — "I never eat them and I want them out."
- `Breaded Chicken with Mash & Black Beans`, `Oat Arepa with Cheddar & Fried Egg`

Investigation before planning found:
- The 4 salmon families have **zero** references anywhere (`meal_plan_entries`, `meal_plan_template_entries`, `recipe_extras`, other recipes' `linked_recipe_id`) — clean to delete.
- The Chicken/Arepa pair have **8 live `meal_plan_entries` rows** across two accounts: `user_id 1` (the developer) and `user_id 6` (**Catherine Duffy**, cathduffy5150@gmail.com — a separate, non-shared account: `meal_plan_owner_id` is null on both users, so her plan is genuinely her own).
- All 8 of those entries are dated 2026-01-24 through 2026-04-04 — **all in the past** relative to today (2026-08-10). Deleting cascades (`fk_meal_plan_recipe` is `ON DELETE CASCADE`) and removes them, but nothing on anyone's upcoming calendar is affected.
- The developer confirmed: remove the meal-plan entries explicitly, then delete the recipes.

Separately, the developer asked for a new meal plan for Catherine: **Monday 2026-08-17**, targeting **~1400 kcal** with solid macros, also saved to her **meal plan templates** (she currently has none).

### Restated goal

Clean up the 6 flagged recipe families from the live catalogue with zero silent side effects on any user's calendar, and give Catherine a verified, macro-target-compliant single day of meals for 2026-08-17 that's also saved as a reusable weekly template on her account.

### In scope

- Delete `meal_plan_entries` rows 354, 394, 426, 474, 481, 587, 754 (`user_id 1`) and 337 (`user_id 6`) — the 8 rows referencing the Chicken/Arepa pair.
- Delete all `recipe_family_members`, `recipe_ingredients`, `recipe_steps`, `recipe_meals`, `recipes`, `recipe_families` rows for the 6 named families (14 recipes total).
- Design a 3-meal day (breakfast/lunch/dinner) for `user_id 6` targeting ~1400kcal, verified against the same protein/fat/carbs reject conditions used throughout this project — using **existing, already-macro-verified** recipes rather than designing new ones.
- Insert that day into `meal_plan_entries` for `user_id 6`, `plan_date = 2026-08-17`.
- Create a new `meal_plan_templates` row for `user_id 6` and insert the same 3 meals at `day_offset = 0` (Monday).

### Explicitly out of scope

- Any other flagged pre-existing macro/structure violation from the earlier audit (Pizza, Tortilla Española, French Toast, Steak & Chips, etc.) — not requested, left untouched.
- Designing new recipes for Catherine's day — reusing existing, already-verified catalogue entries only.
- Filling out the rest of Catherine's template week (Tue–Sun) — only Monday was requested.
- Touching `user_id 1`'s own meal-plan history beyond the 7 entries directly tied to the deleted recipes.

### Assumptions made

- **Removing the meal-plan entries as an explicit step, not relying on the `ON DELETE CASCADE`** — matches the developer's own phrasing ("we can remove the entries from their plan. and delete") and makes the deletion auditable as two distinct, reviewable operations rather than one implicit side effect.
- **`day_offset = 0` = Monday** — confirmed against the one existing template in the DB (`user_id 1`'s "Hight Protein Low Cal", 7 rows at `day_offset` 0–6, breakfast/lunch/dinner pattern matches a standard week starting Monday).
- **Template name:** `"1400 Cal High Protein Day"` — descriptive of what was actually built; the developer can rename after review.
- **No existing template to append to** — confirmed Catherine has zero rows in `meal_plan_templates`, so this creates a new template rather than modifying one.

---

## Part 2 — Technical design

### Approach

Two independent, sequential pieces of work against the live Railway MySQL — no schema change, no migration, no code. Deletion runs first (Task 1), meal-plan build runs second (Task 2); they don't depend on each other but are grouped in one plan because they came out of the same conversation and both touch `user_id 6`'s account.

### Meal selection for Catherine's day — verification, not guesswork

Per this project's macro-recompute convention (never trust stored `calories`), every candidate was recomputed from `recipe_ingredients` (+ prorated linked-recipe contributions where applicable) before selection. Final picks, all independently verified against the standard reject conditions (protein ≥35g/serving, fat ≤35% kcal, carbs ≥38% kcal):

| Meal | Recipe (Light variant) | id | kcal | Protein | Fat | Carbs | Fat% | Carbs% |
|---|---|---|---|---|---|---|---|---|
| Breakfast | Apple, Cinnamon & Walnut Porridge | 214 | 475.3 | 35.73g | 12.90g | 54.08g | 24.4% | 45.5% |
| Lunch | Chicken & Vegetable Soup | 23 | 461.8 | 37.59g | 13.44g | 47.56g | 26.2% | 41.2% |
| Dinner | Baked Cod with Lemon, Herbs & New Potatoes | 235 | 458.6 | 41.61g | 11.31g | 47.61g | 22.2% | 41.5% |
| **Day total** | | | **1395.7** | **114.93g** | **37.65g** | **149.25g** | **24.3%** | **42.8%** |

1395.7 kcal — 4.3 under the 1400 target, as close as three whole-serving picks from the existing catalogue allow without introducing a fourth micro-meal. Protein comes out very high (33% of kcal, 115g) which is a deliberate, favourable outcome for a calorie-restricted day (satiety, muscle retention — consistent with the project's own protein-floor rationale in `CLAUDE.md`). All three source recipes are `macros_audited`-quality verified: two (Porridge, Cod) were designed and verified fresh under MPP-4 this session; the third (Chicken & Vegetable Soup) was recomputed live as part of this plan, not assumed from its stored `calories`.

### Data shapes

#### Deletion order (per the live FK graph — `recipe_family_members`/`recipe_ingredients`/`recipe_steps`/`recipe_meals` have no cascade from `recipes`, so each needs an explicit `DELETE`; `meal_plan_entries.recipe_id` does cascade but is deleted explicitly first per the developer's instruction)

```sql
-- Step 1: remove the 8 meal-plan entries tied to the Chicken/Arepa pair (explicit, not relying on cascade)
DELETE FROM meal_plan_entries WHERE recipe_id IN (101, 102, 103, 114, 115, 116);

-- Step 2: delete recipe content for all 6 families (14 recipe ids)
-- Salmon families: 66, 67 (Miso Glazed Salmon) | 69, 70 (Salmon & Asparagus)
--                  72, 73 (Teriyaki Salmon)     | 75, 76 (Salmon en Papillote)
-- Chicken/Arepa:    101, 102, 103 (Breaded Chicken) | 114, 115, 116 (Oat Arepa)
DELETE FROM recipe_family_members WHERE recipe_id IN (66,67,69,70,72,73,75,76,101,102,103,114,115,116);
DELETE FROM recipe_ingredients    WHERE recipe_id IN (66,67,69,70,72,73,75,76,101,102,103,114,115,116);
DELETE FROM recipe_steps          WHERE recipe_id IN (66,67,69,70,72,73,75,76,101,102,103,114,115,116);
DELETE FROM recipe_meals          WHERE recipe_id IN (66,67,69,70,72,73,75,76,101,102,103,114,115,116);
DELETE FROM recipes               WHERE id        IN (66,67,69,70,72,73,75,76,101,102,103,114,115,116);

-- Step 3: delete the now-empty family shells
DELETE FROM recipe_families WHERE id IN (18, 19, 20, 21, 30, 34);
```

Pre-verified zero rows in `recipe_extras` (parent/child) and other recipes' `linked_recipe_id` reference any of these 14 ids — no sub-component entanglement to worry about.

#### Catherine's meal plan (`meal_plan_entries`, `plan_date = '2026-08-17'`, `user_id = 6`)

```sql
INSERT INTO meal_plan_entries (user_id, plan_date, meal_id, recipe_id, servings) VALUES
(6, '2026-08-17', 1, 214, 1.00),  -- Breakfast: Apple, Cinnamon & Walnut Porridge (Light)
(6, '2026-08-17', 2, 23,  1.00),  -- Lunch: Chicken & Vegetable Soup (Light)
(6, '2026-08-17', 3, 235, 1.00);  -- Dinner: Baked Cod with Lemon, Herbs & New Potatoes (Light)
```

#### Catherine's template (`meal_plan_templates` + `meal_plan_template_entries`, Monday = `day_offset 0`)

```sql
INSERT INTO meal_plan_templates (user_id, name, created_at, updated_at)
VALUES (6, '1400 Cal High Protein Day', NOW(), NOW());
-- capture new template id, then:

INSERT INTO meal_plan_template_entries (template_id, day_offset, meal_id, recipe_id, servings) VALUES
(<template_id>, 0, 1, 214, 1.00),
(<template_id>, 0, 2, 23,  1.00),
(<template_id>, 0, 3, 235, 1.00);
```

### Runtime quality notes

- **No transactions assumed** — per this project's own Railway MySQL caution (per-statement autocommit), each `DELETE`/`INSERT` runs as its own statement; the deletion order above is chosen so a failure partway through leaves the DB in a safe, still-consistent state (no orphaned FK references at any point — child rows always precede parent rows in the delete order).
- **Idempotency:** the deletes are naturally idempotent (deleting an already-deleted id is a no-op). The template/meal-plan inserts are **not** guarded — re-running Task 2 verbatim would create duplicate entries. If this plan is re-run, check for the template's existence first.
- **Blast radius:** confirmed via live query, not assumption — zero other users, templates, or recipes reference any of the 14 recipe ids being deleted, beyond the 8 `meal_plan_entries` rows already accounted for.

### Risks and judgement calls

- **Deleting recipes from a live production DB is irreversible** — there is no soft-delete/undo in this schema. If any of these 6 families are wanted back, they'd need to be redesigned from scratch via `/chef`.
- **Catherine's day was designed without knowing her actual dietary preferences** (allergies, dislikes, cuisine preference) — the three picks are macro-sound but the developer should sanity-check the actual dishes (porridge/soup/cod) suit her before this goes live, especially since it's also becoming a reusable template.
- **1395.7kcal, not exactly 1400** — closest achievable using three whole servings from the existing catalogue without introducing a fourth entry or fractional servings. Flagging in case an exact 1400 matters more than getting there cleanly.

---

## Self-review

**Spec coverage:** Both developer asks addressed — 6-family deletion (with explicit meal-plan-entry removal first, matching the developer's own phrasing) and Catherine's 1400kcal Monday plan + template.

**Type/id consistency:** All 14 recipe ids and 6 family ids used identically across every DELETE statement. Catherine's `user_id = 6` used consistently across the `meal_plan_entries` insert and the new `meal_plan_templates`/`meal_plan_template_entries` inserts.

**Placeholder scan:** No `TBD`/`TODO`. The one open value (`<template_id>`) is explicitly called out as "capture after insert, then use" — standard auto-increment handoff, not a vague placeholder.
