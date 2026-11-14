import { useNavigate } from 'react-router-dom'
import MealCard from './MealCard'
import MealEntryMenu from './MealEntryMenu'
import { getTodayISO } from '../../utils/dateUtils'
import { isDayTickable } from '../../utils/mealPlanDayUtils'
import { recipesForMealPath } from '../../constants/mealPlanUi'

/** A draggable compact meal card with its ⋯ menu pinned top-right. */
function MealCardDesktop({ entry, day, slot, actions, onOpenServings, onOpenMove }) {
  const navigate = useNavigate()

  const onDragStart = (e) => {
    e.dataTransfer.setData('text/plain', String(entry.id))
    e.dataTransfer.effectAllowed = 'move'
  }

  return (
    <div className="meal-card-desktop" draggable onDragStart={onDragStart}>
      <MealCard
        entry={entry}
        day={day}
        size="compact"
        canTick={isDayTickable(day.date, getTodayISO())}
        onTick={actions.tick}
      />
      <MealEntryMenu
        entry={entry}
        slotLabel={slot.label}
        onServings={() => onOpenServings(entry)}
        onVariant={(variant) => actions.switchVariant(entry, day, variant)}
        onReplace={() => navigate(recipesForMealPath(slot.key, day.date))}
        onMove={() => onOpenMove(entry)}
        onRemove={() => actions.requestRemove(entry)}
      />
    </div>
  )
}

export default MealCardDesktop
