// MPP-10: pure helpers for the Manage extras popup (no React, node-smoke-testable).

export const choiceKey = (targetId, extraRecipeId) => `${targetId}:${extraRecipeId}`

/** Extras the user can act on: children of a store-bought extra are hidden (not cooked). */
export const visibleExtras = (meal) => {
  const storeBought = new Set()
  return meal.extras.filter((x) => {
    if (x.parentExtraRecipeId != null && storeBought.has(x.parentExtraRecipeId)) {
      storeBought.add(x.extraRecipeId)
      return false
    }
    if (!x.homemade) storeBought.add(x.extraRecipeId)
    return true
  })
}

/** Returns a new view with each { targetId, extraRecipeId, homemade } applied. */
export const patchView = (view, items) => {
  if (!view || !items.length) return view
  const next = new Map(items.map((i) => [choiceKey(i.targetId, i.extraRecipeId), i.homemade]))
  return {
    ...view,
    meals: view.meals.map((meal) => ({
      ...meal,
      extras: meal.extras.map((x) => {
        const key = choiceKey(meal.targetId, x.extraRecipeId)
        return next.has(key) ? { ...x, homemade: next.get(key) } : x
      })
    }))
  }
}

export const countExtras = (view) => {
  const meals = view?.meals ?? []
  let extras = 0
  let storeBought = 0
  meals.forEach((meal) => {
    visibleExtras(meal).forEach((x) => {
      extras += 1
      if (!x.homemade) storeBought += 1
    })
  })
  return { meals: meals.length, extras, storeBought }
}

/** "Oct 12 – Oct 18" from two ISO dates. */
export const formatShortRange = (startISO, endISO) => {
  const fmt = (iso) => new Date(`${iso}T00:00:00`).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  return `${fmt(startISO)} – ${fmt(endISO)}`
}
