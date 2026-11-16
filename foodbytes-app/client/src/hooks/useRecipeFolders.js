import { useCallback, useEffect, useRef, useState } from 'react'
import recipeFolderService from '../services/recipeFolderService'
import { hideKeyOf } from '../utils/recipeCatalogueUtils'
import { FOLDER_SAVE_ERROR } from '../constants/recipeFolders'
import { UNDO_REMOVE_MS, INFO_TOAST_MS } from '../constants/mealPlanUi'
import useToast from './useToast'

const messageOf = (err) => err.response?.data?.error || FOLDER_SAVE_ERROR
const isStale = (err) => err.response?.status === 404 || err.response?.status === 400

/**
 * Per-person custom recipe folders for the Recipes screen (feature state, deliberately not a Context).
 * Structural edits (create, rename, move, delete) are pessimistic: the UI changes once the server agrees.
 * Filing a recipe is optimistic and runs through a queue so Undo never beats its request. A failed initial
 * load leaves `loadFailed` true and editing disabled, so a failure is never mistaken for "no folders".
 */
export default function useRecipeFolders({ isAuthenticated }) {
  const [folders, setFolders] = useState([])
  const [loading, setLoading] = useState(isAuthenticated)
  const [loadFailed, setLoadFailed] = useState(false)
  const { toast, showToast, dismissToast } = useToast()
  const queue = useRef(Promise.resolve())        // membership writes run in order
  const lastRemoved = useRef(null)               // { folderId, recipe } for Undo
  const loadSeq = useRef(0)                      // ignores a slow load that a newer one has overtaken

  const load = useCallback(async () => {
    if (!isAuthenticated) { setFolders([]); setLoading(false); return }
    setLoading(true)
    const seq = ++loadSeq.current
    try {
      const list = await recipeFolderService.list()
      if (seq === loadSeq.current) { setFolders(list); setLoadFailed(false) }
    } catch {
      if (seq === loadSeq.current) setLoadFailed(true)
    } finally {
      if (seq === loadSeq.current) setLoading(false)
    }
  }, [isAuthenticated])

  useEffect(() => { load() }, [load])

  const show = (message, canUndo) => showToast(message, canUndo, canUndo ? UNDO_REMOVE_MS : INFO_TOAST_MS)
  const enqueue = (request) => {
    const run = queue.current.then(request)
    queue.current = run.catch(() => {})
    return run
  }
  const replace = (folder) => setFolders((prev) => prev.map((f) => (f.id === folder.id ? folder : f)))

  /** Runs a structural call; reloads when the server says our copy is stale. */
  const structural = async (request, apply) => {
    try {
      const result = await request()
      apply(result)
      return { ok: true, folder: result }
    } catch (err) {
      if (isStale(err)) load()
      return { ok: false, error: messageOf(err) }
    }
  }

  const create = (name, parentId) => structural(
    () => recipeFolderService.create(name, parentId),
    (folder) => setFolders((prev) => [...prev, folder]))
  const rename = (id, name) => structural(() => recipeFolderService.rename(id, name), replace)
  const move = (id, parentId) => structural(() => recipeFolderService.move(id, parentId), replace)
  const removeFolder = (id) => {
    const deleted = folders.find((f) => f.id === id)
    return structural(() => recipeFolderService.remove(id), () => setFolders((prev) =>
      prev.filter((f) => f.id !== id).map((f) => (f.parentId === id ? { ...f, parentId: deleted?.parentId ?? null } : f))))
  }

  const setKey = (folderId, key, on) => setFolders((prev) => prev.map((f) => {
    if (f.id !== folderId) return f
    const has = f.recipeIds.includes(key)
    if (on === has) return f
    return { ...f, recipeIds: on ? [...f.recipeIds, key] : f.recipeIds.filter((k) => k !== key) }
  }))

  const addRecipe = async (folderId, recipe, { silent = false } = {}) => {
    const key = hideKeyOf(recipe)
    const folder = folders.find((f) => f.id === folderId)
    setKey(folderId, key, true)
    if (!silent) show(`Added to ${folder?.name ?? 'folder'}`, false)
    try { await enqueue(() => recipeFolderService.addRecipe(folderId, key)) } catch (err) {
      setKey(folderId, key, false)
      if (isStale(err)) load()
      show(messageOf(err), false)
    }
  }

  const removeRecipe = async (folderId, recipe, { silent = false } = {}) => {
    const key = hideKeyOf(recipe)
    const folder = folders.find((f) => f.id === folderId)
    setKey(folderId, key, false)
    if (!silent) {
      lastRemoved.current = { folderId, recipe }
      show(`Removed from ${folder?.name ?? 'folder'}`, true)
    }
    try { await enqueue(() => recipeFolderService.removeRecipe(folderId, key)) } catch (err) {
      setKey(folderId, key, true)
      if (isStale(err)) load()
      show(messageOf(err), false)
    }
  }

  /** Tick-list toggle: add, or silent remove (no Undo). */
  const toggleRecipe = (folderId, recipe) => {
    const folder = folders.find((f) => f.id === folderId)
    return folder?.recipeIds.includes(hideKeyOf(recipe))
      ? removeRecipe(folderId, recipe, { silent: true })
      : addRecipe(folderId, recipe)
  }

  const undo = () => {
    if (!lastRemoved.current) return
    const { folderId, recipe } = lastRemoved.current
    lastRemoved.current = null
    dismissToast()
    addRecipe(folderId, recipe, { silent: true })
  }

  return { folders, loading, loadFailed, retry: load, canEdit: isAuthenticated && !loading && !loadFailed,
    create, rename, move, removeFolder, addRecipe, removeRecipe, toggleRecipe, undo, toast, dismissToast }
}
