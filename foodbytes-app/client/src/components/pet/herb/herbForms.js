// MPP-31: Pip's herb line, ported verbatim from the approved
// .claude/contract/MPP-15-epic-breakdown/mockups/pip-herb-wardrobe.html (FORMS, 2026-10-13).
// Every form is drawn in the same 200-unit space with its feet on y = HERB_FOOT_Y, scaled by
// `scale` about (100, HERB_FOOT_Y).

export const HERB_INK = '#2f4a22'
export const HERB_FOOT_X = 100
export const HERB_FOOT_Y = 186
export const HERB_FULL_VIEWBOX = '0 -40 200 240'

const ellipsePath = (cx, cy, rx, ry) =>
  `M${cx - rx} ${cy} A${rx} ${ry} 0 1 0 ${cx + rx} ${cy} A${rx} ${ry} 0 1 0 ${cx - rx} ${cy} Z`

/**
 * Index = form - 1. hat: where a brim sits {y, w}; eyes: {y, gap, s}; neck / waist: y lines for
 * torso clothes; side: half-width at the neck; feet: [[root, tip], [root, tip]]; growTop: where head
 * growth starts; miniViewBox: the tight crop for the `mini` variant (tune at the visual check).
 * crownTop: highest y of the body + back leaves (no hat moves it); growthRise: how far HerbGrowth
 * rises above its base (0 = no growth). Both measured once from the upright art (MPP-38, mockup
 * getBBox + half the ink stroke) — re-measure if HerbBack / HerbGrowth / the body paths change.
 * The current values are PROVISIONAL convex-hull bounds (min y over path endpoints and control
 * points, plus half the stroke) pending the developer's getBBox measurement (MPP-38 Task 2 Step 1);
 * they can only sit higher than the true extent, so the bar clears the art with a little extra gap.
 */
export const HERB_FORMS = [
  {
    name: 'Basil seed', scale: 0.84, fill: ['#d8b98a', '#a77d4b'],
    body: 'M100 112 C128 122 134 150 122 170 C112 184 88 184 78 170 C66 150 72 122 100 112Z',
    hat: { y: 126, w: 38 }, eyes: { y: 140, gap: 13, s: 0.72 }, neck: 156, waist: 172, side: 24,
    feet: [[[86, 177], [74, 185]], [[114, 177], [126, 185]]], growTop: 112, crownTop: 109, growthRise: 0,
    miniViewBox: '65 118 74 74'
  },
  {
    name: 'Seedling', scale: 0.88, fill: ['#c8eea2', '#86c862'],
    body: ellipsePath(100, 146, 40, 38),
    hat: { y: 118, w: 56 }, eyes: { y: 134, gap: 17, s: 0.8 }, neck: 155, waist: 174, side: 37,
    feet: [[[82, 178], [70, 186]], [[118, 178], [130, 186]]], growTop: 108, crownTop: 105, growthRise: 38,
    miniViewBox: '46 84 108 108'
  },
  {
    name: 'Sprig', scale: 0.92, fill: ['#c8eea2', '#86c862'],
    body: 'M100 74 C136 74 150 110 150 140 C150 170 128 182 100 182 C72 182 50 170 50 140 C50 110 64 74 100 74Z',
    hat: { y: 92, w: 60 }, eyes: { y: 120, gap: 20, s: 0.9 }, neck: 145, waist: 168, side: 47,
    feet: [[[78, 178], [66, 186]], [[122, 178], [134, 186]]], growTop: 74, crownTop: 71, growthRise: 53,
    miniViewBox: '19 30 162 162'
  },
  {
    name: 'Bushling', scale: 0.96, fill: ['#c8eea2', '#86c862'],
    body: ellipsePath(100, 136, 54, 48),
    hat: { y: 100, w: 72 }, eyes: { y: 124, gap: 22, s: 0.95 }, neck: 149, waist: 172, side: 51,
    feet: [[[76, 178], [62, 186]], [[124, 178], [138, 186]]], growTop: 88, crownTop: 51, growthRise: 0,
    miniViewBox: '14 36 172 172'
  },
  {
    name: 'Basilisk', scale: 0.98, fill: ['#b4e488', '#4f9c34'],
    body: 'M100 88 C146 88 162 116 162 140 C162 170 136 184 100 184 C64 184 38 170 38 140 C38 116 54 88 100 88Z',
    hat: { y: 100, w: 78 }, eyes: { y: 124, gap: 24, s: 1 }, neck: 153, waist: 173, side: 58,
    feet: [[[70, 177], [54, 186]], [[130, 177], [146, 186]]], growTop: 88, crownTop: 35, growthRise: 80,
    miniViewBox: '-6 4 212 212'
  }
]

/** The form's geometry; unknown forms fall back to the seed so a bad payload never blanks Pip. */
export const herbForm = (form) => HERB_FORMS[form - 1] ?? HERB_FORMS[0]

/**
 * AC 6: the anchors every form exposes for MPP-32's wardrobe, in the unscaled 200-unit space
 * (apply the form's `scale` about (HERB_FOOT_X, HERB_FOOT_Y) to place them). Keyed by form 1–5.
 */
export const PIP_FORM_ANCHORS = Object.fromEntries(HERB_FORMS.map((f, i) => [i + 1, {
  hat: f.hat,
  eyes: { y: f.eyes.y, gap: f.eyes.gap },
  neck: f.neck,
  waist: f.waist,
  feetTips: f.feet.map(([, tip]) => tip)
}]))
