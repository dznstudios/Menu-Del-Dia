import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { API_URL } from '../config/config';

// Create context
export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [userToken, setUserToken] = useState(null);
  const [userInfo, setUserInfo] = useState(null);
  const [error, setError] = useState(null);

  // Login function
  const login = async (email, password) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await axios.post(`${API_URL}/api/users/login`, {
        email,
        password
      });
      
      const userData = response.data;
      
      // Store user data
      setUserInfo(userData);
      setUserToken(userData.token);
      
      // Save to AsyncStorage
      await AsyncStorage.setItem('userToken', userData.token);
      await AsyncStorage.setItem('userInfo', JSON.stringify(userData));
      await AsyncStorage.setItem('userRole', userData.role);
      
      // Set auth header for future requests
      axios.defaults.headers.common['Authorization'] = `Bearer ${userData.token}`;
      
      setIsLoading(false);
      return userData;
    } catch (error) {
      const message = error.response?.data?.message || 'Login failed. Please try again.';
      setError(message);
      setIsLoading(false);
      throw new Error(message);
    }
  };

  // Register function
  const register = async (name, email, password, role = 'user') => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await axios.post(`${API_URL}/api/users/register`, {
        name,
        email,
        password,
        role
      });
      
      const userData = response.data;
      
      // Store user data
      setUserInfo(userData);
      setUserToken(userData.token);
      
      // Save to AsyncStorage
      await AsyncStorage.setItem('userToken', userData.token);
      await AsyncStorage.setItem('userInfo', JSON.stringify(userData));
      await AsyncStorage.setItem('userRole', userData.role);
      
      // Set auth header for future requests
      axios.defaults.headers.common['Authorization'] = `Bearer ${userData.token}`;
      
      setIsLoading(false);
      return userData;
    } catch (error) {
      const message = error.response?.data?.message || 'Registration failed. Please try again.';
      setError(message);
      setIsLoading(false);
      throw new Error(message);
    }
  };

  // Logout function
  const logout = async () => {
    setIsLoading(true);
    
    try {
      // Remove from AsyncStorage
      await AsyncStorage.removeItem('userToken');
      await AsyncStorage.removeItem('userInfo');
      await AsyncStorage.removeItem('userRole');
      
      // Clear state
      setUserToken(null);
      setUserInfo(null);
      
      // Remove auth header
      delete axios.defaults.headers.common['Authorization'];
      
      setIsLoading(false);
    } catch (error) {
      console.log('Logout error:', error);
      setIsLoading(false);
    }
  };

  // Update user profile
  const updateProfile = async (userData) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await axios.put(`${API_URL}/api/users/profile`, userData, {
        headers: {
          Authorization: `Bearer ${userToken}`
        }
      });
      
      const updatedUserData = response.data;
      
      // Update user info
      setUserInfo(updatedUserData);
      
      // Update AsyncStorage
      await AsyncStorage.setItem('userInfo', JSON.stringify(updatedUserData));
      
      setIsLoading(false);
      return updatedUserData;
    } catch (error) {
      const message = error.response?.data?.message || 'Profile update failed. Please try again.';
      setError(message);
      setIsLoading(false);
      throw new Error(message);
    }
  };

  // Check if user is logged in on app start
  const isLoggedIn = async () => {
    try {
      setIsLoading(true);
      
      // Get token from AsyncStorage
      const token = await AsyncStorage.getItem('userToken');
      const userInfoString = await AsyncStorage.getItem('userInfo');
      
      if (token && userInfoString) {
        // Set user data
        setUserToken(token);
        setUserInfo(JSON.parse(userInfoString));
        
        // Set auth header
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      }
      
      setIsLoading(false);
    } catch (error) {
      console.log('isLoggedIn error:', error);
      setIsLoading(false);
    }
  };

  // Check login status on app start
  useEffect(() => {
    isLoggedIn();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        isLoading,
        userToken,
        userInfo,
        error,
        login,
        register,
        logout,
        updateProfile
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}; 