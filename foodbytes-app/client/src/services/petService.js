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
  }
}

export default petService
