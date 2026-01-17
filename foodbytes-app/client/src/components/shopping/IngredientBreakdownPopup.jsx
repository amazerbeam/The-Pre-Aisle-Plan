import './IngredientBreakdownPopup.css'

/**
 * FR-042: Ingredient Breakdown Popup
 * Shows which meals use an ingredient and how much each requires
 * - Closes via X button or clicking the grey overlay area
 * - Does NOT close on scroll or clicking inside the popup
 */
function IngredientBreakdownPopup({ breakdown, onClose }) {
  // Handle overlay click (grey area) - close popup
  const handleOverlayClick = (e) => {
    // Only close if clicking directly on the overlay, not the popup content
    if (e.target.classList.contains('breakdown-popup-overlay')) {
      onClose()
    }
  }

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
    <div className="breakdown-popup-overlay" onClick={handleOverlayClick}>
      <div className="breakdown-popup">
        <header className="breakdown-header">
          <div className="breakdown-title-row">
            <h4>{breakdown.ingredientName}</h4>
            <span className="breakdown-total">
              {formatQuantity(breakdown.totalQuantity)} {breakdown.unit}
            </span>
          </div>
          <button
            className="breakdown-close-btn"
            onClick={onClose}
            aria-label="Close breakdown"
          >
            &times;
          </button>
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
      </div>
    </div>
  )
}

export default IngredientBreakdownPopup
