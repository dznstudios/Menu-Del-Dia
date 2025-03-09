import React, { useState, useEffect, useContext } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  ActivityIndicator,
  RefreshControl,
  SafeAreaView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { AuthContext } from '../context/AuthContext';
import { getTodayMenus } from '../services/menuService';
import { getCurrentLocation } from '../services/locationService';
import { getNearbyRestaurants } from '../services/restaurantService';
import MenuCard from '../components/MenuCard';
import FilterBar from '../components/FilterBar';
import globalStyles, { COLORS, SPACING } from '../styles/globalStyles';
import { MAP_CONFIG } from '../config/config';

const HomeScreen = ({ navigation }) => {
  const { userInfo } = useContext(AuthContext);
  const [menus, setMenus] = useState([]);
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [region, setRegion] = useState(MAP_CONFIG.initialRegion);
  const [showMap, setShowMap] = useState(false);
  const [filters, setFilters] = useState({
    distance: '5',
    type: 'lunch'
  });

  // Fetch data on component mount
  useEffect(() => {
    fetchData();
  }, []);

  // Fetch data when filters change
  useEffect(() => {
    fetchData();
  }, [filters]);

  // Fetch data
  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Get current location
      const location = await getCurrentLocation();
      setRegion(location);

      // Get nearby restaurants
      const nearbyRestaurants = await getNearbyRestaurants(
        location.latitude,
        location.longitude,
        filters.distance
      );
      setRestaurants(nearbyRestaurants);

      // Get today's menus
      const todayMenus = await getTodayMenus();
      
      // Filter menus
      let filteredMenus = todayMenus.filter(menu => {
        // Filter by type
        if (filters.type && menu.type !== filters.type) {
          return false;
        }
        
        // Filter by price
        if (filters.price_min && filters.price_max) {
          const min = parseFloat(filters.price_min);
          const max = parseFloat(filters.price_max);
          if (menu.price < min || menu.price > max) {
            return false;
          }
        }
        
        // Filter by cuisine type
        if (filters.cuisine_type && menu.restaurant_id.cuisine_type !== filters.cuisine_type) {
          return false;
        }
        
        // Filter by dietary option
        if (filters.dietary_option && !menu.restaurant_id.dietary_options.includes(filters.dietary_option)) {
          return false;
        }
        
        // Filter by search text
        if (filters.search) {
          const searchText = filters.search.toLowerCase();
          const starterMatch = menu.starter && menu.starter.toLowerCase().includes(searchText);
          const mainMatch = menu.main && menu.main.toLowerCase().includes(searchText);
          const dessertMatch = menu.dessert && menu.dessert.toLowerCase().includes(searchText);
          const tagsMatch = menu.tags && menu.tags.some(tag => tag.toLowerCase().includes(searchText));
          
          if (!starterMatch && !mainMatch && !dessertMatch && !tagsMatch) {
            return false;
          }
        }
        
        return true;
      });
      
      setMenus(filteredMenus);
      setLoading(false);
      setRefreshing(false);
    } catch (error) {
      console.error('Error fetching data:', error);
      setError('Failed to load data. Please try again.');
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Handle refresh
  const handleRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  // Handle filter change
  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
  };

  // Toggle map view
  const toggleMapView = () => {
    setShowMap(!showMap);
  };

  // Handle random menu (Lunch Roulette)
  const handleRandomMenu = () => {
    if (menus.length > 0) {
      const randomIndex = Math.floor(Math.random() * menus.length);
      const randomMenu = menus[randomIndex];
      navigation.navigate('MenuDetails', { menuId: randomMenu._id });
    }
  };

  // Render header
  const renderHeader = () => (
    <View style={styles.header}>
      <Text style={styles.greeting}>
        ¡Hola, {userInfo?.name?.split(' ')[0] || 'there'}!
      </Text>
      <Text style={styles.subtitle}>¿Qué quieres comer hoy?</Text>
      
      <FilterBar onFilter={handleFilterChange} initialFilters={filters} />
      
      <View style={styles.viewToggle}>
        <TouchableOpacity 
          style={[styles.viewButton, !showMap && styles.activeViewButton]} 
          onPress={() => setShowMap(false)}
        >
          <Ionicons 
            name="list" 
            size={20} 
            color={!showMap ? COLORS.background : COLORS.text} 
          />
          <Text style={[styles.viewButtonText, !showMap && styles.activeViewButtonText]}>
            List
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.viewButton, showMap && styles.activeViewButton]} 
          onPress={() => setShowMap(true)}
        >
          <Ionicons 
            name="map" 
            size={20} 
            color={showMap ? COLORS.background : COLORS.text} 
          />
          <Text style={[styles.viewButtonText, showMap && styles.activeViewButtonText]}>
            Map
          </Text>
        </TouchableOpacity>
      </View>
      
      <TouchableOpacity style={styles.rouletteButton} onPress={handleRandomMenu}>
        <Ionicons name="shuffle" size={20} color={COLORS.background} />
        <Text style={styles.rouletteButtonText}>Lunch Roulette</Text>
      </TouchableOpacity>
    </View>
  );

  // Render empty state
  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="restaurant-outline" size={80} color={COLORS.textLight} />
      <Text style={styles.emptyText}>No menus found</Text>
      <Text style={styles.emptySubtext}>
        Try adjusting your filters or check back later
      </Text>
    </View>
  );

  // Render error state
  const renderError = () => (
    <View style={styles.errorContainer}>
      <Ionicons name="alert-circle-outline" size={80} color={COLORS.error} />
      <Text style={styles.errorText}>{error}</Text>
      <TouchableOpacity style={styles.retryButton} onPress={fetchData}>
        <Text style={styles.retryButtonText}>Retry</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={globalStyles.safeArea}>
      {renderHeader()}
      
      {loading && !refreshing ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Loading menus...</Text>
        </View>
      ) : error ? (
        renderError()
      ) : showMap ? (
        <View style={styles.mapContainer}>
          <MapView
            provider={PROVIDER_GOOGLE}
            style={styles.map}
            region={region}
            showsUserLocation
            showsMyLocationButton
          >
            {restaurants.map((restaurant) => (
              <Marker
                key={restaurant._id}
                coordinate={{
                  latitude: restaurant.location.coordinates[1],
                  longitude: restaurant.location.coordinates[0],
                }}
                title={restaurant.name}
                description={`${restaurant.cuisine_type} • ${restaurant.average_rating.toFixed(1)}★`}
                onPress={() => navigation.navigate('RestaurantDetails', { restaurantId: restaurant._id })}
              />
            ))}
          </MapView>
        </View>
      ) : (
        <FlatList
          data={menus}
          keyExtractor={(item) => item._id}
          renderItem={({ item }) => (
            <MenuCard
              menu={item}
              onPress={() => navigation.navigate('MenuDetails', { menuId: item._id })}
            />
          )}
          ListEmptyComponent={renderEmpty}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              colors={[COLORS.primary]}
            />
          }
          contentContainerStyle={menus.length === 0 && styles.flatListContent}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  header: {
    padding: SPACING.large,
    backgroundColor: COLORS.background,
  },
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.textLight,
    marginBottom: SPACING.large,
  },
  viewToggle: {
    flexDirection: 'row',
    marginTop: SPACING.medium,
    marginBottom: SPACING.medium,
    borderRadius: 8,
    backgroundColor: COLORS.backgroundLight,
    padding: 4,
  },
  viewButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: 6,
  },
  activeViewButton: {
    backgroundColor: COLORS.primary,
  },
  viewButtonText: {
    marginLeft: 4,
    fontSize: 14,
    color: COLORS.text,
  },
  activeViewButtonText: {
    color: COLORS.background,
    fontWeight: 'bold',
  },
  rouletteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.accent,
    paddingVertical: SPACING.medium,
    borderRadius: 8,
    marginTop: SPACING.medium,
  },
  rouletteButtonText: {
    marginLeft: SPACING.small,
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: SPACING.medium,
    fontSize: 16,
    color: COLORS.textLight,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.large,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
    marginTop: SPACING.large,
  },
  emptySubtext: {
    fontSize: 14,
    color: COLORS.textLight,
    textAlign: 'center',
    marginTop: SPACING.small,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.large,
  },
  errorText: {
    fontSize: 16,
    color: COLORS.error,
    textAlign: 'center',
    marginTop: SPACING.large,
    marginBottom: SPACING.large,
  },
  retryButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.large,
    paddingVertical: SPACING.medium,
    borderRadius: 8,
  },
  retryButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.background,
  },
  mapContainer: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  flatListContent: {
    flexGrow: 1,
  },
});

export default HomeScreen; 