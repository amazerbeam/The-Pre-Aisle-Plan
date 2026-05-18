import './WakeLockIcon.css'

/**
 * FR-029: WakeLockIcon - Small inline lock icon for wake lock status
 *
 * Displays a small lock emoji next to content (e.g., "Ingredients" header).
 * - Shows 🔒 when wake lock is active
 * - Shows 🔓 when wake lock is inactive
 * - Plays animation when transitioning to locked state
 * - Clickable to toggle wake lock on/off
 *
 * @param {boolean} isLocked - Current wake lock state
 * @param {boolean} isAnimating - Whether to play the lock animation
 * @param {boolean} isSupported - Whether Wake Lock API is supported
 * @param {function} onToggle - Callback when icon is clicked
 */
function WakeLockIcon({ isLocked, isAnimating, isSupported, onToggle }) {
  // Don't render if wake lock is not supported
  if (!isSupported) {
    return null
  }

  const handleClick = (e) => {
    e.stopPropagation()
    onToggle?.()
  }

  return (
    <button
      className={`wake-lock-icon ${isAnimating ? 'animating' : ''} ${isLocked ? 'locked' : 'unlocked'}`}
      onClick={handleClick}
      title={isLocked ? 'Screen lock active - click to disable' : 'Screen lock inactive - click to enable'}
      aria-label={isLocked ? 'Disable screen wake lock' : 'Enable screen wake lock'}
      type="button"
    >
      <span className="lock-emoji">
        {isLocked ? '\uD83D\uDD12' : '\uD83D\uDD13'}
      </span>
    </button>
  )
}

export default WakeLockIcon
