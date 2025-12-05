import { useState, useEffect, useRef } from 'react'
import './RecipeStepsForm.css'

/**
 * Form for editing recipe steps with reorder functionality (FR-046).
 * Features: up/down reorder arrows, add position selector, immediate removal.
 */
function RecipeStepsForm({ steps: initialSteps, onSave, onCancel, setHasUnsavedChanges }) {
  const [steps, setSteps] = useState([])
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [addPosition, setAddPosition] = useState('bottom')
  const [addAfterIndex, setAddAfterIndex] = useState(0)
  const [saving, setSaving] = useState(false)
  const formRef = useRef(null)

  // Initialize with existing steps
  useEffect(() => {
    if (initialSteps) {
      setSteps(initialSteps.map((step, idx) => ({
        ...step,
        tempId: `existing-${idx}`,
        stepNumber: idx + 1
      })))
    }
  }, [initialSteps])

  // Track changes
  useEffect(() => {
    const hasChanges = JSON.stringify(steps.map(s => s.instruction)) !==
      JSON.stringify(initialSteps?.map(s => s.instruction) || [])
    setHasUnsavedChanges(hasChanges)
  }, [steps, initialSteps, setHasUnsavedChanges])

  // Move step up
  const moveUp = (index) => {
    if (index === 0) return
    const newList = [...steps]
    ;[newList[index - 1], newList[index]] = [newList[index], newList[index - 1]]
    setSteps(newList.map((step, idx) => ({ ...step, stepNumber: idx + 1 })))
  }

  // Move step down
  const moveDown = (index) => {
    if (index === steps.length - 1) return
    const newList = [...steps]
    ;[newList[index], newList[index + 1]] = [newList[index + 1], newList[index]]
    setSteps(newList.map((step, idx) => ({ ...step, stepNumber: idx + 1 })))
  }

  // Delete step (immediate removal - can undo by not saving)
  const deleteStep = (index) => {
    setSteps(prev => prev.filter((_, i) => i !== index).map((step, idx) => ({
      ...step,
      stepNumber: idx + 1
    })))
  }

  // Update step instruction
  const updateStep = (index, instruction) => {
    setSteps(prev => prev.map((step, i) =>
      i === index ? { ...step, instruction } : step
    ))
  }

  // Add new step
  const handleAddStep = () => {
    const newStep = {
      tempId: `new-${Date.now()}`,
      stepNumber: 0,
      instruction: ''
    }

    let newList
    if (addPosition === 'bottom') {
      newList = [...steps, newStep]
    } else if (addPosition === 'start') {
      newList = [newStep, ...steps]
    } else {
      newList = [
        ...steps.slice(0, addAfterIndex + 1),
        newStep,
        ...steps.slice(addAfterIndex + 1)
      ]
    }

    setSteps(newList.map((step, idx) => ({ ...step, stepNumber: idx + 1 })))
    setShowAddDialog(false)
  }

  // Handle save - server will clean empty steps
  const handleSave = async () => {
    setSaving(true)
    try {
      // Filter out completely empty steps before saving
      const validSteps = steps
        .filter(step => step.instruction && step.instruction.trim())
        .map((step, idx) => ({
          ...step,
          stepNumber: idx + 1
        }))

      await onSave(validSteps)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="recipe-steps-form" ref={formRef}>
      {/* Sticky Header with Add Button */}
      <div className="sticky-header">
        <h3 className="form-title">Steps ({steps.length})</h3>
        <button
          type="button"
          className="btn-primary add-button"
          onClick={() => setShowAddDialog(true)}
        >
          + Add Step
        </button>
      </div>

      {/* Steps List */}
      <div className="steps-list">
        {steps.length === 0 ? (
          <div className="empty-message">
            No steps yet. Click "Add Step" to start.
          </div>
        ) : (
          steps.map((step, index) => (
            <div key={step.tempId || index} className="step-row">
              {/* Move arrows */}
              <div className="row-arrows">
                <button
                  type="button"
                  className="arrow-button"
                  onClick={() => moveUp(index)}
                  disabled={index === 0}
                  title="Move up"
                >
                  ↑
                </button>
                <button
                  type="button"
                  className="arrow-button"
                  onClick={() => moveDown(index)}
                  disabled={index === steps.length - 1}
                  title="Move down"
                >
                  ↓
                </button>
              </div>

              {/* Step number */}
              <div className="step-number">
                {index + 1}
              </div>

              {/* Step instruction textarea */}
              <textarea
                value={step.instruction || ''}
                onChange={(e) => updateStep(index, e.target.value)}
                placeholder="Enter step instruction..."
                className="step-textarea"
                rows={2}
              />

              {/* Delete button */}
              <button
                type="button"
                className="delete-button"
                onClick={() => deleteStep(index)}
                title="Delete step"
              >
                ×
              </button>
            </div>
          ))
        )}
      </div>

      {/* Form Actions */}
      <div className="form-actions">
        <button type="button" className="btn-secondary" onClick={onCancel} disabled={saving}>
          Cancel
        </button>
        <button type="button" className="btn-primary" onClick={handleSave} disabled={saving}>
          {saving ? 'Saving...' : 'Save'}
        </button>
      </div>

      {/* Add Position Dialog */}
      {showAddDialog && (
        <div className="dialog-overlay" onClick={() => setShowAddDialog(false)}>
          <div className="dialog" onClick={e => e.stopPropagation()}>
            <h4>Add Step Position</h4>
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
              {steps.length > 0 && (
                <>
                  <label className="radio-label">
                    <input
                      type="radio"
                      name="position"
                      value="after"
                      checked={addPosition === 'after'}
                      onChange={() => setAddPosition('after')}
                    />
                    <span>After step:</span>
                  </label>
                  {addPosition === 'after' && (
                    <select
                      value={addAfterIndex}
                      onChange={(e) => setAddAfterIndex(parseInt(e.target.value))}
                      className="after-select"
                    >
                      {steps.map((step, idx) => (
                        <option key={idx} value={idx}>
                          Step {idx + 1}: {step.instruction?.substring(0, 30) || '(empty)'}...
                        </option>
                      ))}
                    </select>
                  )}
                </>
              )}
            </div>
            <div className="dialog-actions">
              <button className="btn-secondary" onClick={() => setShowAddDialog(false)}>Cancel</button>
              <button className="btn-primary" onClick={handleAddStep}>Add</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default RecipeStepsForm
