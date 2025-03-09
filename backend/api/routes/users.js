const express = require('express');
const router = express.Router();
const { 
  registerUser, 
  loginUser, 
  getUserProfile, 
  updateUserProfile,
  addToFavorites,
  removeFromFavorites,
  getUserFavorites
} = require('../controllers/userController');
const { auth } = require('../middleware/auth');

// Public routes
router.post('/register', registerUser);
router.post('/login', loginUser);

// Private routes
router.get('/profile', auth, getUserProfile);
router.put('/profile', auth, updateUserProfile);
router.post('/favorites', auth, addToFavorites);
router.delete('/favorites/:restaurantId', auth, removeFromFavorites);
router.get('/favorites', auth, getUserFavorites);

module.exports = router; 