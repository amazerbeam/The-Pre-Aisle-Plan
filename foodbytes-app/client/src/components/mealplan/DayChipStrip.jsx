import { useRef } from 'react'
import { filledCoreSlots } from '../../utils/mealPlanDayUtils'
import { MEAL_SLOTS } from '../../constants/mealPlanUi'

/** Mon-Sun chip strip: tap (or arrow keys) to pick the day shown below; dots show how many B/L/D slots are filled. */
function DayChipStrip({ days, selectedDate, onSelect }) {
  const tabRefs = useRef([])
  const selectedIndex = Math.max(0, days.findIndex(d => d.date === selectedDate))

  const onKeyDown = (e) => {
    const step = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0
    if (!step) return
    e.preventDefault()
    const next = (selectedIndex + step + days.length) % days.length
    onSelect(days[next].date)
    tabRefs.current[next]?.focus()
  }

  return (
    <div className="day-chips" role="tablist" aria-label="Days of the week" onKeyDown={onKeyDown}>
      {days.map((day, i) => {
        const selected = i === selectedIndex
        const filled = filledCoreSlots(day)
        return (
          <button
            key={day.date}
            ref={el => { tabRefs.current[i] = el }}
            type="button"
            role="tab"
            aria-selected={selected}
            tabIndex={selected ? 0 : -1}
            aria-label={`${day.dayOfWeek} ${Number(day.date.slice(8))}, ${filled} of ${MEAL_SLOTS.length} meals planned`}
            className={`day-chip ${selected ? 'is-selected' : ''} ${day.isToday ? 'is-today' : ''}`}
            onClick={() => onSelect(day.date)}
          >
            <span className="day-chip-name">{day.dayOfWeek.slice(0, 3)}</span>
            <span className="day-chip-num">{Number(day.date.slice(8))}</span>
            <span className="day-chip-dots" aria-hidden="true">
              {MEAL_SLOTS.map((s, n) => <i key={s.key} className={n < filled ? 'is-filled' : ''} />)}
            </span>
          </button>
        )
      })}
    </div>
  )
}

export default DayChipStrip
