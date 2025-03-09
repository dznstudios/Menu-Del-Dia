import * as Location from 'expo-location';
import { MAP_CONFIG } from '../config/config';

// Get current location
export const getCurrentLocation = async () => {
  try {
    // Request permission
    const { status } = await Location.requestForegroundPermissionsAsync();
    
    if (status !== 'granted') {
      throw new Error('Permission to access location was denied');
    }
    
    // Get current position
    const location = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced,
    });
    
    return {
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
      latitudeDelta: MAP_CONFIG.initialRegion.latitudeDelta,
      longitudeDelta: MAP_CONFIG.initialRegion.longitudeDelta,
    };
  } catch (error) {
    console.error('Error getting location:', error);
    
    // Return default location (Tenerife center)
    return MAP_CONFIG.initialRegion;
  }
};

// Calculate distance between two coordinates in kilometers
export const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Radius of the earth in km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c; // Distance in km
  
  return distance;
};

// Convert degrees to radians
const deg2rad = (deg) => {
  return deg * (Math.PI / 180);
};

// Get address from coordinates
export const getAddressFromCoordinates = async (latitude, longitude) => {
  try {
    const response = await Location.reverseGeocodeAsync({
      latitude,
      longitude,
    });
    
    if (response.length > 0) {
      const address = response[0];
      return {
        street: address.street,
        city: address.city,
        region: address.region,
        country: address.country,
        postalCode: address.postalCode,
        formattedAddress: `${address.street}, ${address.city}, ${address.region}, ${address.country}`,
      };
    }
    
    return null;
  } catch (error) {
    console.error('Error getting address:', error);
    return null;
  }
};

// Get coordinates from address
export const getCoordinatesFromAddress = async (address) => {
  try {
    const response = await Location.geocodeAsync(address);
    
    if (response.length > 0) {
      return {
        latitude: response[0].latitude,
        longitude: response[0].longitude,
      };
    }
    
    return null;
  } catch (error) {
    console.error('Error getting coordinates:', error);
    return null;
  }
}; 