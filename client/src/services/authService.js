import api from './api';

export const authService = {
  // Register new user
  async register(userData) {
    const response = await api.post('/auth/register', userData);
    if (response.data?.data) {
      localStorage.setItem('finora_user', JSON.stringify(response.data.data));
    }
    return response.data;
  },

  // Login existing user
  async login(credentials) {
    const response = await api.post('/auth/login', credentials);
    if (response.data?.data) {
      localStorage.setItem('finora_user', JSON.stringify(response.data.data));
    }
    return response.data;
  },

  // Logout user
  logout() {
    localStorage.removeItem('finora_user');
  },

  // Get current user profile from server
  async getMe() {
    const response = await api.get('/auth/me');
    return response.data;
  },

  // Update user profile name
  async updateProfile(profileData) {
    const response = await api.put('/auth/profile', profileData);
    if (response.data?.data) {
      const stored = JSON.parse(localStorage.getItem('finora_user') || '{}');
      const updated = { ...stored, name: response.data.data.name };
      localStorage.setItem('finora_user', JSON.stringify(updated));
    }
    return response.data;
  },

  // Get currently cached user
  getStoredUser() {
    try {
      const stored = localStorage.getItem('finora_user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  },
};

export default authService;
