import { useEffect, useRef, useState } from 'react'
import extraChoicesService from '../services/extraChoicesService'
import { EXTRAS_SCOPE, SAVE_STATUS } from '../constants/extraChoices'
import { choiceKey, countExtras, patchView, visibleExtras } from '../utils/manageExtrasUtils'

const errorMessage = (err, fallback) => err?.response?.data?.error || fallback

/**
 * MPP-10: state for the Manage extras popup. Every change saves immediately and optimistically;
 * on failure only the items whose latest request failed are reverted, so an earlier failed tap
 * can't undo a later successful one.
 */
export function useManageExtras({ scope, startDate, templateId }) {
  const [view, setView] = useState(null)
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState(null)
  const [saveStatus, setSaveStatus] = useState(SAVE_STATUS.IDLE)
  const [hasSaved, setHasSaved] = useState(false)
  const [reloadKey, setReloadKey] = useState(0)
  const latestRequest = useRef(new Map())
  const requestSeq = useRef(0)
  // Always the latest view, even between taps that happen before React re-renders.
  const viewRef = useRef(null)

  const commitView = (updater) => {
    viewRef.current = updater(viewRef.current)
    setView(viewRef.current)
  }

  useEffect(() => {
    const controller = new AbortController()
    setLoading(true)
    setLoadError(null)
    const request = scope === EXTRAS_SCOPE.WEEK
      ? extraChoicesService.getWeek(startDate, { signal: controller.signal })
      : extraChoicesService.getTemplate(templateId, { signal: controller.signal })
    request
      .then((data) => commitView(() => data))
      .catch((err) => {
        if (err?.code !== 'ERR_CANCELED') setLoadError(errorMessage(err, 'Could not load extras.'))
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false)
      })
    return () => controller.abort()
  }, [scope, startDate, templateId, reloadKey])

  const persist = (items) => (scope === EXTRAS_SCOPE.WEEK
    ? extraChoicesService.updateWeek(items)
    : extraChoicesService.updateTemplate(templateId, items))

  const applyChoices = (items) => {
    if (!items.length) return
    const previous = new Map()
    const meals = viewRef.current?.meals ?? []
    meals.forEach((meal) => meal.extras.forEach((x) => previous.set(choiceKey(meal.targetId, x.extraRecipeId), x.homemade)))
    const requestId = ++requestSeq.current
    items.forEach((i) => latestRequest.current.set(choiceKey(i.targetId, i.extraRecipeId), requestId))
    commitView((v) => patchView(v, items))
    setSaveStatus(SAVE_STATUS.SAVING)
    persist(items)
      .then(() => {
        setHasSaved(true)
        if (requestId === requestSeq.current) setSaveStatus(SAVE_STATUS.SAVED)
      })
      .catch(() => {
        const revert = items
          .filter((i) => latestRequest.current.get(choiceKey(i.targetId, i.extraRecipeId)) === requestId)
          .map((i) => ({ ...i, homemade: previous.get(choiceKey(i.targetId, i.extraRecipeId)) }))
        commitView((v) => patchView(v, revert))
        setSaveStatus(SAVE_STATUS.ERROR)
      })
  }

  const toggle = (targetId, extraRecipeId, homemade) => applyChoices([{ targetId, extraRecipeId, homemade }])

  const setAll = (homemade) => applyChoices(
    (viewRef.current?.meals ?? []).flatMap((meal) => visibleExtras(meal)
      .filter((x) => x.homemade !== homemade)
      .map((x) => ({ targetId: meal.targetId, extraRecipeId: x.extraRecipeId, homemade })))
  )

  return {
    view, loading, loadError, saveStatus, hasSaved,
    toggle, setAll,
    counts: countExtras(view),
    reload: () => setReloadKey((k) => k + 1)
  }
}
