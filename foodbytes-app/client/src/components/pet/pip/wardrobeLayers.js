import { WARDROBE_SLOT } from '../../../constants/pipWardrobe.js'
import { pipForm } from './lineForms.js'
import { PIP_FOOT_X, PIP_FOOT_Y } from './pipSpace.js'
import { glassesArt, hatArt, shoeArt, torsoArt } from './wardrobeArt.js'

/**
 * MPP-32 AC 3: an outfit composed for one form of one line, in the z-slots PipFigure draws them in:
 * shoes → [back + back-wear] … → [body] → clip: pants → jacket → belt → scarf (inside the body clip) →
 * [outline] → extra (belt buckle, scarf tail) → [face, unless replacesFace] → glasses (none asleep) →
 * hat → [crown from growTop, lifted so it pokes through the hat — or skipped when the hat replaces the crown
 * (replacesCrown: the robot's antennas, drawn from growTop and redrawn when `droop`)]. Nothing here branches on the form:
 * the same outfit gives the same layers on every form, wilted or not (AC 7).
 */

const { HAT, GLASSES, BELT, JACKET, PANTS, SCARF, SHOES } = WARDROBE_SLOT

export const TORSO_ORDER = [PANTS, JACKET, BELT, SCARF]
export const HAT_TILT_DEG = -7

/**
 * @param {Object|null} outfit - { HAT: 'beanie', … } (absent slot = empty)
 * @param {string} line - PIP_LINE id
 * @param {number} form - 1..lineFormCount(line)
 * @param {{ asleep?: boolean, droop?: boolean }} [options]
 * @returns {{ back: Object[], shoes: Object[], clip: Object[], extra: Object[], glasses: Object[], replacesFace: boolean, replacesCrown: boolean, hat: { shapes: Object[], transform: string|null }|null, growTop: number, itemIds: string[] }}
 */
export function dressLayers(outfit, line, form, { asleep = false, droop = false } = {}) {
  const worn = outfit ?? {}
  const f = pipForm(line, form)
  const torsoIds = TORSO_ORDER.map(slot => worn[slot]).filter(Boolean)
  const torso = torsoIds.map(id => torsoArt(line, id, f))
  const hat = worn[HAT] ? hatArt(line, worn[HAT], f, { droop }) : null
  const replacesCrown = Boolean(hat?.replacesCrown)
  const glasses = worn[GLASSES] && !asleep ? glassesArt(line, worn[GLASSES], f) : null
  return {
    back: torso.flatMap(t => t.back), // drawn right after the line's Back (a cape)
    shoes: worn[SHOES] ? shoeArt(line, worn[SHOES], f) : [],
    clip: torso.flatMap(t => t.clip),
    extra: torso.flatMap(t => t.extra),
    glasses: glasses?.shapes ?? [],
    replacesFace: Boolean(glasses?.replacesFace), // a screen face: PipFigure skips the line's Face
    replacesCrown, // an antenna: PipFigure skips the line's Crown
    hat: hat && { shapes: hat.shapes, transform: hat.straight ? null : `rotate(${HAT_TILT_DEG} ${PIP_FOOT_X} ${f.hat.y})` },
    growTop: hat && !replacesCrown ? Math.min(f.growTop, hat.top + 4) : f.growTop,
    itemIds: [worn[SHOES], ...torsoIds, glasses ? worn[GLASSES] : null, worn[HAT]].filter(Boolean)
  }
}

/** AC 4: the square an item card crops to — head, eyes, torso or feet — after the form's scale (mockup slotCrop + pipCrop). */
export function slotCropViewBox(slot, line, form) {
  const f = pipForm(line, form)
  const [cy, size] = slotCrop(slot, f)
  return squareAround(cy, size, f.scale)
}

/** AC 5: the footer tab's crop when Pip wears a hat (mockup tabPip): head and hat, not the whole form. */
export function hatMiniViewBox(line, form) {
  const f = pipForm(line, form)
  return squareAround(f.hat.y - f.hat.w * 0.15, f.hat.w * 2 + 44, f.scale)
}

/** AC 5: the footer tab shows the hat only. */
export const hatOnly = (outfit) => (outfit?.[HAT] ? { [HAT]: outfit[HAT] } : {})

function slotCrop(slot, f) {
  if (slot === HAT) return [f.hat.y - f.hat.w * 0.35, f.hat.w * 1.9 + 26]
  if (slot === GLASSES) return [f.eyes.y, f.eyes.gap * 2 + 56 * f.eyes.s]
  if (slot === SHOES) return [180, f.feet[1][1][0] - f.feet[0][1][0] + 46]
  return [(f.neck + f.waist) / 2 + 2, f.side * 2 + 34]
}

// A square of `size` model units centred on (100, cy), mapped through the form's scale about the feet.
function squareAround(cy, size, k) {
  const y = PIP_FOOT_Y + (cy - PIP_FOOT_Y) * k
  const s = size * k
  return [PIP_FOOT_X - s / 2, y - s / 2, s, s].map(n => Number(n.toFixed(1))).join(' ')
}
