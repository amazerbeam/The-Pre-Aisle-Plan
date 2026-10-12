import api from './api'

/**
 * MPP-14: the plan's pet. Always the meal-plan OWNER's pet — a linked user reads and
 * renames the owner's — carrying the owner's effective meal times.
 */
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
  }
}

export default petService
