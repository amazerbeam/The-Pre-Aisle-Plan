import { HEAD_BAR_GAP } from '../../../constants/pipGrowth.js'
import { WARDROBE_SLOT } from '../../../constants/pipWardrobe.js'
import { pipForm } from './lineForms.js'
import { PIP_FOOT_Y } from './pipSpace.js'
import { hatArt } from './wardrobeArt.js'
import { dressLayers } from './wardrobeLayers.js'

/**
 * MPP-38: geometry for the level bar over Pip's head. Pure — pinned by wardrobe.check.mjs.
 * Unscaled 200-unit space unless stated; unknown lines fall back to herb and unknown forms to form 1 (pipForm).
 */

/** The highest point of Pip's head for `line` / `form` wearing `outfit`: body/back leaves, head growth (lifted through a hat) or the hat crown. */
export function headBarTop(line, form, outfit) {
  const f = pipForm(line, form)
  const tops = [f.crownTop]
  if (f.growthRise > 0) tops.push(dressLayers(outfit, line, form).growTop - f.growthRise)
  const hatId = outfit?.[WARDROBE_SLOT.HAT]
  const hat = hatId ? hatArt(line, hatId, f) : null
  if (hat) tops.push(hat.top)
  return Math.min(...tops)
}

/** The bar's bottom edge in the figure's scaled space (the space RoomPip places Pip in). */
export function headBarY(line, form, outfit) {
  const k = pipForm(line, form).scale
  return PIP_FOOT_Y + (headBarTop(line, form, outfit) - PIP_FOOT_Y) * k - HEAD_BAR_GAP
}

/** AC 6: "Sprig · 14 / 24 → Bushling" → "Sprig, 14 of 24 to Bushling" — read aloud without symbols. */
export function spokenLevelLabel(label) {
  return label.replace(' · ', ', ').replace(' / ', ' of ').replace(' → ', ' to ')
}
