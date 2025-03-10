import React, { useState, useEffect, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  RefreshControl
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AuthContext } from '../context/AuthContext';
import { getUserProfile } from '../services/userService';
import { getMenusByRestaurant, deleteMenu } from '../services/menuService';
import globalStyles, { COLORS, SPACING, RADIUS, SIZES } from '../styles/globalStyles';

const RestaurantDashboardScreen = ({ navigation }) => {
  const { userInfo } = useContext(AuthContext);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [restaurant, setRestaurant] = useState(null);
  const [menus, setMenus] = useState([]);

  // Fetch data on component mount
  useEffect(() => {
    fetchData();
  }, []);

  // Fetch data
  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Get user profile to get restaurant info
      const profile = await getUserProfile();
      
      if (profile.restaurants && profile.restaurants.length > 0) {
        const restaurantId = profile.restaurants[0]._id;
        setRestaurant(profile.restaurants[0]);
        
        // Get menus for this restaurant
        const restaurantMenus = await getMenusByRestaurant(restaurantId);
        setMenus(restaurantMenus);
      } else {
        setError('No restaurant found. Please create a restaurant first.');
      }

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

  // Handle menu deletion
  const handleDeleteMenu = (menuId) => {
    Alert.alert(
      'Delete Menu',
      'Are you sure you want to delete this menu?',
      [
        {
          text: 'Cancel',
          style: 'cancel'
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteMenu(menuId);
              // Refresh menus list
              fetchData();
              Alert.alert('Success', 'Menu deleted successfully');
            } catch (error) {
              console.error('Error deleting menu:', error);
              Alert.alert('Error', 'Failed to delete menu. Please try again.');
            }
          }
        }
      ]
    );
  };

  // Handle menu edit
  const handleEditMenu = (menuId) => {
    navigation.navigate('EditMenu', { menuId });
  };

  // Render menu item
  const renderMenuItem = ({ item }) => {
    const formattedDate = new Date(item.created_at).toLocaleDateString();
    
    return (
      <View style={styles.menuItem}>
        <View style={styles.menuHeader}>
          <View>
            <Text style={styles.menuType}>
              {item.type === 'lunch' ? 'Lunch Menu' : 'Dinner Menu'}
            </Text>
            <Text style={styles.menuDate}>{formattedDate}</Text>
          </View>
          <Text style={styles.menuPrice}>{item.price.toFixed(2)} €</Text>
        </View>
        
        <View style={styles.menuContent}>
          {item.starter && (
            <Text style={styles.menuText}>
              <Text style={styles.menuLabel}>Starter: </Text>
              {item.starter}
            </Text>
          )}
          
          {item.main && (
            <Text style={styles.menuText}>
              <Text style={styles.menuLabel}>Main: </Text>
              {item.main}
            </Text>
          )}
          
          {item.dessert && (
            <Text style={styles.menuText}>
              <Text style={styles.menuLabel}>Dessert: </Text>
              {item.dessert}
            </Text>
          )}
        </View>
        
        {item.is_exclusive && (
          <View style={styles.exclusiveBadge}>
            <Text style={styles.exclusiveText}>App Exclusive</Text>
          </View>
        )}
        
        <View style={styles.menuActions}>
          <TouchableOpacity 
            style={styles.menuAction}
            onPress={() => handleEditMenu(item._id)}
          >
            <Ionicons name="create-outline" size={20} color={COLORS.primary} />
            <Text style={styles.menuActionText}>Edit</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.menuAction}
            onPress={() => handleDeleteMenu(item._id)}
          >
            <Ionicons name="trash-outline" size={20} color={COLORS.error} />
            <Text style={[styles.menuActionText, { color: COLORS.error }]}>Delete</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  // Render empty state
  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="restaurant-outline" size={80} color={COLORS.textLight} />
      <Text style={styles.emptyText}>No menus found</Text>
      <Text style={styles.emptySubtext}>
        Create your first Menú del Día by tapping the button below
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
    <View style={styles.container}>
      {/* Restaurant Info */}
      {restaurant && (
        <View style={styles.restaurantInfo}>
          <Text style={styles.restaurantName}>{restaurant.name}</Text>
          <Text style={styles.restaurantCuisine}>{restaurant.cuisine_type}</Text>
        </View>
      )}
      
      {/* Menus List */}
      {loading && !refreshing ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Loading menus...</Text>
        </View>
      ) : error ? (
        renderError()
      ) : (
        <FlatList
          data={menus}
          keyExtractor={(item) => item._id}
          renderItem={renderMenuItem}
          ListEmptyComponent={renderEmpty}
          contentContainerStyle={menus.length === 0 && styles.flatListContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              colors={[COLORS.primary]}
            />
          }
        />
      )}
      
      {/* Add Menu Button */}
      <TouchableOpacity 
        style={styles.addButton}
        onPress={() => navigation.navigate('Upload Menu')}
      >
        <Ionicons name="add" size={24} color={COLORS.background} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  restaurantInfo: {
    padding: SPACING.large,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.backgroundLight,
  },
  restaurantName: {
    fontSize: SIZES.xl,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  restaurantCuisine: {
    fontSize: SIZES.medium,
    color: COLORS.textLight,
    marginTop: SPACING.xs,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: SPACING.medium,
    fontSize: SIZES.medium,
    color: COLORS.textLight,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.large,
  },
  emptyText: {
    fontSize: SIZES.large,
    fontWeight: 'bold',
    color: COLORS.text,
    marginTop: SPACING.large,
  },
  emptySubtext: {
    fontSize: SIZES.medium,
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
    fontSize: SIZES.medium,
    color: COLORS.error,
    textAlign: 'center',
    marginTop: SPACING.large,
    marginBottom: SPACING.large,
  },
  retryButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.large,
    paddingVertical: SPACING.medium,
    borderRadius: RADIUS.medium,
  },
  retryButtonText: {
    fontSize: SIZES.medium,
    fontWeight: 'bold',
    color: COLORS.background,
  },
  flatListContent: {
    flexGrow: 1,
  },
  menuItem: {
    backgroundColor: COLORS.background,
    borderRadius: RADIUS.medium,
    margin: SPACING.medium,
    padding: SPACING.medium,
    borderWidth: 1,
    borderColor: COLORS.backgroundLight,
  },
  menuHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.medium,
  },
  menuType: {
    fontSize: SIZES.medium,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  menuDate: {
    fontSize: SIZES.small,
    color: COLORS.textLight,
  },
  menuPrice: {
    fontSize: SIZES.large,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  menuContent: {
    marginBottom: SPACING.medium,
  },
  menuText: {
    fontSize: SIZES.medium,
    color: COLORS.text,
    marginBottom: SPACING.small,
  },
  menuLabel: {
    fontWeight: 'bold',
  },
  exclusiveBadge: {
    alignSelf: 'flex-start',
    backgroundColor: COLORS.primary + '20', // 20% opacity
    paddingHorizontal: SPACING.small,
    paddingVertical: SPACING.xs,
    borderRadius: RADIUS.small,
    marginBottom: SPACING.medium,
  },
  exclusiveText: {
    fontSize: SIZES.small,
    color: COLORS.primary,
    fontWeight: 'bold',
  },
  menuActions: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: COLORS.backgroundLight,
    paddingTop: SPACING.medium,
  },
  menuAction: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: SPACING.large,
  },
  menuActionText: {
    fontSize: SIZES.small,
    color: COLORS.primary,
    marginLeft: SPACING.xs,
  },
  addButton: {
    position: 'absolute',
    bottom: SPACING.large,
    right: SPACING.large,
    backgroundColor: COLORS.primary,
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
});

export default RestaurantDashboardScreen; 