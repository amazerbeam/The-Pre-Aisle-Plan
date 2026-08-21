# Phase 2 gate — developer decisions

Recorded 2026-08-18 during `/fb-apply`. The Phase 2 approval gate in `tasks.md` is
**passed**: the developer reviewed `findings.md` and answered all ten decisions it
raised, plus three follow-ups this run surfaced.

`plan.md` and `tasks.md` predate these answers. **Where they disagree with this file,
this file wins.**

---

## Gate housekeeping

- **The prior partial migration was discarded.** A previous interrupted run had drafted
  `2026-08-18-mpp5-family-audit-remediation.sql` (12 KB, Phases 3–5 only) before the gate.
  Developer chose *discard and rebuild*. Moved out of the repo to the session scratchpad
  as `DISCARDED-2026-08-18-mpp5-family-audit-remediation.sql`, not yet purged.
  Task 5 Step 2's precondition (no migration file exists) now holds.
- **The migration is rebuilt from scratch**, from `findings.md` plus this file.

---

## The ten decisions from `findings.md`

| # | Family | Decision |
|---|---|---|
| 1 | 105 Beef Burger | **Full rework** — see below. Not the transposition fix originally proposed. |
| 2 | 27 Pad Thai | Remove prawns **and** fish sauce (142); replace with **Worcestershire + MSG**. |
| 3 | 5, 22 Worcestershire | **Leave it.** No change. See *Anchovy position* below. |
| 4 | 7 Chicken & Vegetable Soup | **Include** in the `is_default` move → **10 families**, not 9. |
| 5 | 96 (and 95) Yogurt Bowl | **Cut the yogurt, raise the granola** to hold kcal. → **Revised 2026-08-19**: add whey isolate, cut yogurt on Balanced only, granola unchanged; family 95 reverted. See *Follow-up rulings*. |
| 6 | 106 Turkey Burger | **Link + vinegar + rest** — all three fixes. |
| 7 | 93 Chicken Carbonara | **Reclassify as a cheat meal** — see below. Not the portion fix originally proposed. |
| 8 | 43 Mediterranean Salmon | **Macro fix + make it genuinely Mediterranean.** |
| 9 | Cheat structural exemption | **Accepted in full** — *"that's what cheat meals are for"*. |
| 10 | 22 `step_number = 0` | **Move the chef note to `recipe_steps.tip`** on step 1, renumber 1–10. |

---

## Decision 1 — Family 105 rework (supersedes the transposition fix)

The developer rejected both options on the table and specified a different dish:
**pita instead of a bun, and the ham removed entirely.**

- Drop `Sliced Ham` (108) — remove the row from recipes 247/248/249.
- Drop `Brioche Burger Buns` (94) — remove the row.
- Add **pita as an FR-103 dual-path row**: `linked_recipe_id` = 117 (`Pita Bread`)
  **and** `ingredient_id` = 157 (store-bought `Pita Bread`), copying family 35's
  existing pattern. Requires a matching `recipe_steps` row carrying
  `linked_recipe_id = 117` and a populated `alt_instruction`.
- **Link the patty**: replace raw `Beef Burger Patties` (95) with
  `linked_recipe_id` = 43 (`Burger Patties`), raised to a real **130–200 g per serving**.
  Clears the homemade-first violation *and* the transposed weight in one move.
- **Rename** the family and all three recipes to match the dish — the current name
  ("Beef Burger with Bun, Lettuce, Tomato & Ham") names two components it no longer
  contains, which lens 5 rejects. This is an agreed **exception** to `plan.md`'s
  "no renaming beyond the ` - Diet` suffix" boundary.

Every portion must stay inside the 565 g `Burger Patties` yield and the `Pita Bread`
yield. Full recompute required — the original fix table in `findings.md` is void.

---

## Decision 7 — Family 93 becomes a cheat meal (supersedes Task 23 and part of Task 12)

Developer verdict: *"Make it a cheat meal and double the sauce and increase the bacon.
It's not nice as is."*

- `is_cheat = 1` on **all three** members — recipes 210, 211, 212.
- **Double the sauce** — the carbonara sauce is egg + Parmesan (no cream, correctly
  built). Double both together.
- **Increase the pancetta.** Confirmed pancetta, not bacon: keep pancetta and raise the
  weight rather than swapping in streaky bacon.
- The family **leaves the audit**: no macro remediation, no prose pass, no sign-off,
  and the macro reject conditions no longer apply to it.
- **Recipe 212's pasta portion is still fixed** — `quantity_grams = 300` against a
  282 g `Fresh Pasta` yield is impossible data, not a macro finding, so the
  cheat exemption does not cover it. Reduce to ≤ 282 g on the parent row only
  (`Fresh Pasta` itself is an extra and stays untouched per *don't audit extras*),
  and rewrite step 1 to drop the "scale up 1.1×" language.

---

## Anchovy position (supersedes the plan's gout assumption)

**Worcestershire is fine everywhere.** The developer confirmed it stays in families 5
and 22, and asked for it in Pad Thai. This is consistent with the standing memory note,
which was corrected on 2026-08-18 to keep Worcestershire — only the memory index line
was stale, and it has been fixed.

The distinction that holds: **fish sauce out, Worcestershire in.** It is a dose
judgement, not an ingredient ban. Pad Thai's fish sauce contributes ~60–90 mg purines
per serving; Worcestershire at in-repo doses contributes ~10 mg, against ~180–200 mg
from the beef in a stew serving. So swapping Pad Thai's fish sauce for Worcestershire is
a genuine reduction, not a lateral move.

---

## Task 14 — dropped (out of scope)

Unit realism (89 rows / 14 ingredient groups out of grams) is **removed from this
contract**. It is owned by **[MPP-6](https://amazerbeam.atlassian.net/browse/MPP-6)** —
*Standardise ingredient display units (49 ingredients / 1141 rows)* — which states
directly: *"Recommendation: drop Task 14 from MPP-5 so those rows are not set twice…
Task 14 is cosmetic and does not gate MPP-5's sign-off."*

Note for MPP-6: its named mass-bug example is `Brioche Burger Buns` (94) on recipes
247–252. Decision 1 removes that ingredient from those exact recipes, so the example
partly resolves here.

---

## Scope deltas against `plan.md`

| Measure | `plan.md` says | Now |
|---|---|---|
| Cheat families | 4 (14, 16, 28, 29) | **5** — plus **93** |
| Audit families in scope | 31 | **30** |
| Live recipes in scope | 93 | **90** |
| `is_default` move | 9 families | **10** — adds family **7** |
| Unit-realism rows (Task 14) | ~83–89 | **0** — moved to MPP-6 |
| Macro remediation families | 11 | **12** — 93 leaves, 96/95, 105, 106 enter |
| Renames | 3 (` - Diet` suffix only) | **plus family 105** and its 3 recipes |

## Work added that `tasks.md` has no task for

- Family 105 full rework + rename (decision 1)
- Family 93 cheat reclassification + sauce/pancetta increase (decision 7)
- Family 96 whey isolate + Balanced yogurt cut (decision 5, as revised 2026-08-19; family 95
  is reverted to live and needs no work)
- Family 106 mayonnaise dual-path link + linked prep step, vinegar in the slaw,
  patty rest (decision 6)
- Family 43 Mediterranean additions — cherry tomatoes, olives, oregano (decision 8)
- Family 22 chef-note move to `tip` + renumber 1–10 (decision 10)

## Work `tasks.md` has that is now void

- **Task 14** — dropped to MPP-6.
- **Task 23** (family 93 "confirm no further macro work") — superseded by the cheat
  reclassification.
- **Task 12**'s sign-off half — recipe 212's portion fix survives, its audit does not.
- **Task 7** — now 5 cheat families, not 4.
- **Task 8** — now 10 `is_default` families, not 9.

---

## Follow-up rulings during execution (2026-08-18)

Two items surfaced mid-implementation where the developer's original instruction could not
be met as written. Both were put back to the developer and answered.

**Family 96 — the 400/450/500 g yogurt target is arithmetically unreachable *with the
ingredients the bowl had*.** Greek yogurt was the only meaningful protein in it; cutting
Light 600 → 400 g drops protein 36.2 → 26.2 g/serving (a hard reject), and closing that gap
needs ~235 g of granola, which lands at 38.6 % fat — trading a protein reject for a fat
reject. The whole yogurt × granola grid was searched; no cell satisfies both.

An interim ruling of *"keep the partial cut"* (Balanced 450 → 320 g/serving, granola raised
on all three) was recorded on 2026-08-18 and has since been **superseded**. See below.

### Revised ruling, 2026-08-19 — whey covers the protein (supersedes "keep the partial cut")

The developer revisited the decision after two errors in the original finding surfaced, then
answered the question the interim ruling had explicitly parked.

**What the finding got wrong:**

1. **The portion was overstated.** The audit called 450 g of Greek yogurt *"a whole large tub
   per person"*. A standard tub is **500 g**, so 450 g is most of a standard tub — not a
   large one. The rhetorical force of the finding outran its arithmetic.
2. **It applied to one variant, not the family.** Only Balanced (222) sat at 450 g/serving.
   Light was 300 g and Moderate 350 g — unremarkable for a yogurt bowl. Cutting all three to
   correct an outlier on one of them was over-correction.
3. **The cut cost real protein.** Balanced fell 55.2 → 43.5 g/serving, a loss of **11.7 g**,
   to settle a presentation complaint. Greek yogurt *is* the protein in this bowl.

**What unblocked it.** The interim ruling reported, correctly, that reaching 200–250 g of
yogurt per serving *"needs a protein source this bowl does not have"*. The developer asked
whether protein powder could cover the cut instead. It can: **Whey protein isolate
(ingredient 163, 80.65 P / 0.00 C / 1.61 F per 100 g)** buys protein at almost no fat and no
carb cost — precisely the lever the yogurt × granola grid lacked, since granola buys fat
faster than it buys protein.

**Ruling: add whey, cut the yogurt only where it was actually an outlier, leave the granola
alone.** Whole-recipe grams (`default_servings` 2):

| Recipe | Greek yogurt | Granola (linked 213) | Berries | Honey | Whey isolate (163) |
|---|---|---|---|---|---|
| 220 Light | 600 g *(unchanged)* | 90 g *(unchanged)* | 130 g | 12 g | **10 g — new** |
| 221 Moderate | 700 → **640 g** | 120 g *(unchanged)* | 160 g | 18 g | **15 g — new** |
| 222 Balanced | 900 → **700 g** | 150 g *(unchanged)* | 200 g | 25 g | **25 g — new** |

Balanced takes a **deeper** cut than the superseded version (700 g vs 640 g) and still
*gains* protein. The 450 g/serving outlier is gone (350 g/serving now) with nothing traded
for it. Granola stays at its live weights — the earlier raise existed only to backfill kcal
lost with the yogurt, which whey makes unnecessary, and leaving it alone keeps Goodness
Granola (213) untouched as an extra should be. **No new ingredient is created**: 163 already
exists and is already used on 9 rows.

Recomputed per serving (Atwater 4/4/9, granola prorated at its live 500 g yield):

| | kcal | Protein g | Fat % | Carb % | |
|---|---|---|---|---|---|
| 220 Light | 470 | 40.2 | 26.7 | 39.1 | PASS |
| 221 Moderate | 581 | 46.2 | 27.9 | 40.2 | PASS |
| 222 Balanced | 710 | 55.3 | 28.2 | 40.7 | PASS |

Protein rises on every variant; kcal ordering 470 < 581 < 710 holds; all three now sit
*inside* their design bands, which the superseded version missed on Balanced (698).
`recipes.calories` (whole-recipe) becomes **940 / 1162 / 1421**.

**Carb-floor caveat:** whey adds protein with zero carbs, so carb % falls. Light lands at
39.1 % against a 38 % reject — 1.1 pts of headroom, the tightest margin in the family. Do
not trim Light's honey or berries without recomputing.

**Steps** are rewritten with the new grams and gain a new step 1 whisking the whey into the
yogurt before assembly — dry powder tipped onto a finished bowl clumps and the lumps do not
break up. The linked Goodness Granola step and its `alt_instruction` are preserved.

### Family 95 — cut reverted entirely, 2026-08-19

Family 95 (Mixed Berry & Greek Yogurt Smoothie, 217/218/219) was only trimmed because
decisions.md Sec. 5 ended *"and 95 proportionally"* — it was swept along with family 96
rather than assessed on its own. `findings.md` had already **explicitly accepted** its
portions with no change proposed: 235 / 250 / 300 g per serving in a *blended drink*, where
bulk liquid is the format. `findings.md` drew the contrast with family 96 in as many words —
*"the same ingredient at 450 g/serving in a **bowl** is not defensible"* — so the finding was
always about the bowl, never the smoothie.

**Ruling: revert to the live state.** Every statement against 217/218/219 is removed from the
migration — ingredient weights and the `recipes.calories` writes alike. Greek yogurt stays
470 / 500 / 600 g and `calories` stays 915 / 1115 / 1422. Its `recipe_steps` were never
rewritten (all four steps quote ingredients but no gram weights), so there was nothing to
undo there — confirmed against the live rows.

Recomputed on the live composition: **457 / 558 / 711 kcal**, protein **37.3 / 41.2 / 50.6**
g/serving, fat 27.7 / 30.1 / 32.6 %, carbs 39.7 / 40.4 / 38.9 % — all passing, no change
needed. **It still gets its sign-off** (`macros_audited = 1`, already in Phase 10 / Task 32):
passing with no change is an audit result, not the absence of one.

**Family 105 — the pita rework lands at 23.3 % fat**, below the 25 % design floor. Not a
reject (the reject is *above* 35 %), and structural: the linked patty is 3.7 g fat/100 g and
the pita 9.76, so no portion ratio moves the composite. Precedent: `findings.md` accepted
family 9 Light at 23.3 % and family 107 at 21.4 %.
**Ruling: leave it.** Raising fat would mean undoing the lean linked patty that was the
point of the rework. The cheese/pickle remedy stays in the step `tip`, which costs no macros.

## Corrections to `findings.md` found against live data

- Family 96 granola is **90 / 120 / 150 g** live, not the 90 / 110 / 120 g published.
- Family 8's `display_order` was Moderate=1 / Balanced=2 — broken, and **nothing in the
  contract would have caught it**, since Task 10 renumbered family 35 only. Fixed in Task 30.
- Families 5 and 22's published fix tables assume a Worcestershire→soy swap the developer
  rejected, so their figures are void. Recomputed live: family 22 ships 533/580/733,
  family 5 ships 626/746/1003.
- Family 99's Light (229) is not the dry-pan halloumi variant the report describes; 229 and
  230 carry olive oil rows and **231** does not. The live data was followed.
- Pad Thai Light lands at **37.4 g** protein, not the predicted 38.1 g — that figure was
  computed for a soy-doubling fix, and the removed fish sauce carried 1.6 g of whole-recipe
  protein the plan never subtracted. Still clears the floor with 2.4 g of headroom.
