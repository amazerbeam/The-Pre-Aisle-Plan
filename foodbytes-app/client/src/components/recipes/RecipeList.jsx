import { useState, useEffect, useCallback, useRef } from 'react'
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

  // FR-101: Use ref to track weekPlan without causing callback recreation
  // This breaks the dependency chain that causes double spinner
  const weekPlanRef = useRef(weekPlan)
  useEffect(() => {
    weekPlanRef.current = weekPlan
  }, [weekPlan])

  /**
   * FR-101: Get all recipe IDs currently in the user's meal plan.
   * Uses ref instead of direct dependency to avoid recreation on weekPlan changes.
   */
  const getMealPlanRecipeIds = useCallback(() => {
    const currentWeekPlan = weekPlanRef.current
    if (!currentWeekPlan?.days) return new Set()

    const recipeIds = new Set()
    currentWeekPlan.days.forEach(day => {
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
  }, []) // Empty deps - reads from ref

  /**
   * FR-102: Swap recipes with variants if the variant is in the meal plan.
   * Uses summary data - only needs to check variant IDs, no full data fetch needed.
   */
  const swapWithMealPlanVariants = useCallback((loadedRecipes) => {
    const mealPlanRecipeIds = getMealPlanRecipeIds()
    if (mealPlanRecipeIds.size === 0) return loadedRecipes

    return loadedRecipes.map((recipe) => {
      // Check if this recipe has variants
      if (!recipe.variants || recipe.variants.length < 2) return recipe

      // Check if any variant (other than current) is in the meal plan
      const variantInPlan = recipe.variants.find(
        v => v.recipeId !== recipe.id && mealPlanRecipeIds.has(v.recipeId)
      )

      if (variantInPlan) {
        // FR-102: Create a summary-like object from variant info
        // This avoids needing to fetch full recipe data
        return {
          ...recipe,
          id: variantInPlan.recipeId,
          name: variantInPlan.recipeName,
          variantLabel: variantInPlan.variantLabel,
          isDefault: variantInPlan.isDefault,
          calories: variantInPlan.caloriesPerServing * recipe.defaultServings
        }
      }

      return recipe
    })
  }, [getMealPlanRecipeIds])

  /**
   * FR-102: Load lightweight recipe summaries (no ingredients/steps).
   * FR-101: Only depends on isAdmin, not on weekPlan.
   */
  const loadRecipes = useCallback(async (mealType) => {
    setLoading(true)
    setError(null)
    try {
      // FR-102: Use summary endpoint for lightweight data
      // Admin users see all recipes (including hidden), regular users see only live recipes
      const data = isAdmin
        ? await recipeService.getAllRecipesAdmin(mealType)
        : await recipeService.getRecipeSummariesByMealType(mealType)

      // Swap default recipes with variants if variant is in meal plan
      const swappedData = swapWithMealPlanVariants(data)
      setRecipes(swappedData)
    } catch (err) {
      setError('Failed to load recipes. Please try again.')
      console.error('Error loading recipes:', err)
    } finally {
      setLoading(false)
    }
  }, [isAdmin, swapWithMealPlanVariants])

  // FR-101: Only reload on tab change, not on weekPlan changes
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
