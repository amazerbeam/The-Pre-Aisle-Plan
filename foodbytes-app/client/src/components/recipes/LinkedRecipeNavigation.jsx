import './LinkedRecipeNavigation.css'

/**
 * FR-092: LinkedRecipeNavigation - Back button and breadcrumbs for recipe navigation.
 *
 * Shows when navigating into linked recipes (e.g., Pizza → Pizza Sauce → Pesto)
 * with a back button to return to the previous recipe.
 */
function LinkedRecipeNavigation({
  canGoBack,           // boolean - whether back navigation is possible
  previousRecipeName,  // string - name of previous recipe for back button
  breadcrumbs,         // array of strings - recipe name trail
  onBack,              // () => void - callback to go back
  showBreadcrumbs = false  // boolean - whether to show full breadcrumb trail
}) {
  if (!canGoBack) {
    return null
  }

  return (
    <div className="linked-recipe-navigation">
      <button
        className="back-button"
        onClick={onBack}
        aria-label={`Go back to ${previousRecipeName}`}
      >
        <span className="back-arrow">←</span>
        <span className="back-text">{previousRecipeName}</span>
      </button>

      {showBreadcrumbs && breadcrumbs && breadcrumbs.length > 1 && (
        <nav className="breadcrumbs" aria-label="Recipe navigation">
          {breadcrumbs.map((name, index) => (
            <span key={index} className="breadcrumb-item">
              {index > 0 && <span className="breadcrumb-separator">›</span>}
              <span className={index === breadcrumbs.length - 1 ? 'current' : ''}>
                {name}
              </span>
            </span>
          ))}
        </nav>
      )}
    </div>
  )
}

export default LinkedRecipeNavigation
