import './Toast.css'

/**
 * Toast - FR-098: Simple toast notification for error messages
 */
function Toast({ message, type = 'error', onClose }) {
  if (!message) return null

  return (
    <div className={`toast toast-${type}`} role="alert">
      <span className="toast-message">{message}</span>
      {onClose && (
        <button className="toast-close" onClick={onClose} aria-label="Close">
          ×
        </button>
      )}
    </div>
  )
}

export default Toast
