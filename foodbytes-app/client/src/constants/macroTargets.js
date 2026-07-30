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

/**
 * Whether a target is judged on absolute grams or on its share of derived kcal.
 * The string values are load-bearing: macroStatus.evaluateMacro switches on them.
 */
export const MACRO_MODE = {
  GRAMS: 'grams',
  PERCENT: 'percent'
}

/** Legend display order. Deliberately NOT the evaluation order in `bands`. */
export const STATUS_DISPLAY_ORDER = [
  MACRO_STATUS.UNDER,
  MACRO_STATUS.NEAR,
  MACRO_STATUS.ON,
  MACRO_STATUS.OVER
]

export const STATUS_WORD = {
  [MACRO_STATUS.UNDER]: 'Under target',
  [MACRO_STATUS.NEAR]: 'Under target',
  [MACRO_STATUS.ON]: 'On target',
  [MACRO_STATUS.OVER]: 'Over target'
}

export const STATUS_ARROW = {
  [MACRO_STATUS.UNDER]: '↓',
  [MACRO_STATUS.NEAR]: '↓',
  [MACRO_STATUS.ON]: '✓',
  [MACRO_STATUS.OVER]: '↑'
}

export const REJECT_MARK = '⚠'

/**
 * User-visible copy rendered by MacroBadgeRow / MacroTargetPopup that is not
 * attached to a single macro's band table.
 *
 * Declared here so macroStatus.check.mjs can run the same banned-token
 * assertions over it as over MACRO_TARGETS: every string shown to someone
 * reading a recipe is checked mechanically, not left to review.
 */
export const MACRO_COPY = {
  /** Appended to a badge's aria-label when the band carries `reject: true`. */
  REJECT_PHRASE: ', rejected by the FoodBytes recipe standard',
  /** The must-fix pill beside the status pill in the popup. */
  REJECT_PILL: 'Reject',
  /** Marks the band the current reading falls into. */
  YOU_ARE_HERE: 'You are here',
  VARIANT_NOTE: 'This target is the same for all three variants. Light, Moderate and Balanced differ on calories only — protein, fat % and carb % targets are identical across them.'
}

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
    mode: MACRO_MODE.GRAMS,
    perfect: '≥ 35 g per serving',
    bands: [
      {
        status: MACRO_STATUS.ON,
        range: '≥ 35 g',
        meaning: 'Meets the protein floor',
        test: (grams) => grams >= 35
      },
      {
        status: MACRO_STATUS.NEAR,
        range: '33 – 34 g',
        meaning: 'Under the floor, but within display rounding',
        test: (grams) => grams >= 33
      },
      {
        status: MACRO_STATUS.UNDER,
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
    mode: MACRO_MODE.PERCENT,
    perfect: '40 – 50 % of kcal',
    bands: [
      {
        status: MACRO_STATUS.ON,
        range: '40 – 50 %',
        meaning: 'In the target split',
        test: (percent) => percent >= 40 && percent <= 50
      },
      {
        status: MACRO_STATUS.OVER,
        range: '> 50 %',
        meaning: 'Above target — no upper limit is set',
        test: (percent) => percent > 50
      },
      {
        status: MACRO_STATUS.NEAR,
        range: '38 – 39 %',
        meaning: 'Under target, inside the documented slack',
        test: (percent) => percent >= 38
      },
      {
        status: MACRO_STATUS.UNDER,
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
    mode: MACRO_MODE.PERCENT,
    perfect: '25 – 35 % of kcal',
    bands: [
      {
        status: MACRO_STATUS.ON,
        range: '25 – 35 %',
        meaning: 'In the target split',
        test: (percent) => percent >= 25 && percent <= 35
      },
      {
        status: MACRO_STATUS.UNDER,
        range: '< 25 %',
        meaning: 'Under-fatted — the dish will read dry',
        test: (percent) => percent < 25
      },
      {
        status: MACRO_STATUS.OVER,
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
