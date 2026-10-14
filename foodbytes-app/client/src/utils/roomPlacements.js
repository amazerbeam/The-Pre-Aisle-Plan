import { DECOR_ITEMS, DECOR_SPOT_LABELS, DEFAULT_FLOOR_STYLE, DEFAULT_WALL_STYLE, ROOM_SPOTS, ROOM_STYLES } from '../constants/petDecor.js'

/**
 * MPP-27: pure helpers over PetRoomDTO's decor ([{ id, kind, price, owned }]) and placements
 * ({ leftWall, rightWall, floor, wallStyle, floorStyle }). Pinned by room.check.mjs.
 */

/** A known item or style's { label, spot }, or null for an id this client doesn't know. */
export function decorEntry(id) {
  return DECOR_ITEMS[id] ?? ROOM_STYLES[id] ?? null
}

/** The room after putting itemId on spot, for an optimistic edit. null clears it, and a cleared finish is its default. */
export function withPlacement(room, spot, itemId) {
  const cleared = spot === ROOM_SPOTS.WALL_STYLE ? DEFAULT_WALL_STYLE : spot === ROOM_SPOTS.FLOOR_STYLE ? DEFAULT_FLOOR_STYLE : null
  return { ...room, placements: { ...room?.placements, [spot]: itemId || cleared } }
}

/** Every known catalogue entry for a spot, in the server's order (the shop grids). */
export function catalogueFor(decor, spot) {
  return (decor ?? []).filter(item => item.kind === spot && decorEntry(item.id)?.spot === spot)
}

/** The owned, known entries for a spot (the picker and the style chips). */
export function ownedFor(decor, spot) {
  return catalogueFor(decor, spot).filter(item => item.owned)
}

/** The shop's status line after buying itemId; room is the write's room (did it land on its spot?). */
export function decorBoughtLine(itemId, room) {
  const entry = decorEntry(itemId)
  if (!entry) return null
  if (entry.spot === ROOM_SPOTS.WALL_STYLE || entry.spot === ROOM_SPOTS.FLOOR_STYLE) return `${entry.label} bought and applied.`
  if (room?.placements?.[entry.spot] === itemId) {
    return `${entry.label} bought and put on the ${DECOR_SPOT_LABELS[entry.spot].toLowerCase()}.`
  }
  return `${entry.label} bought. Swap it in with ✏️ Edit room.`
}
