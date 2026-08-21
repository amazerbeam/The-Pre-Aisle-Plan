# MPP-5 — Audit and fix all unaudited recipe families

Full five-lens audit of every recipe family that had never been through one, plus the
remediation needed to make each of them pass. Everything lands as a single, manually-applied
DML migration; no application source file changed.

**Contract documents** (in `.claude/contract/MPP-5-audit-unaudited-recipe-families/`):

- [`plan.md`](.claude/contract/MPP-5-audit-unaudited-recipe-families/plan.md) — the approved plan
- [`findings.md`](.claude/contract/MPP-5-audit-unaudited-recipe-families/findings.md) — the read-only Phase 1 audit report (122 KB, the evidence behind every fix)
- [`decisions.md`](.claude/contract/MPP-5-audit-unaudited-recipe-families/decisions.md) — the developer's answers at the Phase 2 gate. **Where it disagrees with `plan.md` or `tasks.md`, it wins.**

---

## What this does

Audited every family against the five lenses (macros, units, step quality, portion realism,
naming), then fixed what failed:

| | |
|---|---|
| Families audited and signed off | **30** (two blocks: 15 already macro-clean, 15 after remediation) |
| Families reclassified as cheat meals | **5** — 14 Steak & Chips, 16 Avocado Toast, 28 Tortilla Espanola, 29 French Toast, 93 Chicken Carbonara |
| Macro rejects cleared | **28** |
| Structural fixes | `is_default` moved Balanced → Moderate on **10** families; member 107 (Pizza "Balanced 2") retired; `display_order` renumbered 1/2/3 on families 35 and 8; family 8 given the Light it never had (new recipe id **269**) |
| Recipes with steps rewritten | the prose pass covers every audited family — linked steps, `alt_instruction` and `tip` carried through verbatim |
| Unit-realism rows | **0** — Task 14 was dropped to MPP-6 (see below) |

**Headline result:** every variant in all 30 audited families now passes the hard rejects —
protein ≥ 35 g/serving, fat ≤ 35 % of kcal, carbs ≥ 38 % of kcal — with `Light < Moderate <
Balanced` kcal ordering intact in every family. Per-serving kcal is a design target, not a
reject (`.claude/rules/recipe-variants.md`, 2026-07-30 policy), so the handful of families
running above their band are signed off deliberately.

---

## Scope changes agreed at the Phase 2 gate

These are departures from `plan.md`, all approved by the developer and recorded in
`decisions.md`:

1. **Five cheat families, not four.** Family 93 (Chicken Carbonara) joins the original four:
   *"Make it a cheat meal and double the sauce and increase the bacon. It's not nice as is."*
   Cheat families are exempt from the macro audit **and** from structural fixes, and
   `macros_audited` stays `0` on all 16 of their recipes — a cheat meal must never read as
   signed off. Family 93's sauce (egg + Parmesan, doubled together) and pancetta are
   increased in Phase 11b; that block is explicitly not an audit and produces no sign-off.
2. **30 audit families / 90 live recipes**, down from 31 / 93.
3. **Task 14 (unit realism) is void** — moved to
   [MPP-6](https://amazerbeam.atlassian.net/browse/MPP-6), *Standardise ingredient display
   units*, so those rows are not set twice. Zero unit-only rows are touched here.
4. **Family 105 fully reworked and renamed.** The ham and the brioche bun are dropped, the
   patty is linked to the `Burger Patties` recipe, and pita is added as an FR-103 dual-path
   row (homemade `Pita Bread` link + store-bought fallback) with its matching prep step. The
   family and all three recipes are renamed to
   *Beef Burger in Pita with Lettuce & Tomato* — the old name listed two components the dish
   no longer contains. This is an agreed exception to `plan.md`'s "no renaming beyond the
   ` - Diet` suffix" boundary.
5. **Family 7 added** to the `is_default` move — 10 families, not 9. It is out of ticket
   scope and already attested; the attestation is deliberately not cleared, because moving
   the default flag touches no ingredient, serving count or calorie value.
6. **Pad Thai loses its fish sauce as well as its prawns**, replaced with Worcestershire +
   MSG. `plan.md` listed the fish sauce as an open recommendation; the developer applied it.
   Worcestershire **stays** in families 5 and 22 — the standing position is *fish sauce out,
   Worcestershire in*, a dose judgement rather than an ingredient ban.
7. **Family 96's yogurt cut is partial** — see accepted exceptions below.

Other changes beyond the original ticket: jalapenos on Chicken Burrito Bowl (with a new
`Jalapeno` ingredient row, dedup-checked against every chilli/pepper spelling in the table),
the `Potatoes` (69) → `Potato` (121) ingredient merge, recipe 212's over-yield pasta portion
(300 g against a 282 g yield → 280 g), and the ` - Diet` name suffix removed from family 87.

---

## Accepted exceptions that persist after this PR

These are deliberate. A reader running the reject queries will see them and should not treat
them as oversights.

- **Family 28 keeps 4 members**, one labelled `Extra Light`, and **family 29 keeps `Moderate`
  at `display_order` 1.** Both are hard rejects under `.claude/rules/recipe-variants.md`.
  They persist because cheat families are exempt from structural fixes by developer
  instruction — *"that's what cheat meals are for"*.
- **Family 105 sits at 23.3 % fat** on all three variants, under the 25 % chef floor. Not a
  reject (the reject is *above* 35 %) and structural: the linked patty is 3.7 g fat/100 g and
  the pita 9.76, so no portion ratio moves the composite. Raising it would mean undoing the
  lean linked patty that was the point of the rework. The cheese/pickle remedy lives in the
  step `tip`, which costs no macros. Precedent: families 9 (23.3 %) and 107 (21.4 %).
- **Family 96 keeps a partial yogurt cut** (450 → 320 g per serving on Balanced), not the
  400/450/500 g target `decisions.md` originally asked for. That target is arithmetically
  unreachable — Greek yogurt is the bowl's only meaningful protein, and the whole
  yogurt × granola grid was searched: every cell trades the protein reject for a fat reject.
  The actual lens-4 finding (a 450 g-per-person outlier) is gone and protein stays legal at
  35.8 / 39.1 / 43.5 g.
- **Family 93's macros now read badly on paper** — fat 37–43 %, carbs under 38 %. That is the
  point: it is a cheat meal, the reject conditions no longer apply, and the developer asked
  for exactly this. Recorded so nobody later reads it as an unnoticed regression.

---

## The migration — must be applied manually

**`foodbytes-app/database/migrations/2026-08-18-mpp5-family-audit-remediation.sql`**

It is **not applied**. Merging this PR changes no data. Apply it yourself against the live
Railway MySQL.

- **DML-only.** No DDL, so unlike a schema migration it carries **no `ddl-auto: validate`
  startup risk** — the backend will not break if it is applied late. It should still be
  applied before anyone trusts the recipe cards.
- **Re-runnable from the top.** Every statement is idempotent: `INSERT`s are
  `INSERT ... SELECT ... WHERE NOT EXISTS` with `<=>` NULL-safe equality, step rewrites are
  per-recipe wipe-and-re-insert guarded on `(recipe_id, step_number)`, and the new recipe 269
  is guarded on both the id being free and family 8 having no Light.
- **Read it end to end before applying.** The header block documents every phase, every
  accepted exception and every deliberate supersession.

### Apply instructions

1. **Pre-flight, before anything else.** Run:
   ```sql
   SELECT COUNT(*) FROM recipes WHERE id = 269;
   ```
   It **must return 0.** Family 8's new Light is inserted with an explicit id of 269 because
   a session variable will not survive the Railway console, which commits per statement. It
   was free on 2026-08-18 (`MAX(recipes.id)` = 268). If it returns 1, **stop** — every
   statement touching 269 is guarded, so a collision corrupts nothing, but the entire block
   silently no-ops and family 8 stays broken. Re-point the id first.
2. **Apply as UTF-8.** From Phase 6 onward the step text contains the degree sign (200°C,
   74°C), matching what is already stored on the sibling recipes. The Railway console is
   fine; a CLI client needs `--default-character-set=utf8mb4`.
3. **Run it top to bottom, in order. Do not reorder, and do not re-paste an earlier section
   after a later one has landed.** The Railway console commits per statement, and two later
   statements deliberately supersede earlier ones — most importantly recipe 212's `calories`,
   which Phase 5 sets to 1425 and Phase 11b corrects to 1884 once the sauce is doubled.
4. **Stop at the mandatory check inside Phase 9.** After the family 8 block:
   ```sql
   SELECT COUNT(*) AS family_8_members FROM recipe_family_members WHERE family_id = 8;
   ```
   It **must return 3.** A 2 means the id collision above happened and the block no-opped.
5. **Run the verification block at the bottom of the file** (recipe 212's calories, family
   8's member count, and that nothing anywhere still references ingredient 69), then the full
   reject-query set in `tasks.md` Phase 12 → Tasks 36, 37 and 38.

---

## Verification

- **No application source file changed.** This PR is one `.sql` file plus contract
  documentation. Frontend and backend are untouched.
- **Backend test suite is at baseline: 46/50 passing.** `mvn test` reports `BUILD FAILURE`
  on this repo and always has — `AuthControllerLoginTest` is a known pre-existing failure and
  no test boots a JPA context. **This is not a regression from this PR**, and no test in the
  suite reads the recipe data this migration touches.
- The migration's own figures: Phases 3–5 were written from `findings.md`'s recorded
  live-query results (the DB was unreachable at the time); **from Phase 6 onward every macro
  figure was recomputed from the live rows** on 2026-08-18 — raw ingredients
  (`quantity_grams` × per-100g) plus linked recipes prorated by
  `parent quantity_grams / linked total yield`, kcal by Atwater 4P + 4C + 9F — and validated
  against `findings.md`'s published baselines before any fix was designed. Corrections found
  against live data are listed at the bottom of `decisions.md`.

---

## Notes for future contributors

- **`recipes.calories` is whole-recipe kcal, not per-serving** (`kcal_per_serving ×
  default_servings`), and it must be computed on the **homemade** basis — nutrition always
  comes from the homemade linked recipe, never from the store-bought fallback, even when the
  user has selected store-bought.
- **Sub-recipes and extras are excluded from the family audit flow** by standing developer
  instruction: they are read-only inputs. When a parent's portion exceeds a child's yield,
  fix the parent's portion — never the child's yield. Recipe 212's 300 g → 280 g pasta fix is
  the worked example.
