import { FOLDER_MAX_DEPTH } from '../constants/recipeFolders.js'

/** Pure helpers over the flat folder list from GET /api/recipe-folders: {id, name, parentId, recipeIds}. */
const byName = (a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: 'base' })

export const folderById = (folders, id) => folders.find((f) => f.id === id) || null
export const childrenOf = (folders, parentId) => folders.filter((f) => (f.parentId ?? null) === (parentId ?? null)).sort(byName)

export function pathOf(folders, id) {
  const path = []
  for (let f = folderById(folders, id); f && path.length <= folders.length; f = folderById(folders, f.parentId)) path.unshift(f)
  return path
}
export const depthOf = (folders, id) => (id == null ? 0 : pathOf(folders, id).length)
export const heightOf = (folders, id) => 1 + Math.max(0, ...childrenOf(folders, id).map((c) => heightOf(folders, c.id)))
export const descendantIdsOf = (folders, id) => childrenOf(folders, id).flatMap((c) => [c.id, ...descendantIdsOf(folders, c.id)])

export const canCreateIn = (folders, parentId) => depthOf(folders, parentId) + 1 <= FOLDER_MAX_DEPTH
export function canMoveTo(folders, id, targetParentId) {
  if (targetParentId == null) return true
  if (targetParentId === id || descendantIdsOf(folders, id).includes(targetParentId)) return false
  return depthOf(folders, targetParentId) + heightOf(folders, id) <= FOLDER_MAX_DEPTH
}

/** Map<recipeKey, Set<folderId>>: build once per folders change, then O(1) per card. */
export function folderIndex(folders) {
  const idx = new Map()
  folders.forEach((f) => f.recipeIds.forEach((k) => { if (!idx.has(k)) idx.set(k, new Set()); idx.get(k).add(f.id) }))
  return idx
}
export const visibleCount = (folder, isHiddenKey) => folder.recipeIds.filter((k) => !isHiddenKey(k)).length
