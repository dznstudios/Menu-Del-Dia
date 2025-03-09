const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { 
  createReview,
  getReviews,
  getReviewById,
  updateReview,
  deleteReview,
  getReviewsByRestaurant,
  getReviewsByUser,
  likeReview
} = require('../controllers/reviewController');
const { auth } = require('../middleware/auth');

// Set up multer storage for review photos
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/reviews');
  },
  filename: (req, file, cb) => {
    cb(null, `review-${Date.now()}${path.extname(file.originalname)}`);
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
router.get('/', getReviews);
router.get('/restaurant/:restaurantId', getReviewsByRestaurant);
router.get('/user/:userId', getReviewsByUser);
router.get('/:id', getReviewById);

// Private routes
router.post('/', auth, upload.array('photos', 5), createReview);
router.put('/:id', auth, upload.array('photos', 5), updateReview);
router.delete('/:id', auth, deleteReview);
router.post('/:id/like', auth, likeReview);

module.exports = router; 