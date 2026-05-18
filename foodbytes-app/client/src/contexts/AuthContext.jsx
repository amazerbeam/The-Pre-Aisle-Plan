import { createContext, useState, useEffect, useContext } from 'react'
import api from '../services/api'

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

  const value = {
    user,
    loading,
    isGuest,
    isAuthenticated: !!user,
    isAdmin: user?.isAdmin || false,
    loginWithGoogle,
    passwordLogin,
    continueAsGuest,
    logout,
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
