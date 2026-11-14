import './UndoToast.css'

/** Bottom toast for meal actions; shows Undo while a removal can still be cancelled. */
function UndoToast({ toast, onUndo }) {
  if (!toast) return null
  return (
    <div className="meal-toast" role="status" aria-live="polite">
      <span>{toast.message}</span>
      {toast.canUndo && <button type="button" className="meal-toast-undo" onClick={onUndo}>Undo</button>}
    </div>
  )
}

export default UndoToast
