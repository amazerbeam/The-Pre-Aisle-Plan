import api from './api'

/** Per-person hidden recipes (Recipes redesign). All calls require a signed-in user. */
export const hiddenRecipeService = {
  /** @returns {Promise<number[]>} hidden family keys */
  async listHidden() {
    const response = await api.get('/hidden-recipes')
    return response.data.recipeIds
  },
  /** @returns {Promise<number>} the normalised key the server stored */
  async hide(recipeId) {
    const response = await api.put(`/hidden-recipes/${recipeId}`)
    return response.data.recipeId
  },
  async unhide(recipeId) {
    await api.delete(`/hidden-recipes/${recipeId}`)
  }
}

export default hiddenRecipeService
