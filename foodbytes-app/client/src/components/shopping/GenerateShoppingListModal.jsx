import { useState } from 'react'
import { useShoppingList } from '../../contexts/ShoppingListContext'
import { useMealPlan } from '../../contexts/MealPlanContext'
import { formatWeekRange } from '../../utils/dateUtils'
import { plannedSlotCount } from '../../utils/mealPlanDayUtils'
import './GenerateShoppingListModal.css'

/**
 * Modal for generating a shopping list. Dates default to the planned week
 * (mode 'week'), the current list's own dates ('list'), or the week with the
 * date inputs already showing ('custom').
 */
const GenerateShoppingListModal = ({ onClose, showWarning = false, mode = 'week' }) => {
  const { shoppingList, generateShoppingList, isGenerating } = useShoppingList()
  const { weekPlan, startDate: weekStart, endDate: weekEnd } = useMealPlan()

  const useListDates = mode === 'list' && shoppingList?.startDate && shoppingList?.endDate
  const [startDate, setStartDate] = useState(useListDates ? shoppingList.startDate : weekStart)
  const [endDate, setEndDate] = useState(useListDates ? shoppingList.endDate : weekEnd)
  const [showDates, setShowDates] = useState(mode === 'custom')
  const [error, setError] = useState(null)

  const isVisibleWeek = startDate === weekStart && endDate === weekEnd
  const rangeLabel = startDate && endDate ? formatWeekRange(startDate, endDate) : '…'

  const handleGenerate = async () => {
    // Validate dates
    if (!startDate || !endDate) {
      setError('Please select both start and end dates')
      return
    }

    if (endDate < startDate) {
      setError('End date must be after start date')
      return
    }

    setError(null)
    await generateShoppingList(startDate, endDate)
    onClose()
  }

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget && !isGenerating) {
      onClose()
    }
  }

  return (
    <div className="generate-modal-overlay" onClick={handleOverlayClick}>
      <div className="generate-modal">
        <h2>Generate Shopping List</h2>

        {showWarning && (
          <div className="warning-message">
            This will replace your current shopping list. Any checked items will be reset.
          </div>
        )}

        <div className="generate-summary">
          <div className="generate-summary-row">
            <span>{useListDates ? 'List dates' : 'Meal plan week'}</span>
            <b>{rangeLabel}</b>
          </div>
          {isVisibleWeek && (
            <div className="generate-summary-row">
              <span>Meals in it</span>
              <b>{plannedSlotCount(weekPlan)}</b>
            </div>
          )}
        </div>

        {showDates ? (
          <div className="date-inputs">
            <div className="date-field">
              <label htmlFor="start-date">Start Date</label>
              <input
                type="date"
                id="start-date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                disabled={isGenerating}
              />
            </div>

            <div className="date-field">
              <label htmlFor="end-date">End Date</label>
              <input
                type="date"
                id="end-date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                disabled={isGenerating}
              />
            </div>
          </div>
        ) : (
          <button
            type="button"
            className="choose-dates-btn"
            onClick={() => setShowDates(true)}
            disabled={isGenerating}
          >
            Choose other dates…
          </button>
        )}

        {error && <div className="error-message">{error}</div>}

        <div className="modal-actions">
          <button
            className="cancel-btn"
            onClick={onClose}
            disabled={isGenerating}
          >
            Cancel
          </button>
          <button
            className="generate-btn"
            onClick={handleGenerate}
            disabled={isGenerating}
          >
            {isGenerating ? 'Generating...' : `Make list for ${rangeLabel}`}
          </button>
        </div>
      </div>
    </div>
  )
}

export default GenerateShoppingListModal
