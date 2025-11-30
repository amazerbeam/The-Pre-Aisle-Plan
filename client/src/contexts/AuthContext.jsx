import { createContext, useState, useEffect, useContext } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCurrentUser();
  }, []);

  const fetchCurrentUser = async () => {
    try {
      const response = await api.get('/auth/me');
      setUser(response.data);
    } catch (err) {
      // Not authenticated or cookie expired
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = () => {
    // Redirect to Google OAuth - only Google supported
    window.location.href = '/oauth2/authorization/google';
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } finally {
      setUser(null);
    }
  };

  const updatePreferences = async (preferences) => {
    try {
      const response = await api.put('/auth/preferences', preferences);
      setUser(response.data);
      return response.data;
    } catch (err) {
      throw err;
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      login,
      logout,
      updatePreferences,
      isAuthenticated: !!user,
      isAdmin: user?.isAdmin || false,
      refetchUser: fetchCurrentUser
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
