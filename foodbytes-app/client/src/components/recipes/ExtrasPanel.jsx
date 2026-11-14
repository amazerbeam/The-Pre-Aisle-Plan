/**
 * Recipe view "Extras" box: one row per linked sub-recipe (pita, dough, sauce...) with a
 * Homemade / Store-bought toggle and a link into the sub-recipe. The toggle only changes the
 * shopping list and the step wording; macros always use the homemade version.
 */
function ExtrasPanel({ extras, isHomemade, onToggle, onOpen, saving, error, locked, hint }) {
  const disabled = saving || locked
  return (
    <div className="rv-extras">
      <h3>Extras</h3>
      {extras.map((extra) => {
        const homemade = isHomemade(extra.recipeId)
        return (
          <div className="rv-extra" key={extra.recipeId}>
            <div className="rv-extra-title">
              {extra.name}
              <div className="rv-tog" role="group" aria-label={`${extra.name}: homemade or store-bought`}>
                <button
                  type="button"
                  className={homemade ? 'on' : ''}
                  aria-pressed={homemade}
                  disabled={disabled}
                  onClick={() => onToggle(extra.recipeId, true)}
                >
                  Homemade
                </button>
                <button
                  type="button"
                  className={homemade ? '' : 'on'}
                  aria-pressed={!homemade}
                  disabled={disabled}
                  onClick={() => onToggle(extra.recipeId, false)}
                >
                  Store-bought
                </button>
              </div>
            </div>
            {homemade && (
              <button type="button" className="rv-extra-open" onClick={() => onOpen(extra.recipeId)}>
                Open {extra.name} recipe →
              </button>
            )}
          </div>
        )
      })}
      <p className="rv-extras-note">Macros always use the homemade version.</p>
      {locked && hint && <p className="rv-extras-note">{hint}</p>}
      {error && <p className="rv-extras-error" role="alert">{error}</p>}
    </div>
  )
}

export default ExtrasPanel
