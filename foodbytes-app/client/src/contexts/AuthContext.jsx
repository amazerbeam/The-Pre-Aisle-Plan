import { createContext, useState, useEffect, useContext } from 'react'
import api from '../services/api'
import { userService } from '../services/userService'

const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isGuest, setIsGuest] = useState(false)

  useEffect(() => {
    checkAuthStatus()
  }, [])

  const checkAuthStatus = async () => {
    try {
      const response = await api.get('/auth/me')
      setUser(response.data)
      setIsGuest(false)
    } catch (err) {
      setUser(null)
    } finally {
      setLoading(false)
    }
  }

  const loginWithGoogle = () => {
    window.location.href = '/oauth2/authorization/google'
  }

  const passwordLogin = async (email, password) => {
    const response = await api.post('/auth/login', { email, password })
    setUser(response.data)
    setIsGuest(false)
    return response.data
  }

  const continueAsGuest = () => {
    setIsGuest(true)
    setUser(null)
  }

  const logout = async () => {
    try {
      await api.post('/auth/logout')
    } finally {
      setUser(null)
      setIsGuest(false)
    }
  }

  /**
   * MPP-3: save the default portion count. Pass null to clear it.
   * Throws on failure so the calling control can surface the server's message
   * and revert — deliberately NOT caught into a success shape here.
   */
  const saveDefaultServings = async (defaultServings) => {
    const updated = await userService.updatePreferences(defaultServings)
    setUser(updated)
    return updated
  }

  const value = {
    user,
    loading,
    isGuest,
    isAuthenticated: !!user,
    isAdmin: user?.isAdmin || false,
    defaultServings: user?.defaultServings ?? null,
    loginWithGoogle,
    passwordLogin,
    continueAsGuest,
    logout,
    saveDefaultServings,
    checkAuthStatus
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export default AuthContext
