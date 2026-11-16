import { headBarTop } from './headBar.js'
import { pipForm } from './lineForms.js'
import { PIP_FOOT_Y } from './pipSpace.js'

/**
 * Dress Pip cards and the evolution lineup show the whole Pip (approved 2026-11-16, mockup pip-dragon-fixes.html, option B).
 * Start from the form's miniViewBox (already fitted to its wings, tail and feet) and grow it upward, square and
 * x-centred with its bottom fixed, until it clears the Pip's highest point (headBarTop: crown, growth or hat) plus a margin.
 * Lives apart from wardrobeLayers.js because headBar.js imports that file.
 */

export const FIT_MARGIN = 4

/** 'x y s s' in the figure's scaled space for `line` / `form` wearing `outfit` (null = bare). */
export function fitViewBox(line, form, outfit = null) {
  const f = pipForm(line, form)
  const [x0, y0, size0] = f.miniViewBox.split(' ').map(Number)
  const top = PIP_FOOT_Y + (headBarTop(line, form, outfit) - FIT_MARGIN - PIP_FOOT_Y) * f.scale
  const bottom = y0 + size0
  const size = Math.max(size0, bottom - top)
  const cx = x0 + size0 / 2
  return [cx - size / 2, bottom - size, size, size].map(n => Number(n.toFixed(1))).join(' ')
}

/** One viewBox for every card in a slot: the fit for its tallest item (or the bare form), so a row shares one scale. */
export function slotFitViewBox(slot, line, form, itemIds) {
  const outfits = [null, ...itemIds.map(id => ({ [slot]: id }))]
  const tallest = outfits.reduce((best, outfit) => (headBarTop(line, form, outfit) < headBarTop(line, form, best) ? outfit : best))
  return fitViewBox(line, form, tallest)
}
