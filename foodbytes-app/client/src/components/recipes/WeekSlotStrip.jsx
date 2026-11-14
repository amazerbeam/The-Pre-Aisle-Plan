import { slotEntryFor } from '../../utils/recipeCatalogueUtils'
import { getShortDayName, getTodayISO } from '../../utils/dateUtils'

function WeekSlotStrip({ weekPlan, mealKey, mealLabel, pickDate, onPickDay, onOpenRecipe }) {
  if (!weekPlan?.days) return null

  const today = getTodayISO()
  const emptyCount = weekPlan.days.filter((d) => !slotEntryFor(weekPlan, d.date, mealKey)).length
  const meal = mealLabel.toLowerCase()

  return (
    <section className="week-strip" aria-label={`This week's ${meal}`}>
      <div className="week-strip-head">
        This week's {meal}
        <span className="week-strip-gap">
          {emptyCount ? `${emptyCount} day${emptyCount > 1 ? 's' : ''} still empty` : 'All 7 days planned ✓'}
        </span>
      </div>
      <div className="week-strip-days">
        {weekPlan.days.map((day) => {
          const entry = slotEntryFor(weekPlan, day.date, mealKey)
          const dayName = getShortDayName(day.date)
          const dayNumber = Number(day.date.slice(8, 10))
          const recipeName = entry?.recipe?.name
          const cls = [
            'week-tile',
            entry ? '' : 'is-empty',
            day.date === today ? 'is-today' : '',
            day.date === pickDate ? 'is-picking' : ''
          ].filter(Boolean).join(' ')
          return (
            <button
              key={day.date}
              type="button"
              className={cls}
              aria-label={entry ? `${recipeName} on ${dayName}` : `Pick ${meal} for ${dayName}`}
              title={entry ? recipeName : 'Empty: tap to pick a recipe for this day'}
              onClick={() => (entry ? onOpenRecipe(entry) : onPickDay(day.date))}
            >
              <span className="week-tile-day">{dayName} <span>{dayNumber}</span></span>
              <span className="week-tile-name">{entry ? recipeName : '+ Pick one'}</span>
              <span className="week-tile-dot" aria-hidden="true" />
            </button>
          )
        })}
      </div>
    </section>
  )
}

export default WeekSlotStrip
