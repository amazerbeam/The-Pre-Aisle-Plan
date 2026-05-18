import api from './api'

/**
 * Saved Meal-Plan Templates API.
 * See requirement-meal-plan-templates-2026-05-09.md.
 */
export const mealPlanTemplateService = {
  async list() {
    const response = await api.get('/meal-plan/templates')
    return response.data
  },

  async get(templateId) {
    const response = await api.get(`/meal-plan/templates/${templateId}`)
    return response.data
  },

  async create(name, sourceStartDate) {
    const response = await api.post('/meal-plan/templates', { name, sourceStartDate })
    return response.data
  },

  async rename(templateId, name) {
    const response = await api.patch(`/meal-plan/templates/${templateId}`, { name })
    return response.data
  },

  async updateSnapshot(templateId, sourceStartDate) {
    const response = await api.put(
      `/meal-plan/templates/${templateId}/snapshot?sourceStartDate=${sourceStartDate}`
    )
    return response.data
  },

  async remove(templateId) {
    const response = await api.delete(`/meal-plan/templates/${templateId}`)
    return response.status === 204
  },

  async apply(templateId, targetStartDate) {
    const response = await api.post(
      `/meal-plan/templates/${templateId}/apply?targetStartDate=${targetStartDate}`
    )
    return response.data
  }
}

export default mealPlanTemplateService
