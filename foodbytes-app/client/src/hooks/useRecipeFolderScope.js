import { folderById, folderIndex } from '../utils/recipeFolderTree'
import { hideKeyOf } from '../utils/recipeCatalogueUtils'

/**
 * Which recipes the Recipes page shows for the current folder view.
 * Menu view shows everything, a folder shows its members, the Folders top level shows unfiled recipes.
 * `counts` has the per-meal shape RecipeToolbar takes (in scope and not hidden); `unfiledCount` feeds
 * the "Unfiled" tile. No memoisation: the lists are small and there is no profiling evidence for it.
 */
export default function useRecipeFolderScope({ inFolders, folderId, folders, recipesByMeal, isHidden }) {
  const idx = folderIndex(folders)
  const members = folderId == null ? null : folderById(folders, folderId)?.recipeIds ?? []

  const inScope = (recipe) => {
    if (!inFolders) return true
    const key = hideKeyOf(recipe)
    return members ? members.includes(key) : !idx.has(key)
  }

  const counts = {}
  Object.entries(recipesByMeal).forEach(([meal, list]) => {
    counts[meal] = list.filter((r) => inScope(r) && !isHidden(r)).length
  })

  const unfiled = new Set()
  Object.values(recipesByMeal).flat().forEach((r) => {
    const key = hideKeyOf(r)
    if (!isHidden(r) && !idx.has(key)) unfiled.add(key)
  })

  return { inScope, counts, unfiledCount: unfiled.size }
}
