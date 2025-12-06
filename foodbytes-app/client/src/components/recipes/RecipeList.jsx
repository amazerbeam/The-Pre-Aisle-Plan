import { useState, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import recipeService from '../../services/recipeService'
import RecipeCard from './RecipeCard'
import RecipeEditModal from '../admin/RecipeEditModal'
import './RecipeList.css'

const MEAL_TYPES = ['breakfast', 'lunch', 'dinner', 'snacks']

function RecipeList() {
  const { isAdmin } = useAuth()
  const [recipes, setRecipes] = useState([])
  const [activeMeal, setActiveMeal] = useState('breakfast')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  // FR-033: Admin edit modal state
  const [editingRecipeId, setEditingRecipeId] = useState(null)
  const [showNewRecipe, setShowNewRecipe] = useState(false)

  useEffect(() => {
    loadRecipes(activeMeal)
  }, [activeMeal, isAdmin])

  const loadRecipes = async (mealType) => {
    setLoading(true)
    setError(null)
    try {
      // Admin users see all recipes (including hidden), regular users see only live recipes
      const data = isAdmin
        ? await recipeService.getAllRecipesAdmin(mealType)
        : await recipeService.getRecipesByMealType(mealType)
      setRecipes(data)
    } catch (err) {
      setError('Failed to load recipes. Please try again.')
      console.error('Error loading recipes:', err)
    } finally {
      setLoading(false)
    }
  }

  // FR-033: Handle edit button click
  const handleEdit = (recipeId) => {
    setEditingRecipeId(recipeId)
  }

  // FR-033: Handle modal close
  const handleModalClose = () => {
    setEditingRecipeId(null)
    setShowNewRecipe(false)
  }

  // FR-033: Handle recipe save (refresh list)
  const handleRecipeSave = (savedRecipe) => {
    // Reload recipes to show updated data
    loadRecipes(activeMeal)
  }

  // FR-043: Handle variant selection - fetch full recipe and replace in list
  const handleSelectVariant = async (variantRecipeId, currentServings) => {
    try {
      const variantRecipe = await recipeService.getRecipeById(variantRecipeId)
      if (variantRecipe) {
        // Replace the recipe in the list with the selected variant
        setRecipes(prevRecipes =>
          prevRecipes.map(recipe =>
            recipe.variants?.some(v => v.recipeId === variantRecipeId)
              ? variantRecipe
              : recipe
          )
        )
      }
    } catch (error) {
      console.error('Failed to load variant recipe:', error)
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
        {/* FR-047: Add Recipe button for admins */}
        {isAdmin && (
          <button
            className="add-recipe-button"
            onClick={() => setShowNewRecipe(true)}
          >
            + Add Recipe
          </button>
        )}
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
            <RecipeCard
              key={recipe.id}
              recipe={recipe}
              currentMealType={activeMeal}
              onEdit={handleEdit}
              onSelectVariant={handleSelectVariant}
            />
          ))}
          {recipes.length === 0 && (
            <p className="no-recipes">No recipes found for {activeMeal}.</p>
          )}
        </div>
      )}

      {/* FR-033: Recipe Edit Modal */}
      {editingRecipeId && (
        <RecipeEditModal
          recipeId={editingRecipeId}
          isNew={false}
          onClose={handleModalClose}
          onSave={handleRecipeSave}
        />
      )}

      {/* FR-047: New Recipe Modal */}
      {showNewRecipe && (
        <RecipeEditModal
          recipeId={null}
          isNew={true}
          onClose={handleModalClose}
          onSave={handleRecipeSave}
        />
      )}
    </div>
  )
}

export default RecipeList
