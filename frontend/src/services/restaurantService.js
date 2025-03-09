import api from './api';

// Get all restaurants
export const getAllRestaurants = async () => {
  try {
    const response = await api.get('/api/restaurants');
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Get restaurant by ID
export const getRestaurantById = async (id) => {
  try {
    const response = await api.get(`/api/restaurants/${id}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Get nearby restaurants
export const getNearbyRestaurants = async (lat, lng, distance = 5) => {
  try {
    const response = await api.get(`/api/restaurants/nearby?lat=${lat}&lng=${lng}&distance=${distance}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Get restaurants by cuisine type
export const getRestaurantsByCuisine = async (cuisineType) => {
  try {
    const response = await api.get(`/api/restaurants/cuisine/${cuisineType}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Get restaurants by dietary option
export const getRestaurantsByDietaryOption = async (dietaryOption) => {
  try {
    const response = await api.get(`/api/restaurants/dietary/${dietaryOption}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Create restaurant (for restaurant owners)
export const createRestaurant = async (restaurantData) => {
  try {
    const response = await api.post('/api/restaurants', restaurantData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Update restaurant (for restaurant owners)
export const updateRestaurant = async (id, restaurantData) => {
  try {
    const response = await api.put(`/api/restaurants/${id}`, restaurantData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Delete restaurant (for restaurant owners)
export const deleteRestaurant = async (id) => {
  try {
    const response = await api.delete(`/api/restaurants/${id}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Upload restaurant photo
export const uploadRestaurantPhoto = async (id, photoFile) => {
  try {
    const formData = new FormData();
    formData.append('photo', {
      uri: photoFile.uri,
      name: photoFile.fileName || 'photo.jpg',
      type: photoFile.type || 'image/jpeg',
    });
    
    const response = await api.post(`/api/restaurants/${id}/photos`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    return response.data;
  } catch (error) {
    throw error;
  }
}; 