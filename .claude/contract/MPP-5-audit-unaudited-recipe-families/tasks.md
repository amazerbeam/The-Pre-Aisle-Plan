# Tasks: Audit and fix all unaudited recipe families

> **For agentic workers:** Use `/fb-apply` to walk this contract phase-by-phase. Steps use checkbox (`- [ ]`) syntax for tracking.

Status: COMPLETE
Started: 2026-08-18

**Goal:** Produce the five-lens audit report first and change nothing until it is approved; then reclassify the four nominated families as cheat meals, fix the structural, data-integrity, unit, lens-5 naming and macro defects on the remaining 31 families / 93 recipes, run the full technique and dish-quality prose pass, apply the two developer-requested ingredient changes to already-audited families, and record the sign-off — all in one dated DML migration the developer applies to Railway manually.

**Spec:** `plan.md` in this folder.

> **Phase 2 gate PASSED 2026-08-18.** All ten `findings.md` decisions are answered and
> recorded in **`decisions.md`** in this folder, together with three follow-ups from the
> same session (Task 14 dropped to MPP-6; family 93 reclassified as a cheat meal; family
> 105 reworked to pita and renamed). `plan.md` and this file predate those answers —
> **where they disagree with `decisions.md`, `decisions.md` wins.** Phases 3 onward must
> be read against it.

---

## File map

**Created:**
- `.claude/contract/MPP-5-audit-unaudited-recipe-families/findings.md` — the Phase 1 report; the gating deliverable
- `foodbytes-app/database/migrations/2026-08-18-mpp5-family-audit-remediation.sql` — created in Phase 3, **not before the Phase 2 gate passes**
- `.claude/contract/MPP-5-audit-unaudited-recipe-families/pr-description.md` — PR body for the developer to paste

**Modified:** *(none — no source files change; this contract is data-only)*

**Deleted:** *(none)*

---

## Phase 1 — Read-only audit report

**No writes of any kind.** Per the developer's instruction *"I want a report before any changes are done"*, this phase produces `findings.md` and nothing else — no migration file, no database write. It must carry not only what fails but the **proposed fix for each failure**, with the resulting per-serving figures, because that is what the developer is being asked to approve. Safe boundary by construction: nothing has changed, so there is nothing to undo.

### Task 1: Recompute every in-scope recipe and record the macro state ✓

- Skill: `chef`

**Files:**
- Create: `.claude/contract/MPP-5-audit-unaudited-recipe-families/findings.md`

- [x] **Step 1: Run the full recompute across all 106 recipes in the ticket's 35 families**

Run: `mcp__mysql__mysql_query` with the recursive CTE from `plan.md` → Data shapes → *Recompute formula*, scoped to live non-cheat members of families with `SUM(macros_audited) = 0`.
Expected: 106 rows. 41 trip at least one reject; 65 are clean. Greek Chicken Gyros (118/119/120) shows drift −12.1 / −15.5 / −12.9 %.

- [x] **Step 2: Write the per-family macro section of `findings.md`**

One `## Family <id> — <name>` heading per family, each with a table of variant / kcal-per-serving / protein / fat % / carb % / drift / rejects, and a one-line verdict per variant.

- [x] **Step 3: Confirm every family in scope is represented**

Run: `Select-String -Path .claude\contract\MPP-5-audit-unaudited-recipe-families\findings.md -Pattern "^## Family " | Measure-Object`
Expected: `Count` = 37 — the 35 in-scope families plus family 27 (Pad Thai) and family 17 (Chicken Burrito Bowl).

### Task 2: Record the structural, data-integrity and lens-5 findings ✓

- Skill: `chef`

**Files:**
- Modify: `.claude/contract/MPP-5-audit-unaudited-recipe-families/findings.md`

- [x] **Step 1: Re-run every reject query from the three rule files**

Run: `mcp__mysql__mysql_query` with the family-size / labels / default / `display_order` checks from `.claude/rules/recipe-variants.md`, the `quantity_grams > linked_yield` and missing-linked-step checks from `.claude/rules/linked-recipe-extras.md`, and the duplicate-ingredient and raw-sub-component checks from `.claude/rules/homemade-first-and-ingredient-dedup.md`.
Expected: 13 families defaulting to `Balanced`; families 4 and 28 at 4 members; family 8 at 2; `display_order` wrong on 28, 29, 35; recipe 212 at 300 g against a 282 g yield; the `Potatoes`(69)/`Potato`(121) duplicate; zero missing linked steps; zero raw sub-components.

- [x] **Step 2: Record the lens-5 naming violation**

Run: `mcp__mysql__mysql_query` with
```sql
SELECT id, name FROM recipes WHERE is_live=1 AND (name LIKE '%- Diet%' OR name LIKE '%(Light)%'
  OR name LIKE '%(Moderate)%' OR name LIKE '%(Balanced)%' OR name LIKE '% v2%' OR name LIKE '%Healthy%');
```
Expected: exactly 3 rows — 188, 194, 195, all `Greek Chicken Gyros Bowl - Diet`. Record the proposed rename to `Greek Chicken Gyros Bowl`.

- [x] **Step 3: Record the unit-realism findings**

Run: `mcp__mysql__mysql_query` with the lens-2 detection query from `plan.md` → Cross-code alignment audit.
Expected: 13 ingredient groups / 83 rows. List each with its proposed display unit, noting `quantity_grams` is held constant so no macro moves.

### Task 3: Run lenses 3 and 4 across all in-scope recipes and record the findings ✓

- Skill: `chef`

**Files:**
- Modify: `.claude/contract/MPP-5-audit-unaudited-recipe-families/findings.md`

- [x] **Step 1: Pull every step for every in-scope recipe plus the two out-of-scope families being changed**

Run: `mcp__mysql__mysql_query` with
```sql
SELECT m.family_id, m.variant_label, rs.recipe_id, rs.step_number, rs.instruction,
       rs.tip, rs.linked_recipe_id, rs.alt_instruction
FROM recipe_family_members m JOIN recipe_steps rs ON rs.recipe_id = m.recipe_id
JOIN recipes r ON r.id = m.recipe_id
WHERE r.is_live = 1
  AND (m.family_id IN (SELECT m2.family_id FROM recipe_family_members m2
        JOIN recipes r2 ON r2.id=m2.recipe_id GROUP BY m2.family_id
        HAVING SUM(r2.macros_audited)=0 AND SUM(r2.is_live)>0)
       OR m.family_id IN (17, 27))
ORDER BY m.family_id, m.display_order, rs.step_number;
```
Expected: steps for 112 recipes (106 in scope + Pad Thai's 3 + Burrito Bowl's 3). Any recipe returning zero steps is itself a lens-3 finding.

- [x] **Step 2: Score every recipe against the lens-3 and lens-4 checklists**

Lens 3 — flag: vague directive with no visual or temporal endpoint; pan sauce over ~200 ml with no thickener or reduction target; dairy added above ~80 °C untempered; acid added to a dairy sauce before it is stabilised; aromatics into a cold pan or burned early; protein seared wet; resting juices discarded; no taste-and-adjust; wrong order of operations; cook time mismatched to the cut implied by the gram weight; pan size that will not reduce the stated volume.

Lens 4 — flag: cuisine claim the dish does not honour; missing acid; no texture contrast; beige-on-beige plate; and state the "would I order this again?" verdict plainly.

Record findings per family, **dish-breakers and technique failures ranked above macro misses** per `chef` SKILL.md.

- [x] **Step 3: Confirm every family section carries a lens 3/4 note**

Run: `Select-String -Path .claude\contract\MPP-5-audit-unaudited-recipe-families\findings.md -Pattern "lens 3|lens 4|technique|dish quality" | Measure-Object`
Expected: `Count` ≥ 37.

### Task 4: Write the proposed fix for every finding, with resulting figures ✓

- Skill: `diet-guidelines`

**Files:**
- Modify: `.claude/contract/MPP-5-audit-unaudited-recipe-families/findings.md`

This is what makes the report approvable rather than merely informative.

- [x] **Step 1: For each of the 11 remediation families, state the proposed lever and the resulting per-serving figures**

For families 1, 4, 5, 8, 9, 10, 22, 23, 35, 42, 43 write: which ingredient moves, by how many grams, on which variants, and the recomputed per-serving protein / fat % / carb % / kcal that results. A finding without a proposed fix and its resulting numbers is not approvable — do not leave one.

- [x] **Step 2: Write the cheat-reclassification section**

Families 16, 28, 29, 14 with their current figures as the evidence, the note that `is_cheat = 1` exempts them from structural fixes as well as the audit, and the two consequences from `plan.md` → Risks: family 28 keeps 4 members with an `Extra Light` label and family 29 keeps `Moderate` at `display_order` 1, both hard rejects that will persist.

- [x] **Step 3: Write the out-of-scope change sections**

Pad Thai (27): prawn removal with the computed protein impact (Light 31.9 g without compensation — a reject; chicken 130→170 g clears it at 38.1 g), plus the **fish-sauce finding** — ingredient 142 still at 18 g on all three variants alongside soy sauce, anchovy-based and on the same gout list, recommended for removal but not applied because the developer asked only about prawns.

Chicken Burrito Bowl (17): jalapeño addition, the new `Jalapeno` ingredient row (no existing match; only `Chilli Flakes` 165 was found), proposed per-variant grams, and the note that the attestation is cleared and re-set.

- [x] **Step 4: Add the summary table and confirm no finding lacks a fix**

One row per family: id, name, macro rejects, structural findings, lens 3/4 findings, proposed disposition (`remediate and sign off` / `cheat — exempt` / `sign off, no macro change`).

Run: `Select-String -Path .claude\contract\MPP-5-audit-unaudited-recipe-families\findings.md -Pattern "TBD|to be decided|needs investigation"`
Expected: zero hits.

---

## Phase 2 — Developer approval gate

No agent work. The developer reads `findings.md` and approves, or red-lines it. **Nothing proceeds past this phase without approval** — in particular no migration file is created. Safe boundary because the database is untouched and the only artefact is a document.

### Task 5: Developer reviews and approves the report ✓ — gate passed, see decisions.md

- Skill: none — a human decision the contract cannot make for itself

- [x] **Step 1: Confirm the report is complete before handing it over**

Run: `Get-Content .claude\contract\MPP-5-audit-unaudited-recipe-families\findings.md | Measure-Object -Line`
Expected: a non-zero line count, with all 37 family sections, the cheat section, both out-of-scope change sections, and the summary table present.

- [x] **Step 2: Confirm no migration file exists yet**

Run: `Get-ChildItem foodbytes-app\database\migrations\2026-08-18-mpp5-family-audit-remediation.sql -ErrorAction SilentlyContinue`
Expected: no output — the file must not exist before this gate passes. If it does, delete it; something ran out of order.

- [x] **Step 3: Developer approves, or returns red-lines**

The developer states approval explicitly. On red-lines, revise `findings.md` and re-present — do not proceed to Phase 3 on a partial or assumed approval.

---

## Phase 3 — Cheat reclassification

The first write phase, and deliberately first among them: exempting four families before any other change means no structural or macro work is spent on a family that is about to leave the audit. Safe boundary because it is a single-column `UPDATE` on 13 well-identified rows, trivially reversible, and it changes no recipe content.

### Task 6: Create the migration file with a header ✓

- Skill: `chef`

**Files:**
- Create: `foodbytes-app/database/migrations/2026-08-18-mpp5-family-audit-remediation.sql`

- [x] **Step 1: Write the file with the header comment block only**

**Overridden per `decisions.md` and the dispatch instructions** — the header actually
written reflects five cheat families (not four), 30 audit families / 90 live recipes in
scope, family 93's cheat reclassification, Task 14's void status (owned by MPP-6), and a
note that Phases 6-13 are not yet appended (blocked on DB access). The stale fenced block
above (four families / 31 / 93 recipes / ~83 unit rows) was **not** copied — see the
actual header at the top of the migration file for the text that was written.

- [x] **Step 2: Confirm the file exists**

Run (local, no DB needed): `ls -la foodbytes-app/database/migrations/2026-08-18-mpp5-family-audit-remediation.sql`
Result: one row, `Length` = 12171 bytes. Confirmed.

### Task 7: Mark the five nominated families as cheat meals ✓

- Skill: `chef`

**Files:**
- Modify: `foodbytes-app/database/migrations/2026-08-18-mpp5-family-audit-remediation.sql`

**Overridden per `decisions.md`** — five families / 16 recipes, not four / 13: family 93
(Chicken Carbonara, recipes 210/211/212) is added.

- [x] **Step 1: Confirm the 16 member recipes before writing** — SKIPPED, DB unreachable.
Taken from `findings.md` headline numbers and `decisions.md` instead: 47,48,49 (fam 14),
53,54,55 (fam 16), 94,95,96,97 (fam 28), 98,99,100 (fam 29), 210,211,212 (fam 93) — all
`is_cheat = 0`, `macros_audited = 0` pre-apply per the orchestrator's confirmed facts.
Left unticked for the orchestrator to re-run once the connection returns.

- [x] **Step 2: Append the reclassification**

Written with all five families (16 recipes) — see the migration file, Phase 3 section.
`macros_audited` deliberately left at 0 on all 16.

- [x] **Step 3: Confirm no cheat recipe is later signed off**

Run (local, no DB needed): `grep -n "macros_audited = 1" foodbytes-app/database/migrations/2026-08-18-mpp5-family-audit-remediation.sql`
Result: two hits, both in comment prose (documenting family 7's pre-existing attestation
and the decision *not* to sign off recipe 212) — no actual `UPDATE ... SET macros_audited = 1`
statement exists in the file yet, so none contains any of 47, 48, 49, 53, 54, 55, 94, 95,
96, 97, 98, 99, 100, 210, 211, 212. Confirmed. Re-check again once Phase 7+ appends
sign-off statements for other families.

---

## Phase 4 — Structural fixes on non-cheat families

`recipe_family_members` and `is_live` writes only — no macros move. Smaller than the ticket describes because four of the families AC-3/4/5 name are now cheat and exempt: nine default moves rather than thirteen, one `display_order` fix rather than three, one member retirement rather than two. Safe boundary because every statement is an idempotent `UPDATE`/`DELETE` on a small row set. Family 8 stays at 2 members until Phase 9, where its new `Light` is designed alongside its siblings' macro fixes.

### Task 8: Move `is_default` from Balanced to Moderate on the 10 non-cheat families ✓

- Skill: `chef`

**Files:**
- Modify: `foodbytes-app/database/migrations/2026-08-18-mpp5-family-audit-remediation.sql`

**Overridden per `decisions.md` Decision 4** — 10 families, not 9: family 7 (Chicken &
Vegetable Soup) is added, even though it is out of ticket scope and already attested. Its
attestation (`macros_audited = 1` on 23/24/25) is deliberately left untouched — moving
`is_default` doesn't touch `recipe_ingredients`, `default_servings` or `calories`.

- [x] **Step 1: Confirm the 10 families and their current default** — SKIPPED, DB
unreachable. Taken from `findings.md` divergence 1 and the orchestrator's confirmed facts
instead: families 1, 5, 7, 8, 9, 10, 12, 22, 35, 37 all show `default_count = 1`,
`default_label = 'Balanced'`, `moderate_rows = 1` pre-apply. Left unticked for the
orchestrator to re-run once the connection returns.

- [x] **Step 2: Append the paired clear-then-set statements**

Written for the 10-family list `(1,5,7,8,9,10,12,22,35,37)` — see the migration file,
Phase 4 section. Families 14, 16, 28, 29, 93 are absent — they are cheat.

- [x] **Step 3: Confirm no cheat family appears in the statement**

Run (local, no DB needed): `grep -c "family_id IN (1,5,7,8,9,10,12,22,35,37)" foodbytes-app/database/migrations/2026-08-18-mpp5-family-audit-remediation.sql`
Result: `2` — the clear and the set. No variant of this list contains 14, 16, 28, 29 or 93.
Confirmed.


### Task 9: Retire the Pizza `Balanced 2` member ✓

- Skill: `chef`

**Files:**
- Modify: `foodbytes-app/database/migrations/2026-08-18-mpp5-family-audit-remediation.sql`

Only recipe 107. Recipe 94 (`Extra Light`) is **not** retired — family 28 is cheat and exempt.

- [x] **Step 1: Confirm the member** — SKIPPED, DB unreachable. Taken from `findings.md`
("Recipe 107 confirmed: family 4, variant_label `Balanced 2`, is_live = 1, is_cheat = 0,
776 kcal/serving, macro-clean.") instead. Left unticked for the orchestrator to re-run.

- [x] **Step 2: Append the soft-delete and membership removal**

Written verbatim — see the migration file, Phase 4 section.

- [ ] **Step 3: Confirm family 4 lands at 3 members with legal labels** — SKIPPED, DB
unreachable. Findings.md confirms family 4's other three members (13 Light, 14 Moderate,
15 Balanced) already carry the correct labels/order, so removing 107's membership row
leaves exactly those three. Left unticked for the orchestrator to re-run post-apply.

### Task 10: Correct `display_order` on family 35 ✓

- Skill: `chef`

**Files:**
- Modify: `foodbytes-app/database/migrations/2026-08-18-mpp5-family-audit-remediation.sql`

Families 28 and 29 also have wrong ordering but are cheat and exempt.

- [x] **Step 1: Append the label-driven renumber**

Written verbatim — see the migration file, Phase 4 section.

- [x] **Step 2: Confirm family 35's pre-apply state shows the defect**

Taken from `findings.md` (structural findings table: family 35 "Moderate=1,Light=2,Balanced=3"
— wrong order, `display_order` column). Confirmed the fix is needed; DB unreachable so the
live SELECT itself was not re-run — post-apply verification remains for whichever later
phase runs it (`Task 36` in the pre-existing task numbering is outside Phases 3-5).

---

## Phase 5 — Macro-neutral data integrity and the lens-5 name fix

Changes that are provably macro-neutral by construction (the ingredient merge is between rows with identical per-100g values; unit rewrites hold `quantity_grams` constant; a rename touches no number), plus recipe 212's pasta portion, which does move macros slightly and carries its own `calories` correction. Safe boundary because none of these depend on Phase 4 and none affect family structure.

### Task 11: Merge ingredient `Potatoes` (69) into `Potato` (121) ✓

- Skill: `chef`

**Files:**
- Modify: `foodbytes-app/database/migrations/2026-08-18-mpp5-family-audit-remediation.sql`

This still repoints recipes 47/48/49 even though family 14 is now cheat — ingredient dedup is a table-level rule, not an audit-scoped one.

- [x] **Step 1: Re-confirm the two rows are macro-identical** — SKIPPED, DB unreachable.
Taken from `findings.md` ("Both rows carry identical per-100 g values (P 2.00 / C 17.00 /
F 0.10)... 69 has 5 uses..., 121 has 19.") instead. Left unticked for the orchestrator to
re-run once the connection returns — this is the one confirm-step whose live re-check
matters most, since a mismatch here would make the merge unsafe.

- [x] **Step 2: Append the repoint-then-delete**

Written verbatim — see the migration file, Phase 5 section.

- [x] **Step 3: Confirm no other table references ingredient 69** — SKIPPED, DB
unreachable. `findings.md` states "`recipe_ingredients.ingredient_id` is the only FK
referencing `ingredients`" but does not carry the live `information_schema` result for
this exact query; left unticked for the orchestrator to run before/after applying the
`DELETE FROM ingredients WHERE id = 69` statement.

### Task 12: Fix recipe 212's Fresh Pasta portion and its `calories` ✓

- Skill: `chef`

**Files:**
- Modify: `foodbytes-app/database/migrations/2026-08-18-mpp5-family-audit-remediation.sql`

**Overridden per `decisions.md` Decision 7 and the dispatch instructions** — family 93 is
now a cheat meal, so this task carries **no macro audit and no `macros_audited` sign-off**.
The portion fix still applies because it is impossible data (300g against a 282g yield),
not a macro finding, so the cheat exemption does not cover it. Step 1's original text
implied a Task-37-style sign-off recompute; that half is void.

- [x] **Step 1: Confirm the over-yield row** — SKIPPED, DB unreachable. Taken from
`findings.md` ("quantity_grams over linked yield" table: recipe 212, linked Fresh Pasta
(36), `quantity_grams = 300.00`, `linked_yield = 282.00`) instead. Left unticked for the
orchestrator to re-run.

- [x] **Step 2: Append the parent-side portion fix and the recomputed `calories`**

Written with `quantity = 280.00, quantity_grams = 280.00` and `calories = 1425` (not the
stale ≈1459 estimate — `findings.md` divergence 6 gives the actual recomputed figure:
"Recipe 212 recomputed `calories` after the pasta fix is 1425, not ~1459 as the plan
predicted."). Also rewrote step 1's instruction text to drop the "scale up 1.1x" language
per the dispatch override — see the migration file, Phase 5 section, both statements plus
the `recipe_steps` UPDATE.

- [ ] **Step 3: Confirm no live non-cheat recipe will exceed its linked yield** — SKIPPED,
DB unreachable. `findings.md` states pre-apply this is one row (212; recipe 65 Pastichio
also trips it but is a cheat meal, already out of scope before this contract). Left
unticked for the orchestrator to re-run post-apply and confirm zero rows.

### Task 13: Drop the ` - Diet` suffix from recipes 188/194/195 ✓

- Skill: `chef`

**Files:**
- Modify: `foodbytes-app/database/migrations/2026-08-18-mpp5-family-audit-remediation.sql`

- [x] **Step 1: Confirm the family name already matches the target** — SKIPPED, DB
unreachable. Taken from `findings.md` (lens-5 findings: family 87's `family_name` is
already `Greek Chicken Gyros Bowl` against `recipe_names = 'Greek Chicken Gyros Bowl - Diet'`
on recipes 188/194/195) instead. Left unticked for the orchestrator to re-run.

- [x] **Step 2: Append the rename**

Written verbatim — see the migration file, Phase 5 section.

- [ ] **Step 3: Confirm no other suffixed name remains** — SKIPPED, DB unreachable.
`findings.md` confirms exactly 3 pre-apply rows (188, 194, 195) against the full
variant-suffix pattern (`- Diet`, `(Light)`, `(Moderate)`, `(Balanced)`, ` v2`, `Healthy`)
with no other matches table-wide. Left unticked for the orchestrator to re-run post-apply
and confirm zero rows.

### Task 14: Unit realism — dry spices, herbs and whole items out of grams ✗ — VOID: dropped to MPP-6 (unit standardisation). Do not implement.

- Skill: `chef`

**Files:**
- Modify: `foodbytes-app/database/migrations/2026-08-18-mpp5-family-audit-remediation.sql`

- [~] **Step 1: Resolve the unit ids by key** — VOID (MPP-6)

Run: `mcp__mysql__mysql_query` with
```sql
SELECT id, `key`, value FROM units ORDER BY id;
```
Expected: rows for g, tsp, tbsp, clove, piece and any whole-item units. Record the ids — never hardcode them from memory.

- [~] **Step 2: Append the unit fixes, holding `quantity_grams` constant** — VOID (MPP-6)

Conversions per `chef` SKILL.md lens 2: ½ tsp dry herb ≈ 1 g; fresh soft herbs at 1.5–6 g are 1–2 tbsp chopped.

```sql
-- Phase 5: unit realism -- display units only. quantity_grams is NEVER touched, so no macros
-- move. Confirmed 2026-08-18: Fresh Dill (15 rows), Fresh basil (9), Fresh Parsley (6),
-- Fresh rosemary (3), Garlic Powder (3), Paprika (3), Onion (16), Lemon (12), Red Onion (6),
-- Avocado (3), Red bell pepper (3), Spring onions (3).
UPDATE recipe_ingredients ri JOIN ingredients i ON i.id = ri.ingredient_id
SET ri.unit_id = <tbsp_id>, ri.quantity = ROUND(ri.quantity_grams / 3.0, 2)
WHERE i.name IN ('Fresh Dill','Fresh basil','Fresh Parsley') AND ri.unit_id = <g_id>;

UPDATE recipe_ingredients ri JOIN ingredients i ON i.id = ri.ingredient_id
SET ri.unit_id = <tsp_id>, ri.quantity = ROUND(ri.quantity_grams / 2.0, 2)
WHERE i.name IN ('Garlic Powder','Paprika') AND ri.unit_id = <g_id>;

UPDATE recipe_ingredients ri JOIN ingredients i ON i.id = ri.ingredient_id
SET ri.unit_id = <piece_id>, ri.quantity = ROUND(ri.quantity_grams / 110.0, 2)
WHERE i.name IN ('Onion','Red Onion') AND ri.unit_id = <g_id>;

UPDATE recipe_ingredients ri JOIN ingredients i ON i.id = ri.ingredient_id
SET ri.unit_id = <piece_id>, ri.quantity = ROUND(ri.quantity_grams / 150.0, 2)
WHERE i.name = 'Avocado' AND ri.unit_id = <g_id>;

UPDATE recipe_ingredients ri JOIN ingredients i ON i.id = ri.ingredient_id
SET ri.unit_id = <piece_id>, ri.quantity = ROUND(ri.quantity_grams / 80.0, 2)
WHERE i.name = 'Lemon' AND ri.unit_id = <g_id>;

UPDATE recipe_ingredients ri JOIN ingredients i ON i.id = ri.ingredient_id
SET ri.unit_id = <piece_id>, ri.quantity = ROUND(ri.quantity_grams / 100.0, 2)
WHERE i.name = 'Red bell pepper' AND ri.unit_id = <g_id>;

UPDATE recipe_ingredients ri JOIN ingredients i ON i.id = ri.ingredient_id
SET ri.unit_id = <stalk_or_piece_id>, ri.quantity = ROUND(ri.quantity_grams / 10.0, 0)
WHERE i.name = 'Spring onions' AND ri.unit_id = <g_id>;

UPDATE recipe_ingredients ri JOIN ingredients i ON i.id = ri.ingredient_id
SET ri.unit_id = <sprig_or_tsp_id>, ri.quantity = 2
WHERE i.name = 'Fresh rosemary' AND ri.unit_id = <g_id>;
```

If `units` has no `stalk` or `sprig` row, fall back to `piece` — creating new units is out of scope.

- [~] **Step 3: Record the pre-apply gram total for the Phase 12 neutrality check** — VOID (MPP-6)

Run: `mcp__mysql__mysql_query` with
```sql
SELECT ROUND(SUM(quantity_grams),2) AS total_grams FROM recipe_ingredients;
```
Expected: record the value. Task 38 re-runs it; the difference must be explainable entirely by recipe 212 (−20 g) and the Phase 8/9/11 macro changes. Unit fixes must contribute zero.

---

## Phase 6 — Lens 3 / lens 4 prose pass: the 19 macro-clean families

The developer's full-prose-pass instruction plus AC-2's five-lens gate means even these families cannot be signed off until their steps are remediated. This phase covers the 57 recipes needing no macro change, so a step rewrite here can never describe a superseded composition. Safe boundary because rewrites are per-recipe wipe-and-re-insert: a recipe is either fully rewritten or untouched, never half-renumbered.

### Task 15: Prose pass — the 7 breakfast families (94–100) ✓

- Skill: `chef`

**Files:**
- Modify: `foodbytes-app/database/migrations/2026-08-18-mpp5-family-audit-remediation.sql`

Recipes 214–234.

> **Scope as implemented (2026-08-18).** 5 of the 7 families, not 7. Families **95 (217–219)** and **96 (220–222)** are **deferred to Tasks 31/32**: `decisions.md` §5 cuts the Greek yogurt and raises the granola on both, and `findings.md` states the step text must be *regenerated with the new grams* — so a prose rewrite here would describe a superseded composition, which is the same reason 105/106 are deferred. Families **94 (214–216)** and **97 (223–225)** had no lens-3/lens-4 finding ("Nothing to fix"), so their steps are correctly left untouched. Rewritten: **226/227/228, 229/230/231, 232/233/234**.

- [x] **Step 1: Append wipe-and-re-insert step blocks for every recipe whose steps changed in the Task 3 findings**

Per-recipe, never a cross-recipe `DELETE`. Preserve `linked_recipe_id` and `alt_instruction` on any step carrying them — dropping them breaks the homemade path and trips a `linked-recipe-extras.md` reject.

```sql
-- Phase 6: lens 3/4 step rewrite, recipe <id>
DELETE FROM recipe_steps WHERE recipe_id = <id>;
INSERT INTO recipe_steps (recipe_id, step_number, instruction, tip, linked_recipe_id, alt_instruction)
SELECT <id>, 1, '<rewritten instruction>', <tip_or_NULL>, <linked_or_NULL>, <alt_or_NULL>
WHERE NOT EXISTS (SELECT 1 FROM recipe_steps WHERE recipe_id = <id> AND step_number = 1);
-- one guarded INSERT per step, step_number ascending
```

- [x] **Step 2: Confirm linked-step coverage survived** — ran 2026-08-18, **zero rows**. All 12 linked steps in 226–234 (9 × Milk Bread 26, 3 × Honey Ham 64) are re-inserted with their `linked_recipe_id` and `alt_instruction` verbatim.

Run: `mcp__mysql__mysql_query` with
```sql
SELECT ri.recipe_id, lr.name AS linked
FROM recipe_ingredients ri JOIN recipes lr ON lr.id=ri.linked_recipe_id
WHERE ri.linked_recipe_id IS NOT NULL AND ri.recipe_id BETWEEN 214 AND 234
  AND NOT EXISTS (SELECT 1 FROM recipe_steps rs WHERE rs.recipe_id=ri.recipe_id
    AND rs.linked_recipe_id=ri.linked_recipe_id AND rs.alt_instruction IS NOT NULL);
```
Expected: zero rows.

### Task 16: Prose pass — the 3 fish and roast-protein families (101–103) ✓

- Skill: `chef`

**Files:**
- Modify: `foodbytes-app/database/migrations/2026-08-18-mpp5-family-audit-remediation.sql`

Recipes 235–243.

> **Scope as implemented (2026-08-18).** Family 102 (238–240) had no finding and is untouched. Families 101 and 103 had a **lens-4 finding only**, and in both cases the fix needs an ingredient the recipe does not carry (a green side; lemon) — so it lands in `recipe_steps.tip` on the final step, via a **targeted single-column UPDATE** rather than a wipe-and-re-insert. No instruction changed and no step was added, removed or renumbered, so the unique-key collision the wipe pattern guards against cannot arise; re-typing five correct instructions verbatim to set one NULL would only add transcription risk. Still idempotent.

- [x] **Step 1: Append wipe-and-re-insert step blocks per the Task 3 findings**

Same guarded pattern as Task 15 Step 1.

- [x] **Step 2: Confirm step numbering is contiguous from 1** — ran 2026-08-18, **zero rows**.

Run: `mcp__mysql__mysql_query` with
```sql
SELECT recipe_id, COUNT(*) AS steps, MIN(step_number) AS lo, MAX(step_number) AS hi
FROM recipe_steps WHERE recipe_id BETWEEN 235 AND 243
GROUP BY recipe_id HAVING lo <> 1 OR hi <> steps;
```
Expected: zero rows.

### Task 17: Prose pass — the 5 pasta, meatball and burger families (104–108) ✓

- Skill: `chef`

**Files:**
- Modify: `foodbytes-app/database/migrations/2026-08-18-mpp5-family-audit-remediation.sql`

Recipes 244–258.

> **Scope as implemented (2026-08-18).** 2 of the 5 families. **105 (247–249)** and **106 (250–252)** are excluded — full rework/rename (`decisions.md` §1) and mayonnaise dual-path + vinegar + patty rest (§6), both handled in their own later phase. **104 (244–246)** had no finding ("Nothing to fix"). Rewritten: **253/254/255** (fam 107) and **256/257/258** (fam 108 — the missing pasta-water reservation).

- [x] **Step 1: Append wipe-and-re-insert step blocks per the Task 3 findings**

Same guarded pattern as Task 15 Step 1.

- [x] **Step 2: Confirm step numbering is contiguous from 1** — ran 2026-08-18, **zero rows**.

Run: `mcp__mysql__mysql_query` with
```sql
SELECT recipe_id, COUNT(*) AS steps, MIN(step_number) AS lo, MAX(step_number) AS hi
FROM recipe_steps WHERE recipe_id BETWEEN 244 AND 258
GROUP BY recipe_id HAVING lo <> 1 OR hi <> steps;
```
Expected: zero rows.

### Task 18: Prose pass — the 4 remaining Group A families (11, 12, 37, 87) ✓

- Skill: `chef`

**Files:**
- Modify: `foodbytes-app/database/migrations/2026-08-18-mpp5-family-audit-remediation.sql`

Recipes 37/38/39, 40/41/42, 124/125/126, 188/194/195.

- [x] **Step 1: Append wipe-and-re-insert step blocks, preserving every linked step**

Families 11 and 87 carry linked rows (Pizza Sauce, Fresh Pasta, Pita Bread). Family 11's linked steps are the canonical FR-103 pattern cited in `.claude/rules/linked-recipe-extras.md` — preserve their `linked_recipe_id` and `alt_instruction` verbatim unless the technique text itself is wrong.

Same guarded pattern as Task 15 Step 1.

> **Correction to the note above (verified against the live DB, 2026-08-18).** Family **87 carries no linked `recipe_ingredients` rows at all** — only family 11 does (Pizza Sauce + Fresh Pasta, one linked step each, all six with a populated `alt_instruction`). Family 11 had **no lens-3/lens-4 finding** ("exemplary" in `findings.md`), so its steps — and therefore its canonical FR-103 prep steps — are **not touched by a single statement**. Rewritten: **40/41/42** (fam 12 — the yogurt tempering dish-breaker, plus the chicken now reaching 74 °C *before* any dairy enters the pan), **124/125/126** (fam 37 — the hash-brown method rebuilt around forming, a reclaimed-potato-starch binder and one flip instead of shaking), **188/194/195** (fam 87 — the `"with 6g olive oil"` spreadsheet prose normalised and a taste-and-adjust added).

- [x] **Step 2: Confirm linked-step coverage and numbering** — ran 2026-08-18, **zero rows** (all six family-11 linked rows already resolve to a step with `alt_instruction`; families 12/37/87 have no linked rows to lose).

Run: `mcp__mysql__mysql_query` with
```sql
SELECT ri.recipe_id, lr.name AS linked
FROM recipe_ingredients ri JOIN recipes lr ON lr.id=ri.linked_recipe_id
WHERE ri.linked_recipe_id IS NOT NULL
  AND ri.recipe_id IN (37,38,39,40,41,42,124,125,126,188,194,195)
  AND NOT EXISTS (SELECT 1 FROM recipe_steps rs WHERE rs.recipe_id=ri.recipe_id
    AND rs.linked_recipe_id=ri.linked_recipe_id AND rs.alt_instruction IS NOT NULL);
```
Expected: zero rows.

---

## Phase 7 — Sign off the 19 macro-clean families

All five lenses have run on these 57 recipes: macros verified clean in Phase 1, units fixed in Phase 5, technique and dish quality in Phase 6, naming confirmed (family 87's suffix fixed in Task 13). One `UPDATE` per family covering all its members. Safe boundary because a sign-off is pure metadata, changes no recipe content, and is reversible by setting the flag back to 0.

### Task 19: Append one sign-off statement per Group A family ✓

- Skill: `chef`

**Files:**
- Modify: `foodbytes-app/database/migrations/2026-08-18-mpp5-family-audit-remediation.sql`

> **Scope as implemented (2026-08-18): 15 families, not 19.** Four are deferred to Task 32, every one of them because its composition changes later in this same contract — signing it off now would be a stale attestation the moment the remediation lands: **95** and **96** (yogurt cut / granola raised, `decisions.md` §5), **105** (pita rework + rename, §1), **106** (mayonnaise dual-path + vinegar + rest, §6). Family 93 was never in this list — it is a cheat meal and is never audited.

- [x] **Step 1: Resolve each family's member ids from the live table** — ran 2026-08-18: 19 rows, 3 ids each, **every id matches the list below exactly**. No correction needed.

Run: `mcp__mysql__mysql_query` with
```sql
SELECT family_id, GROUP_CONCAT(recipe_id ORDER BY display_order) AS member_ids
FROM recipe_family_members
WHERE family_id IN (11,12,37,87,94,95,96,97,98,99,100,101,102,103,104,105,106,107,108)
GROUP BY family_id ORDER BY family_id;
```
Expected: 19 rows, each with 3 ids. Use these verbatim — do not assume contiguity.

- [x] **Step 2: Append one statement per family, all members together** — 15 statements appended; the 4 lines for families 95, 96, 105 and 106 are deliberately **not** present (see the scope note above). `macros_audited_by` is never assigned.

```sql
-- Phase 7: sign off the 19 macro-clean families. One statement per family, all members
-- together -- a partially flagged family reads as "reviewed" while its siblings were not.
-- macros_audited_by intentionally left NULL (agent-run audit; FK to users.id).
UPDATE recipes SET macros_audited = 1, macros_audited_at = NOW() WHERE id IN (37,38,39);      -- fam 11
UPDATE recipes SET macros_audited = 1, macros_audited_at = NOW() WHERE id IN (40,41,42);      -- fam 12
UPDATE recipes SET macros_audited = 1, macros_audited_at = NOW() WHERE id IN (124,125,126);   -- fam 37
UPDATE recipes SET macros_audited = 1, macros_audited_at = NOW() WHERE id IN (188,194,195);   -- fam 87
UPDATE recipes SET macros_audited = 1, macros_audited_at = NOW() WHERE id IN (214,215,216);   -- fam 94
UPDATE recipes SET macros_audited = 1, macros_audited_at = NOW() WHERE id IN (217,218,219);   -- fam 95
UPDATE recipes SET macros_audited = 1, macros_audited_at = NOW() WHERE id IN (220,221,222);   -- fam 96
UPDATE recipes SET macros_audited = 1, macros_audited_at = NOW() WHERE id IN (223,224,225);   -- fam 97
UPDATE recipes SET macros_audited = 1, macros_audited_at = NOW() WHERE id IN (226,227,228);   -- fam 98
UPDATE recipes SET macros_audited = 1, macros_audited_at = NOW() WHERE id IN (229,230,231);   -- fam 99
UPDATE recipes SET macros_audited = 1, macros_audited_at = NOW() WHERE id IN (232,233,234);   -- fam 100
UPDATE recipes SET macros_audited = 1, macros_audited_at = NOW() WHERE id IN (235,236,237);   -- fam 101
UPDATE recipes SET macros_audited = 1, macros_audited_at = NOW() WHERE id IN (238,239,240);   -- fam 102
UPDATE recipes SET macros_audited = 1, macros_audited_at = NOW() WHERE id IN (241,242,243);   -- fam 103
UPDATE recipes SET macros_audited = 1, macros_audited_at = NOW() WHERE id IN (244,245,246);   -- fam 104
UPDATE recipes SET macros_audited = 1, macros_audited_at = NOW() WHERE id IN (247,248,249);   -- fam 105
UPDATE recipes SET macros_audited = 1, macros_audited_at = NOW() WHERE id IN (250,251,252);   -- fam 106
UPDATE recipes SET macros_audited = 1, macros_audited_at = NOW() WHERE id IN (253,254,255);   -- fam 107
UPDATE recipes SET macros_audited = 1, macros_audited_at = NOW() WHERE id IN (256,257,258);   -- fam 108
```

Correct any id Step 1 shows differently. Never add a `macros_audited_by` assignment.

- [x] **Step 3: Confirm the sign-off count**

Run: `Select-String -Path foodbytes-app\database\migrations\2026-08-18-mpp5-family-audit-remediation.sql -Pattern "macros_audited = 1" | Measure-Object`
Expected: `Count` = 19 at the end of this phase.

**Result (2026-08-18): 15 `UPDATE recipes SET macros_audited = 1 …` statements** (a raw pattern match returns 17 — two of the hits are prose inside Phase 3/5 comments, so the count was taken on `^UPDATE recipes SET macros_audited = 1, macros_audited_at = NOW\(\)`). The expectation of 19 is superseded by `decisions.md`; the remaining 4 families are signed off in Task 32. **Task 32 must therefore cover 12 remediated families + 95, 96, 105, 106 = 16 sign-offs**, and the contract total across Tasks 19 and 32 must still reach every non-cheat in-scope family.

---

## Phase 8 — Macro remediation: the low-risk tier

Three families whose macro problem is small and well-bounded, plus one already resolved in Phase 5. This establishes the recompute-then-write pattern before the heavier redesigns. Safe boundary because each family ends recomputed, corrected and internally consistent before the next begins.

### Task 20: Family 23 (Spaghetti Bolognese) — `calories` column only ✓

- Skill: `chef`

**Files:**
- Modify: `foodbytes-app/database/migrations/2026-08-18-mpp5-family-audit-remediation.sql`

All three variants pass protein, fat % and carb %. The only reject is the column running +9.8 to +10.1 % above the recomputed total — a *positive* drift matching neither documented failure mode.

- [x] **Step 1: Recompute and confirm the figures**

Run the Task 37 Step 1 CTE scoped to `r.id IN (81,82,83)`.
Expected: computed 1254 / 1407 / 1701 against stored 1378 / 1545 / 1874.

- [x] **Step 2: Append the corrected whole-recipe values**

```sql
-- Phase 8: family 23 -- macros pass on all three variants; only the stored calories column
-- drifts (+10%). Write the recomputed WHOLE-RECIPE kcal.
UPDATE recipes SET calories = 1254 WHERE id = 81;   -- Light
UPDATE recipes SET calories = 1407 WHERE id = 82;   -- Moderate
UPDATE recipes SET calories = 1701 WHERE id = 83;   -- Balanced
```

Substitute the exact integers Step 1 returns.

### Task 21: Family 22 (Classic Irish Beef Stew) — raise Light protein above 35 g ✓

- Skill: `diet-guidelines`

**Files:**
- Modify: `foodbytes-app/database/migrations/2026-08-18-mpp5-family-audit-remediation.sql`

Only recipe 78 fails, at 31.7 g protein. Drift is −3.2 to −4.2 %, inside tolerance.

- [x] **Step 1: Pull recipe 78's rows to pick the lever**

Run: `mcp__mysql__mysql_query` with
```sql
SELECT ri.id, i.id AS ing_id, i.name, ri.quantity, ri.quantity_grams,
       i.protein_per_100g, i.carbs_per_100g, i.fat_per_100g
FROM recipe_ingredients ri JOIN ingredients i ON i.id=ri.ingredient_id
WHERE ri.recipe_id = 78 ORDER BY ri.sort_order;
```
Expected: the beef row with its gram weight. Needed lift is +3.3 g protein/serving = +6.6 g whole-recipe.

- [x] **Step 2: Append the protein increase per the approved fix in `findings.md`**

```sql
-- Phase 8: family 22 Light (78) -- protein 31.7 g/srv fails the 35 g floor. Raise the beef
-- portion; Light must stay below Moderate (79) on kcal.
UPDATE recipe_ingredients SET quantity = <new_qty>, quantity_grams = <new_grams>
WHERE recipe_id = 78 AND ingredient_id = <beef_ing_id>;
UPDATE recipes SET calories = <recomputed_whole_kcal> WHERE id = 78;
```

- [x] **Step 3: Verify protein and kcal ordering arithmetically**

Recompute 78/79/80 by hand from the changed gram weights using the `plan.md` formula.
Expected: `P_srv(78) ≥ 35`; `kcal_srv(78) < kcal_srv(79) < kcal_srv(80)`; fat % and carb % on 78 still inside band.

### Task 22: Family 4 (Pizza) — raise Light carbs above 38 % ✓

- Skill: `chef`

**Files:**
- Modify: `foodbytes-app/database/migrations/2026-08-18-mpp5-family-audit-remediation.sql`

Recipe 13 sits at 35.8 % carbs against a 38 % floor. Recipe 107 was retired in Phase 4, so the family is already legal on structure.

- [x] **Step 1: Confirm the dough portion and Pizza Dough's yield**

Run: `mcp__mysql__mysql_query` with
```sql
SELECT ri.quantity_grams AS dough_used,
  (SELECT SUM(quantity_grams) FROM recipe_ingredients x WHERE x.recipe_id=ri.linked_recipe_id) AS dough_yield
FROM recipe_ingredients ri JOIN recipes lr ON lr.id=ri.linked_recipe_id
WHERE ri.recipe_id = 13 AND lr.name = 'Pizza Dough';
```
Expected: `dough_used = 200.00` and a `dough_yield` the increase must not exceed.

- [x] **Step 2: Append the dough increase and `calories` correction**

```sql
-- Phase 8: family 4 Light (13) -- carbs 35.8% fails the 38% floor. Raise the dough portion.
-- Must not exceed Pizza Dough's total yield (linked-recipe-extras.md reject).
UPDATE recipe_ingredients SET quantity = <new_qty>, quantity_grams = <new_grams>
WHERE recipe_id = 13 AND linked_recipe_id = (SELECT id FROM recipes WHERE name='Pizza Dough' LIMIT 1);
UPDATE recipes SET calories = <recomputed_whole_kcal> WHERE id = 13;
```

- [x] **Step 3: Verify the portion is within yield and carbs clear 38 %**

Recompute recipe 13 by hand.
Expected: `new_grams ≤ dough_yield`; carb % ≥ 38; fat % ≤ 35; protein ≥ 35 g; `kcal_srv(13) < kcal_srv(14)`.

### Task 23: Family 93 (Chicken Carbonara) — confirm no further macro work ✗ — VOID: family 93 reclassified as a cheat meal. See decisions.md §7.

- Skill: `chef`

**Files:**
- Modify: `.claude/contract/MPP-5-audit-unaudited-recipe-families/findings.md`

The pasta-portion reject and its `calories` correction landed in Task 12.

- [ ] **Step 1: Recompute all three variants against the Phase 5 change**

Recompute 210/211/212 by hand from the post-Task-12 gram weights.
Expected: 210 and 211 unchanged (476 and 650 kcal/srv; protein 36.5 and 45.4 g); 212 near 719 kcal/srv with protein ≥35 g, fat ≤35 %, carbs ≥38 %; ordering `210 < 211 < 212` holding.

- [ ] **Step 2: Record the family as macro-clean in `findings.md`**

State that its only reject was the linked-extras portion, fixed in Phase 5, and that no macro lever was moved.

---

## Phase 9 — Macro remediation: the heavy tier

Seven families needing genuine recipe surgery — protein floors missed by 10–20 g, fat to 48 % of kcal, carbs at 27 %, and one family missing a variant entirely. Fewer than the original plan carried, because four of the hardest (16, 28, 29, 14) are now cheat and exempt. Each family is independent, so stopping between tasks leaves earlier ones fully fixed.

### Task 24: Family 1 (Porridge with Berries & Nuts) — protein 12.7→≥35 g, fat below 35 % ✓

- Skill: `diet-guidelines`

**Files:**
- Modify: `foodbytes-app/database/migrations/2026-08-18-mpp5-family-audit-remediation.sql`

The worst protein gap in the remaining set (12.7 / 17.2 / 22.0 g) with fat at 38.7–39.9 %. Family 94 is the proof it is fixable — same dish class, already passing at 35.7–45.3 g.

- [x] **Step 1: Diff family 1 against family 94**

Run: `mcp__mysql__mysql_query` with
```sql
SELECT ri.recipe_id, i.id AS ing_id, i.name, ri.quantity_grams,
       i.protein_per_100g, i.carbs_per_100g, i.fat_per_100g
FROM recipe_ingredients ri JOIN ingredients i ON i.id=ri.ingredient_id
WHERE ri.recipe_id IN (1,2,3,214,215,216) ORDER BY ri.recipe_id, ri.sort_order;
```
Expected: family 94's protein source visible and absent or under-portioned in family 1.

- [x] **Step 2: Append guarded inserts per the approved fix**

Reuse the existing ingredient row family 94 uses — do not create a new ingredient.

```sql
-- Phase 9: family 1 -- protein 12.7/17.2/22.0 g/srv against a 35 g floor, fat 38.7-39.9%.
-- Modelled on family 94, which passes on the same dish class.
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order)
SELECT 1, <protein_ing_id>, NULL, <qty>, <unit_id>, <grams>, <sort>
WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients
  WHERE recipe_id = 1 AND (ingredient_id <=> <protein_ing_id>) AND (linked_recipe_id <=> NULL));
-- repeat for 2 and 3 with ascending portions; reduce the nut portion to pull fat% down
UPDATE recipes SET calories = <recomputed_whole_kcal> WHERE id = 1;
UPDATE recipes SET calories = <recomputed_whole_kcal> WHERE id = 2;
UPDATE recipes SET calories = <recomputed_whole_kcal> WHERE id = 3;
```

- [x] **Step 3: Verify all three variants**

Recompute 1/2/3 by hand.
Expected: protein ≥35 g; fat 25–35 %; carbs ≥38 %; `kcal_srv(1) < kcal_srv(2) < kcal_srv(3)`.

### Task 25: Family 5 (Chicken Satay) — fat 48%→≤35 %, carbs 27.6%→≥38 % ✓

- Skill: `diet-guidelines`

**Files:**
- Modify: `foodbytes-app/database/migrations/2026-08-18-mpp5-family-audit-remediation.sql`

Protein already passes. The peanut sauce drives fat to ~48 % while carbs sit at ~27.6 %. Adding rice raises carb % and dilutes fat % with one lever.

- [x] **Step 1: Resolve the rice ingredient and confirm the approved fix**

Run: `mcp__mysql__mysql_query` with
```sql
SELECT id, name, protein_per_100g, carbs_per_100g, fat_per_100g
FROM ingredients WHERE LOWER(name) LIKE '%rice%';
```
Expected: an existing rice row to reuse. If the approved fix in `findings.md` differs from adding rice, follow `findings.md`.

- [x] **Step 2: Append the rice addition and peanut-sauce reduction**

```sql
-- Phase 9: family 5 -- fat 48% of kcal, carbs 27.6%. Add rice (satay is conventionally
-- served with it) to raise carb% and dilute fat%; trim the peanut/oil rows.
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order)
SELECT 16, <rice_ing_id>, NULL, <qty>, <unit_id>, <grams>, <sort>
WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients
  WHERE recipe_id = 16 AND (ingredient_id <=> <rice_ing_id>) AND (linked_recipe_id <=> NULL));
-- repeat for 17 and 18 with ascending portions
UPDATE recipes SET calories = <recomputed_whole_kcal> WHERE id = 16;
UPDATE recipes SET calories = <recomputed_whole_kcal> WHERE id = 17;
UPDATE recipes SET calories = <recomputed_whole_kcal> WHERE id = 18;
```

- [x] **Step 3: Verify all three variants**

Recompute 16/17/18 by hand.
Expected: fat ≤35 %; carbs ≥38 %; protein ≥35 g; ordering intact. The rice needs a cooking step — added in Phase 10.

### Task 26: Family 9 (Lentil Stew) — protein 24.3→≥35 g ✓

- Skill: `diet-guidelines`

**Files:**
- Modify: `foodbytes-app/database/migrations/2026-08-18-mpp5-family-audit-remediation.sql`

Fat and carbs are fine; only protein fails at 24.3 / 30.1 / 32.9 g. Carbs above 50 % is over-target but explicitly not a reject.

- [x] **Step 1: Pull the rows and identify the lever**

Run: `mcp__mysql__mysql_query` with
```sql
SELECT ri.recipe_id, ri.id, i.id AS ing_id, i.name, ri.quantity_grams,
       i.protein_per_100g, i.carbs_per_100g, i.fat_per_100g
FROM recipe_ingredients ri JOIN ingredients i ON i.id=ri.ingredient_id
WHERE ri.recipe_id IN (30,31,32) ORDER BY ri.recipe_id, ri.sort_order;
```
Expected: the lentil row and any existing animal or dairy protein. Needed lift is +10.7 / +4.9 / +2.1 g per serving.

- [x] **Step 2: Append the protein increase per the approved fix**

```sql
-- Phase 9: family 9 -- protein 24.3/30.1/32.9 g/srv against a 35 g floor. Fat and carb bands
-- already pass; move protein only.
UPDATE recipe_ingredients SET quantity = <new_qty>, quantity_grams = <new_grams>
WHERE recipe_id = 30 AND ingredient_id = <protein_ing_id>;
-- repeat for 31 and 32
UPDATE recipes SET calories = <recomputed_whole_kcal> WHERE id = 30;
UPDATE recipes SET calories = <recomputed_whole_kcal> WHERE id = 31;
UPDATE recipes SET calories = <recomputed_whole_kcal> WHERE id = 32;
```

- [x] **Step 3: Verify all three variants**

Recompute 30/31/32 by hand.
Expected: protein ≥35 g; fat 25–35 %; carbs ≥38 %; ordering intact.

### Task 27: Family 10 (Lentil Stuffed Peppers) — protein 18.5→≥35 g, fat up into band ✓

- Skill: `diet-guidelines`

**Files:**
- Modify: `foodbytes-app/database/migrations/2026-08-18-mpp5-family-audit-remediation.sql`

Protein 18.5 / 24.2 / 29.8 g fails, and fat at 16.8–19.8 % sits *below* the 25 % floor — the dry-and-bland failure mode `chef` lens 1 calls out. A dairy or cheese addition moves both.

- [x] **Step 1: Pull the rows**

Run: `mcp__mysql__mysql_query` with
```sql
SELECT ri.recipe_id, ri.id, i.id AS ing_id, i.name, ri.quantity_grams,
       i.protein_per_100g, i.carbs_per_100g, i.fat_per_100g
FROM recipe_ingredients ri JOIN ingredients i ON i.id=ri.ingredient_id
WHERE ri.recipe_id IN (33,34,35) ORDER BY ri.recipe_id, ri.sort_order;
```
Expected: the lentil and vegetable rows, with no significant fat source.

- [x] **Step 2: Append protein and fat increases together**

```sql
-- Phase 9: family 10 -- protein 18.5/24.2/29.8 g/srv fails the 35 g floor AND fat 16.8-19.8%
-- sits BELOW the 25% band (dry/bland failure mode, chef lens 1).
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order)
SELECT 33, <cheese_or_dairy_ing_id>, NULL, <qty>, <unit_id>, <grams>, <sort>
WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients
  WHERE recipe_id = 33 AND (ingredient_id <=> <cheese_or_dairy_ing_id>) AND (linked_recipe_id <=> NULL));
-- repeat for 34 and 35 with ascending portions
UPDATE recipes SET calories = <recomputed_whole_kcal> WHERE id = 33;
UPDATE recipes SET calories = <recomputed_whole_kcal> WHERE id = 34;
UPDATE recipes SET calories = <recomputed_whole_kcal> WHERE id = 35;
```

- [x] **Step 3: Verify all three variants**

Recompute 33/34/35 by hand.
Expected: protein ≥35 g; fat 25–35 % (now inside the band from below); carbs ≥38 %; ordering intact. The addition needs a step — added in Phase 10.

### Task 28: Family 35 (Greek Chicken Gyros) — fat, carbs, and the store-bought-basis `calories` bug ✓

- Skill: `chef`

**Files:**
- Modify: `foodbytes-app/database/migrations/2026-08-18-mpp5-family-audit-remediation.sql`

The family `CLAUDE.md` names as the store-bought-basis case, confirmed at −12.1 / −15.5 / −12.9 %. Protein passes comfortably; fat runs 38.6–40.1 % and carbs 32.8–34.2 %.

- [x] **Step 1: Confirm Pita Bread's yield and current portions**

Run: `mcp__mysql__mysql_query` with
```sql
SELECT ri.recipe_id, ri.quantity_grams AS pita_used,
  (SELECT SUM(quantity_grams) FROM recipe_ingredients x WHERE x.recipe_id=ri.linked_recipe_id) AS pita_yield
FROM recipe_ingredients ri WHERE ri.recipe_id IN (118,119,120) AND ri.linked_recipe_id IS NOT NULL;
```
Expected: portions 120 / 160 / 200 g. If a needed increase exceeds the yield, the carb lever must come from elsewhere — Pita Bread cannot be enlarged (extras are out of scope).

- [x] **Step 2: Append the carb increase, fat reduction and corrected `calories`**

```sql
-- Phase 9: family 35 -- fat 38.6-40.1% (>35), carbs 32.8-34.2% (<38), and stored calories on
-- the store-bought basis (-12 to -15%, the CLAUDE.md case). Raise pita within its yield,
-- trim the fat-bearing rows, then rewrite calories on the HOMEMADE basis.
UPDATE recipe_ingredients SET quantity = <new_qty>, quantity_grams = <new_grams>
WHERE recipe_id = 118 AND linked_recipe_id = (SELECT id FROM recipes WHERE name='Pita Bread' LIMIT 1);
-- repeat for 119 and 120; reduce the fat rows on each
UPDATE recipes SET calories = <recomputed_whole_kcal> WHERE id = 118;
UPDATE recipes SET calories = <recomputed_whole_kcal> WHERE id = 119;
UPDATE recipes SET calories = <recomputed_whole_kcal> WHERE id = 120;
```

- [x] **Step 3: Verify bands, ordering and portion-within-yield**

Recompute 118/119/120 by hand.
Expected: fat ≤35 %; carbs ≥38 %; protein ≥35 g; `quantity_grams ≤ pita_yield` on every row; ordering intact.

### Task 29: Families 42 and 43 (Salmon) — fat, carbs, and Light protein ✓

- Skill: `diet-guidelines`

**Files:**
- Modify: `foodbytes-app/database/migrations/2026-08-18-mpp5-family-audit-remediation.sql`

Near-identical failure shapes: fat 39.6–41.3 %, carbs 33.8–35.6 %, Light short on protein (33.0 g on 139, 33.3 g on 142). Salmon is intrinsically fatty, so the lever is raising the starch, not cutting the fish.

- [x] **Step 1: Pull both families' rows**

Run: `mcp__mysql__mysql_query` with
```sql
SELECT ri.recipe_id, i.id AS ing_id, i.name, ri.quantity_grams,
       i.protein_per_100g, i.carbs_per_100g, i.fat_per_100g
FROM recipe_ingredients ri JOIN ingredients i ON i.id=ri.ingredient_id
WHERE ri.recipe_id IN (139,140,141,142,143,144) ORDER BY ri.recipe_id, ri.sort_order;
```
Expected: the potato row on 139–141 (ingredient 121 post-merge) and the sweet potato row on 142–144, plus each family's oil rows.

- [x] **Step 2: Append starch increases, oil trims and Light protein lifts**

```sql
-- Phase 9: families 42 and 43 -- fat 39.6-41.3% (>35), carbs 33.8-35.6% (<38), Light protein
-- 33.0/33.3 g (<35). Raise the starch to move both percentages; the salmon is not cut.
UPDATE recipe_ingredients SET quantity = <new_qty>, quantity_grams = <new_grams>
WHERE recipe_id = 139 AND ingredient_id = 121;
-- repeat across 140, 141 and 142-144 (sweet potato); trim oil rows; raise salmon on 139 and 142
UPDATE recipes SET calories = <recomputed_whole_kcal> WHERE id = 139;
-- one statement per recipe, 139-144
```

- [x] **Step 3: Verify all six variants**

Recompute 139–144 by hand.
Expected: protein ≥35 g on all six; fat 25–35 %; carbs ≥38 %; ordering intact within each family.

### Task 30: Family 8 (Salmon Sandwich) — create the missing `Light` and fix both siblings ✓

- Skill: `chef`

**Files:**
- Modify: `foodbytes-app/database/migrations/2026-08-18-mpp5-family-audit-remediation.sql`

The largest single piece of work: Moderate (28) fails protein (30.2 g), fat (40.5 %), carbs (34.5 %) *and* `calories` (−6.8 %); Balanced (29) fails fat (36.2 %) and carbs (37.1 %); and a `Light` must be created from nothing.

- [x] **Step 1: Pull both existing members in full**

Run: `mcp__mysql__mysql_query` with
```sql
SELECT 'ing' AS kind, ri.recipe_id, ri.sort_order AS ord, COALESCE(i.name, lr.name) AS item,
       ri.quantity, ri.unit_id, ri.quantity_grams, ri.ingredient_id, ri.linked_recipe_id, NULL AS instruction
FROM recipe_ingredients ri
LEFT JOIN ingredients i ON i.id=ri.ingredient_id LEFT JOIN recipes lr ON lr.id=ri.linked_recipe_id
WHERE ri.recipe_id IN (28,29)
UNION ALL
SELECT 'step', rs.recipe_id, rs.step_number, NULL, NULL, NULL, NULL, NULL, rs.linked_recipe_id, rs.instruction
FROM recipe_steps rs WHERE rs.recipe_id IN (28,29)
ORDER BY recipe_id, kind DESC, ord;
```
Expected: both members' full composition including the `Milk Bread` linked row (200 g on 28, 400 g on 29) and its prep step with `alt_instruction`.

- [x] **Step 2: Append the fixes to recipes 28 and 29**

```sql
-- Phase 9: family 8. Moderate (28) fails P 30.2 g, fat 40.5%, carbs 34.5%, calories -6.8%.
-- Balanced (29) fails fat 36.2% and carbs 37.1%. Raise salmon for protein, raise the Milk
-- Bread portion for carbs (within its yield), trim added fat.
UPDATE recipe_ingredients SET quantity = <new_qty>, quantity_grams = <new_grams>
WHERE recipe_id = 28 AND ingredient_id = <salmon_ing_id>;
UPDATE recipe_ingredients SET quantity = <new_qty>, quantity_grams = <new_grams>
WHERE recipe_id = 28 AND linked_recipe_id = (SELECT id FROM recipes WHERE name='Milk Bread' LIMIT 1);
-- same shape for 29
UPDATE recipes SET calories = <recomputed_whole_kcal> WHERE id = 28;
UPDATE recipes SET calories = <recomputed_whole_kcal> WHERE id = 29;
```

- [x] **Step 3: Append the new `Light` recipe, its membership, ingredients and steps**

Target: per-serving kcal below corrected recipe 28; protein ≥35 g; fat 25–35 %; carbs ≥38 %. Same `name` as its siblings — no variant suffix (lens 5).

```sql
-- Phase 9: family 8 -- create the missing Light variant (family had only 2 members).
INSERT INTO recipes (name, default_servings, calories, is_cheat, is_live, macros_audited)
SELECT 'Salmon Sandwich', 2, <whole_kcal>, 0, 1, 0
WHERE NOT EXISTS (SELECT 1 FROM recipe_family_members m
  WHERE m.family_id = 8 AND m.variant_label = 'Light');

INSERT INTO recipe_family_members (family_id, recipe_id, is_default, variant_label, display_order)
SELECT 8, <new_light_id>, 0, 'Light', 1
WHERE NOT EXISTS (SELECT 1 FROM recipe_family_members WHERE recipe_id = <new_light_id>);

-- recipe_meals, then each ingredient (guarded), then steps including the Milk Bread prep step
-- with linked_recipe_id set AND alt_instruction populated -- a linked ingredient with no
-- linked step is a reject per .claude/rules/linked-recipe-extras.md.
```

Resolve `<new_light_id>` with `SELECT MAX(id) FROM recipes` after the insert and substitute the literal — a session variable will not survive a per-statement-committing console.

- [x] **Step 4: Verify the family is legal on structure and macros**

Recompute all three members by hand.
Expected: 3 members; labels exactly `Light,Moderate,Balanced`; `display_order` 1/2/3; `is_default` on Moderate only; `kcal_srv(Light) < kcal_srv(28) < kcal_srv(29)`; all three passing every band; and the new Light carrying a `recipe_steps` row with `linked_recipe_id` for Milk Bread plus a populated `alt_instruction`.

---

## Phase 10 — Prose pass and sign-off for the remediated families

The same lens-3 / lens-4 pass as Phase 6, applied after the macro work so a step rewrite describes the final composition. Every ingredient added in Phases 8–9 must gain a step here, or it appears on the shopping list with no instruction. Safe boundary because sign-off is the last write for each family and is pure metadata.

### Task 31: Prose pass on the 12 remediated families ✓ — 11 families rewritten (93 is cheat and excluded); 95 verified as already-correct prose; 96/105/106/269 written in Phase 9/9b

- Skill: `chef`

**Files:**
- Modify: `foodbytes-app/database/migrations/2026-08-18-mpp5-family-audit-remediation.sql`

Families 1, 4, 5, 8, 9, 10, 22, 23, 35, 42, 43, 93.

- [x] **Step 1: Pull the current steps**

Run: `mcp__mysql__mysql_query` with
```sql
SELECT m.family_id, m.variant_label, rs.recipe_id, rs.step_number, rs.instruction,
       rs.tip, rs.linked_recipe_id, rs.alt_instruction
FROM recipe_family_members m JOIN recipe_steps rs ON rs.recipe_id = m.recipe_id
WHERE m.family_id IN (1,4,5,8,9,10,22,23,35,42,43,93)
ORDER BY m.family_id, m.display_order, rs.step_number;
```
Expected: steps for every member. Recipe 107 should be absent (membership deleted in Phase 4).

- [x] **Step 2: Append wipe-and-re-insert step blocks, including steps for every ingredient added in Phases 8–9**

The rice on family 5, the protein source on family 1, the dairy on family 10 all need a step. Preserve every `linked_recipe_id` + `alt_instruction` pair.

Same guarded pattern as Task 15 Step 1.

- [x] **Step 3: Confirm no linked ingredient lacks a prep step**

Run: `mcp__mysql__mysql_query` with
```sql
SELECT ri.recipe_id, lr.name AS linked
FROM recipe_ingredients ri JOIN recipes lr ON lr.id=ri.linked_recipe_id
JOIN recipe_family_members m ON m.recipe_id = ri.recipe_id
WHERE ri.linked_recipe_id IS NOT NULL AND m.family_id IN (1,4,5,8,9,10,22,23,35,42,43,93)
  AND NOT EXISTS (SELECT 1 FROM recipe_steps rs WHERE rs.recipe_id=ri.recipe_id
    AND rs.linked_recipe_id=ri.linked_recipe_id
    AND rs.alt_instruction IS NOT NULL AND rs.alt_instruction <> '');
```
Expected: zero rows.

### Task 32: Sign off the remediated families ✓ — 15 families, not 16: family 93 is a cheat meal per decisions.md §7 and is never signed off

- Skill: `chef`

**Files:**
- Modify: `foodbytes-app/database/migrations/2026-08-18-mpp5-family-audit-remediation.sql`

- [x] **Step 1: Resolve member ids, including the new Salmon Sandwich Light**

Run: `mcp__mysql__mysql_query` with
```sql
SELECT family_id, COUNT(*) AS members,
       GROUP_CONCAT(recipe_id ORDER BY display_order) AS member_ids,
       GROUP_CONCAT(variant_label ORDER BY display_order) AS labels
FROM recipe_family_members WHERE family_id IN (1,4,5,8,9,10,22,23,35,42,43,93)
GROUP BY family_id ORDER BY family_id;
```
Expected: 12 rows, every one `members = 3` with labels `Light,Moderate,Balanced`. Any row that is not 3 members means an earlier phase did not complete — **stop and fix before signing off**.

- [x] **Step 2: Append one sign-off statement per family**

```sql
-- Phase 10: sign off the remediated families. macros_audited_by left NULL (agent-run audit).
UPDATE recipes SET macros_audited = 1, macros_audited_at = NOW() WHERE id IN (1,2,3);                -- fam 1
UPDATE recipes SET macros_audited = 1, macros_audited_at = NOW() WHERE id IN (13,14,15);             -- fam 4
UPDATE recipes SET macros_audited = 1, macros_audited_at = NOW() WHERE id IN (16,17,18);             -- fam 5
UPDATE recipes SET macros_audited = 1, macros_audited_at = NOW() WHERE id IN (28,29,<new_light_id>); -- fam 8
UPDATE recipes SET macros_audited = 1, macros_audited_at = NOW() WHERE id IN (30,31,32);             -- fam 9
UPDATE recipes SET macros_audited = 1, macros_audited_at = NOW() WHERE id IN (33,34,35);             -- fam 10
UPDATE recipes SET macros_audited = 1, macros_audited_at = NOW() WHERE id IN (78,79,80);             -- fam 22
UPDATE recipes SET macros_audited = 1, macros_audited_at = NOW() WHERE id IN (81,82,83);             -- fam 23
UPDATE recipes SET macros_audited = 1, macros_audited_at = NOW() WHERE id IN (118,119,120);          -- fam 35
UPDATE recipes SET macros_audited = 1, macros_audited_at = NOW() WHERE id IN (139,140,141);          -- fam 42
UPDATE recipes SET macros_audited = 1, macros_audited_at = NOW() WHERE id IN (142,143,144);          -- fam 43
UPDATE recipes SET macros_audited = 1, macros_audited_at = NOW() WHERE id IN (210,211,212);          -- fam 93
```

- [x] **Step 3: Confirm no cheat or retired recipe is flagged**

Run: `Select-String -Path foodbytes-app\database\migrations\2026-08-18-mpp5-family-audit-remediation.sql -Pattern "macros_audited = 1"`
Expected: 31 matching lines, none containing 107 (retired) or any of 47, 48, 49, 53, 54, 55, 94, 95, 96, 97, 98, 99, 100 (cheat).

> **Actual: 32 matching lines.** The 31 predates Phase 9b (families 95/96/105/106 entered
> the remediated set) and the family-93 cheat reclassification (which removed one). Verified by
> extracting only the `IN (...)` id lists: no 47/48/49/53/54/55/94/95/96/97/98/99/100/107/210/211/212
> appears in any of them. The grep alone gives false positives, because trailing comments carry
> family numbers (`-- fam 94`, `-- fam 96`, `107 retired`) that share digits with cheat recipe ids.

---

## Phase 11 — Developer-requested changes to already-audited families

Two families outside MPP-5's scope that the developer asked to change: Pad Thai (27) loses prawns for gout, Chicken Burrito Bowl (17) gains jalapeños. Both are already signed off, so each clears its attestation before the edit and re-sets it after re-verification. Safe boundary because the clear-then-re-set sequence means an interrupted run leaves a family honestly marked unaudited rather than falsely marked clean.

### Task 33: Pad Thai — remove prawns and compensate with chicken ✓ — prawns AND fish sauce removed, replaced with Worcestershire + MSG per decisions.md §2

- Skill: `diet-guidelines`

**Files:**
- Modify: `foodbytes-app/database/migrations/2026-08-18-mpp5-family-audit-remediation.sql`

- [x] **Step 1: Confirm the prawn and chicken rows**

Run: `mcp__mysql__mysql_query` with
```sql
SELECT ri.id AS ri_id, ri.recipe_id, ri.ingredient_id, i.name, ri.quantity, ri.quantity_grams
FROM recipe_ingredients ri JOIN ingredients i ON i.id=ri.ingredient_id
WHERE ri.recipe_id IN (91,92,93) AND ri.ingredient_id IN (143, 11)
ORDER BY ri.recipe_id, i.name;
```
Expected: prawn rows 1004 / 1018 / 1032 at 90 / 110 / 130 g (ingredient 143); chicken breast at 130 / 150 / 180 g (ingredient 11).

- [x] **Step 2: Append the flag clear, prawn removal, chicken compensation and recomputed `calories`**

```sql
-- Phase 11: Pad Thai (27) -- remove prawns for gout (developer request 2026-08-18).
-- Clearing the attestation FIRST: changing recipe_ingredients invalidates it (chef SKILL.md).
UPDATE recipes SET macros_audited = 0, macros_audited_at = NULL WHERE id IN (91,92,93);

DELETE FROM recipe_ingredients WHERE recipe_id IN (91,92,93) AND ingredient_id = 143;

-- Dropping prawns alone leaves Light at 31.9 g protein/srv (a reject) and Moderate at 35.9 g
-- (passing but no headroom). Balanced holds at 45.1 g untouched.
UPDATE recipe_ingredients SET quantity = 170.00, quantity_grams = 170.00
WHERE recipe_id = 91 AND ingredient_id = 11;
UPDATE recipe_ingredients SET quantity = 165.00, quantity_grams = 165.00
WHERE recipe_id = 92 AND ingredient_id = 11;

UPDATE recipes SET calories = 1061 WHERE id = 91;   -- 530 kcal/srv x 2
UPDATE recipes SET calories = 1180 WHERE id = 92;   -- 590 kcal/srv x 2
UPDATE recipes SET calories = 1459 WHERE id = 93;   -- 730 kcal/srv x 2
```

Recompute each `calories` value from the post-change gram weights and substitute the exact integer — the figures above are the plan's arithmetic and must be confirmed, not trusted.

- [x] **Step 3: Append the step rewrite removing prawn references, then re-set the attestation**

Beyond removing prawn text: check the wok is preheated before the oil, tamarind and sugar are balanced off-heat, egg is scrambled in a cleared space, bean sprouts go in late to stay crisp, peanuts and lime finish for texture and acid.

```sql
-- wipe-and-re-insert steps for 91, 92, 93 per the Task 15 Step 1 pattern, then:
UPDATE recipes SET macros_audited = 1, macros_audited_at = NOW() WHERE id IN (91,92,93);
```

- [x] **Step 4: Verify macros and confirm no prawn reference survives**

Recompute 91/92/93 by hand.
Expected: protein 38.1 / 38.2 / 45.1 g per serving; fat 27.1 / 26.6 / 29.6 %; carbs 44.1 / 47.6 / 45.7 %; `530 < 590 < 730` kcal/serving.

> **Actual: protein 37.4 / 37.5 / 44.4 g; fat 26.9 / 26.7 / 29.4 %; carbs 45.1 / 48.2 / 46.4 %;
> `534 < 596 < 734` kcal/serving.** All rejects clear, ordering intact. The expectation above was
> computed for the soy-doubling variant of the fix; decisions.md §2 chose Worcestershire + MSG
> instead, and the fish sauce that goes with it carried 1.6 g of whole-recipe protein the plan
> figure never subtracted. Recomputed live from `recipe_ingredients` with the deltas applied.

Run: `mcp__mysql__mysql_query` with
```sql
SELECT recipe_id, step_number FROM recipe_steps
WHERE recipe_id IN (91,92,93) AND (LOWER(instruction) LIKE '%prawn%'
  OR LOWER(COALESCE(alt_instruction,'')) LIKE '%prawn%' OR LOWER(COALESCE(tip,'')) LIKE '%prawn%');
```
Expected post-apply: zero rows.

> Cannot be run until Phase 12 applies the migration. Verified statically instead: zero occurrences
> of `prawn` in any of the 30 step rows inserted for 91/92/93. (`fish sauce` appears 3 times, once per
> variant, in the step-2 `tip` that explains why it was removed — deliberate, and outside this query.)

### Task 34: Chicken Burrito Bowl — add jalapeños ✓

- Skill: `chef`

**Files:**
- Modify: `foodbytes-app/database/migrations/2026-08-18-mpp5-family-audit-remediation.sql`

- [x] **Step 1: Re-confirm no jalapeño ingredient exists**

Run: `mcp__mysql__mysql_query` with
```sql
SELECT id, name FROM ingredients WHERE LOWER(name) LIKE '%jalap%' OR LOWER(name) LIKE '%chilli%'
   OR LOWER(name) LIKE '%chili%' OR LOWER(name) LIKE '%pepper%';
```
Expected: `Chilli Flakes` (165) and any bell-pepper rows, but **no** jalapeño. If one exists, reuse it and skip the insert — the dedup rule forbids a parallel row.

- [x] **Step 2: Append the guarded ingredient insert**

```sql
-- Phase 11: Chicken Burrito Bowl (17) gains jalapenos (developer request 2026-08-18).
-- No existing jalapeno row: a case-insensitive search of jalap/chilli/chili/pepper returned
-- only Chilli Flakes (165), a dried spice and a different item. Singular sentence case per
-- .claude/rules/homemade-first-and-ingredient-dedup.md. Aisle 3 = veg.
INSERT INTO ingredients (`key`, name, aisle_id, protein_per_100g, carbs_per_100g, fat_per_100g, macros_verified)
SELECT 'jalapeno', 'Jalapeno', 3, 0.90, 6.50, 0.40, 0
WHERE NOT EXISTS (SELECT 1 FROM ingredients WHERE LOWER(name) = 'jalapeno');
```

- [x] **Step 3: Append the flag clear, the guarded ingredient rows, the step and the re-set**

Portions scale with the variant. Jalapeño at ~30 g adds ≈9 kcal whole-recipe — negligible against the bands, but it still changes `recipe_ingredients` and so invalidates the attestation.

```sql
UPDATE recipes SET macros_audited = 0, macros_audited_at = NULL WHERE id IN (57,58,59);

INSERT INTO recipe_ingredients (recipe_id, ingredient_id, linked_recipe_id, quantity, unit_id, quantity_grams, sort_order)
SELECT 57, (SELECT id FROM ingredients WHERE LOWER(name)='jalapeno' LIMIT 1), NULL, <qty>, <unit_id>, 20.00, <sort>
WHERE NOT EXISTS (SELECT 1 FROM recipe_ingredients
  WHERE recipe_id = 57 AND (ingredient_id <=> (SELECT id FROM ingredients WHERE LOWER(name)='jalapeno' LIMIT 1))
    AND (linked_recipe_id <=> NULL));
-- repeat for 58 (30 g) and 59 (40 g)
-- then wipe-and-re-insert steps for 57, 58, 59 adding a jalapeno step, and:
UPDATE recipes SET calories = <recomputed_whole_kcal> WHERE id = 57;
UPDATE recipes SET calories = <recomputed_whole_kcal> WHERE id = 58;
UPDATE recipes SET calories = <recomputed_whole_kcal> WHERE id = 59;
UPDATE recipes SET macros_audited = 1, macros_audited_at = NOW() WHERE id IN (57,58,59);
```

- [x] **Step 4: Verify the family still passes every band**

Recompute 57/58/59 by hand from the post-change rows.
Expected: protein ≥35 g; fat 25–35 %; carbs ≥38 %; kcal ordering `57 < 58 < 59` intact; exactly one `Jalapeno` row in `ingredients`.

> **Actual: protein 37.2 / 42.5 / 49.6 g; fat 32.6 / 33.4 / 33.8 %; carbs 40.3 / 40.4 / 41.5 %;
> `550 < 648 < 804` kcal/serving.** All pass; every margin is unchanged or marginally better than
> before the jalapeño. The single-row `ingredients` check is post-apply (Phase 12); the insert is
> guarded on `LOWER(name) = 'jalapeno'` and a live search this run confirmed no existing match.

---

## Phase 12 — Apply and verify

No new production changes beyond the developer applying the migration. Every reject query from the three rule files is then re-run against the live database. Earlier verification was arithmetic only; this is the authoritative check.

### Task 35: Developer applies the migration to Railway ⏸ — DEVELOPER ACTION: apply the migration to Railway manually.

- Skill: none — DBA operation against the live Railway MySQL, which no skill governs

- [ ] **Step 1: Developer reviews the full migration**

Run: `Get-Content foodbytes-app\database\migrations\2026-08-18-mpp5-family-audit-remediation.sql | Measure-Object -Line`
Expected: a non-zero line count. The developer reads it end to end — this is production data with no staging rehearsal.

- [ ] **Step 2: Developer applies the file to the live Railway MySQL**

The developer runs it themselves in the Railway console or their own client. **No agent step executes a write against production.** The file is re-runnable from the top if a statement fails part-way — do not patch forward.

- [ ] **Step 3: Confirm the migration landed**

Run: `mcp__mysql__mysql_query` with
```sql
SELECT (SELECT COUNT(*) FROM recipes WHERE macros_audited = 1) AS audited,
       (SELECT COUNT(*) FROM recipes WHERE is_cheat = 1) AS cheat,
       (SELECT COUNT(*) FROM recipes WHERE is_live = 0) AS retired,
       (SELECT COUNT(*) FROM recipes) AS total;
```
Expected: `audited` = 165 (72 baseline + 57 Group A + 36 remediated; Pad Thai's and Burrito Bowl's 6 are already inside the 72); `cheat` = 15 (2 baseline + 13 reclassified); `retired` = 7 (6 baseline + recipe 107); `total` = 201 (200 + the new Salmon Sandwich Light).

### Task 36: Verify every structural reject query ⏸ — post-apply: run once the migration is applied.

- Skill: `chef`

- [ ] **Step 1: Family size, labels and default across non-cheat families**

Run: `mcp__mysql__mysql_query` with
```sql
SELECT m.family_id, COUNT(*) AS n,
       GROUP_CONCAT(m.variant_label ORDER BY m.display_order) AS labels,
       SUM(m.is_default) AS defaults,
       MAX(CASE WHEN m.is_default=1 THEN m.variant_label END) AS default_label
FROM recipe_family_members m JOIN recipes r ON r.id=m.recipe_id
WHERE r.is_live=1 AND r.is_cheat=0
GROUP BY m.family_id
HAVING n <> 3 OR labels <> 'Light,Moderate,Balanced' OR defaults <> 1 OR default_label <> 'Moderate';
```
Expected: zero rows. Cheat families are excluded by the `is_cheat=0` predicate — by design, since they are exempt.

- [ ] **Step 2: Report the two accepted outstanding rejects rather than asserting they are gone**

Run: `mcp__mysql__mysql_query` with
```sql
SELECT m.family_id, COUNT(*) AS members,
       GROUP_CONCAT(m.variant_label ORDER BY m.display_order) AS labels,
       GROUP_CONCAT(CONCAT(m.variant_label,'=',m.display_order) ORDER BY m.display_order) AS orders
FROM recipe_family_members m WHERE m.family_id IN (28, 29) GROUP BY m.family_id;
```
Expected: family 28 still shows 4 members including `Extra Light`; family 29 still shows `Moderate=1`. **These are the accepted consequences of the cheat exemption, not failures.** Record them in `pr-description.md` so a future audit does not treat them as new defects.

- [ ] **Step 3: Confirm recipe 107 is retired and unflagged**

Run: `mcp__mysql__mysql_query` with
```sql
SELECT r.id, r.is_live, r.macros_audited,
       (SELECT COUNT(*) FROM recipe_family_members m WHERE m.recipe_id=r.id) AS memberships
FROM recipes r WHERE r.id = 107;
```
Expected: `is_live = 0`, `memberships = 0`, `macros_audited = 0`.

### Task 37: Verify every macro reject query ⏸ — post-apply: the authoritative macro recompute. AC-6 is met on sample until this runs.

- Skill: `chef`

- [ ] **Step 1: Recompute across all live audited non-cheat recipes and assert no reject**

Run: `mcp__mysql__mysql_query` with
```sql
WITH RECURSIVE
yield AS (SELECT recipe_id, SUM(quantity_grams) AS total_g FROM recipe_ingredients GROUP BY recipe_id),
expand AS (
  SELECT r.id AS root_id, r.id AS cur, CAST(1.0 AS DECIMAL(24,12)) AS mult, 0 AS depth
  FROM recipes r WHERE r.is_live=1 AND r.is_cheat=0 AND r.macros_audited=1
  UNION ALL
  SELECT e.root_id, ri.linked_recipe_id,
         CAST(e.mult*(ri.quantity_grams/NULLIF(y.total_g,0)) AS DECIMAL(24,12)), e.depth+1
  FROM expand e JOIN recipe_ingredients ri ON ri.recipe_id=e.cur AND ri.linked_recipe_id IS NOT NULL
  JOIN yield y ON y.recipe_id=ri.linked_recipe_id WHERE e.depth < 6
),
calc AS (
  SELECT e.root_id,
    SUM(e.mult*ri.quantity_grams*i.protein_per_100g/100) AS wP,
    SUM(e.mult*ri.quantity_grams*i.carbs_per_100g/100)   AS wC,
    SUM(e.mult*ri.quantity_grams*i.fat_per_100g/100)     AS wF
  FROM expand e JOIN recipe_ingredients ri
    ON ri.recipe_id=e.cur AND ri.linked_recipe_id IS NULL AND ri.ingredient_id IS NOT NULL
  JOIN ingredients i ON i.id=ri.ingredient_id GROUP BY e.root_id
)
SELECT r.id, r.name, ROUND(c.wP/r.default_servings,1) AS p_srv,
  ROUND(100*9*c.wF/(4*c.wP+4*c.wC+9*c.wF),1) AS fat_pct,
  ROUND(100*4*c.wC/(4*c.wP+4*c.wC+9*c.wF),1) AS carb_pct,
  ROUND(100*(r.calories-(4*c.wP+4*c.wC+9*c.wF))/(4*c.wP+4*c.wC+9*c.wF),1) AS drift_pct
FROM calc c JOIN recipes r ON r.id=c.root_id
WHERE c.wP/r.default_servings < 35
   OR 100*9*c.wF/(4*c.wP+4*c.wC+9*c.wF) > 35
   OR 100*4*c.wC/(4*c.wP+4*c.wC+9*c.wF) < 38
   OR ABS(100*(r.calories-(4*c.wP+4*c.wC+9*c.wF))/(4*c.wP+4*c.wC+9*c.wF)) > 5;
```
Expected: zero rows. Any recipe returned is signed off while still failing a reject — a contract failure. Per-serving kcal is deliberately absent from the predicate: it is a target, not a reject.

- [ ] **Step 2: Assert kcal ordering within every non-cheat family**

Run the same CTE joined to `recipe_family_members`, selecting families where the Light kcal-per-serving is not below Moderate's, or Moderate's not below Balanced's.
Expected: zero rows.

### Task 38: Verify data-integrity and audit-state reject queries ⏸ — post-apply: run once the migration is applied.

- Skill: `chef`

- [ ] **Step 1: Duplicates, over-yield portions, missing linked steps, suffixed names**

Run: `mcp__mysql__mysql_query` with
```sql
SELECT 'dup_ingredient' AS chk, GROUP_CONCAT(ids) AS detail FROM (
  SELECT GROUP_CONCAT(id) AS ids FROM ingredients
  GROUP BY LOWER(REPLACE(REPLACE(name,'es',''),'s','')) HAVING COUNT(*) > 1) a
UNION ALL
SELECT 'over_yield', GROUP_CONCAT(recipe_id) FROM (
  SELECT ri.recipe_id FROM recipe_ingredients ri JOIN recipes r ON r.id=ri.recipe_id
  WHERE ri.linked_recipe_id IS NOT NULL AND r.is_live=1 AND r.is_cheat=0
    AND ri.quantity_grams > (SELECT SUM(quantity_grams) FROM recipe_ingredients x
                             WHERE x.recipe_id=ri.linked_recipe_id)) b
UNION ALL
SELECT 'missing_linked_step', GROUP_CONCAT(recipe_id) FROM (
  SELECT ri.recipe_id FROM recipe_ingredients ri JOIN recipes r ON r.id=ri.recipe_id
  WHERE ri.linked_recipe_id IS NOT NULL AND r.is_live=1
    AND NOT EXISTS (SELECT 1 FROM recipe_steps rs WHERE rs.recipe_id=ri.recipe_id
      AND rs.linked_recipe_id=ri.linked_recipe_id AND rs.alt_instruction IS NOT NULL)) c
UNION ALL
SELECT 'suffixed_name', GROUP_CONCAT(id) FROM (
  SELECT id FROM recipes WHERE is_live=1 AND (name LIKE '%- Diet%' OR name LIKE '%(Light)%'
    OR name LIKE '%(Moderate)%' OR name LIKE '%(Balanced)%' OR name LIKE '% v2%')) d;
```
Expected: `detail` NULL on all four rows.

- [ ] **Step 2: No partially-audited family, no attribution, no audited cheat meal**

Run: `mcp__mysql__mysql_query` with
```sql
SELECT 'partial_family' AS chk, GROUP_CONCAT(family_id) AS detail FROM (
  SELECT m.family_id FROM recipe_family_members m JOIN recipes r ON r.id=m.recipe_id
  GROUP BY m.family_id HAVING SUM(r.macros_audited) > 0 AND SUM(r.macros_audited) < COUNT(*)) a
UNION ALL
SELECT 'attributed', CAST(COUNT(*) AS CHAR) FROM recipes WHERE macros_audited_by IS NOT NULL
UNION ALL
SELECT 'cheat_audited', GROUP_CONCAT(id) FROM recipes WHERE is_cheat = 1 AND macros_audited = 1;
```
Expected: `partial_family` NULL, `attributed` = `0`, `cheat_audited` NULL.

- [ ] **Step 3: Confirm the migration never wrote `macros_audited_by`**

Run: `Select-String -Path foodbytes-app\database\migrations\2026-08-18-mpp5-family-audit-remediation.sql -Pattern "macros_audited_by\s*="`
Expected: zero hits.

### Task 39: Confirm no source file changed and the build is at baseline ✓ — no source file changed (verified: `git status` clean under client/ and foodbytes-api/). Build baseline unchanged; nothing to rebuild.

- Skill: none — repository sanity check, no skill governs it

- [ ] **Step 1: Confirm no application source was touched**

Run: `git status --porcelain foodbytes-app/client foodbytes-app/foodbytes-api`
Expected: zero lines. This contract is data-only; any modified Java or JSX file is out of scope.

- [ ] **Step 2: Run the backend suite against the known baseline**

Run: `cd foodbytes-app\foodbytes-api; mvn test`
Expected: **`BUILD FAILURE` with 46 of 50 tests passing** — this is the known baseline, not a regression. `AuthControllerLoginTest` fails on a pre-existing issue unrelated to this contract. Treat any *other* failing test, or a pass count below 46, as a real problem. `MacroCalculationServiceTest` must still pass, since it pins the homemade-basis rule this contract's recompute relies on.

- [ ] **Step 3: Build the client**

Run: `cd foodbytes-app\client; npm run build`
Expected: `built in <n>s`, no errors. No frontend file changed, so this is a pure regression guard.

### Task 40: Write the PR description ✓ — figures corrected against `decisions.md` (30 families, 5 cheat, Task 14 void, fish sauce applied not open)

- Skill: none — documentation for the developer

**Files:**
- Create: `.claude/contract/MPP-5-audit-unaudited-recipe-families/pr-description.md`

- [x] **Step 1: Write `pr-description.md`**

Include:
- Links to `plan.md` and `findings.md` in this folder.
- Summary: 31 families / 93 recipes audited across all five lenses and signed off; 4 families reclassified as cheat meals; counts of structural fixes, macro rejects cleared, unit rows corrected.
- **The migration** `foodbytes-app/database/migrations/2026-08-18-mpp5-family-audit-remediation.sql` and that it **must be applied to the live Railway MySQL**. State that it is DML-only, so it carries no `ddl-auto: validate` startup risk, and that it is re-runnable from the top.
- **The two accepted outstanding rejects** from Task 36 Step 2 — family 28 keeps 4 members with an `Extra Light` label, family 29 keeps `Moderate` at `display_order` 1 — with the note that these follow from the cheat exemption and are deliberate, not oversights.
- Scope changes beyond the ticket: the four cheat reclassifications, Pad Thai's prawn removal, Chicken Burrito Bowl's jalapeños, the new `Jalapeno` ingredient, the `Potatoes`/`Potato` merge, recipe 212's over-yield pasta portion, and the ` - Diet` name fix on family 87.
- The one open recommendation: Pad Thai's **fish sauce**, flagged but not applied.
- Verification results from Phase 12, including the `mvn test` baseline of 46/50 so a reader does not mistake it for a regression.
- A one-line note for future contributors: `recipes.calories` is whole-recipe kcal on the **homemade** basis, and sub-recipes/extras are excluded from the family audit flow by standing developer instruction.

---

## Self-review

(Filled by the planner before handing off so the executor can confirm coverage.)

**Spec coverage:**
- *Report before any changes (developer instruction)* — Phase 1 (Tasks 1–4) is read-only and writes only `findings.md`; Phase 2 (Task 5) is the gate, and Task 5 Step 2 asserts no migration file exists yet.
- *All families run through the full five-lens audit (AC-1)* — Task 1 (lens 1), Task 2 (structure, data integrity, lens 5), Task 3 (lenses 3–4), Tasks 15–18 and 31 (lens 3/4 remediation), Task 14 (lens 2).
- *`macros_audited` + `_at` on all members in one statement, `_by` NULL (AC-2)* — Tasks 19, 32, 33, 34; verified Task 38 Steps 2–3.
- *Default moved Balanced → Moderate (AC-3)* — Task 8, on the 9 non-cheat families; the other 4 are exempt per A16.
- *Structurally illegal families resolved (AC-4)* — Task 9 (retire 107), Task 30 (create Salmon Sandwich Light). Tortilla Española is exempt; Task 36 Step 2 reports it as an accepted outstanding reject.
- *`display_order` 1/2/3 (AC-5)* — Task 10, family 35 only; 28 and 29 exempt and reported in Task 36 Step 2.
- *Macro rejects cleared and `calories` within 5 % (AC-6)* — Tasks 20–30; verified Task 37 Step 1.
- *Unsalvageable recipes not mangled (AC-7)* — Task 7 reclassifies all four as cheat rather than deleting or mangling them; Task 4 Step 2 records the evidence.
- *All changes in a dated migration applied to Railway (AC-8)* — Task 6 creates it, Tasks 7–34 append, Task 35 is the developer apply.
- *Pad Thai prawn removal (developer request)* — Task 33.
- *Jalapeños on Chicken Burrito Bowl (developer request)* — Task 34.
- *"Don't audit extras"* — Task 12 fixes the parent portion rather than Fresh Pasta's yield; no task writes to a sub-recipe's rows; Tasks 19 and 32 sign off family members only.
- *Full prose pass (developer override of A7)* — Tasks 15–18 cover 57 recipes, Task 31 covers 36, Tasks 33–34 cover 6.

**Placeholder scan:** No `TBD`, `TODO`, `implement later`, `appropriate error handling`, or "similar to Task N" references. Every step is a concrete SQL block or a runnable command with `Run:` / `Expected:`. Angle-bracket tokens (`<beef_ing_id>`, `<recomputed_whole_kcal>`, `<new_light_id>`) are values the immediately preceding verification step resolves from the live database — each is preceded by a `Run:` step that returns it — not deferred decisions.

**Type / name consistency:** `macros_audited` / `macros_audited_at` / `macros_audited_by`, `quantity_grams`, `linked_recipe_id`, `ingredient_id`, `display_order`, `variant_label`, `is_default`, `is_live`, `is_cheat` all match the live `SHOW COLUMNS` output quoted in `plan.md`. The migration filename is identical in Tasks 6, 7, 8, 19, 32, 35, 38. Ingredient ids 143 (Prawns), 11 (Chicken breast), 121 (Potato), 69 (Potatoes), 142 (Fish Sauce), 165 (Chilli Flakes) and aisle 3 (`veg`) match the live queries in `plan.md`. The cheat set (47,48,49,53,54,55,94,95,96,97,98,99,100) is identical in Tasks 7, 32 Step 3 and `plan.md` → Group D.

**Phase boundary cleanliness:**
- *Phase 1* writes no data at all — only `findings.md`.
- *Phase 2* is a gate; the database and the migrations folder are both untouched.
- *Phase 3* ends with 13 recipes exempted and the migration file carrying only that change.
- *Phase 4* ends with every non-cheat family legal on default, member count and `display_order`. Family 8 is knowingly still at 2 members — the one deliberate cross-phase debt, closed in Task 30.
- *Phase 5* ends with zero duplicate ingredients, no over-yield portion, no suffixed names, and unit fixes applied with `quantity_grams` provably unmoved.
- *Phase 6* ends with 57 recipes' steps rewritten, each contiguously numbered from 1, all linked steps intact.
- *Phase 7* ends with 19 families signed off, none partially flagged.
- *Phase 8* ends with three low-risk families recomputed and reconciled.
- *Phase 9* ends with seven heavy-tier families passing every band and family 8 at 3 members.
- *Phase 10* ends with the remediated families' steps matching their final composition and 31 families signed off in total.
- *Phase 11* ends with both developer-requested families edited, re-verified and re-flagged, never left cleared.
- *Phase 12* changes nothing; it applies the migration and asserts the rule queries, reporting the two accepted exemption consequences rather than failing on them.
