import { useState, useEffect } from 'react'
import recipeService from '../../services/recipeService'
import RecipeCard from './RecipeCard'
import './RecipeList.css'

const MEAL_TYPES = ['breakfast', 'lunch', 'dinner', 'snacks']

function RecipeList() {
  const [recipes, setRecipes] = useState([])
  const [activeMeal, setActiveMeal] = useState('breakfast')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    loadRecipes(activeMeal)
  }, [activeMeal])

  const loadRecipes = async (mealType) => {
    setLoading(true)
    setError(null)
    try {
      const data = await recipeService.getRecipesByMealType(mealType)
      setRecipes(data)
    } catch (err) {
      setError('Failed to load recipes. Please try again.')
      console.error('Error loading recipes:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="recipe-list-container">
      <nav className="meal-tabs">
        {MEAL_TYPES.map((meal) => (
          <button
            key={meal}
            className={`meal-tab ${activeMeal === meal ? 'active' : ''}`}
            onClick={() => setActiveMeal(meal)}
          >
            {meal.charAt(0).toUpperCase() + meal.slice(1)}
          </button>
        ))}
      </nav>

      {loading && (
        <div className="loading">
          <div className="spinner"></div>
        </div>
      )}

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      {!loading && !error && (
        <div className="recipe-grid">
          {recipes.map((recipe) => (
            <RecipeCard key={recipe.id} recipe={recipe} currentMealType={activeMeal} />
          ))}
          {recipes.length === 0 && (
            <p className="no-recipes">No recipes found for {activeMeal}.</p>
          )}
        </div>
      )}
    </div>
  )
}

export default RecipeList
