const mongoose = require('mongoose');

const ReviewSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required']
  },
  restaurant_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Restaurant',
    required: [true, 'Restaurant ID is required']
  },
  rating: {
    type: Number,
    required: [true, 'Rating is required'],
    min: 1,
    max: 5
  },
  comment: {
    type: String,
    trim: true
  },
  photos: [{
    type: String
  }],
  likes: {
    type: Number,
    default: 0
  },
  menu_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Menu'
  }
}, {
  timestamps: {
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  }
});

// Create compound index for user and restaurant
ReviewSchema.index({ user_id: 1, restaurant_id: 1 }, { unique: true });

module.exports = mongoose.model('Review', ReviewSchema); 