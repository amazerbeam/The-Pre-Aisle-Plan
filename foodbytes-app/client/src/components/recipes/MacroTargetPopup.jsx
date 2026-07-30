import { useEffect, useMemo, useRef } from 'react'
import { createPortal } from 'react-dom'
import { usePullToDismiss } from '../../hooks/usePullToDismiss'
import PullToDismissUI from '../common/PullToDismissUI'
import {
  MACRO_COPY,
  MACRO_TARGETS,
  REJECT_MARK,
  STATUS_ARROW,
  STATUS_DISPLAY_ORDER,
  STATUS_WORD
} from '../../constants/macroTargets'
import { evaluateMacro } from '../../utils/macroStatus'
import './MacroTargetPopup.css'

/**
 * FR-104: Macro target popup — explains the traffic light for one macro.
 *
 * Shows the current reading and its status, the exact target, the full band
 * legend with "you are here" marked, the reasoning, and the source of every
 * claim. Copy never names an internal file or skill.
 *
 * Rendered through a portal into document.body: .recipe-view-modal animates with
 * `transform`, which establishes a containing block for position: fixed
 * descendants, so an inline popup would be clipped to the modal.
 *
 * Mobile: bottom sheet + pull-to-dismiss, matching DailyMacroPopup.
 */
function MacroTargetPopup({
  macroKey,
  macros,
  variantLabel,
  displayedCaloriesPerServing,
  onClose
}) {
  const closeButtonRef = useRef(null)

  const target = MACRO_TARGETS[macroKey]
  const result = evaluateMacro(macros, macroKey)

  // Mobile pull-to-dismiss — the app's standard popup gesture (below 768px only).
  const {
    isDragging,
    circlePosition,
    isOverTarget,
    dragDirection,
    handlers: dismissHandlers,
    setScrollableRef,
    setGestureRef,
    targetPosition
  } = usePullToDismiss(onClose)

  // Legend order is fixed blue -> amber -> green -> red, independent of the
  // evaluation order in `bands`. Macros with no band for a status (protein has
  // no `over`, fat has no `near`) simply omit that row.
  const orderedBands = useMemo(
    () => STATUS_DISPLAY_ORDER
      .map((status) => target.bands.find((band) => band.status === status))
      .filter(Boolean),
    [target]
  )

  // Escape must close this popup, not the recipe modal behind it. RecipeViewModal
  // listens on document in the BUBBLE phase; registering here in the CAPTURE
  // phase means this runs first and stopPropagation() keeps the recipe open.
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key !== 'Escape') return
      event.stopPropagation()
      onClose()
    }

    document.addEventListener('keydown', handleKeyDown, true)
    return () => {
      // The capture flag must match, or the listener is not removed.
      document.removeEventListener('keydown', handleKeyDown, true)
    }
  }, [onClose])

  // Move focus into the dialog on open, and hand it back to whatever opened it on
  // close. Without the restore, Escape removes the close button from the DOM and
  // focus falls to document.body — dumping a keyboard user out of the recipe modal
  // that is still open behind this popup. Not a full Tab-cycle focus trap.
  useEffect(() => {
    const trigger = document.activeElement
    closeButtonRef.current?.focus()
    return () => trigger?.focus?.()
  }, [])

  // No useBodyScrollLock here: RecipeViewModal already holds the shared
  // reference-counted lock for as long as it is open.

  const showKcalMismatch = displayedCaloriesPerServing != null
    && displayedCaloriesPerServing !== result.derivedKcal

  const handleOverlayClick = (event) => {
    // React portals bubble along the component tree, so without this a click in
    // here reaches .recipe-view-overlay's onClick and closes the recipe.
    event.stopPropagation()
    if (event.target === event.currentTarget) onClose()
  }

  return createPortal(
    <div className="macro-target-overlay" onClick={handleOverlayClick}>
      {/* The panel owns the gesture surface: usePullToDismiss attaches a
          non-passive touchmove listener to it via this callback ref. */}
      <div
        ref={setGestureRef}
        className="macro-target-popup"
        role="dialog"
        aria-modal="true"
        aria-labelledby="macro-target-title"
        {...dismissHandlers}
      >
        <header className="macro-target-header">
          <div className="macro-target-heading">
            <h4 id="macro-target-title">{target.label}</h4>
            <span className="macro-target-subtitle">
              per serving{variantLabel ? ` · ${variantLabel}` : ''}
            </span>
          </div>
          <button
            ref={closeButtonRef}
            type="button"
            className="macro-target-close"
            onClick={onClose}
            aria-label="Close"
          >
            &times;
          </button>
        </header>

        {/* Inner scroller: defines the at-top / at-bottom pull-to-dismiss boundaries */}
        <div className="macro-target-content" ref={setScrollableRef}>
          <div className={`macro-target-current macro-target-current--${result.status}`}>
            <span className="macro-target-value">{result.grams} g</span>
            <span className="macro-target-value-sub">
              {result.percent} % of {result.derivedKcal} kcal (4P + 4C + 9F)
            </span>
            {showKcalMismatch && (
              <span className="macro-target-value-sub">
                recipe card shows {displayedCaloriesPerServing} kcal
              </span>
            )}
            <span className="macro-target-status-row">
              <span className={`macro-target-pill macro-target-pill--${result.status}`}>
                {STATUS_ARROW[result.status]} {STATUS_WORD[result.status]}
              </span>
              {result.band.reject && (
                <span className="macro-target-reject">
                  {REJECT_MARK} {MACRO_COPY.REJECT_PILL}
                </span>
              )}
            </span>
          </div>

          <div className="macro-target-perfect">
            <span className="macro-target-perfect-label">Perfect target</span>
            <span className="macro-target-perfect-value">{target.perfect}</span>
          </div>

          <p className="macro-target-section">What the colours mean</p>
          <ul className="macro-target-legend">
            {orderedBands.map((band) => (
              <li
                key={band.status}
                className={band.status === result.status ? 'is-current' : undefined}
              >
                <span className={`macro-target-dot macro-target-dot--${band.status}`} aria-hidden="true" />
                <span className="macro-target-legend-arrow" aria-hidden="true">
                  {STATUS_ARROW[band.status]}
                </span>
                <span>
                  <span className="macro-target-legend-range">{band.range}</span>
                  {band.reject && (
                    <span className="macro-target-legend-reject">reject</span>
                  )}
                  <span className="macro-target-legend-meaning">{band.meaning}</span>
                </span>
                {band.status === result.status && (
                  <span className="macro-target-here">{MACRO_COPY.YOU_ARE_HERE}</span>
                )}
              </li>
            ))}
          </ul>

          <p className="macro-target-section">Why this target</p>
          <div className="macro-target-why">
            {target.why.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>

          <p className="macro-target-section">Where this comes from</p>
          <ul className="macro-target-sources">
            {target.sources.map(({ claim, source }) => (
              <li key={claim}>
                <span className="macro-target-source-claim">{claim}</span>
                <span className="macro-target-source-origin">{source}</span>
              </li>
            ))}
          </ul>

          <p className="macro-target-variant-note">{MACRO_COPY.VARIANT_NOTE}</p>
        </div>

        <p className="macro-target-hint">Press ESC or tap outside to close</p>
      </div>

      {/* Mobile pull-to-dismiss indicator */}
      <PullToDismissUI
        isDragging={isDragging}
        circlePosition={circlePosition}
        isOverTarget={isOverTarget}
        targetPosition={targetPosition}
        dragDirection={dragDirection}
      />
    </div>,
    document.body
  )
}

export default MacroTargetPopup
