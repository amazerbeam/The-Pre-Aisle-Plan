import { useEffect, useRef } from 'react'
import './IngredientBreakdownPopup.css'

/**
 * FR-042: Ingredient Breakdown Popup
 * Shows which meals use an ingredient and how much each requires
 */
function IngredientBreakdownPopup({ breakdown, position, onClose }) {
  const popupRef = useRef(null)

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (popupRef.current && !popupRef.current.contains(e.target)) {
        onClose()
      }
    }

    // Cancel on scroll/drag
    const handleScroll = () => {
      onClose()
    }

    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('touchstart', handleClickOutside)
    document.addEventListener('scroll', handleScroll, true)

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('touchstart', handleClickOutside)
      document.removeEventListener('scroll', handleScroll, true)
    }
  }, [onClose])

  if (!breakdown) return null

  // Meal type emoji mapping
  const mealEmojis = {
    breakfast: '\u{1F373}', // Cooking egg
    lunch: '\u{1F96A}',     // Sandwich
    dinner: '\u{1F35D}',    // Spaghetti
    snacks: '\u{1F36A}'     // Cookie
  }

  // Format quantity to remove trailing zeros
  const formatQuantity = (qty) => {
    const num = parseFloat(qty)
    return num % 1 === 0 ? num.toFixed(0) : num.toFixed(2).replace(/\.?0+$/, '')
  }

  return (
    <div className="breakdown-popup-overlay">
      <div
        ref={popupRef}
        className="breakdown-popup"
        style={{
          top: position?.top || '50%',
          left: position?.left || '50%',
          transform: position ? 'none' : 'translate(-50%, -50%)'
        }}
      >
        <header className="breakdown-header">
          <h4>{breakdown.ingredientName}</h4>
          <span className="breakdown-total">
            {formatQuantity(breakdown.totalQuantity)} {breakdown.unit}
          </span>
        </header>

        <ul className="breakdown-list">
          {breakdown.mealBreakdown.map((meal, idx) => (
            <li key={idx} className="breakdown-item">
              <span className="meal-emoji">
                {mealEmojis[meal.mealType] || '\u{1F37D}'}
              </span>
              <span className="meal-name">{meal.recipeName}</span>
              <span className="meal-quantity">
                {formatQuantity(meal.quantity)} {breakdown.unit}
              </span>
            </li>
          ))}
        </ul>

        <p className="breakdown-hint">Tap anywhere to close</p>
      </div>
    </div>
  )
}

export default IngredientBreakdownPopup
