import api from './api';

export const authService = {
  // Redirect to Google OAuth
  login() {
    window.location.href = '/oauth2/authorization/google';
  },

  // Logout user
  async logout() {
    try {
      await api.post('/auth/logout');
      return true;
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  },

  // Get current user
  async getCurrentUser() {
    try {
      const response = await api.get('/auth/me');
      return response.data;
    } catch (error) {
      if (error.response?.status === 401) {
        return null;
      }
      throw error;
    }
  },

  // Update user preferences
  async updatePreferences(preferences) {
    try {
      const response = await api.put('/auth/preferences', preferences);
      return response.data;
    } catch (error) {
      console.error('Update preferences error:', error);
      throw error;
    }
  },
};
