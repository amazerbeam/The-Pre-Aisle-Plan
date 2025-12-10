import { useState, useEffect, useRef } from 'react'
import { adminService } from '../../services/adminService'
import './RecipeIngredientsForm.css'

/**
 * Form for editing recipe ingredients with autocomplete (FR-044, FR-045).
 * Features: autocomplete, reorder arrows, add position selector, new item detection.
 */
function RecipeIngredientsForm({ ingredients: initialIngredients, onSave, onCancel, setHasUnsavedChanges }) {
  const [ingredients, setIngredients] = useState([])
  const [newIngredients, setNewIngredients] = useState([])
  const [newUnits, setNewUnits] = useState([])
  const [allIngredients, setAllIngredients] = useState([])
  const [allUnits, setAllUnits] = useState([])
  const [allAisles, setAllAisles] = useState([])
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [addPosition, setAddPosition] = useState('bottom')
  const [addAfterIndex, setAddAfterIndex] = useState(0)
  const [showNewItemsConfirm, setShowNewItemsConfirm] = useState(false)
  const [saving, setSaving] = useState(false)
  const formRef = useRef(null)

  // Load reference data
  useEffect(() => {
    loadReferenceData()
  }, [])

  // Initialize with existing ingredients
  useEffect(() => {
    if (initialIngredients) {
      setIngredients(initialIngredients.map((ing, idx) => ({
        ...ing,
        tempId: `existing-${idx}`,
        sortOrder: idx
      })))
    }
  }, [initialIngredients])

  // Track changes
  useEffect(() => {
    const hasChanges = JSON.stringify(ingredients) !== JSON.stringify(initialIngredients?.map((ing, idx) => ({
      ...ing,
      tempId: `existing-${idx}`,
      sortOrder: idx
    })) || [])
    setHasUnsavedChanges(hasChanges)
  }, [ingredients, initialIngredients, setHasUnsavedChanges])

  const loadReferenceData = async () => {
    try {
      const [ingredientsData, unitsData, aislesData] = await Promise.all([
        adminService.getAllIngredients(),
        adminService.getAllUnits(),
        adminService.getAllAisles()
      ])
      setAllIngredients(ingredientsData)
      setAllUnits(unitsData)
      setAllAisles(aislesData)
    } catch (err) {
      console.error('Error loading reference data:', err)
    }
  }

  // Move ingredient up
  const moveUp = (index) => {
    if (index === 0) return
    const newList = [...ingredients]
    ;[newList[index - 1], newList[index]] = [newList[index], newList[index - 1]]
    setIngredients(newList.map((ing, idx) => ({ ...ing, sortOrder: idx })))
  }

  // Move ingredient down
  const moveDown = (index) => {
    if (index === ingredients.length - 1) return
    const newList = [...ingredients]
    ;[newList[index], newList[index + 1]] = [newList[index + 1], newList[index]]
    setIngredients(newList.map((ing, idx) => ({ ...ing, sortOrder: idx })))
  }

  // Delete ingredient
  const deleteIngredient = (index) => {
    setIngredients(prev => prev.filter((_, i) => i !== index).map((ing, idx) => ({ ...ing, sortOrder: idx })))
  }

  // Update ingredient field
  const updateIngredient = (index, field, value) => {
    setIngredients(prev => prev.map((ing, i) =>
      i === index ? { ...ing, [field]: value } : ing
    ))
  }

  // Add new ingredient
  const handleAddIngredient = () => {
    const newIng = {
      tempId: `new-${Date.now()}`,
      ingredientId: null,
      ingredientName: '',
      quantity: 1,
      unitId: null,
      unitKey: null,
      unitValue: '',
      quantityGrams: null,  // FR-084: Gram equivalent for macro calculation
      sortOrder: 0,
      aisleId: null,
      isNewIngredient: false,
      isNewUnit: false
    }

    let newList
    if (addPosition === 'bottom') {
      newList = [...ingredients, newIng]
    } else if (addPosition === 'start') {
      newList = [newIng, ...ingredients]
    } else {
      newList = [
        ...ingredients.slice(0, addAfterIndex + 1),
        newIng,
        ...ingredients.slice(addAfterIndex + 1)
      ]
    }

    setIngredients(newList.map((ing, idx) => ({ ...ing, sortOrder: idx })))
    setShowAddDialog(false)
  }

  // Handle ingredient selection from autocomplete
  const handleIngredientSelect = (index, selectedIngredient) => {
    if (selectedIngredient) {
      updateIngredient(index, 'ingredientId', selectedIngredient.id)
      updateIngredient(index, 'ingredientName', selectedIngredient.name)
      updateIngredient(index, 'ingredientKey', selectedIngredient.key)
      updateIngredient(index, 'aisleId', selectedIngredient.aisleId)
      updateIngredient(index, 'aisleName', selectedIngredient.aisleName)
      updateIngredient(index, 'isNewIngredient', false)
    }
  }

  // Handle new ingredient creation
  const handleNewIngredient = (index, name) => {
    updateIngredient(index, 'ingredientId', null)
    updateIngredient(index, 'ingredientName', name)
    updateIngredient(index, 'ingredientKey', null)
    updateIngredient(index, 'isNewIngredient', true)
  }

  // Handle unit selection from autocomplete
  const handleUnitSelect = (index, selectedUnit, currentQuantity) => {
    if (selectedUnit) {
      updateIngredient(index, 'unitId', selectedUnit.id)
      updateIngredient(index, 'unitKey', selectedUnit.key)
      updateIngredient(index, 'unitValue', selectedUnit.value)
      updateIngredient(index, 'isNewUnit', false)

      // FR-084: Auto-fill quantityGrams when unit is grams
      if (selectedUnit.key === 'g' && currentQuantity) {
        updateIngredient(index, 'quantityGrams', currentQuantity)
      }
    }
  }

  // Handle new unit creation
  const handleNewUnit = (index, value) => {
    updateIngredient(index, 'unitId', null)
    updateIngredient(index, 'unitKey', null)
    updateIngredient(index, 'unitValue', value)
    updateIngredient(index, 'isNewUnit', true)
  }

  // Prepare save - check for new items
  const handleSaveClick = () => {
    // Collect new ingredients and units
    const newIngs = ingredients
      .filter(ing => ing.isNewIngredient && ing.ingredientName)
      .map(ing => ({
        name: ing.ingredientName,
        aisleId: ing.aisleId,
        tempId: ing.tempId
      }))

    const newUns = ingredients
      .filter(ing => ing.isNewUnit && ing.unitValue)
      .map(ing => ({
        value: ing.unitValue,
        tempId: ing.tempId
      }))
      .filter((unit, idx, arr) => arr.findIndex(u => u.value === unit.value) === idx) // Remove duplicates

    if (newIngs.length > 0 || newUns.length > 0) {
      setNewIngredients(newIngs)
      setNewUnits(newUns)
      setShowNewItemsConfirm(true)
    } else {
      doSave([], [])
    }
  }

  // Actually save
  const doSave = async (newIngs, newUns) => {
    setSaving(true)
    try {
      await onSave({
        ingredients: ingredients.map((ing, idx) => ({
          ...ing,
          sortOrder: idx
        })),
        newIngredients: newIngs,
        newUnits: newUns
      })
    } finally {
      setSaving(false)
      setShowNewItemsConfirm(false)
    }
  }

  return (
    <div className="recipe-ingredients-form" ref={formRef}>
      {/* Sticky Add Button */}
      <div className="sticky-header">
        <h3 className="form-title">Ingredients ({ingredients.length})</h3>
        <button
          type="button"
          className="btn-primary add-button"
          onClick={() => setShowAddDialog(true)}
        >
          + Add Ingredient
        </button>
      </div>

      {/* Ingredient List */}
      <div className="ingredients-list">
        {ingredients.length === 0 ? (
          <div className="empty-message">
            No ingredients yet. Click "Add Ingredient" to start.
          </div>
        ) : (
          ingredients.map((ingredient, index) => (
            <IngredientRow
              key={ingredient.tempId || index}
              ingredient={ingredient}
              index={index}
              isFirst={index === 0}
              isLast={index === ingredients.length - 1}
              allIngredients={allIngredients}
              allUnits={allUnits}
              allAisles={allAisles}
              onMoveUp={() => moveUp(index)}
              onMoveDown={() => moveDown(index)}
              onDelete={() => deleteIngredient(index)}
              onUpdate={(field, value) => updateIngredient(index, field, value)}
              onIngredientSelect={(ing) => handleIngredientSelect(index, ing)}
              onNewIngredient={(name) => handleNewIngredient(index, name)}
              onUnitSelect={(unit) => handleUnitSelect(index, unit, ingredients[index]?.quantity)}
              onNewUnit={(value) => handleNewUnit(index, value)}
            />
          ))
        )}
      </div>

      {/* Form Actions */}
      <div className="form-actions">
        <button type="button" className="btn-secondary" onClick={onCancel} disabled={saving}>
          Cancel
        </button>
        <button type="button" className="btn-primary" onClick={handleSaveClick} disabled={saving}>
          {saving ? 'Saving...' : 'Save'}
        </button>
      </div>

      {/* Add Position Dialog */}
      {showAddDialog && (
        <div className="dialog-overlay" onClick={() => setShowAddDialog(false)}>
          <div className="dialog" onClick={e => e.stopPropagation()}>
            <h4>Add Ingredient Position</h4>
            <div className="dialog-options">
              <label className="radio-label">
                <input
                  type="radio"
                  name="position"
                  value="bottom"
                  checked={addPosition === 'bottom'}
                  onChange={() => setAddPosition('bottom')}
                />
                <span>Bottom</span>
              </label>
              <label className="radio-label">
                <input
                  type="radio"
                  name="position"
                  value="start"
                  checked={addPosition === 'start'}
                  onChange={() => setAddPosition('start')}
                />
                <span>Start</span>
              </label>
              <label className="radio-label">
                <input
                  type="radio"
                  name="position"
                  value="after"
                  checked={addPosition === 'after'}
                  onChange={() => setAddPosition('after')}
                />
                <span>After ingredient:</span>
              </label>
              {addPosition === 'after' && (
                <select
                  value={addAfterIndex}
                  onChange={(e) => setAddAfterIndex(parseInt(e.target.value))}
                  className="after-select"
                >
                  {ingredients.map((ing, idx) => (
                    <option key={idx} value={idx}>
                      {idx + 1}. {ing.ingredientName || '(unnamed)'}
                    </option>
                  ))}
                </select>
              )}
            </div>
            <div className="dialog-actions">
              <button className="btn-secondary" onClick={() => setShowAddDialog(false)}>Cancel</button>
              <button className="btn-primary" onClick={handleAddIngredient}>Add</button>
            </div>
          </div>
        </div>
      )}

      {/* New Items Confirmation Dialog */}
      {showNewItemsConfirm && (
        <div className="dialog-overlay">
          <div className="dialog">
            <h4>Creating New Items</h4>
            <p>You are creating the following new items:</p>
            {newIngredients.length > 0 && (
              <div className="new-items-list">
                <strong>New Ingredients:</strong>
                <ul>
                  {newIngredients.map((ing, idx) => (
                    <li key={idx}>{ing.name}</li>
                  ))}
                </ul>
              </div>
            )}
            {newUnits.length > 0 && (
              <div className="new-items-list">
                <strong>New Units:</strong>
                <ul>
                  {newUnits.map((unit, idx) => (
                    <li key={idx}>{unit.value}</li>
                  ))}
                </ul>
              </div>
            )}
            <div className="dialog-actions">
              <button className="btn-secondary" onClick={() => setShowNewItemsConfirm(false)}>Cancel</button>
              <button className="btn-primary" onClick={() => doSave(newIngredients, newUnits)}>
                Continue
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

/**
 * Single ingredient row component
 */
function IngredientRow({
  ingredient,
  index,
  isFirst,
  isLast,
  allIngredients,
  allUnits,
  allAisles,
  onMoveUp,
  onMoveDown,
  onDelete,
  onUpdate,
  onIngredientSelect,
  onNewIngredient,
  onUnitSelect,
  onNewUnit
}) {
  const [ingredientSearch, setIngredientSearch] = useState(ingredient.ingredientName || '')
  const [unitSearch, setUnitSearch] = useState(ingredient.unitValue || '')
  const [showIngredientDropdown, setShowIngredientDropdown] = useState(false)
  const [showUnitDropdown, setShowUnitDropdown] = useState(false)
  const [filteredIngredients, setFilteredIngredients] = useState([])
  const [filteredUnits, setFilteredUnits] = useState([])
  const ingredientRef = useRef(null)
  const unitRef = useRef(null)

  // Filter ingredients on search
  useEffect(() => {
    if (ingredientSearch.length >= 2) {
      const filtered = allIngredients.filter(ing =>
        ing.name.toLowerCase().includes(ingredientSearch.toLowerCase())
      ).slice(0, 10)
      setFilteredIngredients(filtered)
    } else if (showIngredientDropdown) {
      setFilteredIngredients(allIngredients.slice(0, 10))
    }
  }, [ingredientSearch, allIngredients, showIngredientDropdown])

  // Filter units on search
  useEffect(() => {
    if (unitSearch.length >= 1) {
      const filtered = allUnits.filter(unit =>
        unit.value.toLowerCase().includes(unitSearch.toLowerCase())
      )
      setFilteredUnits(filtered)
    } else {
      setFilteredUnits(allUnits)
    }
  }, [unitSearch, allUnits])

  // Handle ingredient input change
  const handleIngredientChange = (value) => {
    setIngredientSearch(value)
    onUpdate('ingredientName', value)

    // Check if this is a new ingredient
    const exists = allIngredients.some(ing =>
      ing.name.toLowerCase() === value.toLowerCase()
    )
    if (!exists && value.trim()) {
      onNewIngredient(value)
    }
  }

  // Handle unit input change
  const handleUnitChange = (value) => {
    setUnitSearch(value)
    onUpdate('unitValue', value)

    // Check if this is a new unit
    const exists = allUnits.some(unit =>
      unit.value.toLowerCase() === value.toLowerCase()
    )
    if (!exists && value.trim()) {
      onNewUnit(value)
    }
  }

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (ingredientRef.current && !ingredientRef.current.contains(e.target)) {
        setShowIngredientDropdown(false)
      }
      if (unitRef.current && !unitRef.current.contains(e.target)) {
        setShowUnitDropdown(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div className={`ingredient-row ${ingredient.isNewIngredient ? 'new-ingredient' : ''}`}>
      {/* Move arrows */}
      <div className="row-arrows">
        <button
          type="button"
          className="arrow-button"
          onClick={onMoveUp}
          disabled={isFirst}
          title="Move up"
        >
          ↑
        </button>
        <button
          type="button"
          className="arrow-button"
          onClick={onMoveDown}
          disabled={isLast}
          title="Move down"
        >
          ↓
        </button>
      </div>

      {/* Ingredient autocomplete */}
      <div className="autocomplete-container" ref={ingredientRef}>
        <input
          type="text"
          value={ingredientSearch}
          onChange={(e) => handleIngredientChange(e.target.value)}
          onFocus={() => setShowIngredientDropdown(true)}
          placeholder="Ingredient name"
          className="ingredient-input"
        />
        {ingredient.isNewIngredient && (
          <span className="new-badge">NEW</span>
        )}
        {showIngredientDropdown && filteredIngredients.length > 0 && (
          <ul className="autocomplete-dropdown">
            {filteredIngredients.map(ing => (
              <li
                key={ing.id}
                onClick={() => {
                  setIngredientSearch(ing.name)
                  onIngredientSelect(ing)
                  setShowIngredientDropdown(false)
                }}
              >
                <span className="ing-name">{ing.name}</span>
                <span className="ing-aisle">({ing.aisleName})</span>
              </li>
            ))}
          </ul>
        )}
        {/* Aisle selector for new ingredients */}
        {ingredient.isNewIngredient && (
          <select
            value={ingredient.aisleId || ''}
            onChange={(e) => onUpdate('aisleId', parseInt(e.target.value))}
            className="aisle-select"
            required
          >
            <option value="">Select aisle...</option>
            {allAisles.map(aisle => (
              <option key={aisle.id} value={aisle.id}>{aisle.name}</option>
            ))}
          </select>
        )}
      </div>

      {/* Quantity */}
      <input
        type="number"
        value={ingredient.quantity || ''}
        onChange={(e) => onUpdate('quantity', parseFloat(e.target.value) || 0)}
        placeholder="Qty"
        className="quantity-input"
        min="0"
        step="0.25"
      />

      {/* Unit autocomplete */}
      <div className="autocomplete-container unit-container" ref={unitRef}>
        <input
          type="text"
          value={unitSearch}
          onChange={(e) => handleUnitChange(e.target.value)}
          onFocus={() => setShowUnitDropdown(true)}
          placeholder="Unit"
          className="unit-input"
        />
        {ingredient.isNewUnit && (
          <span className="new-badge">NEW</span>
        )}
        {showUnitDropdown && filteredUnits.length > 0 && (
          <ul className="autocomplete-dropdown">
            {filteredUnits.map(unit => (
              <li
                key={unit.id}
                onClick={() => {
                  setUnitSearch(unit.value)
                  onUnitSelect(unit)
                  setShowUnitDropdown(false)
                }}
              >
                {unit.value}
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* FR-084: Weight in grams for macro calculation */}
      <input
        type="number"
        value={ingredient.quantityGrams || ''}
        onChange={(e) => onUpdate('quantityGrams', parseFloat(e.target.value) || null)}
        placeholder="g"
        className="grams-input"
        min="0"
        step="0.01"
        title="Weight in grams (for macro calculation)"
      />

      {/* Delete button */}
      <button
        type="button"
        className="delete-button"
        onClick={onDelete}
        title="Delete ingredient"
      >
        ×
      </button>
    </div>
  )
}

export default RecipeIngredientsForm
