import api from './api'

/** MPP-14 / MPP-33: your own pet — its name and your own effective meal times. A linked user has their own pet; only the meal plan is shared. */
export const petService = {
  /**
   * MPP-28: `habits` (MPP-20 check-in statuses) and `awards` (MPP-23 trophy cabinet) ride in this
   * payload. Reading it also records any award just earned (the server's ledger insert is idempotent).
   *
   * HabitStatus = { habit: 'SNACK'|'ALCOHOL', current: number, best: number,
   *                 lastAnsweredDate: string|null, askToday: boolean, coversFrom: string }
   * AwardStatus = { streakType: 'PLAN'|'SNACK'|'ALCOHOL', current: number, best: number,
   *                 counts: { [milestone: string]: number }, next: { milestone: number, inDays: number } }
   * FirstStatus = { key: string, earnedAt: string|null }
   * room.placements keys (MPP-40): the 12 decor spots (rug never null), wallStyle, floorStyle
   *
   * @param {{ signal?: AbortSignal }} [options]
   * @returns {Promise<{ name: string, customName: boolean, mealTimes: Object, habits: HabitStatus[], awards: { streaks: AwardStatus[], firsts: FirstStatus[] }, growth: { points: number, form: number, barCurrent: number|null, barSize: number|null, fullyGrown: boolean, lastDayScore: number, lastScoredDate: string|null, peakForm: number }, wardrobe: Object, room: { stations: Object, upgradeCosts: Object, decor: { id: string, kind: string, price: number, owned: boolean }[], placements: { [spot: string]: string|null } } }>} PetDTO (wardrobe = WardrobeDTO, see equipItem)
   */
  async getPet({ signal } = {}) {
    const response = await api.get('/pet', { signal })
    return response.data
  },

  /**
   * @param {string|null} name - null or blank resets to the default name
   * @returns {Promise<Object>} the updated PetDTO
   */
  async renamePet(name) {
    const response = await api.put('/pet/name', { name })
    return response.data
  },

  /**
   * MPP-32: your own wardrobe writes. WardrobeDTO = { items: [{ id, slot, owned, unseen }],
   * outfit: { HAT?: string, GLASSES?: string, … } }. Each resolves the whole updated wardrobe.
   *
   * @param {string} slot - 'HAT' … 'SHOES'
   * @param {string|null} itemId - null empties the slot
   */
  async equipItem(slot, itemId) {
    const response = await api.put('/pet/wardrobe/outfit', { slot, itemId })
    return response.data
  },

  /** Empties every slot. */
  async undress() {
    const response = await api.delete('/pet/wardrobe/outfit')
    return response.data
  },

  /** Marks the slot's new items seen (its tab was opened). */
  async markWardrobeSeen(slot) {
    const response = await api.post('/pet/wardrobe/seen', { slot })
    return response.data
  },

  /**
   * MPP-26: upgrades one of your own stations by a level, paid from your sprinkles.
   * Resolves RoomWriteDTO { sprinkles, room: { stations: { bed, fridge, cooker, cabinet }, upgradeCosts } }.
   * 409 = refused (top level / not enough sprinkles / bought elsewhere) with { error }.
   *
   * @param {'bed'|'fridge'|'cooker'|'cabinet'} station
   */
  async upgradeStation(station) {
    const response = await api.post(`/pet/stations/${station}/upgrade`)
    return response.data
  },

  /**
   * MPP-27: buys a decor item or style from your own sprinkles. The server puts it on its spot if
   * the spot is empty (a style is applied at once). Resolves RoomWriteDTO { sprinkles, room }.
   * 409 = refused (already owned / not enough sprinkles) with { error }; 400 = unknown item.
   *
   * @param {string} itemId - e.g. 'herb-shelf', 'floor-oak'
   */
  async buyDecor(itemId) {
    const response = await api.post(`/pet/decor/${encodeURIComponent(itemId)}/buy`)
    return response.data
  },

  /**
   * MPP-40 free mode only: sets one of your own stations to any level 1–4 (403 when free mode is off).
   * Resolves RoomWriteDTO { sprinkles, room }.
   */
  async setStationLevel(station, level) {
    const response = await api.put(`/pet/stations/${station}/level`, { level })
    return response.data
  },

  /**
   * MPP-27: puts an owned item on a spot of your own room, free. null clears the spot (a finish
   * resets to its default). Resolves RoomWriteDTO. 409 = not owned; 400 = wrong spot / unknown.
   *
   * @param {string} spot a ROOM_SPOTS value (12 decor spots, rug, wallStyle, floorStyle)
   * @param {string|null} itemId
   */
  async placeDecor(spot, itemId) {
    const response = await api.put('/pet/room/placements', { spot, itemId })
    return response.data
  }
}

export default petService
