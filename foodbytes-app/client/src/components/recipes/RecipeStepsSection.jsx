/**
 * FR-091: Instructions list for RecipeViewModal. Linked steps render as a clickable link when the
 * linked recipe is homemade; store-bought shows the step's altInstruction as plain text.
 * Moved out of RecipeViewModal (MPP-12) to keep the modal under the 400-line budget.
 * Styles stay in RecipeViewModal.css (.steps-section, .steps-list, .step-item, .linked-step-button).
 */
function RecipeStepsSection({ steps, isHomemade, onLinkedStepClick }) {
  return (
    <section className="steps-section">
      <h3>Instructions</h3>
      {steps && steps.length > 0 ? (
        <ol className="steps-list">
          {steps.map((step, idx) => {
            // Handle both old format (string) and new format (object)
            const stepObj = typeof step === 'string'
              ? { instruction: step }
              : step

            // FR-091: Determine what to display based on linked recipe state
            const hasLink = stepObj.linkedRecipeId != null
            const homemade = hasLink ? isHomemade(stepObj.linkedRecipeId) : true

            // Show alt instruction if linked and store-bought
            const displayText = hasLink && !homemade && stepObj.altInstruction
              ? stepObj.altInstruction
              : stepObj.instruction

            return (
              <li key={idx} className="step-item">
                {hasLink && homemade ? (
                  // Linked and homemade - show as clickable link
                  <button
                    className="linked-step-button"
                    onClick={() => onLinkedStepClick(stepObj.linkedRecipeId)}
                    title={`View ${stepObj.linkedRecipeName} recipe`}
                  >
                    {displayText}
                  </button>
                ) : (
                  // No link or store-bought - show as plain text
                  <span>{displayText}</span>
                )}
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
