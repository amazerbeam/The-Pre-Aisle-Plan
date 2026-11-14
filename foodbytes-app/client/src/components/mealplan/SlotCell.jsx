import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMealPlan } from '../../contexts/MealPlanContext'
import MealCardDesktop from './MealCardDesktop'
import { recipesForMealPath } from '../../constants/mealPlanUi'

/** One day x slot cell of the timetable: its meal(s) or an Add button, and a drop target for dragged cards. */
function SlotCell({ day, slot, entries, pendingRemovalIds, actions, onOpenServings, onOpenMove }) {
  const navigate = useNavigate()
  const { getEntryById } = useMealPlan()
  const [isDropTarget, setIsDropTarget] = useState(false)

  const visible = entries.filter(e => !pendingRemovalIds.has(e.id))
  const goToRecipes = () => navigate(recipesForMealPath(slot.key, day.date))

  const onDrop = (e) => {
    e.preventDefault()
    setIsDropTarget(false)
    const entry = getEntryById(Number(e.dataTransfer.getData('text/plain')))
    if (!entry) return
    const alreadyHere = entry.planDate === day.date && entry.mealId === slot.mealId
    if (!alreadyHere) actions.moveEntry(entry, day.date, slot.mealId)
  }

  const className = ['slot-cell', day.isToday && 'is-today-col', isDropTarget && 'is-drop-target']
    .filter(Boolean).join(' ')

  return (
    <div
      className={className}
      onDragOver={(e) => { e.preventDefault(); setIsDropTarget(true) }}
      onDragLeave={() => setIsDropTarget(false)}
      onDrop={onDrop}
    >
      {visible.map(entry => (
        <MealCardDesktop key={entry.id} entry={entry} day={day} slot={slot} actions={actions}
          onOpenServings={onOpenServings} onOpenMove={onOpenMove} />
      ))}
      {visible.length > 0 ? (
        <button type="button" className="slot-add slot-add--ghost" onClick={goToRecipes}>↻ Replace {slot.label}</button>
      ) : (
        <button type="button" className="slot-add" onClick={goToRecipes}>+ Add {slot.label.toLowerCase()}</button>
      )}
    </div>
  )
}

export default SlotCell
