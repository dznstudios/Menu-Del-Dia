const mongoose = require('mongoose');

const MenuSchema = new mongoose.Schema({
  restaurant_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Restaurant',
    required: [true, 'Restaurant ID is required']
  },
  type: {
    type: String,
    enum: ['lunch', 'dinner'],
    default: 'lunch'
  },
  starter: {
    type: String,
    required: [true, 'Starter is required'],
    trim: true
  },
  main: {
    type: String,
    required: [true, 'Main course is required'],
    trim: true
  },
  dessert: {
    type: String,
    trim: true
  },
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: [0, 'Price cannot be negative']
  },
  photo_url: {
    type: String
  },
  tags: [{
    type: String,
    trim: true
  }],
  is_exclusive: {
    type: Boolean,
    default: false
  },
  hours: {
    type: String,
    default: '12-4 PM'
  },
  date: {
    type: Date,
    default: Date.now
  },
  includes_drink: {
    type: Boolean,
    default: false
  },
  drink_options: [{
    type: String,
    trim: true
  }],
  additional_info: {
    type: String,
    trim: true
  }
}, {
  timestamps: {
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  }
});

// Create compound index for restaurant and date
MenuSchema.index({ restaurant_id: 1, date: 1 });

module.exports = mongoose.model('Menu', MenuSchema); 