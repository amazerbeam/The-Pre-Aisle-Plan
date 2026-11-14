export const findEntry = (weekPlan, entryId) => {
  for (const day of weekPlan?.days || []) {
    for (const entries of Object.values(day.mealsByType || {})) {
      const match = entries.find(e => e.id === entryId)
      if (match) return match
    }
  }
  return null
}

export const patchEntry = (weekPlan, entryId, fields) => {
  if (!weekPlan?.days) return weekPlan
  return {
    ...weekPlan,
    days: weekPlan.days.map(day => ({
      ...day,
      mealsByType: Object.fromEntries(
        Object.entries(day.mealsByType || {}).map(([type, entries]) => [
          type,
          entries.map(e => (e.id === entryId ? { ...e, ...fields } : e))
        ])
      )
    }))
  }
}
