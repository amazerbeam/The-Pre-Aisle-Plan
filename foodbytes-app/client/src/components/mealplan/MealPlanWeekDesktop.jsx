import { useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { useTheme } from '../../contexts/ThemeContext'
import useMealEntryActions from '../../hooks/useMealEntryActions'
import UndoToast from '../common/UndoToast'
import WeekSummary from './WeekSummary'
import MealPlanToolbar from './MealPlanToolbar'
import DayHeader from './DayHeader'
import SlotCell from './SlotCell'
import ServingsSheet from './ServingsSheet'
import MoveMealSheet from './MoveMealSheet'
import { slotsForWeek } from '../../utils/mealPlanDayUtils'
import { getEmojiForMeal } from '../../utils/emojiUtils'
import { pageCopy } from '../../utils/themeCopy'
import './MealPlanWeekDesktop.css'

/** Desktop week view: summary tiles, then a timetable of rows (meals) x columns (days). */
function MealPlanWeekDesktop({ weekPlan, onSwap, onOpenDayMacros, onOpenWeekMacros, toolbarHandlers }) {
  const { mealTimes } = useAuth()
  const { theme } = useTheme()
  const heading = pageCopy(theme, 'mealplan')
  const actions = useMealEntryActions()
  const [servingsEntry, setServingsEntry] = useState(null)
  const [moveEntry, setMoveEntry] = useState(null)

  const days = weekPlan.days || []
  const slots = slotsForWeek(weekPlan)
  const emojiDate = days[0]?.date

  return (
    <div className="week-desktop">
      <div className="week-desktop-title">
        <h2>{heading?.title ?? 'Meal Plan'}</h2>
        {heading?.sub && <span className="page-sub">{heading.sub}</span>}
        <MealPlanToolbar {...toolbarHandlers} />
      </div>

      <WeekSummary weekPlan={weekPlan} onOpenWeekMacros={onOpenWeekMacros} />

      <div className="timetable">
        <div className="timetable-corner" />
        {days.map(day => (
          <DayHeader key={day.date} day={day} onSwap={onSwap} onOpenDayMacros={onOpenDayMacros} />
        ))}
        {slots.map(slot => {
          const time = mealTimes?.[`${slot.key}By`]
          return (
            <div className="timetable-row" key={slot.key}>
              <div className="timetable-rowlabel">
                <span>{emojiDate ? getEmojiForMeal(emojiDate, slot.key) : ''} {slot.label}</span>
                {time && <span className="timetable-rowtime">by {time}</span>}
              </div>
              {days.map(day => (
                <SlotCell
                  key={day.date}
                  day={day}
                  slot={slot}
                  entries={day.mealsByType?.[slot.key] || []}
                  pendingRemovalIds={actions.pendingRemovalIds}
                  actions={actions}
                  onOpenServings={setServingsEntry}
                  onOpenMove={setMoveEntry}
                />
              ))}
            </div>
          )
        })}
      </div>

      <UndoToast toast={actions.toast} onUndo={actions.undoRemove} />

      {servingsEntry && (
        <ServingsSheet entry={servingsEntry} onSave={actions.setServings} onClose={() => setServingsEntry(null)} />
      )}
      {moveEntry && (
        <MoveMealSheet entry={moveEntry} weekPlan={weekPlan} slots={slots} onMove={actions.moveEntry}
          onClose={() => setMoveEntry(null)} />
      )}
    </div>
  )
}

export default MealPlanWeekDesktop
