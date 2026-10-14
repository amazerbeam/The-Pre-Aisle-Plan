import { WARDROBE_SLOT } from '../../../constants/pipWardrobe.js'
import { HERB_FOOT_X, HERB_FOOT_Y, herbForm } from './herbForms.js'
import { glassesArt, hatArt, shoeArt, torsoArt } from './wardrobeArt.js'

/**
 * MPP-32 AC 3: an outfit composed for one form, in the z-slots PipHerbFigure draws them in:
 * shoes (after the feet) → [body] → clip: pants → jacket → belt → scarf (inside the body clip) →
 * [outline] → extra (belt buckle, scarf tail) → [face] → glasses (none asleep) → hat → [head
 * growth from growTop, lifted so it pokes through the hat]. Nothing here branches on the form:
 * the same outfit gives the same layers on every form, wilted or not (AC 7).
 */

const { HAT, GLASSES, BELT, JACKET, PANTS, SCARF, SHOES } = WARDROBE_SLOT

export const TORSO_ORDER = [PANTS, JACKET, BELT, SCARF]
export const HAT_TILT_DEG = -7

/**
 * @param {Object|null} outfit - { HAT: 'beanie', … } (absent slot = empty)
 * @param {number} form - 1–5
 * @param {{ asleep?: boolean }} [options]
 * @returns {{ shoes: Object[], clip: Object[], extra: Object[], glasses: Object[], hat: { shapes: Object[], transform: string|null }|null, growTop: number, itemIds: string[] }}
 */
export function dressLayers(outfit, form, { asleep = false } = {}) {
  const worn = outfit ?? {}
  const f = herbForm(form)
  const torsoIds = TORSO_ORDER.map(slot => worn[slot]).filter(Boolean)
  const torso = torsoIds.map(id => torsoArt(id, f))
  const hat = worn[HAT] ? hatArt(worn[HAT], f) : null
  const showGlasses = Boolean(worn[GLASSES]) && !asleep
  return {
    shoes: worn[SHOES] ? shoeArt(worn[SHOES], f) : [],
    clip: torso.flatMap(t => t.clip),
    extra: torso.flatMap(t => t.extra),
    glasses: showGlasses ? glassesArt(worn[GLASSES], f) : [],
    hat: hat && { shapes: hat.shapes, transform: hat.straight ? null : `rotate(${HAT_TILT_DEG} ${HERB_FOOT_X} ${f.hat.y})` },
    growTop: hat ? Math.min(f.growTop, hat.top + 4) : f.growTop,
    itemIds: [worn[SHOES], ...torsoIds, showGlasses ? worn[GLASSES] : null, worn[HAT]].filter(Boolean)
  }
}

/** AC 4: the square an item card crops to — head, eyes, torso or feet — after the form's scale (mockup slotCrop + pipCrop). */
export function slotCropViewBox(slot, form) {
  const f = herbForm(form)
  const [cy, size] = slotCrop(slot, f)
  return squareAround(cy, size, f.scale)
}

/** AC 5: the footer tab's crop when Pip wears a hat (mockup tabPip): head and hat, not the whole form. */
export function hatMiniViewBox(form) {
  const f = herbForm(form)
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
  const y = HERB_FOOT_Y + (cy - HERB_FOOT_Y) * k
  const s = size * k
  return [HERB_FOOT_X - s / 2, y - s / 2, s, s].map(n => Number(n.toFixed(1))).join(' ')
}
