// Themed Pip lines: the robot (Cyberpunk), ported verbatim from the approved foodbytes-app/mockup/pip-themed-lines.html
// (ROBOT_FORMS, 2026-11-15). Same 200-unit space as every line (pip/pipSpace.js): feet on y = PIP_FOOT_Y, each form
// scaled by `scale` about (100, PIP_FOOT_Y). Keys are the herb keys (see herb/herbForms.js).

export const ROBOT_INK = '#22303f'

/**
 * The robot palette (Pip keeps its own colours in every theme), shared by robotParts / robotFaces / robotWardrobe.
 * A screen-face robot: a CRT-monitor head whose glowing pixel face is the expression, on a worn gunmetal body.
 * Genre feel only, no franchise look.
 */
export const RB = {
  dark: '#0b141c', screen: '#10202a', glow: '#37e6ff', glowSoft: '#37e6ff55', accent: '#ff5fa2', lime: '#9cff6a',
  limb: '#7f8c9a', plate: '#56616e', bolt: '#aeb8c2', dim: '#8d99a6', rust: '#b5653a', patch: '#6f7b86', cable: '#2b3a48'
}

/** Index = form - 1: Bot-kid, Teen Unit, Android. */
export const ROBOT_FORMS = [
  {
    name: 'Bot-kid', scale: 0.84, fill: ['#cfd6dc', '#7e8a96'],
    body: 'M74 84 H126 Q140 84 140 98 V126 Q140 140 126 140 H122 V146 Q124 146 124 150 V174 Q124 182 116 182 H84 Q76 182 76 174 V150 Q76 146 78 146 V140 H74 Q60 140 60 126 V98 Q60 84 74 84Z',
    hat: { y: 96, w: 60 }, eyes: { y: 112, gap: 14, s: 0.8 }, neck: 150, waist: 168, side: 23,
    feet: [[[88, 180], [82, 185]], [[112, 180], [118, 185]]], growTop: 84, crownTop: 81, growthRise: 22,
    miniViewBox: '45 80 110 110',
    screen: { x: 67, y: 91, w: 66, h: 42, r: 9 } // the monitor's glass; screen-face items are drawn and clipped to it
  },
  {
    name: 'Teen Unit', scale: 0.9, fill: ['#c6ced5', '#717e8b'],
    body: 'M80 66 H120 Q132 66 132 78 V104 Q132 116 120 116 H108 V122 H118 Q130 122 130 134 V170 Q130 182 118 182 H82 Q70 182 70 170 V134 Q70 122 82 122 H92 V116 H80 Q68 116 68 104 V78 Q68 66 80 66Z',
    hat: { y: 76, w: 56 }, eyes: { y: 92, gap: 13, s: 0.8 }, neck: 128, waist: 158, side: 30,
    feet: [[[86, 180], [80, 186]], [[114, 180], [120, 186]]], growTop: 66, crownTop: 63, growthRise: 26,
    miniViewBox: '30 52 140 140',
    screen: { x: 74, y: 72, w: 52, h: 38, r: 8 }
  },
  {
    name: 'Android', scale: 0.98, fill: ['#bcc5cd', '#65717e'],
    body: 'M86 50 H114 Q126 50 126 62 V84 Q126 96 114 96 H108 V104 H128 Q142 104 142 118 L134 150 L134 172 Q134 182 124 182 H76 Q66 182 66 172 L66 150 L58 118 Q58 104 72 104 H92 V96 H86 Q74 96 74 84 V62 Q74 50 86 50Z',
    hat: { y: 60, w: 48 }, eyes: { y: 74, gap: 11, s: 0.75 }, neck: 112, waist: 150, side: 42,
    feet: [[[84, 180], [76, 186]], [[116, 180], [124, 186]]], growTop: 50, crownTop: 47, growthRise: 20,
    miniViewBox: '20 32 160 160',
    screen: { x: 79, y: 55, w: 42, h: 35, r: 7 }
  }
]
