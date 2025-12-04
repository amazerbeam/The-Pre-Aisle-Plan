import { useState, useEffect } from 'react'
import './RecipeInfoForm.css'

/**
 * Form for editing recipe basic info (FR-033).
 * Fields: name, default servings, calories, meal types, cheat flag, visibility.
 */
function RecipeInfoForm({ recipe, isNew, onSave, onCancel, setHasUnsavedChanges }) {
  const [name, setName] = useState('')
  const [defaultServings, setDefaultServings] = useState(2)
  const [calories, setCalories] = useState(0)
  const [mealTypes, setMealTypes] = useState([])
  const [isCheat, setIsCheat] = useState(false)
  const [isLive, setIsLive] = useState(false)
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)

  const MEAL_TYPE_OPTIONS = [
    { key: 'breakfast', label: 'Breakfast' },
    { key: 'lunch', label: 'Lunch' },
    { key: 'dinner', label: 'Dinner' },
    { key: 'snacks', label: 'Snacks' }
  ]

  // Initialize form with recipe data
  useEffect(() => {
    if (recipe) {
      setName(recipe.name || '')
      setDefaultServings(recipe.defaultServings || 2)
      setCalories(recipe.calories || 0)
      setMealTypes(recipe.mealTypes || [])
      setIsCheat(recipe.isCheat || false)
      setIsLive(recipe.isLive || false)
    }
  }, [recipe])

  // Track changes
  useEffect(() => {
    const hasChanges =
      name !== (recipe?.name || '') ||
      defaultServings !== (recipe?.defaultServings || 2) ||
      calories !== (recipe?.calories || 0) ||
      JSON.stringify(mealTypes.sort()) !== JSON.stringify((recipe?.mealTypes || []).sort()) ||
      isCheat !== (recipe?.isCheat || false) ||
      isLive !== (recipe?.isLive || false)

    setHasUnsavedChanges(hasChanges)
  }, [name, defaultServings, calories, mealTypes, isCheat, isLive, recipe, setHasUnsavedChanges])

  // Handle meal type toggle
  const handleMealTypeChange = (mealKey) => {
    setMealTypes(prev =>
      prev.includes(mealKey)
        ? prev.filter(m => m !== mealKey)
        : [...prev, mealKey]
    )
  }

  // Validate form
  const validate = () => {
    const newErrors = {}

    if (!name.trim()) {
      newErrors.name = 'Recipe name is required'
    }

    if (defaultServings < 1) {
      newErrors.defaultServings = 'Servings must be at least 1'
    }

    if (calories < 0) {
      newErrors.calories = 'Calories cannot be negative'
    }

    if (mealTypes.length === 0) {
      newErrors.mealTypes = 'Select at least one meal type'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Handle save
  const handleSave = async () => {
    if (!validate()) return

    setSaving(true)
    try {
      await onSave({
        name: name.trim(),
        defaultServings,
        calories,
        mealTypes,
        isCheat,
        isLive: isNew ? false : isLive // FR-047: New recipes can't be live
      })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="recipe-info-form">
      <h3 className="form-title">Recipe Info</h3>

      {/* Recipe Name */}
      <div className="form-group">
        <label htmlFor="recipe-name">Recipe Name *</label>
        <input
          id="recipe-name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter recipe name"
          className={errors.name ? 'error' : ''}
        />
        {errors.name && <span className="error-text">{errors.name}</span>}
      </div>

      {/* Default Servings */}
      <div className="form-row">
        <div className="form-group">
          <label htmlFor="default-servings">Default Servings *</label>
          <input
            id="default-servings"
            type="number"
            min="1"
            max="20"
            value={defaultServings}
            onChange={(e) => setDefaultServings(parseInt(e.target.value) || 1)}
            className={errors.defaultServings ? 'error' : ''}
          />
          {errors.defaultServings && <span className="error-text">{errors.defaultServings}</span>}
        </div>

        {/* Calories */}
        <div className="form-group">
          <label htmlFor="calories">Calories (per serving) *</label>
          <input
            id="calories"
            type="number"
            min="0"
            value={calories}
            onChange={(e) => setCalories(parseInt(e.target.value) || 0)}
            className={errors.calories ? 'error' : ''}
          />
          {errors.calories && <span className="error-text">{errors.calories}</span>}
        </div>
      </div>

      {/* Meal Types */}
      <div className="form-group">
        <label>Meal Types *</label>
        <div className="checkbox-group">
          {MEAL_TYPE_OPTIONS.map(option => (
            <label key={option.key} className="checkbox-label">
              <input
                type="checkbox"
                checked={mealTypes.includes(option.key)}
                onChange={() => handleMealTypeChange(option.key)}
              />
              <span>{option.label}</span>
            </label>
          ))}
        </div>
        {errors.mealTypes && <span className="error-text">{errors.mealTypes}</span>}
      </div>

      {/* Cheat Meal */}
      <div className="form-group">
        <label className="checkbox-label">
          <input
            type="checkbox"
            checked={isCheat}
            onChange={(e) => setIsCheat(e.target.checked)}
          />
          <span>Cheat Meal</span>
        </label>
        <p className="help-text">Cheat meals are limited to one per meal type per week.</p>
      </div>

      {/* Visibility - only for existing recipes */}
      {!isNew && (
        <div className="form-group">
          <label>Visibility</label>
          <div className="toggle-group">
            <button
              type="button"
              className={`toggle-button ${!isLive ? 'active' : ''}`}
              onClick={() => setIsLive(false)}
            >
              Hidden
            </button>
            <button
              type="button"
              className={`toggle-button ${isLive ? 'active' : ''}`}
              onClick={() => setIsLive(true)}
            >
              Live
            </button>
          </div>
          <p className="help-text">
            {isLive
              ? 'This recipe is visible to all users.'
              : 'This recipe is only visible to admins.'}
          </p>
        </div>
      )}

      {isNew && (
        <div className="info-banner">
          New recipes start as Hidden and can be set to Live after saving.
        </div>
      )}

      {/* Actions */}
      <div className="form-actions">
        <button
          type="button"
          className="btn-secondary"
          onClick={onCancel}
          disabled={saving}
        >
          Cancel
        </button>
        <button
          type="button"
          className="btn-primary"
          onClick={handleSave}
          disabled={saving}
        >
          {saving ? 'Saving...' : 'Save'}
        </button>
      </div>
    </div>
  )
}

export default RecipeInfoForm
