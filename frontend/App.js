import React, { useState, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { Provider as PaperProvider, DefaultTheme } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Import screens
import HomeScreen from './src/pages/HomeScreen';
import RestaurantListScreen from './src/pages/RestaurantListScreen';
import MenuDetailsScreen from './src/pages/MenuDetailsScreen';
import RestaurantDetailsScreen from './src/pages/RestaurantDetailsScreen';
import ProfileScreen from './src/pages/ProfileScreen';
import LoginScreen from './src/pages/LoginScreen';
import RegisterScreen from './src/pages/RegisterScreen';
import FavoritesScreen from './src/pages/FavoritesScreen';
import RestaurantDashboardScreen from './src/pages/RestaurantDashboardScreen';
import MenuUploadScreen from './src/pages/MenuUploadScreen';

// Import context
import { AuthProvider } from './src/context/AuthContext';

// Create custom theme
const theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: '#FF9800', // Orange
    accent: '#FFC107', // Amber
    background: '#FFFFFF',
    text: '#212121',
    placeholder: '#9E9E9E',
    surface: '#F5F5F5',
  },
};

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

// Auth navigator
const AuthNavigator = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="Login" component={LoginScreen} />
    <Stack.Screen name="Register" component={RegisterScreen} />
  </Stack.Navigator>
);

// Main tab navigator
const MainTabNavigator = () => (
  <Tab.Navigator
    screenOptions={({ route }) => ({
      tabBarIcon: ({ focused, color, size }) => {
        let iconName;

        if (route.name === 'Home') {
          iconName = focused ? 'home' : 'home-outline';
        } else if (route.name === 'Restaurants') {
          iconName = focused ? 'restaurant' : 'restaurant-outline';
        } else if (route.name === 'Favorites') {
          iconName = focused ? 'heart' : 'heart-outline';
        } else if (route.name === 'Profile') {
          iconName = focused ? 'person' : 'person-outline';
        } else if (route.name === 'Dashboard') {
          iconName = focused ? 'grid' : 'grid-outline';
        }

        return <Ionicons name={iconName} size={size} color={color} />;
      },
    })}
    tabBarOptions={{
      activeTintColor: theme.colors.primary,
      inactiveTintColor: 'gray',
    }}
  >
    <Tab.Screen name="Home" component={HomeScreen} />
    <Tab.Screen name="Restaurants" component={RestaurantListScreen} />
    <Tab.Screen name="Favorites" component={FavoritesScreen} />
    <Tab.Screen name="Profile" component={ProfileScreen} />
  </Tab.Navigator>
);

// Restaurant dashboard navigator
const RestaurantNavigator = () => (
  <Tab.Navigator
    screenOptions={({ route }) => ({
      tabBarIcon: ({ focused, color, size }) => {
        let iconName;

        if (route.name === 'Dashboard') {
          iconName = focused ? 'grid' : 'grid-outline';
        } else if (route.name === 'Upload Menu') {
          iconName = focused ? 'add-circle' : 'add-circle-outline';
        } else if (route.name === 'Profile') {
          iconName = focused ? 'person' : 'person-outline';
        }

        return <Ionicons name={iconName} size={size} color={color} />;
      },
    })}
    tabBarOptions={{
      activeTintColor: theme.colors.primary,
      inactiveTintColor: 'gray',
    }}
  >
    <Tab.Screen name="Dashboard" component={RestaurantDashboardScreen} />
    <Tab.Screen name="Upload Menu" component={MenuUploadScreen} />
    <Tab.Screen name="Profile" component={ProfileScreen} />
  </Tab.Navigator>
);

// Main app component
export default function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [userToken, setUserToken] = useState(null);
  const [userRole, setUserRole] = useState('user');

  useEffect(() => {
    // Check if user is logged in
    const bootstrapAsync = async () => {
      try {
        const token = await AsyncStorage.getItem('userToken');
        const role = await AsyncStorage.getItem('userRole');
        
        setUserToken(token);
        setUserRole(role || 'user');
      } catch (e) {
        console.log('Failed to load token', e);
      }
      
      setIsLoading(false);
    };

    bootstrapAsync();
  }, []);

  if (isLoading) {
    return null; // Or a loading screen
  }

  return (
    <AuthProvider>
      <PaperProvider theme={theme}>
        <NavigationContainer>
          <StatusBar style="auto" />
          <Stack.Navigator screenOptions={{ headerShown: false }}>
            {userToken === null ? (
              <Stack.Screen name="Auth" component={AuthNavigator} />
            ) : userRole === 'restaurant' ? (
              <Stack.Screen name="RestaurantMain" component={RestaurantNavigator} />
            ) : (
              <Stack.Screen name="Main" component={MainTabNavigator} />
            )}
            <Stack.Screen 
              name="MenuDetails" 
              component={MenuDetailsScreen} 
              options={{ headerShown: true, title: 'Menu Details' }}
            />
            <Stack.Screen 
              name="RestaurantDetails" 
              component={RestaurantDetailsScreen} 
              options={{ headerShown: true, title: 'Restaurant Details' }}
            />
          </Stack.Navigator>
        </NavigationContainer>
      </PaperProvider>
    </AuthProvider>
  );
} 