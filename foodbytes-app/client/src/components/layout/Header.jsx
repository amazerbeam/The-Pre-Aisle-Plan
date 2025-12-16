import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import LoginModal from '../auth/LoginModal'
import DateRangePicker from '../common/DateRangePicker'
import './Header.css'

function Header() {
  const { user, isAuthenticated, logout } = useAuth()
  const [showLoginModal, setShowLoginModal] = useState(false)
  const [showUserMenu, setShowUserMenu] = useState(false)
  const navigate = useNavigate()

  return (
    <header className="header">
      <div className="header-content">
        {/* FR-039: Clickable logo navigates to Recipes */}
        <div
          className="logo clickable"
          onClick={() => navigate('/')}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === 'Enter' && navigate('/')}
          title="Go to Recipes"
        >
          <svg className="logo-icon" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <rect x="15" y="20" width="70" height="65" rx="8" stroke="currentColor" strokeWidth="6"/>
            <line x1="15" y1="38" x2="85" y2="38" stroke="currentColor" strokeWidth="6"/>
            <line x1="30" y1="12" x2="30" y2="28" stroke="currentColor" strokeWidth="6" strokeLinecap="round"/>
            <line x1="70" y1="12" x2="70" y2="28" stroke="currentColor" strokeWidth="6" strokeLinecap="round"/>
            <text x="50" y="70" fontFamily="Georgia, serif" fontSize="32" fontWeight="bold" fill="currentColor" textAnchor="middle">P</text>
          </svg>
          <h1>My Pantry Plan</h1>
        </div>

        {/* FR-007: Date Range Picker - only shown to authenticated users */}
        <DateRangePicker />

        <div className="header-right">
          {isAuthenticated ? (
            <div className="user-menu-container">
              <button
                className="user-button"
                onClick={() => setShowUserMenu(!showUserMenu)}
              >
                {user.avatarUrl ? (
                  <img src={user.avatarUrl} alt={user.name} className="avatar" />
                ) : (
                  <div className="avatar-placeholder">
                    {user.name?.charAt(0).toUpperCase()}
                  </div>
                )}
                <span className="user-name">{user.name}</span>
              </button>

              {showUserMenu && (
                <div className="user-dropdown">
                  <div className="user-info">
                    <span className="user-email">{user.email}</span>
                  </div>
                  <button className="logout-btn" onClick={logout}>
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button
              className="sign-in-btn"
              onClick={() => setShowLoginModal(true)}
            >
              Sign In
            </button>
          )}
        </div>
      </div>

      {showLoginModal && (
        <LoginModal onClose={() => setShowLoginModal(false)} />
      )}
    </header>
  )
}

export default Header
