import api from './api'

/**
 * MPP-3 / MPP-13: the authenticated user's preferences.
 */
export const userService = {
  /**
   * Partially update preferences. Only the keys present are changed; an explicit
   * null clears that preference.
   *   { defaultServings: 1.5 | null }
   *   { mealTimes: { breakfastBy, lunchBy, dinnerBy } | null }   // null = defaults
   * @param {Object} patch
   * @returns {Promise<Object>} the updated UserDTO
   */
  async updatePreferences(patch) {
    const response = await api.patch('/users/me/preferences', patch)
    return response.data
  }
}

export default userService
