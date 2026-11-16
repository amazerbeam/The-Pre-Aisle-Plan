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

/** 'crown' when this line's hats replace its crown, otherwise null (hats sit on the hat anchor). */
export const hatAnchor = (line) => wardrobeOf(line).HAT_ANCHOR ?? null

/**
 * { top, shapes, straight?, replacesCrown } on the head anchor, or null for an id that isn't a hat.
 * Crown-anchored hats draw from the head top (growTop) and the form's growthRise, and redraw when drooped.
 */
export function hatArt(line, id, f, { droop = false } = {}) {
  const draw = wardrobeOf(line).HATS[id]
  if (!draw) return null
  if (hatAnchor(line) === HAT_ANCHOR_CROWN) {
    return { ...draw(PIP_FOOT_X, f.growTop, f.growthRise, droop), straight: true, replacesCrown: true }
  }
  return { ...draw(PIP_FOOT_X, f.hat.y, f.hat.w), replacesCrown: false }
}

/** { shapes, replacesFace } on the two eye points, or null for an id that isn't glasses. */
export function glassesArt(line, id, f) {
  const wardrobe = wardrobeOf(line)
  const draw = wardrobe.GLASSES[id]
  if (!draw) return null
  return { shapes: draw(PIP_FOOT_X - f.eyes.gap, PIP_FOOT_X + f.eyes.gap, f.eyes.y, f.eyes.s), replacesFace: wardrobe.REPLACES_FACE.includes(id) }
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
