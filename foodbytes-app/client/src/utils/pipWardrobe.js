import { WARDROBE_ITEMS, WARDROBE_SLOTS } from '../constants/pipWardrobe.js'

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

/** AC 6: "🎉 New outfit: Wellies!", or "… (+2 more)" when several arrived together. */
export function wardrobeAnnouncement(ids) {
  const first = WARDROBE_ITEMS[ids[0]]?.label
  if (!first) return null
  return ids.length > 1 ? `🎉 New outfit: ${first}! (+${ids.length - 1} more)` : `🎉 New outfit: ${first}!`
}
