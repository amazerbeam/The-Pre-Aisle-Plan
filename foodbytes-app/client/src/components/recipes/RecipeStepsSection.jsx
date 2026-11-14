/**
 * FR-091: Steps list for RecipeViewModal, shown as tappable cards. Tap a card to mark it done
 * (screen-only); the first unfinished step is highlighted. A homemade linked step keeps its
 * instruction text and gets a separate "Open ... recipe" button; a store-bought one shows the
 * step's altInstruction with a tag. `done` / `onToggleDone` are controlled by the modal so the
 * tab label can show the count. Styles live in RecipeViewModal.css (.rv-step-list, .step*).
 */
function RecipeStepsSection({ steps, isHomemade, onLinkedStepClick, done, onToggleDone, onStartCook }) {
  const list = steps || []
  const current = list.findIndex((_, i) => !done.has(i))
  const cookFrom = current === -1 ? 0 : current

  const handleKeyDown = (e, idx) => {
    if (e.target !== e.currentTarget || (e.key !== ' ' && e.key !== 'Enter')) return
    e.preventDefault()
    onToggleDone(idx)
  }

  return (
    <section className="steps-section">
      <h3>
        Steps
        <small>{done.size}/{list.length} done</small>
        {list.length > 0 && (
          <button type="button" className="cookbtn" onClick={() => onStartCook(cookFrom)}>▶ Cook mode</button>
        )}
      </h3>
      {list.length > 0 ? (
        <ol className="rv-step-list">
          {list.map((step, idx) => {
            // Handle both old format (string) and new format (object)
            const stepObj = typeof step === 'string' ? { instruction: step } : step

            // FR-091: Determine what to display based on linked recipe state
            const hasLink = stepObj.linkedRecipeId != null
            const homemade = hasLink ? isHomemade(stepObj.linkedRecipeId) : true

            // Show alt instruction if linked and store-bought
            const displayText = hasLink && !homemade && stepObj.altInstruction
              ? stepObj.altInstruction
              : stepObj.instruction

            const isDone = done.has(idx)
            return (
              <li
                key={idx}
                role="checkbox"
                aria-checked={isDone}
                tabIndex={0}
                className={`step${isDone ? ' done' : ''}${idx === current ? ' cur' : ''}`}
                onClick={() => onToggleDone(idx)}
                onKeyDown={(e) => handleKeyDown(e, idx)}
              >
                <span className="num" aria-hidden="true">{isDone ? '✓' : idx + 1}</span>
                <div>
                  <div className="txt">{displayText}</div>
                  {hasLink && homemade && (
                    <button
                      type="button"
                      className="step-link"
                      onClick={(e) => { e.stopPropagation(); onLinkedStepClick(stepObj.linkedRecipeId) }}
                    >
                      Open {stepObj.linkedRecipeName} recipe →
                    </button>
                  )}
                  {hasLink && !homemade && (
                    <span className="sb">🛒 Store-bought {stepObj.linkedRecipeName}</span>
                  )}
                </div>
              </li>
            )
          })}
        </ol>
      ) : (
        <p className="no-content">No instructions listed</p>
      )}
    </section>
  )
}

export default RecipeStepsSection
