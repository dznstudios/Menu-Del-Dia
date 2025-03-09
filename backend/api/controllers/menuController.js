const Menu = require('../models/Menu');
const Restaurant = require('../models/Restaurant');
const { ImageAnnotatorClient } = require('@google-cloud/vision');
const { OpenAI } = require('openai');
const path = require('path');
const fs = require('fs');

// Initialize Google Cloud Vision client
const visionClient = new ImageAnnotatorClient({
  keyFilename: process.env.GOOGLE_CLOUD_CREDENTIALS
});

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// @desc    Create a new menu
// @route   POST /api/menus
// @access  Private (Restaurant owners)
const createMenu = async (req, res) => {
  try {
    const {
      restaurant_id,
      type,
      starter,
      main,
      dessert,
      price,
      tags,
      is_exclusive,
      hours,
      includes_drink,
      drink_options,
      additional_info
    } = req.body;

    // Check if restaurant exists and user is the owner
    const restaurant = await Restaurant.findById(restaurant_id);
    
    if (!restaurant) {
      return res.status(404).json({ message: 'Restaurant not found' });
    }
    
    if (restaurant.owner.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to create a menu for this restaurant' });
    }

    // Create menu
    const menu = await Menu.create({
      restaurant_id,
      type,
      starter,
      main,
      dessert,
      price,
      tags,
      is_exclusive,
      hours,
      includes_drink,
      drink_options,
      additional_info,
      photo_url: req.file ? req.file.path : ''
    });

    res.status(201).json(menu);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all menus
// @route   GET /api/menus
// @access  Public
const getMenus = async (req, res) => {
  try {
    const { 
      restaurant_id, 
      type, 
      price_min, 
      price_max, 
      tags, 
      is_exclusive,
      search
    } = req.query;
    
    // Build query
    const query = {};
    
    if (restaurant_id) query.restaurant_id = restaurant_id;
    if (type) query.type = type;
    if (is_exclusive) query.is_exclusive = is_exclusive === 'true';
    
    // Price range
    if (price_min || price_max) {
      query.price = {};
      if (price_min) query.price.$gte = parseFloat(price_min);
      if (price_max) query.price.$lte = parseFloat(price_max);
    }
    
    // Tags (comma-separated)
    if (tags) {
      const tagArray = tags.split(',').map(tag => tag.trim());
      query.tags = { $in: tagArray };
    }
    
    // Text search
    if (search) {
      query.$or = [
        { starter: { $regex: search, $options: 'i' } },
        { main: { $regex: search, $options: 'i' } },
        { dessert: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }
    
    // Find menus and populate restaurant details
    const menus = await Menu.find(query)
      .populate('restaurant_id', 'name location cuisine_type dietary_options')
      .sort({ date: -1 });
    
    res.json(menus);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get menu by ID
// @route   GET /api/menus/:id
// @access  Public
const getMenuById = async (req, res) => {
  try {
    const menu = await Menu.findById(req.params.id)
      .populate('restaurant_id', 'name location cuisine_type dietary_options phone_number');
    
    if (menu) {
      res.json(menu);
    } else {
      res.status(404).json({ message: 'Menu not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update menu
// @route   PUT /api/menus/:id
// @access  Private (Restaurant owner)
const updateMenu = async (req, res) => {
  try {
    const menu = await Menu.findById(req.params.id);
    
    if (!menu) {
      return res.status(404).json({ message: 'Menu not found' });
    }
    
    // Check if user is the restaurant owner
    const restaurant = await Restaurant.findById(menu.restaurant_id);
    
    if (!restaurant) {
      return res.status(404).json({ message: 'Restaurant not found' });
    }
    
    if (restaurant.owner.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to update this menu' });
    }
    
    // Update photo if provided
    if (req.file) {
      req.body.photo_url = req.file.path;
    }
    
    const updatedMenu = await Menu.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    res.json(updatedMenu);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete menu
// @route   DELETE /api/menus/:id
// @access  Private (Restaurant owner)
const deleteMenu = async (req, res) => {
  try {
    const menu = await Menu.findById(req.params.id);
    
    if (!menu) {
      return res.status(404).json({ message: 'Menu not found' });
    }
    
    // Check if user is the restaurant owner
    const restaurant = await Restaurant.findById(menu.restaurant_id);
    
    if (!restaurant) {
      return res.status(404).json({ message: 'Restaurant not found' });
    }
    
    if (restaurant.owner.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to delete this menu' });
    }
    
    await menu.remove();
    
    res.json({ message: 'Menu removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Upload and parse menu image
// @route   POST /api/menus/upload
// @access  Private (Restaurant owner)
const uploadMenuImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Please upload a file' });
    }
    
    const { restaurant_id } = req.body;
    
    // Check if restaurant exists and user is the owner
    const restaurant = await Restaurant.findById(restaurant_id);
    
    if (!restaurant) {
      return res.status(404).json({ message: 'Restaurant not found' });
    }
    
    if (restaurant.owner.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to upload a menu for this restaurant' });
    }
    
    // Get file path
    const filePath = path.join(__dirname, '../../../', req.file.path);
    
    // Read image file
    const imageFile = fs.readFileSync(filePath);
    
    // Detect text using Google Cloud Vision
    const [result] = await visionClient.textDetection(imageFile);
    const detections = result.textAnnotations;
    
    if (!detections || detections.length === 0) {
      return res.status(400).json({ message: 'No text detected in the image' });
    }
    
    const extractedText = detections[0].description;
    
    // Parse menu using OpenAI
    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You are a helpful assistant that parses restaurant menu text into structured data. Extract the starter, main course, dessert, price, and any tags (like seafood, vegan, etc.) from the text."
        },
        {
          role: "user",
          content: `Parse this menu text into JSON format with the following fields: starter, main, dessert, price, tags. Here's the text:\n\n${extractedText}`
        }
      ]
    });
    
    // Parse the response
    const parsedMenu = JSON.parse(completion.choices[0].message.content);
    
    // Add the photo URL to the parsed menu
    parsedMenu.photo_url = req.file.path;
    parsedMenu.restaurant_id = restaurant_id;
    
    res.json(parsedMenu);
  } catch (error) {
    console.error('Error processing menu image:', error);
    res.status(500).json({ message: 'Error processing menu image', error: error.message });
  }
};

// @desc    Get menus by restaurant
// @route   GET /api/menus/restaurant/:restaurantId
// @access  Public
const getMenusByRestaurant = async (req, res) => {
  try {
    const { restaurantId } = req.params;
    
    const menus = await Menu.find({ restaurant_id: restaurantId })
      .sort({ date: -1 });
    
    res.json(menus);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get today's menus
// @route   GET /api/menus/today
// @access  Public
const getTodayMenus = async (req, res) => {
  try {
    // Get today's date (start and end)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const menus = await Menu.find({
      date: { $gte: today, $lt: tomorrow }
    }).populate('restaurant_id', 'name location cuisine_type dietary_options');
    
    res.json(menus);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createMenu,
  getMenus,
  getMenuById,
  updateMenu,
  deleteMenu,
  uploadMenuImage,
  getMenusByRestaurant,
  getTodayMenus
}; 