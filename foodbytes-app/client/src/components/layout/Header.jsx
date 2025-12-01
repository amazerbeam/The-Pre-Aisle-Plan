import { useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import LoginModal from '../auth/LoginModal'
import DateRangePicker from '../common/DateRangePicker'
import './Header.css'

function Header() {
  const { user, isAuthenticated, logout } = useAuth()
  const [showLoginModal, setShowLoginModal] = useState(false)
  const [showUserMenu, setShowUserMenu] = useState(false)

  return (
    <header className="header">
      <div className="header-content">
        <div className="logo">
          <h1>FoodBytes</h1>
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
