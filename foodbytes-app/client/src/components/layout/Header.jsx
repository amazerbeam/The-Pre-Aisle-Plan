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
          <h1>MyPantryPlan</h1>
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
