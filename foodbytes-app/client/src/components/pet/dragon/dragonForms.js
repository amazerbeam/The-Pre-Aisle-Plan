// Themed Pip lines: the dragon (Parchment), ported verbatim from the approved foodbytes-app/mockup/pip-themed-lines.html
// (DRAGON_FORMS, 2026-11-15). Same 200-unit space as every line (pip/pipSpace.js): feet on y = PIP_FOOT_Y, each form
// scaled by `scale` about (100, PIP_FOOT_Y). Keys are the herb keys (see herb/herbForms.js).

export const DRAGON_INK = '#1f3d34'

/** Index = form - 1: Hatchling, Wyrmling, Drake. */
export const DRAGON_FORMS = [
  {
    name: 'Hatchling', scale: 0.84, fill: ['#c4f2dc', '#6cc59a'],
    body: 'M100 92 C124 92 134 108 132 126 C131 136 126 142 128 148 C134 162 128 182 100 182 C72 182 66 162 72 148 C74 142 69 136 68 126 C66 108 76 92 100 92Z',
    hat: { y: 104, w: 50 }, eyes: { y: 122, gap: 12, s: 0.75 }, neck: 146, waist: 168, side: 28,
    feet: [[[88, 178], [78, 185]], [[112, 178], [122, 185]]], growTop: 92, crownTop: 89, growthRise: 12,
    miniViewBox: '50 92 100 100'
  },
  {
    name: 'Wyrmling', scale: 0.9, fill: ['#a8e8cc', '#3fa57c'],
    body: 'M100 68 C128 68 140 86 138 106 C137 118 130 124 130 130 C142 142 142 182 100 182 C58 182 58 142 70 130 C70 124 63 118 62 106 C60 86 72 68 100 68Z',
    hat: { y: 82, w: 60 }, eyes: { y: 102, gap: 15, s: 0.85 }, neck: 132, waist: 164, side: 34,
    feet: [[[84, 178], [72, 186]], [[116, 178], [128, 186]]], growTop: 72, crownTop: 65, growthRise: 20,
    miniViewBox: '34 60 132 132'
  },
  {
    name: 'Drake', scale: 0.98, fill: ['#8fdcbf', '#2a8a66'],
    body: 'M100 56 C126 56 138 72 136 92 C135 104 128 110 126 116 C146 124 152 150 148 168 C144 182 124 184 100 184 C76 184 56 182 52 168 C48 150 54 124 74 116 C72 110 65 104 64 92 C62 72 74 56 100 56Z',
    hat: { y: 70, w: 62 }, eyes: { y: 88, gap: 15, s: 0.9 }, neck: 126, waist: 162, side: 42,
    feet: [[[80, 178], [64, 186]], [[120, 178], [136, 186]]], growTop: 60, crownTop: 53, growthRise: 28,
    miniViewBox: '5 18 190 190'
  }
]
