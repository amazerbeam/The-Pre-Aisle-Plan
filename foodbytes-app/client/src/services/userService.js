import api from './api'

/**
 * MPP-3: the authenticated user's preferences.
 */
export const userService = {
  /**
   * Save the default portion count. Pass null to clear the preference and
   * restore the recipe-default behaviour.
   * @param {number|null} defaultServings
   * @returns {Promise<Object>} the updated UserDTO
   */
  async updatePreferences(defaultServings) {
    const response = await api.patch('/users/me/preferences', { defaultServings })
    return response.data
  }
}

export default userService
