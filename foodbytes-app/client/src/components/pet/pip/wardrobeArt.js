import { PIP_DEFAULT_LINE, PIP_LINE } from '../../../constants/pipLines.js'
import { DRAGON_WARDROBE } from '../dragon/dragonWardrobe.js'
import { HERB_WARDROBE } from '../herb/herbWardrobe.js'
import { ROBOT_WARDROBE } from '../robot/robotWardrobe.js'
import { PIP_FOOT_X } from './pipSpace.js'

/**
 * Themed lines: every creature wears its own version of the same 20 items (same ids, slots and
 * unlocks). Each line's wardrobe reads only its slot's anchors and returns shape descriptors.
 */
export const LINE_WARDROBE = {
  [PIP_LINE.HERB]: HERB_WARDROBE,
  [PIP_LINE.DRAGON]: DRAGON_WARDROBE,
  [PIP_LINE.ROBOT]: ROBOT_WARDROBE
}

const wardrobeOf = (line) => LINE_WARDROBE[line] ?? LINE_WARDROBE[PIP_DEFAULT_LINE]

/** A wardrobe whose hats replace the line's crown (the robot's antennas) sets HAT_ANCHOR to this. */
export const HAT_ANCHOR_CROWN = 'crown'

/** Where the line's crown (growth, horns, antenna) goes while a hat is worn. */
export const CROWN_LIFT = 'lift' // lifted to the hat top so it pokes through (the herb's basil)
export const CROWN_OVER = 'over' // stays on the head, drawn over the hat as if through holes (dragon horns)
export const CROWN_UNDER = 'under' // stays on the head, drawn behind the hat (dragon horns, the Hatchling's shell)
export const CROWN_REPLACE = 'replace' // the hat is the crown (the robot's antennas)

/** 'crown' when this line's hats replace its crown, otherwise null (hats sit on the hat anchor). */
export const hatAnchor = (line) => wardrobeOf(line).HAT_ANCHOR ?? null

/**
 * The crown placement for hat `id` on form `f`: antennas replace it; a form flagged crownUnderHats always
 * tucks it under; otherwise the wardrobe's HAT_CROWN map decides, defaulting to the lift every line had before.
 */
export function crownPlacement(line, id, f) {
  if (hatAnchor(line) === HAT_ANCHOR_CROWN) return CROWN_REPLACE
  if (f.crownUnderHats) return CROWN_UNDER
  return wardrobeOf(line).HAT_CROWN?.[id] ?? CROWN_LIFT
}

/**
 * { top, shapes, straight?, crown } on the head anchor, or null for an id that isn't a hat.
 * Crown-anchored hats draw from the head top (growTop) and the form's growthRise, and redraw when drooped.
 */
export function hatArt(line, id, f, { droop = false } = {}) {
  const draw = wardrobeOf(line).HATS[id]
  if (!draw) return null
  const crown = crownPlacement(line, id, f)
  if (crown === CROWN_REPLACE) {
    return { ...draw(PIP_FOOT_X, f.growTop, f.growthRise, droop), straight: true, crown }
  }
  return { ...draw(PIP_FOOT_X, f.hat.y, f.hat.w), crown }
}

/**
 * { shapes, replacesFace, hidesEye, staysAsleep } on the two eye points, or null for an id that isn't glasses.
 * hidesEye ('L' or null) drops that eye from the face; staysAsleep keeps the item on a sleeping Pip (a scar).
 */
export function glassesArt(line, id, f) {
  const wardrobe = wardrobeOf(line)
  const draw = wardrobe.GLASSES[id]
  if (!draw) return null
  return {
    shapes: draw(PIP_FOOT_X - f.eyes.gap, PIP_FOOT_X + f.eyes.gap, f.eyes.y, f.eyes.s),
    replacesFace: wardrobe.REPLACES_FACE.includes(id),
    hidesEye: wardrobe.HIDES_EYE?.[id] ?? null,
    staysAsleep: Boolean(wardrobe.STAYS_ASLEEP?.includes(id))
  }
}

/** { clip, extra, back }: clip = inside the body outline, extra = outside it, back = behind the body. */
export function torsoArt(line, id, f) {
  const part = wardrobeOf(line).TORSO[id]?.(f)
  return { clip: part?.clip ?? [], extra: part?.extra ?? [], back: part?.back ?? [] }
}

/** Shapes for both feet. */
export function shoeArt(line, id, f) {
  const draw = wardrobeOf(line).SHOES[id]
  return draw ? f.feet.flatMap(([root, tip]) => draw(root, tip)) : []
}

/** Every id a line can draw, for wardrobe.check.mjs. */
export function drawnItemIds(line) {
  const { HATS, GLASSES, TORSO, SHOES } = wardrobeOf(line)
  return [...Object.keys(HATS), ...Object.keys(GLASSES), ...Object.keys(TORSO), ...Object.keys(SHOES)]
}
