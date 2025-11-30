import api from './api';

const authService = {
  /**
   * Get current authenticated user
   * @returns {Promise<Object>} User object with id, email, name, picture, is_admin
   */
  async getCurrentUser() {
    try {
      const response = await api.get('/auth/me');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Initiate OAuth login (redirects to backend OAuth endpoint)
   * @param {string} provider - 'google' or 'github'
   */
  login(provider) {
    // Spring Security OAuth2 uses /oauth2/authorization/{provider}
    window.location.href = `/oauth2/authorization/${provider}`;
  },

  /**
   * Logout user (clears session cookie)
   * @returns {Promise<void>}
   */
  async logout() {
    try {
      await api.post('/auth/logout');
    } catch (error) {
      throw error;
    }
  },
};

export default authService;
