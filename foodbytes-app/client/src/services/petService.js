import api from './api'

/** MPP-14 / MPP-33: your own pet — its name and your own effective meal times. A linked user has their own pet; only the meal plan is shared. */
export const petService = {
  /**
   * @param {{ signal?: AbortSignal }} [options]
   * @returns {Promise<{ name: string, customName: boolean, mealTimes: Object }>} PetDTO
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
   * MPP-23: your own trophy cabinet — MPP-22 streaks and MPP-24 firsts. Reading it also
   * records any award just earned (the server's ledger insert is idempotent).
   *
   * AwardStatus = { streakType: 'PLAN'|'SNACK'|'ALCOHOL', current: number, best: number,
   *                 counts: { [milestone: string]: number }, next: { milestone: number, inDays: number } }
   * FirstStatus = { key: string, earnedAt: string|null }
   *
   * @param {{ signal?: AbortSignal }} [options]
   * @returns {Promise<{ streaks: Object[], firsts: Object[] }>} PetAwardsDTO
   */
  async getAwards({ signal } = {}) {
    const response = await api.get('/pet/awards', { signal })
    return response.data
  }
}

export default petService
