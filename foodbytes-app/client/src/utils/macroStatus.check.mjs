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
import {
  MACRO_COPY,
  MACRO_TARGETS,
  STATUS_ARROW,
  STATUS_DISPLAY_ORDER,
  STATUS_WORD
} from '../constants/macroTargets.js'
import {
  bandFor,
  deriveKcal,
  evaluateMacro,
  hasMealMacroTargets,
  hasUsableMacros
} from './macroStatus.js'

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

/* ---- hasUsableMacros: all-zero means "no data", not "three rejections" ----
 * The backend coerces missing macro data to zero rather than null, so an all-zero
 * reading is a data-completeness problem. evaluateMacro must keep calling it
 * "under" (asserted above — the band table has no notion of unknown); it is the
 * caller's job to route an unusable reading to the plain, unlit badges.
 */
assert.equal(hasUsableMacros({ protein: 0, carbs: 0, fat: 0 }), false)
assert.equal(hasUsableMacros({}), false)
assert.equal(hasUsableMacros(null), false)
assert.equal(hasUsableMacros({ protein: null, carbs: null, fat: null }), false)
// A real recipe, and the weakest possible non-zero reading, are both usable.
assert.equal(hasUsableMacros({ protein: 42, carbs: 64, fat: 20 }), true)
assert.equal(hasUsableMacros({ protein: 0, carbs: 1, fat: 0 }), true)
console.log('✓ usable-macro-data assertions passed')

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

/* ---- status maps cover every status ----
 * STATUS_WORD / STATUS_ARROW are keyed by computed [MACRO_STATUS.X], so a mistyped
 * key resolves to undefined and the entry silently vanishes. MacroBadgeRow does
 * STATUS_WORD[status].toLowerCase() — a missing entry is a TypeError that blanks the
 * whole modal for any recipe landing in that band, so completeness is asserted here
 * rather than left to a reviewer's eye.
 */
for (const status of STATUS_DISPLAY_ORDER) {
  assert.ok(STATUS_WORD[status], `STATUS_WORD is missing an entry for "${status}"`)
  assert.ok(STATUS_ARROW[status], `STATUS_ARROW is missing an entry for "${status}"`)
}
console.log('✓ status-map completeness assertions passed')

/* ---- copy hygiene + attribution ----
 * Every string in MACRO_TARGETS and MACRO_COPY is rendered to the user, so none of
 * them may name an internal file, skill, or repo artefact — those mean nothing to
 * someone reading a recipe. Asserted rather than reviewed by eye, because this is
 * exactly the kind of wording that creeps back in on the next edit.
 *
 * MACRO_COPY holds the rendered strings that belong to no single macro (the badge
 * aria-label's reject phrase, the Reject pill, "You are here", the variant note).
 * They live in the constants file specifically so they fall inside this check
 * instead of sitting inline in JSX where only a reviewer's eye would catch them.
 */
const BANNED_IN_COPY = ['CLAUDE.md', '.claude', 'SKILL.md', 'chef skill', 'FR-104', 'recipe_ingredients']

for (const key of ['protein', 'carbs', 'fat']) {
  const target = MACRO_TARGETS[key]

  const userVisible = [
    target.label,
    target.perfect,
    ...target.bands.flatMap((band) => [band.range, band.meaning]),
    ...target.why,
    ...target.sources.flatMap((entry) => [entry.claim, entry.source]),
    // Macro-independent, so re-checked on each pass. Cheap, and it keeps every
    // rendered string inside one assertion rather than two parallel ones.
    ...Object.values(MACRO_COPY)
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
