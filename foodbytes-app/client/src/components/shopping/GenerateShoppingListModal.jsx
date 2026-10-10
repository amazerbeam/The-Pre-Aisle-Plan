import { useState } from 'react'
import { useShoppingList } from '../../contexts/ShoppingListContext'
import { getTodayISO, addDays, formatDateISO } from '../../utils/dateUtils'
import './GenerateShoppingListModal.css'

/**
 * Modal for generating a shopping list with date range selection
 */
const GenerateShoppingListModal = ({ onClose, showWarning = false }) => {
  const { generateShoppingList, isGenerating } = useShoppingList()

  // Default to today and 7 days from now
  const today = getTodayISO()
  const defaultEndDate = formatDateISO(addDays(new Date(), 6))

  const [startDate, setStartDate] = useState(today)
  const [endDate, setEndDate] = useState(defaultEndDate)
  const [error, setError] = useState(null)

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
            {isGenerating ? 'Generating...' : 'Generate'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default GenerateShoppingListModal
