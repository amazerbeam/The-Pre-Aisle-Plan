import { useState } from 'react'
import { RECIPE_VIEWS, RECIPE_VIEW_STORAGE_KEY } from '../constants/recipeFolders'

const read = () => {
  try { return localStorage.getItem(RECIPE_VIEW_STORAGE_KEY) === RECIPE_VIEWS.FOLDERS ? RECIPE_VIEWS.FOLDERS : RECIPE_VIEWS.MENU }
  catch { return RECIPE_VIEWS.MENU }
}

/** Menu / Folders switch for the Recipes page, remembered per device (like the theme). */
export default function useRecipeView() {
  const [view, setViewState] = useState(read)
  const setView = (next) => {
    setViewState(next)
    try { localStorage.setItem(RECIPE_VIEW_STORAGE_KEY, next) } catch { /* private mode: the choice lasts this visit */ }
  }
  return { view, setView }
}
