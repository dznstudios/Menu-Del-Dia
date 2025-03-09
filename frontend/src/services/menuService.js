import api from './api';

// Get all menus with optional filters
export const getMenus = async (filters = {}) => {
  try {
    // Convert filters object to query string
    const queryParams = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        queryParams.append(key, value);
      }
    });
    
    const queryString = queryParams.toString();
    const url = queryString ? `/api/menus?${queryString}` : '/api/menus';
    
    const response = await api.get(url);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Get menu by ID
export const getMenuById = async (id) => {
  try {
    const response = await api.get(`/api/menus/${id}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Get menus by restaurant
export const getMenusByRestaurant = async (restaurantId) => {
  try {
    const response = await api.get(`/api/menus/restaurant/${restaurantId}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Get today's menus
export const getTodayMenus = async () => {
  try {
    const response = await api.get('/api/menus/today');
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Create menu (for restaurant owners)
export const createMenu = async (menuData, photoFile = null) => {
  try {
    const formData = new FormData();
    
    // Add menu data
    Object.entries(menuData).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        // Handle arrays
        if (Array.isArray(value)) {
          value.forEach(item => {
            formData.append(`${key}[]`, item);
          });
        } else {
          formData.append(key, value);
        }
      }
    });
    
    // Add photo if provided
    if (photoFile) {
      formData.append('photo', {
        uri: photoFile.uri,
        name: photoFile.fileName || 'menu.jpg',
        type: photoFile.type || 'image/jpeg',
      });
    }
    
    const response = await api.post('/api/menus', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Update menu (for restaurant owners)
export const updateMenu = async (id, menuData, photoFile = null) => {
  try {
    const formData = new FormData();
    
    // Add menu data
    Object.entries(menuData).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        // Handle arrays
        if (Array.isArray(value)) {
          value.forEach(item => {
            formData.append(`${key}[]`, item);
          });
        } else {
          formData.append(key, value);
        }
      }
    });
    
    // Add photo if provided
    if (photoFile) {
      formData.append('photo', {
        uri: photoFile.uri,
        name: photoFile.fileName || 'menu.jpg',
        type: photoFile.type || 'image/jpeg',
      });
    }
    
    const response = await api.put(`/api/menus/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Delete menu (for restaurant owners)
export const deleteMenu = async (id) => {
  try {
    const response = await api.delete(`/api/menus/${id}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Upload and parse menu image
export const uploadMenuImage = async (restaurantId, photoFile) => {
  try {
    const formData = new FormData();
    
    formData.append('restaurant_id', restaurantId);
    formData.append('photo', {
      uri: photoFile.uri,
      name: photoFile.fileName || 'menu.jpg',
      type: photoFile.type || 'image/jpeg',
    });
    
    const response = await api.post('/api/menus/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    return response.data;
  } catch (error) {
    throw error;
  }
}; 