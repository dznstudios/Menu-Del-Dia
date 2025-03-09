import api from './api';

// Get user profile
export const getUserProfile = async () => {
  try {
    const response = await api.get('/api/users/profile');
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Update user profile
export const updateUserProfile = async (userData) => {
  try {
    const response = await api.put('/api/users/profile', userData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Add restaurant to favorites
export const addToFavorites = async (restaurantId) => {
  try {
    const response = await api.post('/api/users/favorites', { restaurantId });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Remove restaurant from favorites
export const removeFromFavorites = async (restaurantId) => {
  try {
    const response = await api.delete(`/api/users/favorites/${restaurantId}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Get user favorites
export const getUserFavorites = async () => {
  try {
    const response = await api.get('/api/users/favorites');
    return response.data;
  } catch (error) {
    throw error;
  }
}; 