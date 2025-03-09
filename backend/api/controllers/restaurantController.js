const Restaurant = require('../models/Restaurant');
const User = require('../models/User');

// @desc    Create a new restaurant
// @route   POST /api/restaurants
// @access  Private (Restaurant owners and admins)
const createRestaurant = async (req, res) => {
  try {
    const {
      name,
      location,
      cuisine_type,
      dietary_options,
      phone_number,
      description,
      opening_hours
    } = req.body;

    // Create restaurant
    const restaurant = await Restaurant.create({
      name,
      location,
      cuisine_type,
      dietary_options,
      phone_number,
      description,
      opening_hours,
      owner: req.user._id
    });

    // Update user role to restaurant if not already
    if (req.user.role !== 'restaurant' && req.user.role !== 'admin') {
      await User.findByIdAndUpdate(req.user._id, { role: 'restaurant' });
    }

    res.status(201).json(restaurant);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all restaurants
// @route   GET /api/restaurants
// @access  Public
const getRestaurants = async (req, res) => {
  try {
    const restaurants = await Restaurant.find({});
    res.json(restaurants);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get restaurant by ID
// @route   GET /api/restaurants/:id
// @access  Public
const getRestaurantById = async (req, res) => {
  try {
    const restaurant = await Restaurant.findById(req.params.id);
    
    if (restaurant) {
      res.json(restaurant);
    } else {
      res.status(404).json({ message: 'Restaurant not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update restaurant
// @route   PUT /api/restaurants/:id
// @access  Private (Restaurant owner and admin)
const updateRestaurant = async (req, res) => {
  try {
    const restaurant = await Restaurant.findById(req.params.id);
    
    if (!restaurant) {
      return res.status(404).json({ message: 'Restaurant not found' });
    }
    
    // Check if user is the restaurant owner or an admin
    if (restaurant.owner.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to update this restaurant' });
    }
    
    const updatedRestaurant = await Restaurant.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    res.json(updatedRestaurant);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete restaurant
// @route   DELETE /api/restaurants/:id
// @access  Private (Restaurant owner and admin)
const deleteRestaurant = async (req, res) => {
  try {
    const restaurant = await Restaurant.findById(req.params.id);
    
    if (!restaurant) {
      return res.status(404).json({ message: 'Restaurant not found' });
    }
    
    // Check if user is the restaurant owner or an admin
    if (restaurant.owner.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to delete this restaurant' });
    }
    
    await restaurant.remove();
    
    res.json({ message: 'Restaurant removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get nearby restaurants
// @route   GET /api/restaurants/nearby
// @access  Public
const getNearbyRestaurants = async (req, res) => {
  try {
    const { lat, lng, distance = 5 } = req.query; // distance in km, default 5km
    
    if (!lat || !lng) {
      return res.status(400).json({ message: 'Latitude and longitude are required' });
    }
    
    // Find restaurants within the specified distance
    const restaurants = await Restaurant.find({
      location: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [parseFloat(lng), parseFloat(lat)]
          },
          $maxDistance: distance * 1000 // convert km to meters
        }
      }
    });
    
    res.json(restaurants);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get restaurants by cuisine type
// @route   GET /api/restaurants/cuisine/:type
// @access  Public
const getRestaurantsByCuisine = async (req, res) => {
  try {
    const { type } = req.params;
    
    const restaurants = await Restaurant.find({ cuisine_type: type });
    
    res.json(restaurants);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get restaurants by dietary options
// @route   GET /api/restaurants/dietary/:option
// @access  Public
const getRestaurantsByDietaryOption = async (req, res) => {
  try {
    const { option } = req.params;
    
    const restaurants = await Restaurant.find({ dietary_options: option });
    
    res.json(restaurants);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Upload restaurant photo
// @route   POST /api/restaurants/:id/photos
// @access  Private (Restaurant owner and admin)
const uploadRestaurantPhoto = async (req, res) => {
  try {
    const restaurant = await Restaurant.findById(req.params.id);
    
    if (!restaurant) {
      return res.status(404).json({ message: 'Restaurant not found' });
    }
    
    // Check if user is the restaurant owner or an admin
    if (restaurant.owner.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to update this restaurant' });
    }
    
    if (!req.file) {
      return res.status(400).json({ message: 'Please upload a file' });
    }
    
    // Add photo to restaurant
    restaurant.photos.push(req.file.path);
    await restaurant.save();
    
    res.json({ message: 'Photo uploaded', photos: restaurant.photos });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createRestaurant,
  getRestaurants,
  getRestaurantById,
  updateRestaurant,
  deleteRestaurant,
  getNearbyRestaurants,
  getRestaurantsByCuisine,
  getRestaurantsByDietaryOption,
  uploadRestaurantPhoto
}; 