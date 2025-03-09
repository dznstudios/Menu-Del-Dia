const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { 
  createRestaurant,
  getRestaurants,
  getRestaurantById,
  updateRestaurant,
  deleteRestaurant,
  getNearbyRestaurants,
  getRestaurantsByCuisine,
  getRestaurantsByDietaryOption,
  uploadRestaurantPhoto
} = require('../controllers/restaurantController');
const { auth, isRestaurantOwner } = require('../middleware/auth');

// Set up multer storage for restaurant photos
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/restaurants');
  },
  filename: (req, file, cb) => {
    cb(null, `restaurant-${Date.now()}${path.extname(file.originalname)}`);
  }
});

const upload = multer({ 
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png|webp/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    
    if (mimetype && extname) {
      return cb(null, true);
    }
    
    cb(new Error('Only image files are allowed!'));
  }
});

// Public routes
router.get('/', getRestaurants);
router.get('/nearby', getNearbyRestaurants);
router.get('/cuisine/:type', getRestaurantsByCuisine);
router.get('/dietary/:option', getRestaurantsByDietaryOption);
router.get('/:id', getRestaurantById);

// Private routes
router.post('/', auth, createRestaurant);
router.put('/:id', auth, updateRestaurant);
router.delete('/:id', auth, deleteRestaurant);
router.post('/:id/photos', auth, upload.single('photo'), uploadRestaurantPhoto);

module.exports = router; 