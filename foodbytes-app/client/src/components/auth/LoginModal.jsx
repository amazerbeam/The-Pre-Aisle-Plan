import { useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import './LoginModal.css'

function LoginModal({ onClose }) {
  const { loginWithGoogle, continueAsGuest, passwordLogin } = useAuth()
  const [showPasswordForm, setShowPasswordForm] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)

  const handleGoogleLogin = () => {
    loginWithGoogle()
  }

  const handleGuestContinue = () => {
    continueAsGuest()
    onClose()
  }

  const handlePasswordSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setSubmitting(true)
    try {
      await passwordLogin(email, password)
      onClose()
    } catch (err) {
      setError('Invalid email or password')
    } finally {
      setSubmitting(false)
    }
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

          {!showPasswordForm && (
            <button className="email-toggle-btn" onClick={() => setShowPasswordForm(true)}>
              Use email & password instead
            </button>
          )}

          {showPasswordForm && (
            <form className="password-form" onSubmit={handlePasswordSubmit}>
              <label>
                Email
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="username"
                />
              </label>
              <label>
                Password
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                />
              </label>
              {error && <div className="password-error" role="alert">{error}</div>}
              <button type="submit" className="password-submit-btn" disabled={submitting}>
                {submitting ? 'Signing in…' : 'Sign in'}
              </button>
            </form>
          )}

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
