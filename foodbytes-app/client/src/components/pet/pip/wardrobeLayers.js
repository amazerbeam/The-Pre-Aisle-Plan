import { WARDROBE_SLOT } from '../../../constants/pipWardrobe.js'
import { pipForm } from './lineForms.js'
import { PIP_FOOT_X, PIP_FOOT_Y } from './pipSpace.js'
import { CROWN_LIFT, CROWN_REPLACE, glassesArt, hatArt, footArt, torsoArt } from './wardrobeArt.js'
import { group } from './wardrobeShapes.js'

/**
 * MPP-32 AC 3: an outfit composed for one form of one line, in the z-slots PipFigure draws them in:
 * [back + back-wear] → [legs] → [body] → clip: pants → jacket → belt → scarf (inside the body clip) →
 * [outline] → extra (belt buckle, scarf tail) → feet (the worn shoe, or bare ball feet: a shoe replaces the whole foot) → [face, unless replacesFace] → glasses (none asleep) →
 * hat → [crown, placed per hat (wardrobeArt crownPlacement): lifted to poke through the hat (lift), on the head over
 * the hat (over), on the head behind the hat (under, drawn before the hat), or skipped because the hat is the crown
 * (replace: the robot's antennas, drawn from growTop and redrawn when `droop`)]. Glasses that hide an eye (hideEye)
 * drop it from the face; glasses that stay asleep (a scar) are kept while Pip sleeps. Nothing here branches on the form:
 * the same outfit gives the same layers on every form, wilted or not (AC 7).
 * A screen face (the robot) is clipped to the form's screen and dimmed when drooped.
 */

const { HAT, GLASSES, BELT, JACKET, PANTS, SCARF, SHOES } = WARDROBE_SLOT

export const TORSO_ORDER = [PANTS, JACKET, BELT, SCARF]
export const HAT_TILT_DEG = -7

/** A screen face on a bored or wilted Pip dims like the base face (mockup pip-robot-screen-faces.html). */
export const SCREEN_FACE_DROOP_OPACITY = 0.55

/**
 * @param {Object|null} outfit - { HAT: 'beanie', … } (absent slot = empty)
 * @param {string} line - PIP_LINE id
 * @param {number} form - 1..lineFormCount(line)
 * @param {{ asleep?: boolean, droop?: boolean }} [options]
 * @returns {{ back: Object[], feet: Object[], clip: Object[], extra: Object[], glasses: Object[], screen: {x: number, y: number, w: number, h: number, r: number}|null, replacesFace: boolean, replacesCrown: boolean, crown: string|null, hideEye: string|null, hat: { shapes: Object[], transform: string|null }|null, growTop: number, itemIds: string[] }}
 */
export function dressLayers(outfit, line, form, { asleep = false, droop = false } = {}) {
  const worn = outfit ?? {}
  const f = pipForm(line, form)
  const torsoIds = TORSO_ORDER.map(slot => worn[slot]).filter(Boolean)
  const torso = torsoIds.map(id => torsoArt(line, id, f))
  const hat = worn[HAT] ? hatArt(line, worn[HAT], f, { droop }) : null
  const crown = hat?.crown ?? null
  const picked = worn[GLASSES] ? glassesArt(line, worn[GLASSES], f) : null
  const glasses = picked && (!asleep || picked.staysAsleep) ? picked : null // a scar stays on a sleeping Pip
  const screen = glasses?.screen ?? null // the glass a screen face is clipped to; none asleep (the base face returns)
  const glassesShapes = glasses?.shapes ?? []
  return {
    back: torso.flatMap(t => t.back), // drawn right after the line's Back (a cape)
    clip: torso.flatMap(t => t.clip),
    extra: torso.flatMap(t => t.extra),
    feet: footArt(line, worn[SHOES] ?? null, f), // never empty: bare ball feet when no shoe is worn
    glasses: screen && droop ? [group(glassesShapes, { opacity: SCREEN_FACE_DROOP_OPACITY })] : glassesShapes,
    screen, // PipFigure clips the glasses to it and plays the channel change on face swaps
    replacesFace: Boolean(glasses?.replacesFace), // a screen face: PipFigure skips the line's Face
    hideEye: glasses?.hidesEye ?? null, // a scar: the line's Face drops that eye
    crown, // where PipFigure draws the line's Crown (null = no hat)
    replacesCrown: crown === CROWN_REPLACE, // an antenna: PipFigure skips the line's Crown
    hat: hat && { shapes: hat.shapes, transform: hat.straight ? null : `rotate(${HAT_TILT_DEG} ${PIP_FOOT_X} ${f.hat.y})` },
    growTop: crown === CROWN_LIFT ? Math.min(f.growTop, hat.top + 4) : f.growTop,
    itemIds: [worn[SHOES], ...torsoIds, glasses ? worn[GLASSES] : null, worn[HAT]].filter(Boolean)
  }
}

/** AC 5: the footer tab's crop when Pip wears a hat (mockup tabPip): head and hat, not the whole form. */
export function hatMiniViewBox(line, form) {
  const f = pipForm(line, form)
  return squareAround(f.hat.y - f.hat.w * 0.15, f.hat.w * 2 + 44, f.scale)
}

/** AC 5: the footer tab shows the hat only. */
export const hatOnly = (outfit) => (outfit?.[HAT] ? { [HAT]: outfit[HAT] } : {})

// A square of `size` model units centred on (100, cy), mapped through the form's scale about the feet.
function squareAround(cy, size, k) {
  const y = PIP_FOOT_Y + (cy - PIP_FOOT_Y) * k
  const s = size * k
  return [PIP_FOOT_X - s / 2, y - s / 2, s, s].map(n => Number(n.toFixed(1))).join(' ')
}
