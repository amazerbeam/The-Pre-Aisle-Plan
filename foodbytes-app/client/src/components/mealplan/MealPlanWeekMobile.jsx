import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTheme } from '../../contexts/ThemeContext'
import useMealEntryActions from '../../hooks/useMealEntryActions'
import useSwipeHint from '../../hooks/useSwipeHint'
import UndoToast from '../common/UndoToast'
import MealPlanMenu from './MealPlanMenu'
import MobileWeekBar from './MobileWeekBar'
import DayChipStrip from './DayChipStrip'
import MobileDaySummary from './MobileDaySummary'
import SwipeableRow from './SwipeableRow'
import MealCard from './MealCard'
import MealEntryMenu from './MealEntryMenu'
import MealPlanSheet from './MealPlanSheet'
import MoveMealSheet from './MoveMealSheet'
import ServingsSheet from './ServingsSheet'
import { getTodayISO } from '../../utils/dateUtils'
import { getEmojiForMeal } from '../../utils/emojiUtils'
import { pageCopy } from '../../utils/themeCopy'
import { isDayTickable, slotsForWeek, todayOrFirstDay } from '../../utils/mealPlanDayUtils'
import { recipesForMealPath } from '../../constants/mealPlanUi'
import './MealPlanWeekMobile.css'

const initialDate = (weekPlan) => todayOrFirstDay(weekPlan)?.date

/** Mobile week view: header (menu, week bar, day chips) over one selected day's meals with swipe actions. */
function MealPlanWeekMobile({ weekPlan, onOpenDayMacros, onOpenWeekMacros, menuHandlers }) {
  const navigate = useNavigate()
  const { theme } = useTheme()
  const heading = pageCopy(theme, 'mealplan')
  const actions = useMealEntryActions()
  const { showHint, markSeen } = useSwipeHint()
  const days = weekPlan.days || []
  const [selectedDate, setSelectedDate] = useState(() => initialDate(weekPlan))
  const [replaceTarget, setReplaceTarget] = useState(null)   // { entry, slot }
  const [moveTarget, setMoveTarget] = useState(null)         // { entry, slots }
  const [servingsEntry, setServingsEntry] = useState(null)

  // A new week (arrows in the global header) re-selects today, or the first day.
  useEffect(() => { setSelectedDate(initialDate(weekPlan)) }, [weekPlan.startDate])

  const day = days.find(d => d.date === selectedDate) ?? days[0]
  if (!day) return null

  const allSlots = slotsForWeek(weekPlan)
  const slots = allSlots.filter(s => s.key !== 'snacks' || (day.mealsByType?.snacks || []).length > 0)
  const visibleIn = (slot) => (day.mealsByType?.[slot.key] || []).filter(e => !actions.pendingRemovalIds.has(e.id))
  const hasMeals = slots.some(s => visibleIn(s).length > 0)
  const firstEntryId = slots.map(visibleIn).find(list => list.length > 0)?.[0].id
  const canTick = isDayTickable(day.date, getTodayISO())
  const goToRecipes = (slot) => navigate(recipesForMealPath(slot.key, day.date))

  const openReplace = (entry, slot) => setReplaceTarget({ entry, slot })
  const openMove = (entry, moveSlots = allSlots) => setMoveTarget({ entry, slots: moveSlots })
  const swipeActions = (entry, slot) => [
    { key: 'replace', label: 'Replace', icon: '↻', className: 'swipe-row-action--replace',
      onClick: () => openReplace(entry, slot) },
    { key: 'move', label: 'Move', icon: '↔', className: 'swipe-row-action--move',
      onClick: () => openMove(entry) },
    { key: 'remove', label: 'Remove', icon: '🗑', className: 'swipe-row-action--remove',
      onClick: () => actions.requestRemove(entry) }
  ]

  return (
    <div className="week-mobile">
      <div className="m-head">
        <div className="m-top">
          <h2>{heading?.title ?? 'Meal Plan'}</h2>
          {heading?.sub && <span className="page-sub">{heading.sub}</span>}
          <MealPlanMenu {...menuHandlers} />
        </div>
        <MobileWeekBar weekPlan={weekPlan} onOpen={onOpenWeekMacros} />
        <DayChipStrip days={days} selectedDate={day.date} onSelect={setSelectedDate} />
      </div>

      <div className="m-body">
        <MobileDaySummary day={day} onOpen={() => onOpenDayMacros(day)} />

        {slots.map(slot => {
          const emoji = getEmojiForMeal(day.date, slot.key)
          const entries = visibleIn(slot)
          return (
            <section className="m-slot" key={slot.key} aria-label={slot.label}>
              <h3 className="m-slot-head">{emoji} {slot.label}</h3>
              {entries.map(entry => {
                const isFirst = entry.id === firstEntryId
                return (
                  <div className="m-entry" key={entry.id}>
                    {showHint && isFirst && (
                      <p className="swipe-hint-bubble">👈 Swipe a meal left to <b>Replace</b>, <b>Move</b> or <b>Remove</b></p>
                    )}
                    <SwipeableRow actions={swipeActions(entry, slot)} onSwiped={markSeen} hint={showHint && isFirst}>
                      <MealCard entry={entry} day={day} size="large" canTick={canTick}
                        onTick={actions.tick} thumbEmoji={emoji} />
                    </SwipeableRow>
                    {/* Keyboard / switch access to the same actions; visible only while focused. */}
                    <div className="m-entry-fallback">
                      <MealEntryMenu
                        entry={entry}
                        slotLabel={slot.label}
                        onServings={() => setServingsEntry(entry)}
                        onVariant={(variant) => actions.switchVariant(entry, day, variant)}
                        onReplace={() => openReplace(entry, slot)}
                        onMove={() => openMove(entry)}
                        onRemove={() => actions.requestRemove(entry)}
                      />
                    </div>
                  </div>
                )
              })}
              {entries.length === 0 && (
                <button type="button" className="m-add" onClick={() => goToRecipes(slot)}>
                  + Add {slot.label.toLowerCase()}
                </button>
              )}
            </section>
          )
        })}
        {!hasMeals && <p className="m-empty">Nothing planned for this day yet.</p>}
      </div>

      <UndoToast toast={actions.toast} onUndo={actions.undoRemove} />

      {replaceTarget && (
        <MealPlanSheet title={`Replace ${replaceTarget.slot.label}`} onClose={() => setReplaceTarget(null)}>
          <button type="button" className="m-sheet-row" onClick={() => goToRecipes(replaceTarget.slot)}>
            📖 Browse recipes for {replaceTarget.slot.label}
          </button>
          <button type="button" className="m-sheet-row"
            onClick={() => {
              openMove(replaceTarget.entry, [replaceTarget.slot])
              setReplaceTarget(null)
            }}>
            ⇄ Swap with another day&apos;s {replaceTarget.slot.label}
          </button>
        </MealPlanSheet>
      )}
      {moveTarget && (
        <MoveMealSheet entry={moveTarget.entry} weekPlan={weekPlan} slots={moveTarget.slots}
          onMove={actions.moveEntry} onClose={() => setMoveTarget(null)} />
      )}
      {servingsEntry && (
        <ServingsSheet entry={servingsEntry} onSave={actions.setServings} onClose={() => setServingsEntry(null)} />
      )}
    </div>
  )
}

export default MealPlanWeekMobile
