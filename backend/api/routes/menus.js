const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { 
  createMenu,
  getMenus,
  getMenuById,
  updateMenu,
  deleteMenu,
  uploadMenuImage,
  getMenusByRestaurant,
  getTodayMenus
} = require('../controllers/menuController');
const { auth, isRestaurantOwner } = require('../middleware/auth');

// Set up multer storage for menu photos
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/menus');
  },
  filename: (req, file, cb) => {
    cb(null, `menu-${Date.now()}${path.extname(file.originalname)}`);
  }
});

const upload = multer({ 
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
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
router.get('/', getMenus);
router.get('/today', getTodayMenus);
router.get('/restaurant/:restaurantId', getMenusByRestaurant);
router.get('/:id', getMenuById);

// Private routes
router.post('/', auth, isRestaurantOwner, upload.single('photo'), createMenu);
router.post('/upload', auth, isRestaurantOwner, upload.single('photo'), uploadMenuImage);
router.put('/:id', auth, isRestaurantOwner, upload.single('photo'), updateMenu);
router.delete('/:id', auth, isRestaurantOwner, deleteMenu);

module.exports = router; 