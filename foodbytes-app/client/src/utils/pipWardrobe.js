import { PIP_DEFAULT_LINE } from '../constants/pipLines.js'
import { WARDROBE_ITEMS, WARDROBE_ITEM_LABELS, WARDROBE_SLOTS, WARDROBE_SLOT_LABELS } from '../constants/pipWardrobe.js'

/**
 * MPP-32: pure helpers over the server's WardrobeDTO ({ items: [{ id, slot, owned, unseen }],
 * outfit: { HAT: 'beanie', … } }). Ids this client has no label/art for are skipped, never drawn.
 */

export const knownItems = (wardrobe) => (wardrobe?.items ?? []).filter(item => WARDROBE_ITEMS[item.id])

export const itemsInSlot = (wardrobe, slot) => knownItems(wardrobe).filter(item => item.slot === slot)

/** AC 4: owned and not yet seen — the badge, the red tab dot and the NEW tags. */
export const newItemIds = (wardrobe) => knownItems(wardrobe).filter(item => item.owned && item.unseen).map(item => item.id)

export const slotHasNew = (wardrobe, slot) => itemsInSlot(wardrobe, slot).some(item => item.owned && item.unseen)

/** AC 4: the sheet opens on the first slot (tab order) holding something new, or null. */
export const firstNewSlot = (wardrobe) => WARDROBE_SLOTS.find(({ key }) => slotHasNew(wardrobe, key))?.key ?? null

export const wornCount = (outfit) => Object.values(outfit ?? {}).filter(Boolean).length

/** AC 4: tapping the worn item again, or "None" (null), empties the slot. */
export const toggleTarget = (outfit, slot, itemId) => (itemId && outfit?.[slot] !== itemId ? itemId : null)

/** The wardrobe with one slot set (itemId) or emptied (null) — the optimistic copy. */
export function withSlot(wardrobe, slot, itemId) {
  const outfit = { ...wardrobe.outfit }
  if (itemId) outfit[slot] = itemId
  else delete outfit[slot]
  return { ...wardrobe, outfit }
}

/** The wardrobe with every item in a slot marked seen — the optimistic copy. */
export const withSlotSeen = (wardrobe, slot) => ({
  ...wardrobe,
  items: wardrobe.items.map(item => (item.slot === slot ? { ...item, unseen: false } : item))
})

/** The item's name on this creature; unknown lines fall back to the herb's names. */
export const wardrobeItemLabel = (line, id) =>
  (WARDROBE_ITEM_LABELS[line] ?? WARDROBE_ITEM_LABELS[PIP_DEFAULT_LINE])[id] ?? null

/** The slot's tab label on this creature ("Antenna" for the robot's HAT); falls back to WARDROBE_SLOTS' label. */
export const wardrobeSlotLabel = (line, key) =>
  WARDROBE_SLOT_LABELS[line]?.[key] ?? WARDROBE_SLOTS.find(slot => slot.key === key)?.label ?? null

/** AC 6: "🎉 New outfit: Wellies!", or "… (+2 more)" when several arrived together. */
export function wardrobeAnnouncement(ids, line) {
  const first = wardrobeItemLabel(line, ids[0])
  if (!first) return null
  return ids.length > 1 ? `🎉 New outfit: ${first}! (+${ids.length - 1} more)` : `🎉 New outfit: ${first}!`
}
