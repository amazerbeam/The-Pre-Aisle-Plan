import { useAuth } from '../../contexts/AuthContext'
import './LoginModal.css'

function LoginModal({ onClose }) {
  const { loginWithGoogle, continueAsGuest } = useAuth()

  const handleGoogleLogin = () => {
    loginWithGoogle()
  }

  const handleGuestContinue = () => {
    continueAsGuest()
    onClose()
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>
          <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="18" y1="6" x2="6" y2="18"/>
            <line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>

        <div className="modal-header">
          <h2>Welcome to My Pantry Plan</h2>
          <p>Sign in to unlock all features</p>
        </div>

        <div className="modal-body">
          <button className="google-signin-btn" onClick={handleGoogleLogin}>
            <img
              src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
              alt="Google logo"
            />
            Sign in with Google
          </button>

          <div className="benefits">
            <h3>Benefits of signing in:</h3>
            <ul>
              <li>More recipes</li>
              <li>Shopping List</li>
              <li>Meal Plans</li>
            </ul>
          </div>

          <div className="divider">
            <span>or</span>
          </div>

          <button className="guest-btn" onClick={handleGuestContinue}>
            Continue as Guest
          </button>
        </div>
      </div>
    </div>
  )
}

export default LoginModal
