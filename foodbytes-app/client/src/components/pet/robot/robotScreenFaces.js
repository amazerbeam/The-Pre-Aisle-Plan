import { fxGroup, group, path, rect } from '../pip/wardrobeShapes.js'
import { RB } from './robotForms.js'

/**
 * The robot's screen faces (approved 2026-11-17, mockup/pip-robot-screen-faces.html, option B for every item).
 * A face is same-sized bitmap layers ('.' = pixel off) + a palette, drawn as pixels the CRT screen displays:
 * fitted to the form's `screen` anchor, centred, glowing, with the scanlines and glass sheen redrawn over it.
 * PipFigure clips it to the glass; the item replaces the base face (robotWardrobe REPLACES_FACE).
 * Every later robot face item must be one of these, never a shape on top of the face.
 */

/** @typedef {{ rows: string[], effect?: string }} ScreenLayer  effect = a pip-fx--* name in Pip.css */
/** @typedef {{ layers: ScreenLayer[], palette: Object<string, string>, glow: string, bg?: string }} ScreenFace */

const SMILEY_DISC = [
  '....YYYYY....',
  '..YYYYYYYYY..',
  '.YYYYYYYYYYY.',
  '.YYYYYYYYYYY.',
  'YYYYYYYYYYYYY',
  'YYYYYYYYYYYYY',
  'YYYYYYYYYYYYY',
  '.YYYYYYYYYYY.',
  '.YYYYYYYYYYY.',
  '..YYYYYYYYY..',
  '....YYYYY....'
]
const BLANK13 = '.............'
const SMILEY_EYES = [BLANK13, BLANK13, BLANK13, '....E...E....', '....E...E....', BLANK13, BLANK13, BLANK13, BLANK13, BLANK13, BLANK13]
const SMILEY_MOUTH = [BLANK13, BLANK13, BLANK13, BLANK13, BLANK13, BLANK13, '...M.....M...', '....MMMMM....', BLANK13, BLANK13, BLANK13]

const HEART = ['.HH.HH.', 'HWHHHHH', 'HHHHHHH', '.HHHHH.', '..HHH..', '...H...']
const BLANK7 = '.......'
const BLANK15 = '...............'
const HEARTS_LEFT = [...HEART.map(r => `${r}.${BLANK7}`), BLANK15, BLANK15, BLANK15]
const HEARTS_RIGHT = [...HEART.map(r => `${BLANK7}.${r}`), BLANK15, BLANK15, BLANK15]
const HEARTS_MOUTH = [BLANK15, BLANK15, BLANK15, BLANK15, BLANK15, BLANK15, BLANK15, '....M.....M....', '.....MMMMM.....']

const BLANK17 = '.................'
const SHADES_FRAME = [
  'GGGGGGGGGGGGGGGGG',
  'GggggggG.GggggggG',
  'GggggggG.GggggggG',
  '.GggggG...GggggG.',
  '..GGGG.....GGGG..',
  BLANK17, BLANK17, BLANK17
]
const SHADES_MOUTH = [BLANK17, BLANK17, BLANK17, BLANK17, BLANK17, BLANK17, '............M....', '.......MMMMM.....']
const SHADES_GLINT = [BLANK17, '..W........W.....', '.W........W......', BLANK17, BLANK17, BLANK17, BLANK17, BLANK17]

/** Keep only the bitmap's edge (a lit cell with an off or missing 4-neighbour), painted `ch`. */
function edgeOf(rows, ch) {
  const on = (i, j) => Boolean(rows[j]?.[i]) && rows[j][i] !== '.'
  return rows.map((row, j) => [...row].map((c, i) =>
    (c !== '.' && (!on(i - 1, j) || !on(i + 1, j) || !on(i, j - 1) || !on(i, j + 1)) ? ch : '.')).join(''))
}

/** Smiley.exe — a glowing cyan outline smiley in the screen's own colour; the eyes blink. */
export const SMILEY_OUTLINE = {
  layers: [{ rows: edgeOf(SMILEY_DISC, 'C') }, { rows: SMILEY_MOUTH }, { rows: SMILEY_EYES, effect: 'blink' }],
  palette: { C: RB.glow, E: RB.glow, M: RB.glow },
  glow: RB.glow
}

/** Heart eyes — all-cyan pixel hearts that pulse, with a smile. */
export const HEARTS_CYAN = {
  layers: [{ rows: HEARTS_LEFT, effect: 'pixel-pulse' }, { rows: HEARTS_RIGHT, effect: 'pixel-pulse' }, { rows: HEARTS_MOUTH }],
  palette: { H: RB.glow, W: '#d9fbff', M: RB.glow },
  glow: RB.glow
}

/** Shades.gif — the screen lights cyan; the shades and smirk are dark pixels; the shades scroll in, then a glint. */
export const SHADES_LCD = {
  bg: RB.glow,
  layers: [{ rows: SHADES_MOUTH }, { rows: SHADES_FRAME, effect: 'scroll-in' }, { rows: SHADES_GLINT, effect: 'glint' }],
  palette: { G: RB.dark, g: RB.dark, M: RB.dark, W: '#e9fdff' },
  glow: RB.glow
}

/**
 * Shape descriptors for `face` on `screen` ({ x, y, w, h, r }), or [] when there is no screen.
 * The pixel size fits the bitmap inside the glass with a 4-unit margin, so every cell stays on the screen.
 */
export function screenFace(screen, face) {
  if (!screen) return []
  const { x, y, w, h } = screen
  const cols = face.layers[0].rows[0].length
  const rowCount = face.layers[0].rows.length
  const p = Math.min((w - 8) / cols, (h - 8) / rowCount)
  const x0 = x + w / 2 - (cols * p) / 2
  const y0 = y + h / 2 - (rowCount * p) / 2
  const cells = (rows) => rows.flatMap((row, j) => [...row].flatMap((c, i) =>
    (c === '.' ? [] : [rect(x0 + i * p, y0 + j * p, p + 0.06, p + 0.06, { fill: face.palette[c] })])))
  const lit = face.layers.map(l => (l.effect ? fxGroup(l.effect, cells(l.rows)) : group(cells(l.rows))))
  const shapes = face.bg ? [rect(x, y, w, h, { fill: face.bg, opacity: 0.92 })] : []
  shapes.push(group(lit, { style: { filter: `drop-shadow(0 0 ${(p * 0.7).toFixed(1)}px ${face.glow})` } }))
  for (let sy = y + 3; sy < y + h; sy += 3) {
    shapes.push(path(`M${x} ${sy} H${x + w}`, { stroke: RB.screen, strokeWidth: 0.9, opacity: face.bg ? 0.35 : 0.45 }))
  }
  shapes.push(path(`M${x + 4} ${y + 6} Q${x + w * 0.3} ${y + 2} ${x + w * 0.55} ${y + 3}`, { stroke: '#fff', strokeWidth: 1.6, fill: 'none', opacity: 0.18, strokeLinecap: 'round' }))
  return shapes
}
