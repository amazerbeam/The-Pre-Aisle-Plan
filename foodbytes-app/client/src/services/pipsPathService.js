import api from './api'
import { PIPS_PATH_ENDPOINT } from '../constants/pipsPath'

/**
 * MPP-49: Pip's Path for the signed-in player only (no user parameter anywhere).
 * PipsPathStateDTO = { families: [{ id, chapter, highestCleared, refresherThrough }], currentChapter, endless,
 *                      next: { family, difficulty|null, mode, chapter }, earnedToday, dailyCap, perClear }
 * PipsPathMapDTO   = { mapId, family, difficulty, mode, chapter, width, height, rows: string[] }
 * PipsPathClearDTO = { alreadyCleared, paid, capped, earnedToday, dailyCap, balance, progress }
 */
export const pipsPathService = {
  /** @param {{ signal?: AbortSignal }} [options] */
  async getState({ signal } = {}) {
    const response = await api.get(PIPS_PATH_ENDPOINT, { signal })
    return response.data
  },

  /**
   * {} = the sequencer's next slot; { family, difficulty } = an unlocked chapter level.
   * The server hands back your open map for that slot if you have one. 403 locked, 503 generation failed.
   */
  async issueMap(slot = {}) {
    const response = await api.post(`${PIPS_PATH_ENDPOINT}/maps`, slot)
    return response.data
  },

  /** Posts the full path (cell indices, start first). 422 = not a valid clear; a repeat is 200 with alreadyCleared. */
  async clearMap(mapId, path) {
    const response = await api.post(`${PIPS_PATH_ENDPOINT}/maps/${mapId}/clear`, { path })
    return response.data
  }
}

export default pipsPathService
