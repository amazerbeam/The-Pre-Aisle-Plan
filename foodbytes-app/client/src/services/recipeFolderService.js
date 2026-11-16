import api from './api'

/** Personal recipe folders. All calls require a signed-in user. Errors carry the server's {error} message. */
export const recipeFolderService = {
  /** @returns {Promise<Array<{id:number,name:string,parentId:number|null,recipeIds:number[]}>>} */
  async list() { return (await api.get('/recipe-folders')).data.folders },
  async create(name, parentId) { return (await api.post('/recipe-folders', { name, parentId: parentId ?? null })).data },
  async rename(id, name) { return (await api.patch(`/recipe-folders/${id}/name`, { name })).data },
  async move(id, parentId) { return (await api.patch(`/recipe-folders/${id}/parent`, { parentId: parentId ?? null })).data },
  async remove(id) { await api.delete(`/recipe-folders/${id}`) },
  /** @returns {Promise<number>} the family key the server stored */
  async addRecipe(id, recipeId) { return (await api.put(`/recipe-folders/${id}/recipes/${recipeId}`)).data.recipeId },
  async removeRecipe(id, recipeId) { await api.delete(`/recipe-folders/${id}/recipes/${recipeId}`) },
}

export default recipeFolderService
