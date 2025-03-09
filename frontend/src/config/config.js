// API URL
export const API_URL = 'http://localhost:5000';

// Map configuration
export const MAP_CONFIG = {
  initialRegion: {
    latitude: 28.2916, // Tenerife center latitude
    longitude: -16.6291, // Tenerife center longitude
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  },
  defaultZoom: 12,
};

// App configuration
export const APP_CONFIG = {
  appName: 'Menú del Día',
  version: '1.0.0',
  defaultRadius: 5, // Default search radius in km
  maxRadius: 20, // Maximum search radius in km
  defaultMenuType: 'lunch',
  menuHours: {
    lunch: '12-4 PM',
    dinner: '7-11 PM',
  },
};

// Cuisine types
export const CUISINE_TYPES = [
  'Spanish',
  'Canarian',
  'Mediterranean',
  'Seafood',
  'Italian',
  'Asian',
  'International',
  'Vegetarian',
  'Fusion',
  'Tapas',
];

// Dietary options
export const DIETARY_OPTIONS = [
  'vegetarian',
  'vegan',
  'gluten-free',
  'dairy-free',
  'nut-free',
  'pescatarian',
  'halal',
  'kosher',
];

// Price ranges
export const PRICE_RANGES = [
  { label: 'Under €10', min: 0, max: 10 },
  { label: '€10 - €15', min: 10, max: 15 },
  { label: '€15 - €20', min: 15, max: 20 },
  { label: 'Over €20', min: 20, max: 100 },
]; 