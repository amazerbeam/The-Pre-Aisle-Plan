import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { useMealPlan } from '../../contexts/MealPlanContext'
import recipeService from '../../services/recipeService'
import RecipeCard from './RecipeCard'
import RecipeEditModal from '../admin/RecipeEditModal'
import './RecipeList.css'

const MEAL_TYPES = ['breakfast', 'lunch', 'dinner', 'snacks', 'extras']

function RecipeList() {
  const { isAdmin } = useAuth()
  const { weekPlan } = useMealPlan()
  const [recipes, setRecipes] = useState([])
  const [activeMeal, setActiveMeal] = useState('breakfast')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  // FR-033: Admin edit modal state
  const [editingRecipeId, setEditingRecipeId] = useState(null)
  const [showNewRecipe, setShowNewRecipe] = useState(false)

  /**
   * Get all recipe IDs currently in the user's meal plan
   */
  const getMealPlanRecipeIds = useCallback(() => {
    if (!weekPlan?.days) return new Set()

    const recipeIds = new Set()
    weekPlan.days.forEach(day => {
      if (day.mealsByType) {
        Object.values(day.mealsByType).forEach(entries => {
          entries.forEach(entry => {
            if (entry.recipe?.id) {
              recipeIds.add(entry.recipe.id)
            }
          })
        })
      }
    })
    return recipeIds
  }, [weekPlan])

  /**
   * Swap recipes with variants if the variant is in the meal plan
   */
  const swapWithMealPlanVariants = useCallback(async (loadedRecipes) => {
    const mealPlanRecipeIds = getMealPlanRecipeIds()
    if (mealPlanRecipeIds.size === 0) return loadedRecipes

    const swappedRecipes = await Promise.all(
      loadedRecipes.map(async (recipe) => {
        // Check if this recipe has variants
        if (!recipe.variants || recipe.variants.length < 2) return recipe

        // Check if any variant (other than current) is in the meal plan
        const variantInPlan = recipe.variants.find(
          v => v.recipeId !== recipe.id && mealPlanRecipeIds.has(v.recipeId)
        )

        if (variantInPlan) {
          // Fetch and return the variant instead
          try {
            const variantRecipe = await recipeService.getRecipeById(variantInPlan.recipeId)
            return variantRecipe || recipe
          } catch (err) {
            console.error('Failed to load variant:', err)
            return recipe
          }
        }

        return recipe
      })
    )

    return swappedRecipes
  }, [getMealPlanRecipeIds])

  /**
   * Load recipes and swap with meal plan variants
   */
  const loadRecipes = useCallback(async (mealType) => {
    setLoading(true)
    setError(null)
    try {
      // Admin users see all recipes (including hidden), regular users see only live recipes
      const data = isAdmin
        ? await recipeService.getAllRecipesAdmin(mealType)
        : await recipeService.getRecipesByMealType(mealType)

      // Swap default recipes with variants if variant is in meal plan
      const swappedData = await swapWithMealPlanVariants(data)
      setRecipes(swappedData)
    } catch (err) {
      setError('Failed to load recipes. Please try again.')
      console.error('Error loading recipes:', err)
    } finally {
      setLoading(false)
    }
  }, [isAdmin, swapWithMealPlanVariants])

  useEffect(() => {
    loadRecipes(activeMeal)
  }, [activeMeal, loadRecipes])

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
