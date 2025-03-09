import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, RADIUS, SIZES } from '../styles/globalStyles';
import { CUISINE_TYPES, DIETARY_OPTIONS, PRICE_RANGES } from '../config/config';

const FilterBar = ({ onFilter, initialFilters = {} }) => {
  const [searchText, setSearchText] = useState(initialFilters.search || '');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    cuisine_type: initialFilters.cuisine_type || '',
    dietary_option: initialFilters.dietary_option || '',
    price_min: initialFilters.price_min || '',
    price_max: initialFilters.price_max || '',
    distance: initialFilters.distance || '5',
    type: initialFilters.type || 'lunch',
    ...initialFilters
  });

  // Handle search submit
  const handleSearch = () => {
    onFilter({ ...filters, search: searchText });
  };

  // Handle filter change
  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  // Apply filters
  const applyFilters = () => {
    onFilter({ ...filters, search: searchText });
    setShowFilters(false);
  };

  // Reset filters
  const resetFilters = () => {
    setFilters({
      cuisine_type: '',
      dietary_option: '',
      price_min: '',
      price_max: '',
      distance: '5',
      type: 'lunch'
    });
    setSearchText('');
  };

  // Select price range
  const selectPriceRange = (min, max) => {
    handleFilterChange('price_min', min.toString());
    handleFilterChange('price_max', max.toString());
  };

  return (
    <View style={styles.container}>
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search for menus, dishes..."
          value={searchText}
          onChangeText={setSearchText}
          onSubmitEditing={handleSearch}
          returnKeyType="search"
        />
        <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
          <Ionicons name="search" size={20} color={COLORS.background} />
        </TouchableOpacity>
      </View>

      {/* Filter Button */}
      <TouchableOpacity 
        style={styles.filterButton} 
        onPress={() => setShowFilters(true)}
      >
        <Ionicons name="options-outline" size={20} color={COLORS.text} />
        <Text style={styles.filterButtonText}>Filters</Text>
      </TouchableOpacity>

      {/* Active Filters Display */}
      {(filters.cuisine_type || filters.dietary_option || filters.price_min) && (
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={styles.activeFiltersContainer}
        >
          {filters.cuisine_type && (
            <TouchableOpacity 
              style={styles.activeFilter}
              onPress={() => handleFilterChange('cuisine_type', '')}
            >
              <Text style={styles.activeFilterText}>{filters.cuisine_type}</Text>
              <Ionicons name="close-circle" size={16} color={COLORS.text} />
            </TouchableOpacity>
          )}
          
          {filters.dietary_option && (
            <TouchableOpacity 
              style={styles.activeFilter}
              onPress={() => handleFilterChange('dietary_option', '')}
            >
              <Text style={styles.activeFilterText}>{filters.dietary_option}</Text>
              <Ionicons name="close-circle" size={16} color={COLORS.text} />
            </TouchableOpacity>
          )}
          
          {filters.price_min && (
            <TouchableOpacity 
              style={styles.activeFilter}
              onPress={() => {
                handleFilterChange('price_min', '');
                handleFilterChange('price_max', '');
              }}
            >
              <Text style={styles.activeFilterText}>
                {filters.price_min}-{filters.price_max} €
              </Text>
              <Ionicons name="close-circle" size={16} color={COLORS.text} />
            </TouchableOpacity>
          )}
          
          {filters.type && filters.type !== 'lunch' && (
            <TouchableOpacity 
              style={styles.activeFilter}
              onPress={() => handleFilterChange('type', 'lunch')}
            >
              <Text style={styles.activeFilterText}>{filters.type}</Text>
              <Ionicons name="close-circle" size={16} color={COLORS.text} />
            </TouchableOpacity>
          )}
          
          {/* Clear All Button */}
          <TouchableOpacity 
            style={[styles.activeFilter, styles.clearAllButton]}
            onPress={resetFilters}
          >
            <Text style={styles.clearAllText}>Clear All</Text>
          </TouchableOpacity>
        </ScrollView>
      )}

      {/* Filter Modal */}
      <Modal
        visible={showFilters}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowFilters(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            {/* Header */}
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Filters</Text>
              <TouchableOpacity onPress={() => setShowFilters(false)}>
                <Ionicons name="close" size={24} color={COLORS.text} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalScrollView}>
              {/* Cuisine Type */}
              <Text style={styles.filterTitle}>Cuisine Type</Text>
              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false}
                style={styles.optionsContainer}
              >
                {CUISINE_TYPES.map((cuisine, index) => (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.optionButton,
                      filters.cuisine_type === cuisine && styles.selectedOption
                    ]}
                    onPress={() => handleFilterChange('cuisine_type', cuisine)}
                  >
                    <Text 
                      style={[
                        styles.optionText,
                        filters.cuisine_type === cuisine && styles.selectedOptionText
                      ]}
                    >
                      {cuisine}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              {/* Dietary Options */}
              <Text style={styles.filterTitle}>Dietary Options</Text>
              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false}
                style={styles.optionsContainer}
              >
                {DIETARY_OPTIONS.map((option, index) => (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.optionButton,
                      filters.dietary_option === option && styles.selectedOption
                    ]}
                    onPress={() => handleFilterChange('dietary_option', option)}
                  >
                    <Text 
                      style={[
                        styles.optionText,
                        filters.dietary_option === option && styles.selectedOptionText
                      ]}
                    >
                      {option}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              {/* Price Range */}
              <Text style={styles.filterTitle}>Price Range</Text>
              <View style={styles.priceRangeContainer}>
                {PRICE_RANGES.map((range, index) => (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.priceRangeButton,
                      filters.price_min === range.min.toString() && 
                      filters.price_max === range.max.toString() && 
                      styles.selectedOption
                    ]}
                    onPress={() => selectPriceRange(range.min, range.max)}
                  >
                    <Text 
                      style={[
                        styles.priceRangeText,
                        filters.price_min === range.min.toString() && 
                        filters.price_max === range.max.toString() && 
                        styles.selectedOptionText
                      ]}
                    >
                      {range.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Menu Type */}
              <Text style={styles.filterTitle}>Menu Type</Text>
              <View style={styles.menuTypeContainer}>
                <TouchableOpacity
                  style={[
                    styles.menuTypeButton,
                    filters.type === 'lunch' && styles.selectedOption
                  ]}
                  onPress={() => handleFilterChange('type', 'lunch')}
                >
                  <Text 
                    style={[
                      styles.menuTypeText,
                      filters.type === 'lunch' && styles.selectedOptionText
                    ]}
                  >
                    Lunch
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.menuTypeButton,
                    filters.type === 'dinner' && styles.selectedOption
                  ]}
                  onPress={() => handleFilterChange('type', 'dinner')}
                >
                  <Text 
                    style={[
                      styles.menuTypeText,
                      filters.type === 'dinner' && styles.selectedOptionText
                    ]}
                  >
                    Dinner
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Distance */}
              <Text style={styles.filterTitle}>Distance (km)</Text>
              <View style={styles.distanceContainer}>
                {[1, 2, 5, 10, 20].map((distance) => (
                  <TouchableOpacity
                    key={distance}
                    style={[
                      styles.distanceButton,
                      filters.distance === distance.toString() && styles.selectedOption
                    ]}
                    onPress={() => handleFilterChange('distance', distance.toString())}
                  >
                    <Text 
                      style={[
                        styles.distanceText,
                        filters.distance === distance.toString() && styles.selectedOptionText
                      ]}
                    >
                      {distance} km
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>

            {/* Footer */}
            <View style={styles.modalFooter}>
              <TouchableOpacity 
                style={styles.resetButton}
                onPress={resetFilters}
              >
                <Text style={styles.resetButtonText}>Reset</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.applyButton}
                onPress={applyFilters}
              >
                <Text style={styles.applyButtonText}>Apply Filters</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.background,
    paddingHorizontal: SPACING.medium,
    paddingVertical: SPACING.small,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.backgroundLight,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  searchInput: {
    flex: 1,
    height: 40,
    backgroundColor: COLORS.backgroundLight,
    borderRadius: RADIUS.medium,
    paddingHorizontal: SPACING.medium,
    fontSize: SIZES.medium,
    color: COLORS.text,
  },
  searchButton: {
    backgroundColor: COLORS.primary,
    height: 40,
    width: 40,
    borderRadius: RADIUS.medium,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: SPACING.small,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SPACING.small,
  },
  filterButtonText: {
    fontSize: SIZES.medium,
    color: COLORS.text,
    marginLeft: SPACING.xs,
  },
  activeFiltersContainer: {
    flexDirection: 'row',
    marginTop: SPACING.small,
  },
  activeFilter: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.backgroundLight,
    paddingHorizontal: SPACING.small,
    paddingVertical: SPACING.xs,
    borderRadius: RADIUS.small,
    marginRight: SPACING.small,
  },
  activeFilterText: {
    fontSize: SIZES.small,
    color: COLORS.text,
    marginRight: SPACING.xs,
  },
  clearAllButton: {
    backgroundColor: COLORS.textLight,
  },
  clearAllText: {
    fontSize: SIZES.small,
    color: COLORS.background,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: COLORS.background,
    borderTopLeftRadius: RADIUS.large,
    borderTopRightRadius: RADIUS.large,
    paddingHorizontal: SPACING.large,
    paddingBottom: SPACING.large,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.large,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.backgroundLight,
  },
  modalTitle: {
    fontSize: SIZES.xl,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  modalScrollView: {
    marginBottom: SPACING.large,
  },
  filterTitle: {
    fontSize: SIZES.large,
    fontWeight: 'bold',
    color: COLORS.text,
    marginTop: SPACING.large,
    marginBottom: SPACING.small,
  },
  optionsContainer: {
    flexDirection: 'row',
    marginBottom: SPACING.medium,
  },
  optionButton: {
    paddingHorizontal: SPACING.medium,
    paddingVertical: SPACING.small,
    borderRadius: RADIUS.medium,
    backgroundColor: COLORS.backgroundLight,
    marginRight: SPACING.small,
  },
  selectedOption: {
    backgroundColor: COLORS.primary,
  },
  optionText: {
    fontSize: SIZES.medium,
    color: COLORS.text,
  },
  selectedOptionText: {
    color: COLORS.background,
    fontWeight: 'bold',
  },
  priceRangeContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  priceRangeButton: {
    paddingHorizontal: SPACING.medium,
    paddingVertical: SPACING.small,
    borderRadius: RADIUS.medium,
    backgroundColor: COLORS.backgroundLight,
    marginRight: SPACING.small,
    marginBottom: SPACING.small,
  },
  priceRangeText: {
    fontSize: SIZES.medium,
    color: COLORS.text,
  },
  menuTypeContainer: {
    flexDirection: 'row',
  },
  menuTypeButton: {
    flex: 1,
    paddingVertical: SPACING.small,
    borderRadius: RADIUS.medium,
    backgroundColor: COLORS.backgroundLight,
    marginRight: SPACING.small,
    alignItems: 'center',
  },
  menuTypeText: {
    fontSize: SIZES.medium,
    color: COLORS.text,
  },
  distanceContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  distanceButton: {
    paddingHorizontal: SPACING.medium,
    paddingVertical: SPACING.small,
    borderRadius: RADIUS.medium,
    backgroundColor: COLORS.backgroundLight,
    marginRight: SPACING.small,
    marginBottom: SPACING.small,
  },
  distanceText: {
    fontSize: SIZES.medium,
    color: COLORS.text,
  },
  modalFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: SPACING.medium,
    borderTopWidth: 1,
    borderTopColor: COLORS.backgroundLight,
  },
  resetButton: {
    paddingVertical: SPACING.medium,
    paddingHorizontal: SPACING.large,
    borderRadius: RADIUS.medium,
    backgroundColor: COLORS.backgroundLight,
  },
  resetButtonText: {
    fontSize: SIZES.medium,
    color: COLORS.text,
    fontWeight: 'bold',
  },
  applyButton: {
    paddingVertical: SPACING.medium,
    paddingHorizontal: SPACING.large,
    borderRadius: RADIUS.medium,
    backgroundColor: COLORS.primary,
  },
  applyButtonText: {
    fontSize: SIZES.medium,
    color: COLORS.background,
    fontWeight: 'bold',
  },
});

export default FilterBar; 