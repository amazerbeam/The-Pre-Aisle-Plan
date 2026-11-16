import { useEffect, useState } from 'react'
import { FOLDER_DRAG_TYPE, RECIPE_VIEWS } from '../constants/recipeFolders'
import { hideKeyOf } from '../utils/recipeCatalogueUtils'
import { folderById, pathOf } from '../utils/recipeFolderTree'

/**
 * Which folder is open on the Recipes page, which tree branches are expanded, and desktop drag-and-drop filing.
 * `onOpen` lets the page reset its own search / hidden toggle whenever a folder is opened.
 */
export default function useFolderNavigation({
  foldersApi, folderReady, canDrag, recipesByMeal, setView, onOpen
}) {
  const [folderId, setFolderId] = useState(null)
  const [openIds, setOpenIds] = useState(() => new Set())
  const currentFolder = folderById(foldersApi.folders, folderId)

  // A folder deleted on another device: fall back to the top level.
  useEffect(() => {
    if (folderReady && folderId != null && !currentFolder) setFolderId(null)
  }, [folderReady, folderId, currentFolder])

  const openFolder = (id) => {
    setView(RECIPE_VIEWS.FOLDERS)
    setFolderId(id ?? null)
    onOpen?.()
    if (id != null) setOpenIds((prev) => new Set([...prev, ...pathOf(foldersApi.folders, id).map((f) => f.id)]))
  }

  const toggleOpen = (id) => setOpenIds((prev) => {
    const next = new Set(prev)
    if (!next.delete(id)) next.add(id)
    return next
  })

  // Desktop: drop a dragged card on a folder row or tile to file the recipe family.
  const dropProps = (targetId) => (canDrag ? {
    onDragOver: (e) => {
      if (e.dataTransfer.types.includes(FOLDER_DRAG_TYPE)) { e.preventDefault(); e.currentTarget.classList.add('is-drop') }
    },
    onDragLeave: (e) => e.currentTarget.classList.remove('is-drop'),
    onDrop: (e) => {
      e.preventDefault()
      e.currentTarget.classList.remove('is-drop')
      const key = Number(e.dataTransfer.getData(FOLDER_DRAG_TYPE))
      const recipe = Object.values(recipesByMeal).flat().find((r) => hideKeyOf(r) === key)
      if (recipe) foldersApi.addRecipe(targetId, recipe)
    },
  } : {})

  return { folderId, setFolderId, currentFolder, openIds, openFolder, toggleOpen, dropProps }
}
