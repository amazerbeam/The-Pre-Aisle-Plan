import { HEAD_BAR_GAP } from '../../../constants/pipGrowth.js'
import { WARDROBE_SLOT } from '../../../constants/pipWardrobe.js'
import { HERB_FOOT_Y, herbForm } from './herbForms.js'
import { hatArt } from './wardrobeArt.js'
import { dressLayers } from './wardrobeLayers.js'

/**
 * MPP-38: geometry for the level bar over Pip's head. Pure — pinned by wardrobe.check.mjs.
 * Unscaled 200-unit herb space unless stated; unknown forms fall back to the seed (herbForm).
 */

/** The highest point of Pip's head for `form` wearing `outfit`: body/back leaves, head growth (lifted through a hat) or the hat crown. */
export function headBarTop(form, outfit) {
  const f = herbForm(form)
  const tops = [f.crownTop]
  if (f.growthRise > 0) tops.push(dressLayers(outfit, form).growTop - f.growthRise)
  const hatId = outfit?.[WARDROBE_SLOT.HAT]
  const hat = hatId ? hatArt(hatId, f) : null
  if (hat) tops.push(hat.top)
  return Math.min(...tops)
}

/** The bar's bottom edge in the figure's scaled space (the space RoomPip places Pip in). */
export function headBarY(form, outfit) {
  const k = herbForm(form).scale
  return HERB_FOOT_Y + (headBarTop(form, outfit) - HERB_FOOT_Y) * k - HEAD_BAR_GAP
}

/** AC 6: "Sprig · 14 / 24 → Bushling" → "Sprig, 14 of 24 to Bushling" — read aloud without symbols. */
export function spokenLevelLabel(label) {
  return label.replace(' · ', ', ').replace(' / ', ' of ').replace(' → ', ' to ')
}
