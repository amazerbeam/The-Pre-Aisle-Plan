import api from './api'

/**
 * MPP-10: homemade/store-bought choices for recipe extras.
 * Reads accept { signal } so callers can abort them; writes are never aborted.
 */
export const extraChoicesService = {
  async getWeek(startDate, { signal } = {}) {
    const response = await api.get('/meal-plan/extras/week', { params: { startDate }, signal })
    return response.data
  },

  async updateWeek(choices) {
    await api.put('/meal-plan/extras/week/choices', { choices })
  },

  async getTemplate(templateId, { signal } = {}) {
    const response = await api.get(`/meal-plan/extras/templates/${templateId}`, { signal })
    return response.data
  },

  async updateTemplate(templateId, choices) {
    await api.put(`/meal-plan/extras/templates/${templateId}/choices`, { choices })
  },

  async getDefaults({ signal } = {}) {
    const response = await api.get('/meal-plan/extras/defaults', { signal })
    return response.data
  },

  async importLegacy(selections) {
    const response = await api.post('/meal-plan/extras/import', { selections })
    return response.data
  }
}

export default extraChoicesService
