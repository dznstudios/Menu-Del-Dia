const Review = require('../models/Review');
const Restaurant = require('../models/Restaurant');

// @desc    Create a new review
// @route   POST /api/reviews
// @access  Private
const createReview = async (req, res) => {
  try {
    const { restaurant_id, rating, comment, menu_id } = req.body;
    
    // Check if restaurant exists
    const restaurant = await Restaurant.findById(restaurant_id);
    
    if (!restaurant) {
      return res.status(404).json({ message: 'Restaurant not found' });
    }
    
    // Check if user already reviewed this restaurant
    const existingReview = await Review.findOne({
      user_id: req.user._id,
      restaurant_id
    });
    
    if (existingReview) {
      return res.status(400).json({ message: 'You have already reviewed this restaurant' });
    }
    
    // Create review
    const review = await Review.create({
      user_id: req.user._id,
      restaurant_id,
      rating,
      comment,
      menu_id,
      photos: req.files ? req.files.map(file => file.path) : []
    });
    
    // Update restaurant rating
    const allReviews = await Review.find({ restaurant_id });
    const totalRating = allReviews.reduce((sum, review) => sum + review.rating, 0);
    const averageRating = totalRating / allReviews.length;
    
    await Restaurant.findByIdAndUpdate(restaurant_id, {
      average_rating: averageRating,
      review_count: allReviews.length
    });
    
    res.status(201).json(review);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all reviews
// @route   GET /api/reviews
// @access  Public
const getReviews = async (req, res) => {
  try {
    const reviews = await Review.find({})
      .populate('user_id', 'name profilePicture')
      .populate('restaurant_id', 'name')
      .sort({ created_at: -1 });
    
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get review by ID
// @route   GET /api/reviews/:id
// @access  Public
const getReviewById = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id)
      .populate('user_id', 'name profilePicture')
      .populate('restaurant_id', 'name');
    
    if (review) {
      res.json(review);
    } else {
      res.status(404).json({ message: 'Review not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update review
// @route   PUT /api/reviews/:id
// @access  Private
const updateReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    
    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }
    
    // Check if user is the review owner
    if (review.user_id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to update this review' });
    }
    
    // Update photos if provided
    if (req.files && req.files.length > 0) {
      req.body.photos = req.files.map(file => file.path);
    }
    
    const updatedReview = await Review.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    // Update restaurant rating
    const allReviews = await Review.find({ restaurant_id: review.restaurant_id });
    const totalRating = allReviews.reduce((sum, review) => sum + review.rating, 0);
    const averageRating = totalRating / allReviews.length;
    
    await Restaurant.findByIdAndUpdate(review.restaurant_id, {
      average_rating: averageRating
    });
    
    res.json(updatedReview);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete review
// @route   DELETE /api/reviews/:id
// @access  Private
const deleteReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    
    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }
    
    // Check if user is the review owner
    if (review.user_id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to delete this review' });
    }
    
    const restaurantId = review.restaurant_id;
    
    await review.remove();
    
    // Update restaurant rating
    const allReviews = await Review.find({ restaurant_id: restaurantId });
    
    if (allReviews.length > 0) {
      const totalRating = allReviews.reduce((sum, review) => sum + review.rating, 0);
      const averageRating = totalRating / allReviews.length;
      
      await Restaurant.findByIdAndUpdate(restaurantId, {
        average_rating: averageRating,
        review_count: allReviews.length
      });
    } else {
      // No reviews left
      await Restaurant.findByIdAndUpdate(restaurantId, {
        average_rating: 0,
        review_count: 0
      });
    }
    
    res.json({ message: 'Review removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get reviews by restaurant
// @route   GET /api/reviews/restaurant/:restaurantId
// @access  Public
const getReviewsByRestaurant = async (req, res) => {
  try {
    const { restaurantId } = req.params;
    
    const reviews = await Review.find({ restaurant_id: restaurantId })
      .populate('user_id', 'name profilePicture')
      .sort({ created_at: -1 });
    
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get reviews by user
// @route   GET /api/reviews/user/:userId
// @access  Public
const getReviewsByUser = async (req, res) => {
  try {
    const { userId } = req.params;
    
    const reviews = await Review.find({ user_id: userId })
      .populate('restaurant_id', 'name')
      .sort({ created_at: -1 });
    
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Like a review
// @route   POST /api/reviews/:id/like
// @access  Private
const likeReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    
    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }
    
    // Increment likes
    review.likes += 1;
    await review.save();
    
    res.json({ message: 'Review liked', likes: review.likes });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createReview,
  getReviews,
  getReviewById,
  updateReview,
  deleteReview,
  getReviewsByRestaurant,
  getReviewsByUser,
  likeReview
}; 