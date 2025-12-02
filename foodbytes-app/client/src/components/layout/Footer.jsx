import { useNavigate, useLocation } from 'react-router-dom'
import { useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import './Footer.css'

function Footer() {
  const navigate = useNavigate()
  const location = useLocation()
  const { isAuthenticated, isGuest } = useAuth()
  const [showMessage, setShowMessage] = useState(null)

  const handleMealPlanClick = () => {
    if (!isAuthenticated) {
      setShowMessage('Sign in to access meal planning!')
      setTimeout(() => setShowMessage(null), 3000)
    } else {
      navigate('/mealplan')
    }
  }

  const handleShoppingClick = () => {
    if (!isAuthenticated) {
      setShowMessage('Coming soon - Sign in to unlock!')
      setTimeout(() => setShowMessage(null), 3000)
    } else {
      setShowMessage('Feature coming soon!')
      setTimeout(() => setShowMessage(null), 3000)
    }
  }

  return (
    <footer className="footer">
      {showMessage && (
        <div className="footer-message">{showMessage}</div>
      )}
      <nav className="footer-nav">
        {/* FR-038: Recipes button - first item in footer, uses same .footer-btn styling */}
        <button
          className={`footer-btn ${location.pathname === '/' ? 'active' : ''}`}
          onClick={() => navigate('/')}
        >
          <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 2L2 7l10 5 10-5-10-5z"/>
            <path d="M2 17l10 5 10-5"/>
            <path d="M2 12l10 5 10-5"/>
          </svg>
          <span>Recipes</span>
        </button>

        <button
          className={`footer-btn ${location.pathname === '/mealplan' ? 'active' : ''}`}
          onClick={handleMealPlanClick}
        >
          <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
            <line x1="16" y1="2" x2="16" y2="6"/>
            <line x1="8" y1="2" x2="8" y2="6"/>
            <line x1="3" y1="10" x2="21" y2="10"/>
          </svg>
          <span>Meal Plan</span>
        </button>

        <button
          className={`footer-btn ${location.pathname === '/search' ? 'active' : ''}`}
          onClick={() => navigate('/search')}
        >
          <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8"/>
            <line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <span>Search</span>
        </button>

        <button
          className="footer-btn"
          onClick={handleShoppingClick}
        >
          <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="9" cy="21" r="1"/>
            <circle cx="20" cy="21" r="1"/>
            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
          </svg>
          <span>Shopping</span>
        </button>
      </nav>
    </footer>
  )
}

export default Footer
