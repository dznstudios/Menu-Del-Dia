import React, { useState, useEffect, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Linking,
  Share,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AuthContext } from '../context/AuthContext';
import { getMenuById } from '../services/menuService';
import { addToFavorites, removeFromFavorites } from '../services/userService';
import globalStyles, { COLORS, SPACING, RADIUS, SIZES, SHADOW } from '../styles/globalStyles';

const MenuDetailsScreen = ({ route, navigation }) => {
  const { menuId } = route.params;
  const { userInfo } = useContext(AuthContext);
  const [menu, setMenu] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFavorite, setIsFavorite] = useState(false);

  // Fetch menu details
  useEffect(() => {
    fetchMenuDetails();
  }, [menuId]);

  // Check if restaurant is in favorites
  useEffect(() => {
    if (userInfo && userInfo.favorites && menu) {
      setIsFavorite(userInfo.favorites.includes(menu.restaurant_id._id));
    }
  }, [userInfo, menu]);

  // Fetch menu details
  const fetchMenuDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getMenuById(menuId);
      setMenu(data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching menu details:', error);
      setError('Failed to load menu details. Please try again.');
      setLoading(false);
    }
  };

  // Toggle favorite
  const toggleFavorite = async () => {
    if (!userInfo) {
      Alert.alert('Sign In Required', 'Please sign in to save favorites');
      return;
    }

    try {
      if (isFavorite) {
        await removeFromFavorites(menu.restaurant_id._id);
      } else {
        await addToFavorites(menu.restaurant_id._id);
      }
      setIsFavorite(!isFavorite);
    } catch (error) {
      console.error('Error toggling favorite:', error);
      Alert.alert('Error', 'Failed to update favorites. Please try again.');
    }
  };

  // Call restaurant
  const callRestaurant = () => {
    if (menu?.restaurant_id?.phone_number) {
      Linking.openURL(`tel:${menu.restaurant_id.phone_number}`);
    } else {
      Alert.alert('Error', 'Phone number not available');
    }
  };

  // Share menu
  const shareMenu = async () => {
    try {
      await Share.share({
        message: `Check out this Menú del Día at ${menu.restaurant_id.name}!\n\nStarter: ${menu.starter}\nMain: ${menu.main}\nDessert: ${menu.dessert || 'Not included'}\nPrice: €${menu.price.toFixed(2)}\n\nAvailable during ${menu.hours || '12-4 PM'}`,
        title: `Menú del Día at ${menu.restaurant_id.name}`,
      });
    } catch (error) {
      console.error('Error sharing menu:', error);
    }
  };

  // View restaurant details
  const viewRestaurantDetails = () => {
    navigation.navigate('RestaurantDetails', { restaurantId: menu.restaurant_id._id });
  };

  // Default image if no photo_url
  const defaultImage = 'https://via.placeholder.com/600x400?text=Menu+del+Dia';

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Loading menu details...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle-outline" size={80} color={COLORS.error} />
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={fetchMenuDetails}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!menu) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="restaurant-outline" size={80} color={COLORS.textLight} />
        <Text style={styles.errorText}>Menu not found</Text>
        <TouchableOpacity style={styles.retryButton} onPress={() => navigation.goBack()}>
          <Text style={styles.retryButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Menu Image */}
      <Image
        source={{ uri: menu.photo_url || defaultImage }}
        style={styles.image}
        resizeMode="cover"
      />

      {/* Exclusive Badge */}
      {menu.is_exclusive && (
        <View style={styles.exclusiveBadge}>
          <Text style={styles.exclusiveText}>App Exclusive</Text>
        </View>
      )}

      {/* Action Buttons */}
      <View style={styles.actionButtons}>
        <TouchableOpacity style={styles.actionButton} onPress={toggleFavorite}>
          <Ionicons
            name={isFavorite ? 'heart' : 'heart-outline'}
            size={24}
            color={isFavorite ? COLORS.error : COLORS.text}
          />
          <Text style={styles.actionButtonText}>
            {isFavorite ? 'Saved' : 'Save'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton} onPress={callRestaurant}>
          <Ionicons name="call-outline" size={24} color={COLORS.text} />
          <Text style={styles.actionButtonText}>Call</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton} onPress={shareMenu}>
          <Ionicons name="share-social-outline" size={24} color={COLORS.text} />
          <Text style={styles.actionButtonText}>Share</Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      <View style={styles.content}>
        {/* Restaurant Info */}
        <TouchableOpacity style={styles.restaurantInfo} onPress={viewRestaurantDetails}>
          <View>
            <Text style={styles.restaurantName}>{menu.restaurant_id.name}</Text>
            <Text style={styles.cuisineType}>{menu.restaurant_id.cuisine_type}</Text>
          </View>
          <Ionicons name="chevron-forward" size={24} color={COLORS.textLight} />
        </TouchableOpacity>

        {/* Price and Type */}
        <View style={styles.priceTypeContainer}>
          <View style={styles.priceContainer}>
            <Text style={styles.price}>{menu.price.toFixed(2)} €</Text>
          </View>
          <View style={styles.typeContainer}>
            <Text style={styles.type}>
              {menu.type === 'lunch' ? 'Lunch Menu' : 'Dinner Menu'}
            </Text>
          </View>
        </View>

        {/* Hours */}
        <View style={styles.hoursContainer}>
          <Ionicons name="time-outline" size={20} color={COLORS.textLight} />
          <Text style={styles.hours}>Available during {menu.hours || '12-4 PM'}</Text>
        </View>

        {/* Menu Details */}
        <View style={styles.menuDetails}>
          <Text style={styles.menuTitle}>Menu Details</Text>

          {menu.starter && (
            <View style={styles.menuItem}>
              <Text style={styles.menuItemLabel}>Starter</Text>
              <Text style={styles.menuItemText}>{menu.starter}</Text>
            </View>
          )}

          {menu.main && (
            <View style={styles.menuItem}>
              <Text style={styles.menuItemLabel}>Main Course</Text>
              <Text style={styles.menuItemText}>{menu.main}</Text>
            </View>
          )}

          {menu.dessert && (
            <View style={styles.menuItem}>
              <Text style={styles.menuItemLabel}>Dessert</Text>
              <Text style={styles.menuItemText}>{menu.dessert}</Text>
            </View>
          )}

          {menu.includes_drink && (
            <View style={styles.menuItem}>
              <Text style={styles.menuItemLabel}>Drinks</Text>
              <Text style={styles.menuItemText}>
                {menu.drink_options && menu.drink_options.length > 0
                  ? menu.drink_options.join(', ')
                  : 'Included'}
              </Text>
            </View>
          )}

          {menu.additional_info && (
            <View style={styles.menuItem}>
              <Text style={styles.menuItemLabel}>Additional Information</Text>
              <Text style={styles.menuItemText}>{menu.additional_info}</Text>
            </View>
          )}
        </View>

        {/* Tags */}
        {menu.tags && menu.tags.length > 0 && (
          <View style={styles.tagsContainer}>
            <Text style={styles.tagsTitle}>Tags</Text>
            <View style={styles.tagsList}>
              {menu.tags.map((tag, index) => (
                <View key={index} style={styles.tag}>
                  <Text style={styles.tagText}>{tag}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Dietary Options */}
        {menu.restaurant_id.dietary_options && menu.restaurant_id.dietary_options.length > 0 && (
          <View style={styles.dietaryContainer}>
            <Text style={styles.dietaryTitle}>Dietary Options Available</Text>
            <View style={styles.dietaryList}>
              {menu.restaurant_id.dietary_options.map((option, index) => (
                <View key={index} style={styles.dietaryOption}>
                  <Text style={styles.dietaryOptionText}>{option}</Text>
                </View>
              ))}
            </View>
          </View>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  loadingText: {
    marginTop: SPACING.medium,
    fontSize: SIZES.medium,
    color: COLORS.textLight,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.large,
    backgroundColor: COLORS.background,
  },
  errorText: {
    fontSize: SIZES.large,
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
  image: {
    width: '100%',
    height: 250,
  },
  exclusiveBadge: {
    position: 'absolute',
    top: 20,
    left: 20,
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.medium,
    paddingVertical: SPACING.small,
    borderRadius: RADIUS.medium,
    ...SHADOW.medium,
  },
  exclusiveText: {
    fontSize: SIZES.medium,
    fontWeight: 'bold',
    color: COLORS.background,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: SPACING.large,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.backgroundLight,
  },
  actionButton: {
    alignItems: 'center',
  },
  actionButtonText: {
    marginTop: SPACING.xs,
    fontSize: SIZES.small,
    color: COLORS.text,
  },
  content: {
    padding: SPACING.large,
  },
  restaurantInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: SPACING.medium,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.backgroundLight,
  },
  restaurantName: {
    fontSize: SIZES.xl,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  cuisineType: {
    fontSize: SIZES.medium,
    color: COLORS.textLight,
    marginTop: SPACING.xs,
  },
  priceTypeContainer: {
    flexDirection: 'row',
    marginTop: SPACING.large,
    marginBottom: SPACING.medium,
  },
  priceContainer: {
    backgroundColor: COLORS.accent,
    paddingHorizontal: SPACING.medium,
    paddingVertical: SPACING.small,
    borderRadius: RADIUS.medium,
    marginRight: SPACING.medium,
  },
  price: {
    fontSize: SIZES.large,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  typeContainer: {
    backgroundColor: COLORS.backgroundLight,
    paddingHorizontal: SPACING.medium,
    paddingVertical: SPACING.small,
    borderRadius: RADIUS.medium,
  },
  type: {
    fontSize: SIZES.medium,
    color: COLORS.text,
  },
  hoursContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.large,
  },
  hours: {
    fontSize: SIZES.medium,
    color: COLORS.textLight,
    marginLeft: SPACING.small,
  },
  menuDetails: {
    marginBottom: SPACING.large,
  },
  menuTitle: {
    fontSize: SIZES.large,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SPACING.medium,
  },
  menuItem: {
    marginBottom: SPACING.medium,
  },
  menuItemLabel: {
    fontSize: SIZES.medium,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  menuItemText: {
    fontSize: SIZES.medium,
    color: COLORS.text,
  },
  tagsContainer: {
    marginBottom: SPACING.large,
  },
  tagsTitle: {
    fontSize: SIZES.large,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SPACING.medium,
  },
  tagsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  tag: {
    backgroundColor: COLORS.backgroundLight,
    paddingHorizontal: SPACING.medium,
    paddingVertical: SPACING.small,
    borderRadius: RADIUS.medium,
    marginRight: SPACING.small,
    marginBottom: SPACING.small,
  },
  tagText: {
    fontSize: SIZES.small,
    color: COLORS.text,
  },
  dietaryContainer: {
    marginBottom: SPACING.large,
  },
  dietaryTitle: {
    fontSize: SIZES.large,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SPACING.medium,
  },
  dietaryList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dietaryOption: {
    backgroundColor: COLORS.primary + '20', // 20% opacity
    paddingHorizontal: SPACING.medium,
    paddingVertical: SPACING.small,
    borderRadius: RADIUS.medium,
    marginRight: SPACING.small,
    marginBottom: SPACING.small,
  },
  dietaryOptionText: {
    fontSize: SIZES.small,
    color: COLORS.primary,
    fontWeight: 'bold',
  },
});

export default MenuDetailsScreen; 