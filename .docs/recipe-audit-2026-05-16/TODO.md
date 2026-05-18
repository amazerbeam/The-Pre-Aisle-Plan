# Recipe Audit — Meal Plan Week 2026-05-18 → 2026-05-24

Created: 2026-05-16
Scope: 16 recipe families (18 recipe rows) appearing in the May 18–24 meal plan.
Output SQL: `./audit-2026-05-16.sql` (in this folder)

## Workflow per family

For each family below, run the full 5-lens audit from the `chef` skill:
1. **Lens 1 — Macros & family structure** (recompute from ingredients + linked recipes; per-variant target bands)
2. **Lens 2 — Units & measurement realism** (no `1 g oregano`, no `12 g garlic`)
3. **Lens 3 — Technique & instructions** (vague endpoints, broken physics, missing chef craft)
4. **Lens 4 — Dish quality** (authenticity, flavour balance, texture, visual)
5. **Lens 5 — Naming, metadata, linked-recipe steps**

Present findings + proposed fixes → wait for user approval → append idempotent SQL to `audit-2026-05-16.sql`.

---

## Status legend

- ⬜ pending
- 🟡 in-review (audit presented, awaiting approval)
- ✅ approved (SQL appended to file)
- ⏭️ skipped (no changes needed)
- ✔️ verified post-run

---

## Tasks

### Pre-flight

- [ ] **#1 Backup** — Railway dashboard → MySQL service → Backups → Create snapshot. Record timestamp here: `__________`

### Tier 1 — Real macro failures (must fix)

- [ ] **#2 Spaghetti Bolognese** (family 23, Light 81)
  - Light: 689 kcal (vs 450–550), fat% 20% (vs 25–35%), carbs% 52% (vs 40–50%) — triple miss
  - Status: ⬜ pending
- [ ] **#3 Chicken & Vegetable Soup** (family 7, Light 23 / Moderate 24)
  - Light: 434 kcal (under 450 floor), carbs 31%
  - Moderate: carbs 29%, fat 36%
  - Status: ⬜ pending
- [ ] **#4 Salmon with Air-Fried Potatoes & Green Beans** (family 42, Light 139)
  - Protein 33 g (under 35 g floor), fat% 40% (over 35%), carbs% 35% (under 40%)
  - Status: ⬜ pending

### Tier 2 — Macro misses

- [ ] **#5 Chicken Tikka Masala** (family 12, Light 40) — 629 kcal sits in Moderate band — ⬜ pending
- [ ] **#6 Hash Browns & Diced Chicken** (family 37, Moderate 125) — fat% 21% — ⬜ pending
- [ ] **#7 Pad Kee Mao / Drunken Noodles** (family 32, Light 108) — fat% 22% — ⬜ pending
- [ ] **#8 Beef & Mushroom Black Bean Stir Fry** (family 31, Light 104) — macros exactly on Light floor, verify stored kcal — ⬜ pending

### Tier 3 — Schema + naming

- [ ] **#9 Pink Sauce Pasta** (family 11, Light 37) — sort_order=1 has linked Fresh Pasta with NULL ingredient_id (missing FR-103 dual-path) — ⬜ pending
- [ ] **#10 Mediterranean White Bean & Chicken Soup** (family 88, Light 189) — soup links Fresh Pasta with no store-bought option — ⬜ pending
- [ ] **#11 Protein Porridge with Berries** (family 86, Light 187) — `recipes.name` ends in " - Diet" — ⬜ pending
- [ ] **#12 Greek Chicken Gyros Bowl** (family 87, Light 188) — `recipes.name` ends in " - Diet" — ⬜ pending
- [ ] **#13 Tuscan Chicken with Rice** (family 90, Light 191) — "High-Protein" prefix + Lens 4 authenticity check — ⬜ pending

### Tier 4 — Passes macros, still full review

- [ ] **#14 Chicken Burrito Bowl** (family 17, Moderate 58) — ⬜ pending
- [ ] **#15 Peanut Butter Banana Overnight Oats** (family 39, Light 130 / Moderate 131) — ⬜ pending
- [ ] **#16 Irish Chicken Curry** (family 3, Light 7) — recently redesigned, verify it held — ⬜ pending
- [ ] **#17 Tamarind Tossed Noodles** (family 40, Moderate 134) — ⬜ pending

### Post-audit

- [ ] **#18 Aggregate SQL** — confirm `audit-2026-05-16.sql` is one ordered, guarded, idempotent file; FK-safe order; header lists every recipe touched + backup timestamp
- [ ] **#19 Verification** — after user runs SQL: family integrity, kcal ladder, linked-recipe step coverage, no duplicate `recipe_ingredients` rows

---

## Audit notes

(Findings + proposed fixes get logged below as each family is worked, so the file is self-contained even if the chat is lost.)

### Family 23 — Spaghetti Bolognese
_pending_

### Family 7 — Chicken & Vegetable Soup
_pending_

### Family 42 — Salmon
_pending_

### Family 12 — Chicken Tikka Masala
_pending_

### Family 37 — Hash Browns & Diced Chicken
_pending_

### Family 32 — Pad Kee Mao
_pending_

### Family 31 — Beef Black Bean Stir Fry
_pending_

### Family 11 — Pink Sauce Pasta
_pending_

### Family 88 — Mediterranean White Bean Soup
_pending_

### Family 86 — Protein Porridge
_pending_

### Family 87 — Greek Chicken Gyros Bowl
_pending_

### Family 90 — Tuscan Chicken with Rice
_pending_

### Family 17 — Chicken Burrito Bowl
_pending_

### Family 39 — PB Banana Overnight Oats
_pending_

### Family 3 — Irish Chicken Curry
_pending_

### Family 40 — Tamarind Tossed Noodles
_pending_
