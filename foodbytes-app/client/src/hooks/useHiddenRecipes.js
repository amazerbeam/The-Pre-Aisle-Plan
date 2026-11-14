import { useCallback, useEffect, useRef, useState } from 'react'
import hiddenRecipeService from '../services/hiddenRecipeService'
import { hideKeyOf } from '../utils/recipeCatalogueUtils'
import { UNDO_REMOVE_MS, INFO_TOAST_MS } from '../constants/mealPlanUi'
import useToast from './useToast'

const HIDE_ERROR = "Couldn't update your hidden recipes. Please try again."

/**
 * Per-person hidden recipe keys for the Recipes screen (feature state, deliberately not a Context).
 * Hide is sent immediately and Undo un-hides, because it is fully reversible server-side. A failed
 * initial load leaves `loadFailed` true and Hide disabled, so a failure is never mistaken for "nothing hidden".
 */
export default function useHiddenRecipes({ isAuthenticated }) {
  const [hiddenKeys, setHiddenKeys] = useState(() => new Set())
  const [loading, setLoading] = useState(isAuthenticated)
  const [loadFailed, setLoadFailed] = useState(false)
  const { toast, showToast, dismissToast } = useToast()
  const lastHidden = useRef(null)
  const queue = useRef(Promise.resolve())     // hide/unhide requests run in order, so Undo never beats its PUT

  const load = useCallback(async () => {
    if (!isAuthenticated) { setLoading(false); return }
    setLoading(true)
    try {
      setHiddenKeys(new Set(await hiddenRecipeService.listHidden()))
      setLoadFailed(false)
    } catch {
      setLoadFailed(true)
    } finally {
      setLoading(false)
    }
  }, [isAuthenticated])

  useEffect(() => { load() }, [load])
  const show = (message, canUndo) => showToast(message, canUndo, canUndo ? UNDO_REMOVE_MS : INFO_TOAST_MS)
  const enqueue = (request) => {
    const run = queue.current.then(request)
    queue.current = run.catch(() => {})
    return run
  }
  const setKey = (key, on) => setHiddenKeys(prev => { const n = new Set(prev); on ? n.add(key) : n.delete(key); return n })

  const hide = useCallback(async (recipe) => {
    const key = hideKeyOf(recipe)
    setKey(key, true)
    lastHidden.current = recipe
    show(`Hid ${recipe.name}`, true)
    try { await enqueue(() => hiddenRecipeService.hide(key)) } catch (err) {
      setKey(key, false); lastHidden.current = null
      show(err.response?.data?.error || HIDE_ERROR, false)
    }
  }, [])

  const unhide = useCallback(async (recipe, { silent = false } = {}) => {
    const key = hideKeyOf(recipe)
    setKey(key, false)
    if (!silent) show(`${recipe.name} is back`, false)
    try { await enqueue(() => hiddenRecipeService.unhide(key)) } catch (err) {
      setKey(key, true)
      show(err.response?.data?.error || HIDE_ERROR, false)
    }
  }, [])

  const undo = useCallback(() => {
    if (!lastHidden.current) return
    const recipe = lastHidden.current
    lastHidden.current = null
    dismissToast()
    unhide(recipe, { silent: true })
  }, [unhide, dismissToast])

  const isHidden = useCallback((recipe) => hiddenKeys.has(hideKeyOf(recipe)), [hiddenKeys])

  return { hiddenKeys, isHidden, hide, unhide, undo, toast, dismissToast,
    loading, loadFailed, retry: load, canHide: isAuthenticated && !loading && !loadFailed }
}
