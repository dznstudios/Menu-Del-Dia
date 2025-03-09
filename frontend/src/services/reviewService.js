import api from './api';

// Get all reviews
export const getReviews = async () => {
  try {
    const response = await api.get('/api/reviews');
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Get review by ID
export const getReviewById = async (id) => {
  try {
    const response = await api.get(`/api/reviews/${id}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Get reviews by restaurant
export const getReviewsByRestaurant = async (restaurantId) => {
  try {
    const response = await api.get(`/api/reviews/restaurant/${restaurantId}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Get reviews by user
export const getReviewsByUser = async (userId) => {
  try {
    const response = await api.get(`/api/reviews/user/${userId}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Create review
export const createReview = async (reviewData, photoFiles = []) => {
  try {
    const formData = new FormData();
    
    // Add review data
    Object.entries(reviewData).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        formData.append(key, value);
      }
    });
    
    // Add photos if provided
    if (photoFiles && photoFiles.length > 0) {
      photoFiles.forEach((photo, index) => {
        formData.append('photos', {
          uri: photo.uri,
          name: photo.fileName || `review-photo-${index}.jpg`,
          type: photo.type || 'image/jpeg',
        });
      });
    }
    
    const response = await api.post('/api/reviews', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Update review
export const updateReview = async (id, reviewData, photoFiles = []) => {
  try {
    const formData = new FormData();
    
    // Add review data
    Object.entries(reviewData).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        formData.append(key, value);
      }
    });
    
    // Add photos if provided
    if (photoFiles && photoFiles.length > 0) {
      photoFiles.forEach((photo, index) => {
        formData.append('photos', {
          uri: photo.uri,
          name: photo.fileName || `review-photo-${index}.jpg`,
          type: photo.type || 'image/jpeg',
        });
      });
    }
    
    const response = await api.put(`/api/reviews/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Delete review
export const deleteReview = async (id) => {
  try {
    const response = await api.delete(`/api/reviews/${id}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Like a review
export const likeReview = async (id) => {
  try {
    const response = await api.post(`/api/reviews/${id}/like`);
    return response.data;
  } catch (error) {
    throw error;
  }
}; 