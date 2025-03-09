import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import globalStyles, { COLORS, SPACING, RADIUS, SHADOW, SIZES } from '../styles/globalStyles';

const MenuCard = ({ menu, onPress, isFavorite, onToggleFavorite }) => {
  const navigation = useNavigation();
  
  // Default image if no photo_url
  const defaultImage = 'https://via.placeholder.com/300x200?text=Menu+del+Dia';
  
  // Format price to show € symbol
  const formattedPrice = `${menu.price.toFixed(2)} €`;
  
  // Get restaurant name if available
  const restaurantName = menu.restaurant_id?.name || 'Restaurant';
  
  // Get distance if available
  const distance = menu.distance ? `${menu.distance.toFixed(1)} km` : '';
  
  return (
    <TouchableOpacity 
      style={styles.card}
      onPress={onPress || (() => navigation.navigate('MenuDetails', { menuId: menu._id }))}
      activeOpacity={0.8}
    >
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
      
      {/* Favorite Button */}
      {onToggleFavorite && (
        <TouchableOpacity 
          style={styles.favoriteButton}
          onPress={() => onToggleFavorite(menu._id)}
        >
          <Ionicons 
            name={isFavorite ? 'heart' : 'heart-outline'} 
            size={24} 
            color={isFavorite ? COLORS.error : COLORS.text} 
          />
        </TouchableOpacity>
      )}
      
      {/* Content */}
      <View style={styles.content}>
        {/* Restaurant Info */}
        <View style={styles.restaurantRow}>
          <Text style={styles.restaurantName}>{restaurantName}</Text>
          {distance && <Text style={styles.distance}>{distance}</Text>}
        </View>
        
        {/* Price */}
        <View style={styles.priceContainer}>
          <Text style={styles.price}>{formattedPrice}</Text>
        </View>
        
        {/* Menu Details */}
        <View style={styles.menuDetails}>
          {menu.starter && (
            <View style={styles.menuItem}>
              <Text style={styles.menuItemLabel}>Starter:</Text>
              <Text style={styles.menuItemText}>{menu.starter}</Text>
            </View>
          )}
          
          {menu.main && (
            <View style={styles.menuItem}>
              <Text style={styles.menuItemLabel}>Main:</Text>
              <Text style={styles.menuItemText}>{menu.main}</Text>
            </View>
          )}
          
          {menu.dessert && (
            <View style={styles.menuItem}>
              <Text style={styles.menuItemLabel}>Dessert:</Text>
              <Text style={styles.menuItemText}>{menu.dessert}</Text>
            </View>
          )}
        </View>
        
        {/* Tags */}
        {menu.tags && menu.tags.length > 0 && (
          <View style={styles.tagsContainer}>
            {menu.tags.map((tag, index) => (
              <View key={index} style={styles.tag}>
                <Text style={styles.tagText}>{tag}</Text>
              </View>
            ))}
          </View>
        )}
        
        {/* Hours */}
        <View style={styles.hoursContainer}>
          <Ionicons name="time-outline" size={16} color={COLORS.textLight} />
          <Text style={styles.hours}>{menu.hours || '12-4 PM'}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.background,
    borderRadius: RADIUS.medium,
    marginVertical: SPACING.medium,
    marginHorizontal: SPACING.medium,
    overflow: 'hidden',
    ...SHADOW.medium,
  },
  image: {
    width: '100%',
    height: 150,
  },
  exclusiveBadge: {
    position: 'absolute',
    top: 10,
    left: 10,
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.small,
    paddingVertical: SPACING.xs,
    borderRadius: RADIUS.small,
  },
  exclusiveText: {
    color: COLORS.background,
    fontSize: SIZES.small,
    fontWeight: 'bold',
  },
  favoriteButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: COLORS.background,
    padding: SPACING.xs,
    borderRadius: RADIUS.round,
    ...SHADOW.small,
  },
  content: {
    padding: SPACING.large,
  },
  restaurantRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.small,
  },
  restaurantName: {
    fontSize: SIZES.large,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  distance: {
    fontSize: SIZES.small,
    color: COLORS.textLight,
  },
  priceContainer: {
    position: 'absolute',
    top: -30,
    right: 10,
    backgroundColor: COLORS.accent,
    paddingHorizontal: SPACING.medium,
    paddingVertical: SPACING.xs,
    borderRadius: RADIUS.medium,
    ...SHADOW.small,
  },
  price: {
    fontSize: SIZES.large,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  menuDetails: {
    marginTop: SPACING.medium,
  },
  menuItem: {
    marginBottom: SPACING.small,
  },
  menuItemLabel: {
    fontSize: SIZES.small,
    fontWeight: 'bold',
    color: COLORS.textLight,
  },
  menuItemText: {
    fontSize: SIZES.medium,
    color: COLORS.text,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: SPACING.medium,
  },
  tag: {
    backgroundColor: COLORS.backgroundLight,
    paddingHorizontal: SPACING.small,
    paddingVertical: SPACING.xs,
    borderRadius: RADIUS.small,
    marginRight: SPACING.small,
    marginBottom: SPACING.small,
  },
  tagText: {
    fontSize: SIZES.small,
    color: COLORS.textLight,
  },
  hoursContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SPACING.medium,
  },
  hours: {
    fontSize: SIZES.small,
    color: COLORS.textLight,
    marginLeft: SPACING.xs,
  },
});

export default MenuCard; 