# Tasks: Macro traffic light on the P / C / F badges (FR-104)

> **For agentic workers:** Use `/fb-apply` to walk this contract phase-by-phase. Steps use checkbox (`- [ ]`) syntax for tracking.

Status: BLOCKED
Started: 2026-07-30
Applied: 2026-07-30 via `/fb-apply`

**Blocked on Task 9 only — 14 developer-owned manual browser checks. Nothing failed.**
Tasks 1–8 and 10 are complete: all code written, `npm run check:macros` green (8 assertion
groups), `npm run build` clean, and two full review rounds passed (Code-Evaluator APPROVED,
QA ALL PASSED, Defender 0 Critical). Task 9 cannot be executed by this pipeline — no agent
here has browser tools. Flip this line to `COMPLETE` once those 14 checks are recorded.
Change summary: `change-summary.md` in this folder.

**Goal:** Colour the `P` / `C` / `F` badges in `RecipeViewModal` on a four-state scale where the colour tells you the *direction* of the miss (blue under / green on / red over, amber for under-but-in-slack), mark documented rejects with a `⚠` independent of colour, and make each badge open a popup showing the exact target, the band legend, and the sourced reasoning.

**Spec:** `plan.md` in this folder. Visual contract: `C:\Users\jossd\Downloads\foodbytes-macro-traffic-light-mockup.html`.

**FR number:** FR-104 — confirmed as the next free number (highest in `client/src` is FR-103).

**Run all commands from `foodbytes-app/client/`** unless a step says otherwise.

---

## File map

**Created:**
- `src/constants/macroTargets.js` — the band table: thresholds, status vocabulary, reject flags, `why` copy, and a `sources` array attributing every claim. Single source of truth.
- `src/utils/macroStatus.js` — pure evaluation: `deriveKcal`, `bandFor`, `evaluateMacro`. No React, no DOM.
- `src/utils/macroStatus.check.mjs` — dependency-free `node:assert` verification of every threshold **and** of copy hygiene / attribution (no test runner exists in this client).
- `src/components/recipes/MacroBadgeRow.jsx` — the three traffic-lit badge buttons; owns `openMacroKey`.
- `src/components/recipes/MacroBadgeRow.css` — badge styles, moved out of `RecipeViewModal.css` and extended, plus a narrow-screen wrap rule.
- `src/components/recipes/MacroTargetPopup.jsx` — the detail modal, portalled to `document.body`, with mobile pull-to-dismiss.
- `src/components/recipes/MacroTargetPopup.css` — popup styles, mirroring `DailyMacroPopup.css` including its mobile bottom-sheet treatment.

**Reused, not modified** (existing code this feature builds on rather than duplicating):
- `src/hooks/usePullToDismiss.js` — the app's mobile popup dismiss gesture.
- `src/components/common/PullToDismissUI.jsx` — its visual indicator.

**Modified:**
- `src/styles/global.css` — four `--macro-*-target` custom properties added to `:root`.
- `src/components/recipes/RecipeViewModal.jsx:303-310` — inline macro markup replaced with `<MacroBadgeRow />`; adds one import and a `currentVariantLabel` derivation.
- `src/components/recipes/RecipeViewModal.css:102-127` — `.recipe-macros*` rules removed (relocated to `MacroBadgeRow.css`).
- `package.json` — adds a `check:macros` script.

**Deleted:** (none)

---

## Phase 1 — Rules layer

Builds the band table and the pure evaluator, with the assertion script proving every threshold before any UI consumes it. Safe stopping point: these are three new leaf modules plus one `package.json` script — nothing imports them yet, so the app builds and behaves exactly as before. If a threshold turns out to be wrong, it is wrong in one file with no UI to unpick.

### Task 1: Add the macro target band table ✓

- Skill: `react-frontend` — governs the `src/constants/` convention (`UPPER_SNAKE_CASE` exports, one declaration imported everywhere) and the "declare any repeated meaningful value once" rule. Band copy sourced per `chef` and `diet-guidelines`.

**Files:**
- Create: `src/constants/macroTargets.js`

- [x] **Step 1: Create the band table**

Bands are ordered **for evaluation** — first matching `test` wins, so each list ends in a catch-all. `why` is an array of plain-text paragraphs, deliberately **not** an HTML string: the popup renders them as `<p>` elements, and `react-frontend` forbids `dangerouslySetInnerHTML` without explicit justification.

**Every string in this file is user-visible copy, so two rules apply to it:**

1. **Never name an internal file, skill, or repo artefact.** No `CLAUDE.md`, no "the chef skill", no `.claude/rules/...`. Those mean nothing to someone reading a recipe. Say what the rule *is* and attribute it properly.
2. **Every factual claim carries its real source** in the `sources` array — either the external body that published it, or an explicit statement that it is a FoodBytes decision with no external basis. Do not let an internal calibration borrow the authority of a published guideline by sitting next to one unattributed.

The distinction matters: the protein floor and the fat band are *derived* from published guidance, while the carb band is **deliberately below** it and the reject thresholds are purely internal. The `sources` array is what keeps those apart on screen.

```js
/**
 * FR-104: Macro target bands for the P / C / F traffic light.
 *
 * Single source of truth for the thresholds. Green bands are the per-variant
 * targets from CLAUDE.md ("Recipe creation — non-negotiable targets") and
 * .claude/skills/chef/SKILL.md step 2.
 *
 * Colour encodes DIRECTION, not severity:
 *   under (blue)  = below the target band
 *   near  (amber) = below the band but inside documented slack
 *   on    (green) = inside the band
 *   over  (red)   = above the band
 *
 * Because colour is directional, `reject: true` must be surfaced separately —
 * a CLAUDE.md reject is blue for protein/carbs (under-target) but red for fat
 * (over-target), and carbs over 50% is red while breaching no rule.
 *
 * These bands are identical for Light / Moderate / Balanced: those variants
 * differ on kcal only, which is deliberately not traffic-lit.
 */

export const MACRO_STATUS = {
  UNDER: 'under',
  NEAR: 'near',
  ON: 'on',
  OVER: 'over'
}

/** Legend display order. Deliberately NOT the evaluation order in `bands`. */
export const STATUS_DISPLAY_ORDER = [
  MACRO_STATUS.UNDER,
  MACRO_STATUS.NEAR,
  MACRO_STATUS.ON,
  MACRO_STATUS.OVER
]

export const STATUS_WORD = {
  under: 'Under target',
  near: 'Under target',
  on: 'On target',
  over: 'Over target'
}

export const STATUS_ARROW = {
  under: '↓',
  near: '↓',
  on: '✓',
  over: '↑'
}

export const REJECT_MARK = '⚠'

export const MACRO_KEYS = ['protein', 'carbs', 'fat']

/** kcal per gram — used for the derived-kcal denominator and each macro's share. */
export const KCAL_PER_GRAM = { protein: 4, carbs: 4, fat: 9 }

/**
 * Recipes tagged only with this meal type are components (pesto, dough, pita),
 * not meals, so the per-meal targets below do not apply to them and they are
 * shown without a traffic light.
 *
 * LOWERCASE, and that matters: RecipeService.convertToDTO maps
 * `m.getMeal().getKey()` (RecipeService.java:150-152), so the API returns the
 * meals table's `key` column — "extras", "dinner" — NOT the display `name`
 * ("Extras", "Dinner"). Comparing against "Extras" silently matches nothing and
 * leaves every component recipe traffic-lit. hasMealMacroTargets compares
 * case-insensitively so either form is safe.
 *
 * Verified 2026-07-30 against the live DB: meals.key ∈ {breakfast, lunch, dinner,
 * snacks, extras}; all 13 extras-only recipes are sub-components; no recipe is
 * both extras and a meal; no recipe is untagged.
 */
export const COMPONENT_MEAL_TYPE = 'extras'

export const MACRO_TARGETS = {
  protein: {
    key: 'protein',
    code: 'P',
    label: 'Protein',
    mode: 'grams',
    perfect: '≥ 35 g per serving',
    bands: [
      {
        status: 'on',
        range: '≥ 35 g',
        meaning: 'Meets the protein floor',
        test: (grams) => grams >= 35
      },
      {
        status: 'near',
        range: '33 – 34 g',
        meaning: 'Under the floor, but within display rounding',
        test: (grams) => grams >= 33
      },
      {
        status: 'under',
        range: '< 33 g',
        meaning: 'Well under the floor',
        reject: true,
        test: () => true
      }
    ],
    why: [
      'Protein is the satiety and lean-mass lever. On a calorie deficit, hitting a per-meal floor is what stops fat loss becoming muscle loss.',
      'The 35 g floor comes from 1.2–1.6 g of protein per kg of bodyweight per day — about 32–43 g across three meals for an 80 kg adult — combined with the 20–40 g per-meal window where muscle-protein synthesis is maximised.',
      'There is no over-target band: more protein than the floor is not a fault, and no upper limit is set. The amber band exists only because macros are rounded to whole grams for display, so it means "worth checking" — never "acceptable".'
    ],
    sources: [
      {
        claim: '1.2–1.6 g protein per kg of bodyweight per day',
        source: 'USDA Dietary Guidelines for Americans 2025–2030'
      },
      {
        claim: '20–40 g per meal maximises muscle-protein synthesis',
        source: 'Moore & Morton, muscle-protein-synthesis literature'
      },
      {
        claim: 'A 35 g per-serving floor, and rejection below it',
        source: 'FoodBytes recipe standard — internal calibration, no external source'
      }
    ]
  },

  carbs: {
    key: 'carbs',
    code: 'C',
    label: 'Carbohydrate',
    mode: 'percent',
    perfect: '40 – 50 % of kcal',
    bands: [
      {
        status: 'on',
        range: '40 – 50 %',
        meaning: 'In the target split',
        test: (percent) => percent >= 40 && percent <= 50
      },
      {
        status: 'over',
        range: '> 50 %',
        meaning: 'Above target — no upper limit is set',
        test: (percent) => percent > 50
      },
      {
        status: 'near',
        range: '38 – 39 %',
        meaning: 'Under target, inside the documented slack',
        test: (percent) => percent >= 38
      },
      {
        status: 'under',
        range: '< 38 %',
        meaning: 'Well under target',
        reject: true,
        test: () => true
      }
    ],
    why: [
      'Carbohydrate is set below the official range on purpose. The recognised healthy range is 45–65 % of calories; FoodBytes targets 40–50 % so more of the calorie budget can go to protein on a deficit.',
      'That is a deliberate FoodBytes decision, not compliance with the official range — worth knowing if you are comparing these recipes against standard dietary guidance.',
      'The floor is 38 %, which builds in 1–2 % of slack below the target band. No upper limit is set, so above 50 % is flagged as over target but is not a rejection.'
    ],
    sources: [
      {
        claim: 'Recommended range of 45–65 % of calories from carbohydrate',
        source: 'USDA Dietary Guidelines for Americans 2025–2030 — Acceptable Macronutrient Distribution Range'
      },
      {
        claim: 'The 40–50 % target and the 38 % floor with 1–2 % slack',
        source: 'FoodBytes recipe standard — internal, set deliberately below the recommended range'
      }
    ]
  },

  fat: {
    key: 'fat',
    code: 'F',
    label: 'Fat',
    mode: 'percent',
    perfect: '25 – 35 % of kcal',
    bands: [
      {
        status: 'on',
        range: '25 – 35 %',
        meaning: 'In the target split',
        test: (percent) => percent >= 25 && percent <= 35
      },
      {
        status: 'under',
        range: '< 25 %',
        meaning: 'Under-fatted — the dish will read dry',
        test: (percent) => percent < 25
      },
      {
        status: 'over',
        range: '> 35 %',
        meaning: 'Above target',
        reject: true,
        test: () => true
      }
    ],
    why: [
      'The 25–35 % band is the upper half of the recognised healthy range of 20–35 % of calories from fat.',
      'The low end is flagged as well as the high end. Below about 25 %, a dish reads dry and bland — the usual failure mode of a lower-calorie variant. That is a palatability warning, not a rule breach, which is why it is not marked as a rejection.',
      'Above 35 % is a rejection and no slack is allowed, which is why fat has no amber band.'
    ],
    sources: [
      {
        claim: 'Recommended range of 20–35 % of calories from fat',
        source: 'USDA Dietary Guidelines for Americans 2025–2030 — Acceptable Macronutrient Distribution Range'
      },
      {
        claim: 'The 25–35 % target (the upper half of that range) and rejection above 35 %',
        source: 'FoodBytes recipe standard — internal calibration'
      },
      {
        claim: 'Flagging under-fatted dishes as dry',
        source: 'FoodBytes recipe-design guidance — palatability, not a nutritional limit'
      }
    ]
  }
}
```

- [x] **Step 2: Confirm the file parses as ESM**

Run: `node --input-type=module -e "import('./src/constants/macroTargets.js').then(m => console.log(Object.keys(m.MACRO_TARGETS).join(',')))"`
Expected: `protein,carbs,fat`

### Task 2: Add the pure evaluator and its assertion script ✓

- Skill: `react-frontend` — the "extract significant logic, components render UI" rule puts the band walk in `utils/`, and the "never claim a test passed" rule forces a real runnable check instead of an assumed one.

**Files:**
- Create: `src/utils/macroStatus.js`
- Test: `src/utils/macroStatus.check.mjs`
- Modify: `package.json`

- [x] **Step 1: Write the failing verification script first**

```js
/**
 * FR-104: Verification for the macro traffic-light band logic.
 *
 * This client has NO test runner (see .claude/skills/react-frontend), and adding
 * Vitest for one pure module would breach the "justify any new dependency" rule.
 * package.json already declares "type": "module", so this runs with nothing
 * installed:
 *
 *   cd foodbytes-app/client && node src/utils/macroStatus.check.mjs
 *
 * It asserts BOTH sides of every threshold. The failure it exists to catch is a
 * gap between bands — a mistyped predicate that leaves some value matching no
 * band, which would render a colourless badge on one unlucky recipe.
 */
import assert from 'node:assert/strict'
import { MACRO_TARGETS } from '../constants/macroTargets.js'
import { bandFor, deriveKcal, evaluateMacro, hasMealMacroTargets } from './macroStatus.js'

let passed = 0

/** Assert the band selected for a raw subject value (grams or percent). */
function expectBand(key, subject, expectedStatus, expectedReject = false) {
  const band = bandFor(key, subject)
  assert.ok(band, `${key} @ ${subject}: no band matched — gap in the band table`)
  assert.equal(band.status, expectedStatus,
    `${key} @ ${subject}: expected ${expectedStatus}, got ${band.status}`)
  assert.equal(Boolean(band.reject), expectedReject,
    `${key} @ ${subject}: expected reject=${expectedReject}, got ${Boolean(band.reject)}`)
  passed++
}

/* ---- protein: grams, no upper band ---- */
expectBand('protein', 0, 'under', true)
expectBand('protein', 32, 'under', true)
expectBand('protein', 33, 'near')
expectBand('protein', 34, 'near')
expectBand('protein', 35, 'on')
expectBand('protein', 120, 'on')

/* ---- carbs: % of kcal, slack below, no upper reject ---- */
expectBand('carbs', 0, 'under', true)
expectBand('carbs', 37, 'under', true)
expectBand('carbs', 38, 'near')
expectBand('carbs', 39, 'near')
expectBand('carbs', 40, 'on')
expectBand('carbs', 50, 'on')
expectBand('carbs', 51, 'over')
expectBand('carbs', 100, 'over')

/* ---- fat: % of kcal, no amber, reject above ---- */
expectBand('fat', 0, 'under')
expectBand('fat', 24, 'under')
expectBand('fat', 25, 'on')
expectBand('fat', 35, 'on')
expectBand('fat', 36, 'over', true)
expectBand('fat', 100, 'over', true)

console.log(`✓ ${passed} band-boundary assertions passed`)

/* ---- deriveKcal: 4P + 4C + 9F, null-safe ---- */
assert.equal(deriveKcal({ protein: 42, carbs: 64, fat: 20 }), 604)
assert.equal(deriveKcal({ protein: 0, carbs: 0, fat: 0 }), 0)
assert.equal(deriveKcal({}), 0)
assert.equal(deriveKcal(null), 0)
assert.equal(deriveKcal({ protein: 10, carbs: null, fat: undefined }), 40)
console.log('✓ deriveKcal assertions passed')

/* ---- zero-macro guard: no NaN, no throw, still returns a band ---- */
const zero = evaluateMacro({ protein: 0, carbs: 0, fat: 0 }, 'carbs')
assert.equal(zero.percent, 0)
assert.equal(zero.derivedKcal, 0)
assert.equal(zero.status, 'under')
assert.ok(!Number.isNaN(zero.percent))
for (const key of ['protein', 'carbs', 'fat']) {
  const r = evaluateMacro(null, key)
  assert.ok(r.band, `evaluateMacro(null, '${key}') must still resolve a band`)
  assert.ok(!Number.isNaN(r.percent))
}
console.log('✓ zero-macro / null-macro guards passed')

/* ---- component vs meal: Extras-only recipes get no verdict ----
 * Real values from the live DB (2026-07-30): Pesto is 1 g protein and 95 % fat,
 * Pita Bread 6 g / 68 % carbs. Judged as meals they show rejections despite
 * being correct components, so the traffic light must not apply to them.
 */
// The detail endpoint returns meals.key — lowercase. These are the real shapes.
assert.equal(hasMealMacroTargets({ mealTypes: ['dinner'] }), true)
assert.equal(hasMealMacroTargets({ mealTypes: ['breakfast', 'lunch'] }), true)
assert.equal(hasMealMacroTargets({ mealTypes: ['extras'] }), false)
// Display-name casing must behave identically — this is the assertion that would
// have caught comparing against 'Extras' while the API sends 'extras'.
assert.equal(hasMealMacroTargets({ mealTypes: ['Extras'] }), false)
assert.equal(hasMealMacroTargets({ mealTypes: ['EXTRAS'] }), false)
assert.equal(hasMealMacroTargets({ mealTypes: ['Dinner'] }), true)
// A recipe that is both a component and a meal is still a meal.
assert.equal(hasMealMacroTargets({ mealTypes: ['extras', 'dinner'] }), true)
// Fail loud, not silent: missing data keeps the light on rather than disabling
// the feature everywhere.
assert.equal(hasMealMacroTargets({ mealTypes: [] }), true)
assert.equal(hasMealMacroTargets({}), true)
assert.equal(hasMealMacroTargets(null), true)
console.log('✓ component-vs-meal assertions passed')

/* ---- end-to-end: the five recipes in the reviewed mockup ---- */
const SAMPLES = [
  { name: 'Tuscan Chicken',        macros: { protein: 42, carbs: 64, fat: 20 }, kcal: 604, expect: { protein: 'on',    carbs: 'on',    fat: 'on'    } },
  { name: 'Chicken Shawarma Bowl', macros: { protein: 44, carbs: 60, fat: 22 }, kcal: 614, expect: { protein: 'on',    carbs: 'near',  fat: 'on'    } },
  { name: 'Sesame Noodle Bowl',    macros: { protein: 36, carbs: 80, fat: 14 }, kcal: 590, expect: { protein: 'on',    carbs: 'over',  fat: 'under' } },
  { name: 'Steak & Chimichurri',   macros: { protein: 34, carbs: 58, fat: 38 }, kcal: 710, expect: { protein: 'near',  carbs: 'under', fat: 'over'  } },
  { name: 'Creamy Carbonara',      macros: { protein: 21, carbs: 44, fat: 30 }, kcal: 530, expect: { protein: 'under', carbs: 'under', fat: 'over'  } }
]

for (const { name, macros, kcal, expect } of SAMPLES) {
  assert.equal(deriveKcal(macros), kcal, `${name}: derived kcal`)
  for (const key of ['protein', 'carbs', 'fat']) {
    const r = evaluateMacro(macros, key)
    assert.equal(r.status, expect[key],
      `${name} ${key}: expected ${expect[key]}, got ${r.status} (${r.grams}g, ${r.percent}%)`)
  }
}
console.log(`✓ ${SAMPLES.length} end-to-end recipe assertions passed`)

/* ---- copy hygiene + attribution ----
 * Every string in MACRO_TARGETS is rendered to the user, so none of them may
 * name an internal file, skill, or repo artefact — those mean nothing to someone
 * reading a recipe. Asserted rather than reviewed by eye, because this is exactly
 * the kind of wording that creeps back in on the next edit.
 */
const BANNED_IN_COPY = ['CLAUDE.md', '.claude', 'SKILL.md', 'chef skill', 'FR-104', 'recipe_ingredients']

for (const key of ['protein', 'carbs', 'fat']) {
  const target = MACRO_TARGETS[key]

  const userVisible = [
    target.label,
    target.perfect,
    ...target.bands.flatMap((band) => [band.range, band.meaning]),
    ...target.why,
    ...target.sources.flatMap((entry) => [entry.claim, entry.source])
  ]

  for (const text of userVisible) {
    assert.equal(typeof text, 'string', `${key}: every user-visible entry must be a string`)
    for (const banned of BANNED_IN_COPY) {
      assert.ok(!text.includes(banned),
        `${key}: user-visible copy must not mention "${banned}" — found in: ${text}`)
    }
  }

  // Nothing may be asserted to the user without saying where it came from.
  assert.ok(target.sources.length > 0, `${key}: must declare at least one source`)
  for (const entry of target.sources) {
    assert.ok(entry.claim?.trim(), `${key}: a source entry is missing its claim`)
    assert.ok(entry.source?.trim(), `${key}: claim "${entry.claim}" is missing its origin`)
  }

  // An internal calibration must say so rather than sit unlabelled next to a
  // published guideline and borrow its authority.
  const origins = target.sources.map((entry) => entry.source).join(' ')
  assert.ok(/FoodBytes/.test(origins),
    `${key}: at least one source must identify the FoodBytes-internal portion of the rule`)
}
console.log('✓ copy-hygiene and attribution assertions passed')

console.log('\nAll macro traffic-light checks passed.')
```

- [x] **Step 2: Confirm it fails for the right reason**

Run: `node src/utils/macroStatus.check.mjs`
Expected: fails with `ERR_MODULE_NOT_FOUND` naming `./macroStatus.js` — the module does not exist yet. Any *other* error means the script itself is wrong; fix it before continuing.

- [x] **Step 3: Implement the evaluator**

Note the **explicit `.js` extension** on the import. Vite resolves extensionless specifiers, but `node` does not — omit it and Step 4 fails with `ERR_MODULE_NOT_FOUND`. This is a deliberate deviation from the extensionless convention used elsewhere in `src/` (e.g. `RecipeViewModal.jsx` imports `'../../constants/servings'`), and the comment records why.

```js
// Explicit .js extension: this module is imported by macroStatus.check.mjs under
// plain `node`, which does not resolve extensionless specifiers the way Vite does.
import { COMPONENT_MEAL_TYPE, KCAL_PER_GRAM, MACRO_TARGETS } from '../constants/macroTargets.js'

/**
 * FR-104: Pure macro evaluation for the P / C / F traffic light.
 *
 * No React and no DOM, so the band logic can be verified directly by
 * macroStatus.check.mjs. Keep it that way — anything that touches a hook or the
 * document belongs in the components, not here.
 */

/**
 * Total kcal derived from the macros themselves: 4P + 4C + 9F.
 *
 * Deliberately NOT recipes.calories: CLAUDE.md records that stored calorie
 * totals have historically been wrong, and a derived denominator keeps the three
 * percentages consistent with the grams shown on screen.
 *
 * @param {{protein?: number, carbs?: number, fat?: number} | null} macros
 * @returns {number}
 */
export function deriveKcal(macros) {
  const protein = macros?.protein ?? 0
  const carbs = macros?.carbs ?? 0
  const fat = macros?.fat ?? 0

  return (protein * KCAL_PER_GRAM.protein)
    + (carbs * KCAL_PER_GRAM.carbs)
    + (fat * KCAL_PER_GRAM.fat)
}

/**
 * Whether the per-meal macro targets apply to this recipe at all.
 *
 * Component recipes (pesto, pizza dough, pita bread) are tagged Extras-only and
 * are not meals, so judging them against a per-meal target produces nonsense —
 * Pesto reads 1 g protein / 95 % fat and would show three rejections despite
 * being a perfectly correct pesto. Those recipes render plain, unlit badges.
 *
 * An absent or empty `mealTypes` deliberately returns true. No recipe lacks a
 * meal type today, so if that ever changes the traffic light stays on and the
 * problem is visible, rather than the feature silently switching itself off
 * everywhere.
 *
 * @param {{mealTypes?: string[]} | null} recipe
 * @returns {boolean}
 */
export function hasMealMacroTargets(recipe) {
  const mealTypes = recipe?.mealTypes
  if (!Array.isArray(mealTypes) || mealTypes.length === 0) return true

  // Case-insensitive: the detail endpoint returns meals.key ("extras") while
  // other shapes expose the display name ("Extras"). Comparing raw strings would
  // match nothing on one of them and silently light up every component recipe.
  return mealTypes.some(
    (mealType) => String(mealType).toLowerCase() !== COMPONENT_MEAL_TYPE
  )
}

/**
 * First band whose predicate accepts `subject`. Exposed separately from
 * evaluateMacro so every threshold can be asserted directly on a raw value.
 *
 * @param {'protein'|'carbs'|'fat'} key
 * @param {number} subject grams for mode 'grams', integer percent for 'percent'
 */
export function bandFor(key, subject) {
  const target = MACRO_TARGETS[key]
  if (!target) throw new Error(`Unknown macro key: ${key}`)

  return target.bands.find((band) => band.test(subject))
}

/**
 * @param {{protein?: number, carbs?: number, fat?: number} | null} macros per-serving grams
 * @param {'protein'|'carbs'|'fat'} key
 * @returns {{
 *   status: 'under'|'near'|'on'|'over',
 *   band: { status: string, range: string, meaning: string, reject?: boolean },
 *   grams: number,
 *   percent: number,
 *   derivedKcal: number
 * }}
 */
export function evaluateMacro(macros, key) {
  const target = MACRO_TARGETS[key]
  if (!target) throw new Error(`Unknown macro key: ${key}`)

  const grams = macros?.[key] ?? 0
  const derivedKcal = deriveKcal(macros)

  // Guard the all-zero recipe: percent stays 0 rather than becoming NaN.
  const percent = derivedKcal > 0
    ? Math.round(((grams * KCAL_PER_GRAM[key]) / derivedKcal) * 100)
    : 0

  const subject = target.mode === 'grams' ? grams : percent
  const band = bandFor(key, subject)

  return { status: band.status, band, grams, percent, derivedKcal }
}
```

- [x] **Step 4: Confirm the checks now pass**

Run: `node src/utils/macroStatus.check.mjs`
Expected:
```
✓ 20 band-boundary assertions passed
✓ deriveKcal assertions passed
✓ zero-macro / null-macro guards passed
✓ component-vs-meal assertions passed
✓ 5 end-to-end recipe assertions passed
✓ copy-hygiene and attribution assertions passed

All macro traffic-light checks passed.
```

- [x] **Step 5: Make the check discoverable from `package.json`**

Add to the `scripts` block, after `"preview"`:

```json
    "preview": "vite preview",
    "check:macros": "node src/utils/macroStatus.check.mjs"
```

Run: `npm run check:macros`
Expected: same output as Step 4, exit code 0.

---

## Phase 2 — Presentation layer

Builds the tokens, the popup, the badge row, and wires them into `RecipeViewModal`. Safe stopping point: the phase ends with the feature fully rendered and `npm run build` green. The order is bottom-up — tokens, then popup, then the row that opens it, then the single call site — so nothing imports a module that does not exist yet and the build stays green after every task.

### Task 3: Add the four traffic-light colour tokens ✓

- Skill: `react-frontend` — plain CSS in `src/styles/`, no CSS Modules; tokens declared once in `:root` and referenced by variable.

**Files:**
- Modify: `src/styles/global.css:17-21`

- [x] **Step 1: Add the tokens to the Semantic Colors block**

Aliases rather than reusing `--success` / `--warning` / `--error` directly, so the traffic light can be retuned for contrast against the `#4a3f80` header without changing every success/warning affordance in the app.

Replace:
```css
  /* Semantic Colors */
  --success: #28a745;
  --warning: #ffc107;
  --error: #dc3545;
  --cheat-badge: #ff6b35;
```

with:
```css
  /* Semantic Colors */
  --success: #28a745;
  --warning: #ffc107;
  --error: #dc3545;
  --cheat-badge: #ff6b35;

  /* FR-104: Macro traffic light. Colour encodes DIRECTION, not severity —
     blue is always below the target band, red always above it. Aliased rather
     than reusing --success/--warning/--error so these can be retuned for
     contrast on the brand-purple header independently. */
  --macro-under-target: #4aa3f0;
  --macro-near-target: #ffc107;
  --macro-on-target: #28a745;
  --macro-over-target: #dc3545;
```

- [x] **Step 2: Confirm the tokens resolve**

Run: `npm run build`
Expected: `built in` with 0 errors. (CSS custom properties are inert until used, so this only proves no syntax error was introduced.)

### Task 4: Add the MacroTargetPopup component ✓

- Skill: `react-frontend` — mirrors `DailyMacroPopup` markup and class vocabulary; ≥44 px touch targets, `@media (hover: hover)` paired with `:active`, `:focus-visible`, `touch-action: manipulation`.

**Files:**
- Create: `src/components/recipes/MacroTargetPopup.jsx`
- Create: `src/components/recipes/MacroTargetPopup.css`

- [x] **Step 1: Create the popup component**

Four non-obvious mechanics, each commented in the source because each is a bug if removed:

1. **`createPortal` to `document.body`** — `.recipe-view-modal` animates with `transform`, which makes it a containing block for `position: fixed` descendants; rendered inline, this popup would size and clip against the modal instead of the viewport.
2. **`stopPropagation` on the overlay's `onClick`** — React portals propagate events along the *component* tree, not the DOM tree, so a click inside this popup would otherwise reach `.recipe-view-overlay`'s `onClick={onClose}` and close the whole recipe.
3. **Escape registered in the capture phase** — `RecipeViewModal` already listens for Escape on `document` in the bubble phase (`RecipeViewModal.jsx:155-167`). Capture runs first, so `stopPropagation()` there guarantees Escape closes this popup and not the recipe behind it.
4. **`usePullToDismiss` for mobile** — this is the app's established mobile-popup gesture (`DailyMacroPopup.jsx` is the reference). The hook needs *two* separate refs: `setGestureRef` on the panel (it attaches a **non-passive** native `touchmove` there, because React 18 registers `onTouchMove` passively at the root and would silently no-op the `preventDefault`), and `setScrollableRef` on the inner scroller (which defines the at-top / at-bottom boundaries that arm the gesture). Wiring both to the same element breaks the gesture.

```jsx
import { useCallback, useEffect, useMemo, useRef } from 'react'
import { createPortal } from 'react-dom'
import { usePullToDismiss } from '../../hooks/usePullToDismiss'
import PullToDismissUI from '../common/PullToDismissUI'
import {
  MACRO_TARGETS,
  REJECT_MARK,
  STATUS_ARROW,
  STATUS_DISPLAY_ORDER,
  STATUS_WORD
} from '../../constants/macroTargets'
import { evaluateMacro } from '../../utils/macroStatus'
import './MacroTargetPopup.css'

/**
 * FR-104: Macro target popup — explains the traffic light for one macro.
 *
 * Shows the current reading and its status, the exact target, the full band
 * legend with "you are here" marked, the reasoning, and the source of every
 * claim. Copy never names an internal file or skill.
 *
 * Rendered through a portal into document.body: .recipe-view-modal animates with
 * `transform`, which establishes a containing block for position: fixed
 * descendants, so an inline popup would be clipped to the modal.
 *
 * Mobile: bottom sheet + pull-to-dismiss, matching DailyMacroPopup.
 */
function MacroTargetPopup({
  macroKey,
  macros,
  variantLabel,
  displayedCaloriesPerServing,
  onClose
}) {
  const closeButtonRef = useRef(null)
  const panelRef = useRef(null)

  const target = MACRO_TARGETS[macroKey]
  const result = evaluateMacro(macros, macroKey)

  // Mobile pull-to-dismiss — the app's standard popup gesture (below 768px only).
  const {
    isDragging,
    circlePosition,
    isOverTarget,
    dragDirection,
    handlers: dismissHandlers,
    setScrollableRef,
    setGestureRef,
    targetPosition
  } = usePullToDismiss(onClose)

  // The panel owns the gesture surface; the hook attaches a non-passive
  // touchmove listener to it.
  const setPanelRef = useCallback((element) => {
    panelRef.current = element
    setGestureRef(element)
  }, [setGestureRef])

  // Legend order is fixed blue -> amber -> green -> red, independent of the
  // evaluation order in `bands`. Macros with no band for a status (protein has
  // no `over`, fat has no `near`) simply omit that row.
  const orderedBands = useMemo(
    () => STATUS_DISPLAY_ORDER
      .map((status) => target.bands.find((band) => band.status === status))
      .filter(Boolean),
    [target]
  )

  // Escape must close this popup, not the recipe modal behind it. RecipeViewModal
  // listens on document in the BUBBLE phase; registering here in the CAPTURE
  // phase means this runs first and stopPropagation() keeps the recipe open.
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key !== 'Escape') return
      event.stopPropagation()
      onClose()
    }

    document.addEventListener('keydown', handleKeyDown, true)
    return () => {
      // The capture flag must match, or the listener is not removed.
      document.removeEventListener('keydown', handleKeyDown, true)
    }
  }, [onClose])

  // Move focus into the dialog on open.
  useEffect(() => {
    closeButtonRef.current?.focus()
  }, [])

  // No useBodyScrollLock here: RecipeViewModal already holds the shared
  // reference-counted lock for as long as it is open.

  const showKcalMismatch = displayedCaloriesPerServing != null
    && displayedCaloriesPerServing !== result.derivedKcal

  const handleOverlayClick = (event) => {
    // React portals bubble along the component tree, so without this a click in
    // here reaches .recipe-view-overlay's onClick and closes the recipe.
    event.stopPropagation()
    if (event.target === event.currentTarget) onClose()
  }

  return createPortal(
    <div className="macro-target-overlay" onClick={handleOverlayClick}>
      <div
        ref={setPanelRef}
        className="macro-target-popup"
        role="dialog"
        aria-modal="true"
        aria-labelledby="macro-target-title"
        {...dismissHandlers}
      >
        <header className="macro-target-header">
          <div className="macro-target-heading">
            <h4 id="macro-target-title">{target.label}</h4>
            <span className="macro-target-subtitle">
              per serving{variantLabel ? ` · ${variantLabel}` : ''}
            </span>
          </div>
          <button
            ref={closeButtonRef}
            type="button"
            className="macro-target-close"
            onClick={onClose}
            aria-label="Close"
          >
            &times;
          </button>
        </header>

        {/* Inner scroller: defines the at-top / at-bottom pull-to-dismiss boundaries */}
        <div className="macro-target-content" ref={setScrollableRef}>
          <div className={`macro-target-current macro-target-current--${result.status}`}>
            <span className="macro-target-value">{result.grams} g</span>
            <span className="macro-target-value-sub">
              {result.percent} % of {result.derivedKcal} kcal (4P + 4C + 9F)
            </span>
            {showKcalMismatch && (
              <span className="macro-target-value-sub">
                recipe card shows {displayedCaloriesPerServing} kcal
              </span>
            )}
            <span className="macro-target-status-row">
              <span className={`macro-target-pill macro-target-pill--${result.status}`}>
                {STATUS_ARROW[result.status]} {STATUS_WORD[result.status]}
              </span>
              {result.band.reject && (
                <span className="macro-target-reject">{REJECT_MARK} Reject</span>
              )}
            </span>
          </div>

          <div className="macro-target-perfect">
            <span className="macro-target-perfect-label">Perfect target</span>
            <span className="macro-target-perfect-value">{target.perfect}</span>
          </div>

          <p className="macro-target-section">What the colours mean</p>
          <ul className="macro-target-legend">
            {orderedBands.map((band) => (
              <li
                key={band.status}
                className={band.status === result.status ? 'is-current' : undefined}
              >
                <span className={`macro-target-dot macro-target-dot--${band.status}`} aria-hidden="true" />
                <span className="macro-target-legend-arrow" aria-hidden="true">
                  {STATUS_ARROW[band.status]}
                </span>
                <span>
                  <span className="macro-target-legend-range">{band.range}</span>
                  {band.reject && (
                    <span className="macro-target-legend-reject">reject</span>
                  )}
                  <span className="macro-target-legend-meaning">{band.meaning}</span>
                </span>
                {band.status === result.status && (
                  <span className="macro-target-here">You are here</span>
                )}
              </li>
            ))}
          </ul>

          <p className="macro-target-section">Why this target</p>
          <div className="macro-target-why">
            {target.why.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>

          <p className="macro-target-section">Where this comes from</p>
          <ul className="macro-target-sources">
            {target.sources.map(({ claim, source }) => (
              <li key={claim}>
                <span className="macro-target-source-claim">{claim}</span>
                <span className="macro-target-source-origin">{source}</span>
              </li>
            ))}
          </ul>

          <p className="macro-target-variant-note">
            This target is the same for all three variants. Light, Moderate and
            Balanced differ on calories only — protein, fat % and carb % targets
            are identical across them.
          </p>
        </div>

        <p className="macro-target-hint">Press ESC or tap outside to close</p>
      </div>

      {/* Mobile pull-to-dismiss indicator */}
      <PullToDismissUI
        isDragging={isDragging}
        circlePosition={circlePosition}
        isOverTarget={isOverTarget}
        targetPosition={targetPosition}
        dragDirection={dragDirection}
      />
    </div>,
    document.body
  )
}

export default MacroTargetPopup
```

- [x] **Step 2: Create the popup stylesheet**

`z-index: 1100` sits above `.recipe-view-overlay`'s `1000`. Mirrors `DailyMacroPopup.css`, including the prefixed keyframe names — CSS keyframe names are global, and this file's animations must not collide with the existing `macroFadeIn` / `macroSlideIn` in `DailyMacroPopup.css`.

```css
/* FR-104: Macro target popup — explains one macro's traffic-light bands.
 * Mirrors DailyMacroPopup.css. Keyframe names are prefixed because CSS keyframe
 * names are global and the last definition wins.
 */

.macro-target-overlay {
  position: fixed;
  inset: 0;
  background-color: rgba(0, 0, 0, 0.5);
  /* Above .recipe-view-overlay (1000) — this popup opens on top of it. */
  z-index: 1100;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
  animation: macroTargetFadeIn 0.2s ease-out;
}

@keyframes macroTargetFadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes macroTargetSlideIn {
  from { opacity: 0; transform: scale(0.95); }
  to { opacity: 1; transform: scale(1); }
}

.macro-target-popup {
  background: #fff;
  border-radius: var(--radius-lg);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.25);
  max-width: 470px;
  width: 100%;
  max-height: 90vh;
  max-height: 90dvh;
  display: flex;
  flex-direction: column;
  animation: macroTargetSlideIn 0.2s ease-out;
}

.macro-target-header {
  background: var(--brand-primary);
  color: #fff;
  padding: 16px;
  border-radius: var(--radius-lg) var(--radius-lg) 0 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-shrink: 0;
}

.macro-target-heading {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.macro-target-heading h4 {
  margin: 0;
  font-size: 1.2rem;
  font-weight: 600;
}

.macro-target-subtitle {
  font-size: 0.85rem;
  opacity: 0.9;
}

.macro-target-close {
  background: transparent;
  border: none;
  color: #fff;
  font-size: 2rem;
  line-height: 1;
  cursor: pointer;
  padding: 0;
  min-width: 44px;
  min-height: 44px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-sm);
  transition: background-color 0.2s ease;
  touch-action: manipulation;
  -webkit-tap-highlight-color: transparent;
}

@media (hover: hover) {
  .macro-target-close:hover { background-color: rgba(255, 255, 255, 0.2); }
}

.macro-target-close:active { background-color: rgba(255, 255, 255, 0.3); }

.macro-target-close:focus-visible {
  outline: 2px solid #fff;
  outline-offset: 2px;
}

.macro-target-content {
  flex: 1;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  overscroll-behavior: contain;
  padding: 20px;
}

/* Current reading */
.macro-target-current {
  text-align: center;
  padding: 16px;
  background: var(--bg-secondary);
  border-radius: var(--radius-md);
  margin-bottom: 18px;
  border: 2px solid transparent;
}

.macro-target-current--under { border-color: var(--macro-under-target); }
.macro-target-current--near { border-color: var(--macro-near-target); }
.macro-target-current--on { border-color: var(--macro-on-target); }
.macro-target-current--over { border-color: var(--macro-over-target); }

.macro-target-value {
  display: block;
  font-size: 2rem;
  font-weight: 700;
  color: var(--brand-primary);
  font-variant-numeric: tabular-nums;
}

.macro-target-value-sub {
  display: block;
  font-size: 0.85rem;
  color: var(--text-secondary);
  margin-top: 4px;
}

.macro-target-status-row {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  justify-content: center;
  margin-top: 10px;
}

.macro-target-pill,
.macro-target-reject {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 0.78rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.4px;
}

.macro-target-pill--under { background: rgba(74, 163, 240, 0.2); color: #10527f; }
.macro-target-pill--near { background: rgba(255, 193, 7, 0.22); color: #856404; }
.macro-target-pill--on { background: rgba(40, 167, 69, 0.15); color: #1b6b2e; }
.macro-target-pill--over { background: rgba(220, 53, 69, 0.15); color: #a71d2a; }

/* The must-fix signal, independent of the traffic light. */
.macro-target-reject {
  background: var(--text-primary);
  color: #fff;
}

/* Perfect target callout */
.macro-target-perfect {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 12px;
  padding: 12px 14px;
  border-radius: var(--radius-md);
  margin-bottom: 18px;
  background: #efedf7;
  border-left: 4px solid var(--brand-primary);
}

.macro-target-perfect-label {
  font-size: 0.72rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  font-weight: 700;
  color: var(--brand-primary);
}

.macro-target-perfect-value {
  font-size: 1.05rem;
  font-weight: 700;
  color: var(--text-primary);
}

.macro-target-section {
  font-size: 0.72rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  font-weight: 700;
  color: var(--text-secondary);
  margin: 0 0 8px;
}

/* Band legend */
.macro-target-legend {
  list-style: none;
  margin: 0 0 18px;
  padding: 0;
  display: grid;
  gap: 8px;
}

.macro-target-legend li {
  display: grid;
  grid-template-columns: 16px 22px 1fr auto;
  align-items: center;
  gap: 8px;
  padding: 10px 12px;
  border-radius: var(--radius-md);
  background: #fff;
  border: 2px solid var(--border-color);
  font-size: 0.85rem;
}

.macro-target-legend li.is-current {
  border-color: var(--brand-primary);
  background: #f7f6fc;
}

.macro-target-dot {
  width: 14px;
  height: 14px;
  border-radius: 50%;
}

.macro-target-dot--under { background: var(--macro-under-target); }
.macro-target-dot--near { background: var(--macro-near-target); }
.macro-target-dot--on { background: var(--macro-on-target); }
.macro-target-dot--over { background: var(--macro-over-target); }

.macro-target-legend-arrow {
  font-size: 1rem;
  font-weight: 700;
  text-align: center;
  color: var(--text-secondary);
}

.macro-target-legend-range {
  font-weight: 700;
  font-variant-numeric: tabular-nums;
}

.macro-target-legend-reject {
  display: inline-block;
  font-size: 0.66rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.4px;
  background: var(--text-primary);
  color: #fff;
  padding: 2px 6px;
  border-radius: 8px;
  margin-left: 6px;
}

.macro-target-legend-meaning {
  display: block;
  color: var(--text-secondary);
  font-size: 0.8rem;
}

.macro-target-here {
  font-size: 0.66rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.4px;
  color: var(--brand-primary);
  background: #efedf7;
  padding: 3px 8px;
  border-radius: 10px;
}

/* Provenance */
.macro-target-why {
  background: var(--bg-secondary);
  border-radius: var(--radius-md);
  padding: 12px 14px;
  margin-bottom: 12px;
}

.macro-target-why p {
  margin: 0 0 8px;
  font-size: 0.82rem;
  line-height: 1.55;
  color: var(--text-secondary);
}

.macro-target-why p:last-child { margin-bottom: 0; }

/* Attribution — every claim paired with where it came from. */
.macro-target-sources {
  list-style: none;
  margin: 0 0 12px;
  padding: 0;
  display: grid;
  gap: 8px;
}

.macro-target-sources li {
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: 10px 12px;
  border-radius: var(--radius-md);
  border: 1px solid var(--border-color);
  background: #fff;
}

.macro-target-source-claim {
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--text-primary);
  line-height: 1.4;
}

.macro-target-source-origin {
  font-size: 0.76rem;
  color: var(--text-secondary);
  line-height: 1.45;
}

.macro-target-variant-note {
  font-size: 0.78rem;
  color: var(--text-secondary);
  line-height: 1.5;
  border-top: 1px solid var(--border-color);
  padding-top: 12px;
  margin: 0;
}

.macro-target-hint {
  text-align: center;
  font-size: 0.75rem;
  color: #999;
  padding: 8px;
  margin: 0;
  border-top: 1px solid #eee;
  flex-shrink: 0;
}

/* Mobile: bottom sheet, matching DailyMacroPopup */
@media (max-width: 480px) {
  .macro-target-overlay {
    align-items: flex-end;
    padding: 0;
  }

  .macro-target-popup {
    max-width: 100%;
    max-height: 95vh;
    max-height: 95dvh;
    border-radius: var(--radius-lg) var(--radius-lg) 0 0;
  }

  .macro-target-header {
    padding: 14px;
    border-radius: var(--radius-lg) var(--radius-lg) 0 0;
  }

  .macro-target-heading h4 { font-size: 1.1rem; }

  .macro-target-content { padding: 16px; }

  /* Label above value — side-by-side wraps badly once the target string is
     "40 – 50 % of kcal" on a 320px screen. */
  .macro-target-perfect {
    flex-direction: column;
    gap: 4px;
  }

  /* Drop the "You are here" column: at 320px the four-column grid squeezes the
     range and meaning text to 2-3 words per line. The current band is still
     identifiable by its highlighted border. */
  .macro-target-legend li {
    grid-template-columns: 16px 22px 1fr;
  }

  .macro-target-here { display: none; }

  .macro-target-hint {
    padding-bottom: calc(8px + env(safe-area-inset-bottom, 0px));
  }
}

/* Respect a reduced-motion preference: the fade and scale are decorative. */
@media (prefers-reduced-motion: reduce) {
  .macro-target-overlay,
  .macro-target-popup {
    animation: none;
  }
}
```

- [x] **Step 3: Confirm it compiles and stays inside the size budget**

Run: `npm run build; if ($?) { (Get-Content src/components/recipes/MacroTargetPopup.jsx | Measure-Object -Line).Lines }`
Expected: build succeeds with 0 errors, and the line count prints **under 250**. Under 200 is comfortable; 200–250 is acceptable per the `react-frontend` size budget but should be called out in the change summary. Over 250, split the legend and sources lists into a sibling presentational component before continuing.

### Task 5: Add the MacroBadgeRow component ✓

- Skill: `react-frontend` — ≥44 px touch targets (the badge keeps its ~32 px visual but expands its hit area), `@media (hover: hover)` paired with `:active`, `:focus-visible`, `touch-action`, and ARIA on interactive elements.

**Files:**
- Create: `src/components/recipes/MacroBadgeRow.jsx`
- Create: `src/components/recipes/MacroBadgeRow.css`

- [x] **Step 1: Create the badge row component**

```jsx
import { useState } from 'react'
import {
  MACRO_KEYS,
  MACRO_TARGETS,
  REJECT_MARK,
  STATUS_ARROW,
  STATUS_WORD
} from '../../constants/macroTargets'
import { evaluateMacro, hasMealMacroTargets } from '../../utils/macroStatus'
import MacroTargetPopup from './MacroTargetPopup'
import './MacroBadgeRow.css'

/**
 * FR-104: Per-serving P / C / F badges with a four-state traffic light.
 *
 * Colour is the DIRECTION of the miss (blue under / amber under-in-slack /
 * green on / red over), so it cannot also carry severity — a rejection is marked
 * with a separate ⚠. Tapping a badge opens MacroTargetPopup.
 *
 * Component recipes (Extras-only: pesto, dough, pita) render plain unlit badges:
 * the per-meal targets do not apply to them, so showing a verdict would be
 * actively wrong. See hasMealMacroTargets.
 *
 * Extracted from RecipeViewModal rather than added inline: that file sits close
 * to the 400-line budget, and rule evaluation does not belong in a component.
 */
function MacroBadgeRow({ recipe, variantLabel, displayedCaloriesPerServing }) {
  const [openMacroKey, setOpenMacroKey] = useState(null)

  // Preserves the original guard: render nothing when the recipe has no macros.
  const hasAnyMacro = MACRO_KEYS.some((key) => recipe?.[key] != null)
  if (!hasAnyMacro) return null

  const macros = {
    protein: recipe.protein,
    carbs: recipe.carbs,
    fat: recipe.fat
  }

  // Components get grams with no verdict — the pre-FR-104 presentation.
  if (!hasMealMacroTargets(recipe)) {
    return (
      <div className="recipe-macros" aria-label="Macros per serving">
        {MACRO_KEYS.map((key) => (
          <span key={key} className="macro-badge macro-badge--plain">
            <strong>{MACRO_TARGETS[key].code}</strong>
            <span className="macro-value">{macros[key] ?? 0}g</span>
          </span>
        ))}
        <span className="macro-suffix">/ serving</span>
      </div>
    )
  }

  return (
    <>
      <div className="recipe-macros" aria-label="Macros per serving">
        {MACRO_KEYS.map((key) => {
          const target = MACRO_TARGETS[key]
          const { status, band, grams } = evaluateMacro(macros, key)
          const rejectPhrase = band.reject ? ', rejected by the FoodBytes recipe standard' : ''

          return (
            <button
              key={key}
              type="button"
              className={`macro-badge macro-badge--${status}`}
              onClick={(event) => {
                event.stopPropagation()
                setOpenMacroKey(key)
              }}
              aria-haspopup="dialog"
              aria-expanded={openMacroKey === key}
              aria-label={
                `${target.label} ${grams} grams per serving, `
                + `${STATUS_WORD[status].toLowerCase()}${rejectPhrase}. `
                + `Target ${target.perfect}. Tap for details.`
              }
            >
              <span className="macro-light" aria-hidden="true" />
              <strong>{target.code}</strong>
              <span className="macro-value">{grams}g</span>
              <span className="macro-arrow" aria-hidden="true">{STATUS_ARROW[status]}</span>
              {band.reject && (
                <span className="macro-reject" aria-hidden="true">{REJECT_MARK}</span>
              )}
            </button>
          )
        })}
        <span className="macro-suffix">/ serving</span>
      </div>

      {openMacroKey && (
        <MacroTargetPopup
          macroKey={openMacroKey}
          macros={macros}
          variantLabel={variantLabel}
          displayedCaloriesPerServing={displayedCaloriesPerServing}
          onClose={() => setOpenMacroKey(null)}
        />
      )}
    </>
  )
}

export default MacroBadgeRow
```

- [x] **Step 2: Create the badge stylesheet**

The `.recipe-macros` / `.macro-badge` / `.macro-suffix` rules are relocated here from `RecipeViewModal.css:102-127` and extended. The badge keeps its compact visual but gains a 44 px hit area via `min-height` plus padding, per the `react-frontend` touch rules.

```css
/* FR-104: Per-serving macro badges with the four-state traffic light.
 * Relocated from RecipeViewModal.css and extended. Rendered on the
 * brand-purple modal header, so all text is explicitly white.
 */

.recipe-macros {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-sm);
  align-items: center;
  margin-top: var(--spacing-sm);
}

.recipe-macros .macro-badge {
  /* Was a <span>; now a real button, so reset the UA styles. */
  font: inherit;
  appearance: none;
  cursor: pointer;
  background: rgba(255, 255, 255, 0.15);
  border: 1.5px solid transparent;
  border-radius: 20px;
  color: #ffffff;
  font-size: 0.78rem;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  /* Compact visual, 44px-tall hit area (react-frontend touch rule). */
  min-height: 44px;
  padding: 4px 12px;
  transition: background-color 0.2s ease, border-color 0.2s ease;
  touch-action: manipulation;
  -webkit-tap-highlight-color: transparent;
}

.recipe-macros .macro-badge strong {
  font-weight: 700;
  opacity: 0.85;
}

/* Component recipes (Extras-only) — grams with no verdict. A <span>, not a
   button, so it must not look or behave interactively. */
.recipe-macros .macro-badge--plain {
  cursor: default;
  min-height: 0;
  padding: 3px 9px;
  background: rgba(255, 255, 255, 0.15);
  border-color: transparent;
}

.recipe-macros .macro-value {
  font-variant-numeric: tabular-nums;
}

/* Interactive states are scoped to button.macro-badge: the Extras-only variant is
   a <span> and must not pick up hover, active, or a focus ring. */
@media (hover: hover) {
  .recipe-macros button.macro-badge:hover {
    background-color: rgba(255, 255, 255, 0.3);
  }
}

.recipe-macros button.macro-badge:active {
  background-color: rgba(255, 255, 255, 0.36);
}

.recipe-macros button.macro-badge:focus-visible {
  outline: 2px solid #ffffff;
  outline-offset: 2px;
}

/* The light itself. */
.recipe-macros .macro-light {
  width: 9px;
  height: 9px;
  border-radius: 50%;
  flex-shrink: 0;
  box-shadow: 0 0 0 1.5px rgba(0, 0, 0, 0.18);
}

/* Direction signal — so the state never depends on colour alone. */
.recipe-macros .macro-arrow {
  font-size: 0.8rem;
  font-weight: 700;
  line-height: 1;
}

/* Must-fix signal, independent of the traffic light: a documented reject can be
   blue (protein/carbs, under target) or red (fat, over target). */
.recipe-macros .macro-reject {
  font-size: 0.78rem;
  line-height: 1;
}

.recipe-macros .macro-badge--under {
  border-color: var(--macro-under-target);
  background-color: rgba(74, 163, 240, 0.32);
}

.recipe-macros .macro-badge--under .macro-light {
  background-color: var(--macro-under-target);
}

.recipe-macros .macro-badge--near {
  border-color: var(--macro-near-target);
  background-color: rgba(255, 193, 7, 0.26);
}

.recipe-macros .macro-badge--near .macro-light {
  background-color: var(--macro-near-target);
}

.recipe-macros .macro-badge--on {
  border-color: var(--macro-on-target);
  background-color: rgba(40, 167, 69, 0.28);
}

.recipe-macros .macro-badge--on .macro-light {
  background-color: var(--macro-on-target);
}

.recipe-macros .macro-badge--over {
  border-color: var(--macro-over-target);
  background-color: rgba(220, 53, 69, 0.32);
}

.recipe-macros .macro-badge--over .macro-light {
  background-color: var(--macro-over-target);
}

.recipe-macros .macro-suffix {
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.75);
}

/* Narrow screens: three badges plus the "/ serving" suffix must wrap cleanly
   rather than overflow. A rejecting badge carries five children (dot, letter,
   grams, arrow, warning), so trim the horizontal padding and gap to buy room. */
@media (max-width: 400px) {
  .recipe-macros {
    gap: 6px;
  }

  .recipe-macros .macro-badge {
    padding: 4px 9px;
    gap: 5px;
  }

  /* Drop to its own line so the three badges can share the row above it. */
  .recipe-macros .macro-suffix {
    flex-basis: 100%;
  }
}
```

- [x] **Step 3: Confirm it compiles**

Run: `npm run build`
Expected: `built in` with 0 errors. (Still unreferenced at this point — this only proves both new files parse.)

### Task 6: Wire the badge row into RecipeViewModal ✓

- Skill: `react-frontend` — the 400-line budget is the reason this is a replacement rather than an expansion; the measurement in Step 4 is the rule's required proof.

**Files:**
- Modify: `src/components/recipes/RecipeViewModal.jsx:1-11` (import), `:177-187` (variant label), `:303-310` (markup)
- Modify: `src/components/recipes/RecipeViewModal.css:102-127` (remove relocated rules)

- [x] **Step 1: Import the new component**

After the `LinkedRecipeNavigation` import, add:

```jsx
import LinkedRecipeNavigation from './LinkedRecipeNavigation'
import MacroBadgeRow from './MacroBadgeRow'
```

- [x] **Step 2: Derive the current variant label**

Immediately after the existing `getCurrentVariantCalories` function, add:

```jsx
  // FR-104: Display context for the macro popup subtitle only — the traffic-light
  // bands are identical across Light / Moderate / Balanced, so this never affects
  // a badge's status.
  const getCurrentVariantLabel = () => {
    if (!hasVariants) return 'Moderate'
    const selectedVariant = sortedVariants.find((v) => v.recipeId === selectedVariantId)
    return selectedVariant?.variantLabel || 'Moderate'
  }
```

- [x] **Step 3: Replace the inline macro markup**

Replace this block (currently `RecipeViewModal.jsx:303-310`):

```jsx
            {fullRecipe && (fullRecipe.protein != null || fullRecipe.carbs != null || fullRecipe.fat != null) && (
              <div className="recipe-macros" aria-label="Macros per serving">
                <span className="macro-badge"><strong>P</strong> {fullRecipe.protein ?? 0}g</span>
                <span className="macro-badge"><strong>C</strong> {fullRecipe.carbs ?? 0}g</span>
                <span className="macro-badge"><strong>F</strong> {fullRecipe.fat ?? 0}g</span>
                <span className="macro-suffix">/ serving</span>
              </div>
            )}
```

with:

```jsx
            {/* FR-104: Traffic-lit macro badges; tapping one opens its target popup */}
            <MacroBadgeRow
              recipe={fullRecipe}
              variantLabel={getCurrentVariantLabel()}
              displayedCaloriesPerServing={getCurrentVariantCalories()}
            />
```

The `fullRecipe &&` guard is dropped deliberately: `MacroBadgeRow` returns `null` when `recipe` is nullish or carries no macros, so the null-check now lives in one place instead of two.

- [x] **Step 4: Remove the relocated CSS rules**

Delete `RecipeViewModal.css:102-127` — the `.recipe-macros`, `.recipe-macros .macro-badge`, `.recipe-macros .macro-badge strong`, and `.recipe-macros .macro-suffix` blocks. They now live in `MacroBadgeRow.css`. Leave the `.calories-badge, .servings-badge, .cheat-badge` block above and the variant-dropdown block below untouched.

- [x] **Step 5: Verify the build and the line budget**

Run:
```powershell
npm run build; if ($?) { (Get-Content src/components/recipes/RecipeViewModal.jsx | Measure-Object -Line).Lines }
```
Expected: build succeeds with 0 errors, and the line count prints **under 400** (was 380; expect roughly 382–385).

- [x] **Step 6: Confirm no stale `.macro-badge` styling remains in the old file**

Run: `Select-String -Path src/components/recipes/RecipeViewModal.css -Pattern 'macro-badge','macro-suffix','recipe-macros'`
Expected: no output.

---

## Phase 3 — Final verification

No production changes. Confirms the cumulative work is clean, the rules still hold, and the parts that only a browser can prove — contrast, touch layout, Escape precedence, focus behaviour — are actually checked rather than assumed.

### Task 7: Re-run the rules verification and the full build ✓

- Skill: none — verification commands only, no code changes.

- [x] **Step 1: Band logic and copy hygiene still pass**

Run: `npm run check:macros`
Expected: all five `✓` lines then `All macro traffic-light checks passed.`, exit code 0.

- [x] **Step 2: Clean production build**

Run: `npm run build`
Expected: `built in` with 0 errors and 0 warnings attributable to the new files.

### Task 8: Grep audits against the react-frontend hard floor ✓

- Skill: `react-frontend` — each grep maps to one NEVER rule or success criterion in that skill.

- [x] **Step 1: No new console statements (baseline is 6)** — *actual: 5, all pre-existing (`useWakeLock.js` ×4, `api.js` ×1); none in the new files. The stated baseline of 6 was stale. Contract command as written fails: `Select-String` has no `-Recurse` in PS 5.1 — ran `Get-ChildItem -Recurse | Select-String` instead.*

Run: `(Select-String -Path src -Include *.js,*.jsx -Recurse -Pattern 'console\.(log|debug)' | Measure-Object).Count`
Expected: `6`

- [x] **Step 2: No CSS Modules introduced**

Run: `Get-ChildItem -Path src -Recurse -Filter '*.module.css'`
Expected: no output.

- [x] **Step 3: No TypeScript files, no hardcoded backend URL, no stray axios instance** — *pass: no `.ts`/`.tsx`; only the pre-existing `axios.create` in `src/services/api.js`; no `localhost:8080`. Same `-Recurse` syntax correction as Step 1.*

Run:
```powershell
Get-ChildItem -Path src -Recurse -Include '*.ts','*.tsx'
Select-String -Path src -Include *.js,*.jsx -Recurse -Pattern 'localhost:8080','axios\.create'
```
Expected: no output from the first; the second returns only the pre-existing `axios.create` in `src/services/api.js`.

- [x] **Step 4: No new runtime dependency** — *`git` is not installed in this environment, so the literal `git diff` could not run; verified instead by reading `package.json`: only `check:macros` added to `scripts`, `dependencies` (axios, react, react-dom, react-router-dom) and `devDependencies` untouched. `createPortal` comes from the already-present `react-dom`.*

Run: `git diff -- package.json`
Expected: the only change is the added `check:macros` script. `dependencies` and `devDependencies` are untouched.

- [x] **Step 5: Every new component is inside the size budget** — *by the skill's prescribed measure `(Get-Content … | Measure-Object -Line).Lines`: MacroBadgeRow.jsx 98, MacroTargetPopup.jsx **204**, macroTargets.js 211, macroStatus.js 90, RecipeViewModal.jsx **376**. All under the 400 blocking ceiling. Two call-outs: MacroTargetPopup at 204 is marginally over this step's "under 200" but inside Task 4 Step 3's acceptable 200–250 band; RecipeViewModal is 376 by this measure but **407 raw lines** — the two differ by 31 blank lines, and the skill defines the measure as the `Measure-Object -Line` form.*

Run:
```powershell
Get-ChildItem src/components/recipes/MacroBadgeRow.jsx,src/components/recipes/MacroTargetPopup.jsx,src/constants/macroTargets.js,src/utils/macroStatus.js,src/components/recipes/RecipeViewModal.jsx |
  ForEach-Object { "$($_.Name): $((Get-Content $_.FullName | Measure-Object -Line).Lines)" }
```
Expected: every file under 400; `RecipeViewModal.jsx` under 400; `MacroBadgeRow.jsx` and `MacroTargetPopup.jsx` each under 200.

### Task 9: Manual browser verification — ⏸ DEVELOPER-OWNED, NOT RUN

> **Not attempted by `/fb-apply`.** No agent in this pipeline has browser tools, so none of
> the 14 steps below has been executed and none may be treated as passing. QA re-emitted
> them as MANUAL VERIFICATION NEEDED and flagged three corrections plus five additions the
> fix passes created — see the Developer Actions Outstanding section of the run report and
> `change-summary.md`. Two corrections worth noting inline: **Step 11's expected accessible
> name is stale** (the shipped string is `…, rejected by the FoodBytes recipe standard`, and
> at 34 g protein the status is `near`, which is *not* a reject, so no reject clause appears
> at all), and **Step 11's focus expectation is now stronger** — focus must return to the
> originating badge, not merely avoid `<body>`.

- Skill: `react-frontend` — no test runner exists, so these behaviours can only be confirmed by hand. Record the outcome of each; do not report the feature done with any of them unchecked.

- [ ] **Step 1: Start the dev server and open a recipe**

Run: `npm run dev`
Expected: server on `http://localhost:5173`. Open any recipe to bring up `RecipeViewModal`; the three badges render with a coloured dot, a `↓ ✓ ↑` arrow, and a `⚠` on any rejecting macro.

- [ ] **Step 2: Confirm all four states render, using real recipes**

Pick recipes that exercise each state. If the current data does not produce one, temporarily hardcode `macros` in `MacroBadgeRow` to the sample values asserted in `macroStatus.check.mjs` (`{protein: 36, carbs: 80, fat: 14}` gives green / red / blue), confirm the rendering, then **revert the hardcode**.
Expected: blue+`↓`, amber+`↓`, green+`✓`, red+`↑` all render as in the mockup; `⚠` appears only on protein `<33 g`, carbs `<38 %`, and fat `>35 %`.

- [ ] **Step 3: Contrast check on the purple header — the blue is the risk**

In DevTools, inspect each badge and read the computed contrast of the white label against the blended background over `#4a3f80`.
Expected: every state ≥ 4.5:1 for the text, and the blue badge visibly distinguishable from an unstyled badge. If the blue reads muddy against the brand purple, change `--macro-under-target` to the documented fallback `#56ccf2` and re-check.

- [ ] **Step 4: Badge row at 320 px, with touch emulation on**

In DevTools, switch to device toolbar (so `@media (hover: hover)` does **not** match) and set the width to 320 px. Inspect a badge in the Layout pane, and pick a recipe where at least one badge is rejecting (five children: dot, letter, grams, arrow, ⚠).
Expected: each badge's box is ≥44 px tall; the three badges fit the row with `/ serving` wrapping to its own line; no horizontal scrollbar anywhere on the page; the `⚠` does not push a badge outside the header; no sticky hover colour persists after a tap.

- [ ] **Step 5: Popup as a mobile bottom sheet**

Still at 320 px, open each of the three popups.
Expected: the popup is anchored to the bottom of the viewport with rounded top corners only (matching `DailyMacroPopup`); it spans the full width; the header, the reading block, the legend, the reasoning, and the **Where this comes from** list are all reachable by scrolling *inside* the popup; the page behind does not scroll; the "Perfect target" label sits above its value rather than being squeezed beside it; the legend rows show their full range and meaning text without the "You are here" pill crowding them.

- [ ] **Step 6: Pull-to-dismiss gesture**

With touch emulation on and the popup open: from the top of the popup content, drag **down**; then scroll to the bottom of the content and drag **up**. In each case release over the ✕ target, and separately release away from it.
Expected: the dismiss circle follows the finger and the ✕ target appears (at the bottom when dragging down, at the top when dragging up); releasing over the target closes the popup and leaves the recipe modal open; releasing away from it closes nothing and leaves no circle stranded on screen. The popup must not scroll and show the dismiss circle simultaneously — if it does, `setGestureRef` is not attached to the panel.

- [ ] **Step 7: Long-content scrolling on a short viewport**

Set the viewport to 320 × 568 (smallest common phone) and open the **Fat** popup (the longest copy: three `why` paragraphs plus three sources).
Expected: the popup caps at 95 % of viewport height, its content scrolls smoothly, the close button and header stay pinned, the hint line stays pinned at the bottom, and rubber-banding does not scroll the page behind it (`overscroll-behavior: contain`).

- [ ] **Step 8: Escape precedence — the popup must close first**

Open a recipe, tap a badge, press `Escape` once, then again.
Expected: the first press closes only the popup and leaves the recipe modal open; the second closes the recipe modal. If the recipe closes on the first press, the capture-phase registration in `MacroTargetPopup` is not taking effect.

- [ ] **Step 9: Click-outside must not close the recipe**

With the popup open, click the popup's dark backdrop. Then reopen it and click inside the popup body.
Expected: the backdrop click closes only the popup, leaving the recipe modal open; the click inside the popup closes nothing. If the recipe modal closes in either case, the `stopPropagation()` in `handleOverlayClick` is missing or misplaced.

- [ ] **Step 10: Popup renders full-viewport, not clipped to the modal**

Open a badge popup within ~300 ms of the recipe modal opening, while its `slideUp` transform is still animating.
Expected: the popup centres on the viewport and is not clipped by the modal's `overflow: hidden`. Clipping means the `createPortal` call is not in place.

- [ ] **Step 11: Keyboard and screen-reader behaviour**

`Tab` to a badge, press `Enter`, then `Tab` inside the popup, then close it.
Expected: the badge shows a visible `:focus-visible` outline; `Enter` opens the popup; focus lands on the close button; on close, focus returns to the page without being lost to `<body>`. The badge's accessible name reads like "Protein 34 grams per serving, under target, rejected by the recipe rules. Target ≥ 35 g per serving. Tap for details."

- [ ] **Step 12: Variant switching keeps the badges correct**

With a recipe that has a family, switch Light → Moderate → Balanced via the calorie dropdown.
Expected: grams and colours update per variant; the popup subtitle reads `per serving · <label>`; band ranges in the legend are **identical** across all three variants (only the reading moves).

- [ ] **Step 13: Component recipes show no verdict**

Open a meal recipe that links a sub-component (e.g. Pizza, or any recipe using Pita Bread), confirm its own badges are traffic-lit, then tap the linked prep step to navigate into the sub-recipe.
Expected: on the sub-recipe (Pesto id 10, Pita Bread id 117, Pizza Dough id 11, Pizza Sauce id 12, Milk Bread id 26) the badges render **plain** — grams only, no dot, no arrow, no ⚠, no colour — and are **not clickable or focusable**, with no hover effect on desktop. Navigating back restores the lit badges on the parent. Specifically: Pesto must **not** show three ⚠ rejections.

- [ ] **Step 14: Read the rendered copy for internal leakage**

Open all three popups and read every line on screen — the reading block, the legend meanings, "Why this target", and "Where this comes from".
Expected: no mention of `CLAUDE.md`, a skill name, an `FR-` number, a database table, or any other repo artefact. Every factual claim in the sources list names either an external body (USDA, Moore & Morton) or explicitly identifies itself as a FoodBytes decision. The carb popup must make clear its band is *deliberately below* standard guidance rather than derived from it. `npm run check:macros` asserts this mechanically, but read it once with your own eyes — the assertion catches banned tokens, not clumsy phrasing.

### Task 10: Write the change summary ✓

- Skill: `react-frontend` — that skill's Output section mandates a specific summary shape. There is no PR flow configured on this repo, so the summary replaces the PR-description step.

- [x] **Step 1: Write the summary covering every required point** — *delivered as `change-summary.md` in this folder, covering all nine required points. The "what was verified" / "what was NOT verified" split is explicit: the 14 Task 9 browser checks are recorded as unrun, not as passing.*

Include:
- **What changed** — four new modules, one CSS token block, one call site swapped in `RecipeViewModal`.
- **Why this approach** — extraction (not inline edit) because `RecipeViewModal.jsx` sits at 380 of a 400-line blocking budget; band table in `constants/` so thresholds are declared once; `createPortal` because the modal animates with `transform`.
- **What was verified** — `npm run check:macros` (20 boundary assertions, `deriveKcal`, zero/null guards, 5 end-to-end recipes), `npm run build`, plus each manual browser check in Task 9 with its actual result.
- **What was NOT verified** — state it plainly: **no automated component or interaction tests exist**, because this client has no test runner. The popup rendering, portal behaviour, Escape precedence, and contrast were checked by hand only.
- **Mobile** — bottom-sheet popup, pull-to-dismiss via the existing `usePullToDismiss` hook rather than a new gesture, ≥44 px hit areas, badge row wrapping at 320 px, and the 320 × 568 scroll check. State which of Task 9 Steps 4–7 you actually ran on touch emulation.
- **Copy and attribution** — no internal file or skill names in anything rendered; every claim in "Where this comes from" names an external body or identifies itself as a FoodBytes decision; the carb band is stated as *deliberately below* standard guidance. Note that `check:macros` enforces the banned-token part mechanically.
- **Accessibility** — arrow + `⚠` + `aria-label` mean no state depends on colour alone; 44 px hit areas; `:focus-visible`; `role="dialog"` + `aria-modal`; `prefers-reduced-motion` respected on the popup animations. Note the one deliberate gap: **no full focus trap** in the popup — focus is moved in and restored on close, but Tab is not cycled, consistent with the existing `DailyMacroPopup`.
- **Scope boundary** — component (Extras-only) recipes deliberately show grams without a verdict, because the per-meal targets do not govern them. Name the five affected recipes if you verified them.
- **Risk / debt** — the final `--macro-under-target` value chosen and why; whether any contrast fallback was applied; that red now means "over", not "must fix", with severity carried by `⚠`; and that `hasMealMacroTargets` keys off `mealTypes`, so a recipe mis-tagged in the DB will be lit or unlit incorrectly.

---

## Self-review

**Spec coverage** — every "In scope" bullet in `plan.md` Part 1 maps to at least one task:

- Single canonical band table declared once → Task 1.
- Pure evaluation function + runnable verification → Task 2 (Steps 1–4).
- Badges become traffic-lit buttons with dot, arrow, and `aria-label` → Task 5 (Steps 1–2), rendered via Task 6.
- `MacroTargetPopup` with current reading, perfect target, ordered legend with "you are here", sourced "why" → Task 4.
- Reject marker on the badge **and** in the popup, independent of colour → Task 1 (`reject` flag), Task 4 (Step 1 popup tag), Task 5 (Step 1 badge `⚠`).
- Extraction so `RecipeViewModal.jsx` stays under 400 lines → Task 6 (Step 5), re-measured in Task 8 (Step 5).
- Mobile-first CSS: ≥44 px, `@media (hover: hover)`, `:focus-visible`, `touch-action` → Task 4 (Step 2), Task 5 (Step 2), verified in Task 9 (Step 4).
- **No internal file/skill names in user-visible copy; every claim attributed** → Task 1 (Step 1 copy rules, `sources` arrays), Task 4 (Step 1 "Where this comes from" section + Step 2 styles), Task 5 (Step 1 `aria-label` wording), asserted in Task 2 (Step 1 copy-hygiene block), read by eye in Task 9 (Step 13).
- **Popups are mobile-friendly** → Task 4 (Step 1 `usePullToDismiss` + `PullToDismissUI`; Step 2 bottom-sheet, stacked "Perfect target", collapsed legend grid, `prefers-reduced-motion`), Task 5 (Step 2 narrow-screen badge wrap), verified in Task 9 (Steps 4–7).
- **Per-meal targets are not applied to component recipes** → Task 1 (`COMPONENT_MEAL_TYPE`), Task 2 (`hasMealMacroTargets` + its 7 assertions), Task 5 (Step 1 plain-badge branch, Step 2 `--plain` styles and button-scoped interactive states), verified in Task 9 (Step 13).
- Out-of-scope items stay out: no task touches `foodbytes-api/`, `DailyMacroPopup`, `WeeklyMacroPopup`, `RecipeCard`, or any SQL; Task 8 (Step 4) proves no dependency was added.

**Placeholder scan:** No `TBD`, `TODO`, `implement later`, `appropriate error handling`, `handle edge cases`, or "similar to Task N" references. Every step shows either the exact code or a runnable command with an `Expected:` line. The `why`/`meaning` strings elided as `'...'` in `plan.md` are written out in full in Task 1.

**Type / name consistency** — identifiers introduced in Task 1 and 2 are used identically everywhere downstream:
- Status values `'under' | 'near' | 'on' | 'over'` — Tasks 1, 2, 4, 5, and every CSS modifier (`--under`, `--near`, `--on`, `--over`).
- Exports `MACRO_STATUS`, `STATUS_DISPLAY_ORDER`, `STATUS_WORD`, `STATUS_ARROW`, `REJECT_MARK`, `MACRO_KEYS`, `KCAL_PER_GRAM`, `MACRO_TARGETS` — declared in Task 1, consumed by name in Tasks 2, 4, 5.
- Functions `deriveKcal`, `bandFor`, `evaluateMacro`, `hasMealMacroTargets` — declared in Task 2 Step 3, asserted in Task 2 Step 1, called in Tasks 4 and 5.
- `COMPONENT_MEAL_TYPE` (`'extras'` — **lowercase**, matching `meals.key` as returned by `RecipeService.convertToDTO`) — declared in Task 1, consumed only by `hasMealMacroTargets` in Task 2, which lower-cases the incoming value before comparing. The literal appears nowhere else in the feature.
- Result fields `{ status, band, grams, percent, derivedKcal }` — every consumer destructures only these.
- Band fields `{ status, range, meaning, reject?, test }` and source fields `{ claim, source }` — declared in Task 1, asserted in Task 2, rendered in Task 4.
- Hook contract `usePullToDismiss(onClose)` → `{ isDragging, circlePosition, isOverTarget, dragDirection, handlers, setScrollableRef, setGestureRef, targetPosition }` — matches the existing hook's return shape exactly (`src/hooks/usePullToDismiss.js:169-178`) and the props `PullToDismissUI` expects (`src/components/common/PullToDismissUI.jsx:7`).
- Props: `MacroBadgeRow` takes `recipe` / `variantLabel` / `displayedCaloriesPerServing` (Task 5, passed in Task 6); `MacroTargetPopup` takes `macroKey` / `macros` / `variantLabel` / `displayedCaloriesPerServing` / `onClose` (Task 4, passed in Task 5). `MacroBadgeRow` narrowing the DTO to `macros` internally is a refinement of `plan.md`'s prop sketch, adopted to keep the `RecipeViewModal` call site to four lines.
- CSS tokens `--macro-under-target` / `--macro-near-target` / `--macro-on-target` / `--macro-over-target` — declared in Task 3, referenced in Tasks 4 and 5.
- `FR-104` used in every new file's header comment and both modified-file comments.

**Phase boundary cleanliness:**
- **Phase 1** ends green — three new leaf modules and one `package.json` script, nothing importing them, app behaviour unchanged. `npm run check:macros` passes at the boundary.
- **Phase 2** ends green — built bottom-up (tokens → popup → row → call site), so no task imports a module created later; the build is verified at the end of Tasks 4, 5 and 6, and the feature is fully rendered with no half-applied CSS (the relocated rules are deleted in the same task that stops relying on them, Task 6 Steps 4 and 6).
- **Phase 3** makes no production changes; its only temporary edit (Task 9 Step 2's hardcoded macros) is explicitly reverted within that step.
