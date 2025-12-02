import { useState } from 'react'
import DayAssignmentButtons from './DayAssignmentButtons'
import './RecipeCard.css'

function RecipeCard({ recipe, currentMealType }) {
  const [showDetails, setShowDetails] = useState(false)
  const [servings, setServings] = useState(recipe.defaultServings || 1)

  const scaleQuantity = (originalQty) => {
    const scaled = (originalQty / recipe.defaultServings) * servings
    // Round to 2 decimal places, but show as integer if whole number
    return Number.isInteger(scaled) ? scaled : scaled.toFixed(2)
  }

  const scaledCalories = Math.round((recipe.calories / recipe.defaultServings) * servings)

  return (
    <article className="recipe-card">
      <header className="recipe-header">
        <div className="recipe-title-row">
          <h3 className="recipe-name">{recipe.name}</h3>
          {recipe.isCheat && <span className="cheat-badge">Cheat</span>}
        </div>
        <div className="recipe-meta">
          <span className="calories">{scaledCalories} cal</span>
        </div>
      </header>

      <div className="servings-control">
        <label htmlFor={`servings-${recipe.id}`}>Servings:</label>
        <input
          id={`servings-${recipe.id}`}
          type="number"
          min="1"
          max="20"
          value={servings}
          onChange={(e) => setServings(Math.max(1, parseInt(e.target.value) || 1))}
        />
      </div>

      {/* FR-014, FR-015: Day assignment buttons (hidden for guests) */}
      <DayAssignmentButtons
        recipe={recipe}
        servings={servings}
        currentMealType={currentMealType}
      />

      <button
        className="details-toggle"
        onClick={() => setShowDetails(!showDetails)}
      >
        {showDetails ? 'Hide Details' : 'Show Details'}
      </button>

      {showDetails && (
        <div className="recipe-details">
          <div className="ingredients-section">
            <h4>Ingredients</h4>
            <ul className="ingredients-list">
              {recipe.ingredients.map((ing, idx) => (
                <li key={idx}>
                  <span className="quantity">{scaleQuantity(ing.quantity)}</span>
                  <span className="unit">{ing.unit}</span>
                  <span className="ingredient-name">{ing.name}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="steps-section">
            <h4>Instructions</h4>
            <ol className="steps-list">
              {recipe.steps.map((step, idx) => (
                <li key={idx}>{step}</li>
              ))}
            </ol>
          </div>
        </div>
      )}
    </article>
  )
}

export default RecipeCard
