import React, { useState, useContext, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  ActivityIndicator,
  Alert,
  Platform,
  KeyboardAvoidingView,
  Switch
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { AuthContext } from '../context/AuthContext';
import { uploadMenuImage, createMenu } from '../services/menuService';
import { getUserProfile } from '../services/userService';
import globalStyles, { COLORS, SPACING, RADIUS, SIZES, SHADOW } from '../styles/globalStyles';

const MenuUploadScreen = ({ navigation }) => {
  const { userInfo } = useContext(AuthContext);
  const [loading, setLoading] = useState(false);
  const [ocrLoading, setOcrLoading] = useState(false);
  const [error, setError] = useState(null);
  const [restaurantId, setRestaurantId] = useState('');
  const [image, setImage] = useState(null);
  const [menuData, setMenuData] = useState({
    type: 'lunch',
    starter: '',
    main: '',
    dessert: '',
    price: '',
    hours: '12-4 PM',
    tags: [],
    is_exclusive: false,
    includes_drink: false,
    drink_options: [],
    additional_info: ''
  });
  const [tagInput, setTagInput] = useState('');
  const [drinkInput, setDrinkInput] = useState('');
  const [useOcr, setUseOcr] = useState(true);

  // Get user's restaurant ID
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const profile = await getUserProfile();
        if (profile.restaurants && profile.restaurants.length > 0) {
          setRestaurantId(profile.restaurants[0]._id);
        }
      } catch (error) {
        console.error('Error fetching user profile:', error);
      }
    };

    fetchUserProfile();
  }, []);

  // Request camera permissions
  useEffect(() => {
    (async () => {
      if (Platform.OS !== 'web') {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('Permission needed', 'Sorry, we need camera permissions to make this work!');
        }
      }
    })();
  }, []);

  // Handle input change
  const handleInputChange = (key, value) => {
    setMenuData(prev => ({ ...prev, [key]: value }));
  };

  // Handle price input (ensure it's a number)
  const handlePriceInput = (value) => {
    // Allow only numbers and decimal point
    const regex = /^\d*\.?\d*$/;
    if (value === '' || regex.test(value)) {
      handleInputChange('price', value);
    }
  };

  // Add tag
  const addTag = () => {
    if (tagInput.trim()) {
      setMenuData(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()]
      }));
      setTagInput('');
    }
  };

  // Remove tag
  const removeTag = (index) => {
    setMenuData(prev => ({
      ...prev,
      tags: prev.tags.filter((_, i) => i !== index)
    }));
  };

  // Add drink option
  const addDrinkOption = () => {
    if (drinkInput.trim()) {
      setMenuData(prev => ({
        ...prev,
        drink_options: [...prev.drink_options, drinkInput.trim()]
      }));
      setDrinkInput('');
    }
  };

  // Remove drink option
  const removeDrinkOption = (index) => {
    setMenuData(prev => ({
      ...prev,
      drink_options: prev.drink_options.filter((_, i) => i !== index)
    }));
  };

  // Pick image from camera or gallery
  const pickImage = async (useCamera = false) => {
    try {
      let result;
      
      if (useCamera) {
        result = await ImagePicker.launchCameraAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: true,
          aspect: [4, 3],
          quality: 1,
        });
      } else {
        result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: true,
          aspect: [4, 3],
          quality: 1,
        });
      }

      if (!result.canceled) {
        setImage(result.assets[0]);
        
        if (useOcr) {
          processImageWithOcr(result.assets[0]);
        }
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image. Please try again.');
    }
  };

  // Process image with OCR
  const processImageWithOcr = async (imageFile) => {
    try {
      setOcrLoading(true);
      setError(null);

      // Create form data for upload
      const formData = new FormData();
      formData.append('restaurant_id', restaurantId);
      formData.append('photo', {
        uri: imageFile.uri,
        name: 'menu.jpg',
        type: 'image/jpeg'
      });

      // Upload and process image
      const parsedMenu = await uploadMenuImage(restaurantId, imageFile);

      // Update menu data with parsed results
      setMenuData(prev => ({
        ...prev,
        starter: parsedMenu.starter || '',
        main: parsedMenu.main || '',
        dessert: parsedMenu.dessert || '',
        price: parsedMenu.price ? parsedMenu.price.toString() : '',
        tags: parsedMenu.tags || []
      }));

      setOcrLoading(false);
    } catch (error) {
      console.error('Error processing image with OCR:', error);
      setError('Failed to process image. Please try manual input.');
      setOcrLoading(false);
    }
  };

  // Submit menu
  const submitMenu = async () => {
    try {
      // Validate required fields
      if (!menuData.starter || !menuData.main || !menuData.price) {
        Alert.alert('Missing Information', 'Please fill in at least the starter, main course, and price.');
        return;
      }

      setLoading(true);
      setError(null);

      // Create menu data
      const menuPayload = {
        ...menuData,
        restaurant_id: restaurantId,
        price: parseFloat(menuData.price)
      };

      // Create menu
      await createMenu(menuPayload, image);

      // Success
      Alert.alert('Success', 'Menu created successfully!');
      
      // Reset form
      setMenuData({
        type: 'lunch',
        starter: '',
        main: '',
        dessert: '',
        price: '',
        hours: '12-4 PM',
        tags: [],
        is_exclusive: false,
        includes_drink: false,
        drink_options: [],
        additional_info: ''
      });
      setImage(null);
      
      setLoading(false);
      
      // Navigate back to dashboard
      navigation.navigate('Dashboard');
    } catch (error) {
      console.error('Error submitting menu:', error);
      setError('Failed to create menu. Please try again.');
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
    >
      <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
        <Text style={styles.title}>Upload Menu del Día</Text>
        
        {/* Error Message */}
        {error && (
          <View style={styles.errorContainer}>
            <Ionicons name="alert-circle-outline" size={20} color={COLORS.error} />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}
        
        {/* Upload Method Toggle */}
        <View style={styles.toggleContainer}>
          <Text style={styles.toggleLabel}>Use OCR (Photo Upload)</Text>
          <Switch
            value={useOcr}
            onValueChange={setUseOcr}
            trackColor={{ false: COLORS.backgroundLight, true: COLORS.primary }}
            thumbColor={COLORS.background}
          />
        </View>
        
        {/* Image Upload Section */}
        <View style={styles.imageSection}>
          <Text style={styles.sectionTitle}>Menu Image</Text>
          
          {image ? (
            <View style={styles.imagePreviewContainer}>
              <Image source={{ uri: image.uri }} style={styles.imagePreview} />
              <TouchableOpacity 
                style={styles.removeImageButton}
                onPress={() => setImage(null)}
              >
                <Ionicons name="close-circle" size={24} color={COLORS.error} />
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.uploadButtonsContainer}>
              <TouchableOpacity 
                style={styles.uploadButton}
                onPress={() => pickImage(false)}
              >
                <Ionicons name="images-outline" size={24} color={COLORS.primary} />
                <Text style={styles.uploadButtonText}>Gallery</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.uploadButton}
                onPress={() => pickImage(true)}
              >
                <Ionicons name="camera-outline" size={24} color={COLORS.primary} />
                <Text style={styles.uploadButtonText}>Camera</Text>
              </TouchableOpacity>
            </View>
          )}
          
          {ocrLoading && (
            <View style={styles.ocrLoadingContainer}>
              <ActivityIndicator size="small" color={COLORS.primary} />
              <Text style={styles.ocrLoadingText}>Processing image...</Text>
            </View>
          )}
        </View>
        
        {/* Menu Details Section */}
        <View style={styles.menuDetailsSection}>
          <Text style={styles.sectionTitle}>Menu Details</Text>
          
          {/* Menu Type */}
          <Text style={styles.inputLabel}>Menu Type</Text>
          <View style={styles.menuTypeContainer}>
            <TouchableOpacity
              style={[
                styles.menuTypeButton,
                menuData.type === 'lunch' && styles.selectedMenuType
              ]}
              onPress={() => handleInputChange('type', 'lunch')}
            >
              <Text 
                style={[
                  styles.menuTypeText,
                  menuData.type === 'lunch' && styles.selectedMenuTypeText
                ]}
              >
                Lunch
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[
                styles.menuTypeButton,
                menuData.type === 'dinner' && styles.selectedMenuType
              ]}
              onPress={() => handleInputChange('type', 'dinner')}
            >
              <Text 
                style={[
                  styles.menuTypeText,
                  menuData.type === 'dinner' && styles.selectedMenuTypeText
                ]}
              >
                Dinner
              </Text>
            </TouchableOpacity>
          </View>
          
          {/* Starter */}
          <Text style={styles.inputLabel}>Starter</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter starter"
            value={menuData.starter}
            onChangeText={(text) => handleInputChange('starter', text)}
            multiline
          />
          
          {/* Main Course */}
          <Text style={styles.inputLabel}>Main Course</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter main course"
            value={menuData.main}
            onChangeText={(text) => handleInputChange('main', text)}
            multiline
          />
          
          {/* Dessert */}
          <Text style={styles.inputLabel}>Dessert (Optional)</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter dessert"
            value={menuData.dessert}
            onChangeText={(text) => handleInputChange('dessert', text)}
            multiline
          />
          
          {/* Price */}
          <Text style={styles.inputLabel}>Price (€)</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter price"
            value={menuData.price}
            onChangeText={handlePriceInput}
            keyboardType="numeric"
          />
          
          {/* Hours */}
          <Text style={styles.inputLabel}>Available Hours</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g., 12-4 PM"
            value={menuData.hours}
            onChangeText={(text) => handleInputChange('hours', text)}
          />
          
          {/* Tags */}
          <Text style={styles.inputLabel}>Tags</Text>
          <View style={styles.tagsContainer}>
            <View style={styles.tagInputContainer}>
              <TextInput
                style={styles.tagInput}
                placeholder="Add tags (e.g., seafood, vegan)"
                value={tagInput}
                onChangeText={setTagInput}
                onSubmitEditing={addTag}
              />
              <TouchableOpacity style={styles.addTagButton} onPress={addTag}>
                <Ionicons name="add" size={24} color={COLORS.background} />
              </TouchableOpacity>
            </View>
            
            <View style={styles.tagsList}>
              {menuData.tags.map((tag, index) => (
                <View key={index} style={styles.tag}>
                  <Text style={styles.tagText}>{tag}</Text>
                  <TouchableOpacity onPress={() => removeTag(index)}>
                    <Ionicons name="close-circle" size={16} color={COLORS.text} />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          </View>
          
          {/* Includes Drink */}
          <View style={styles.switchContainer}>
            <Text style={styles.switchLabel}>Includes Drink</Text>
            <Switch
              value={menuData.includes_drink}
              onValueChange={(value) => handleInputChange('includes_drink', value)}
              trackColor={{ false: COLORS.backgroundLight, true: COLORS.primary }}
              thumbColor={COLORS.background}
            />
          </View>
          
          {/* Drink Options (if includes_drink is true) */}
          {menuData.includes_drink && (
            <View style={styles.drinkOptionsContainer}>
              <Text style={styles.inputLabel}>Drink Options</Text>
              <View style={styles.tagInputContainer}>
                <TextInput
                  style={styles.tagInput}
                  placeholder="Add drink options"
                  value={drinkInput}
                  onChangeText={setDrinkInput}
                  onSubmitEditing={addDrinkOption}
                />
                <TouchableOpacity style={styles.addTagButton} onPress={addDrinkOption}>
                  <Ionicons name="add" size={24} color={COLORS.background} />
                </TouchableOpacity>
              </View>
              
              <View style={styles.tagsList}>
                {menuData.drink_options.map((drink, index) => (
                  <View key={index} style={styles.tag}>
                    <Text style={styles.tagText}>{drink}</Text>
                    <TouchableOpacity onPress={() => removeDrinkOption(index)}>
                      <Ionicons name="close-circle" size={16} color={COLORS.text} />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            </View>
          )}
          
          {/* App Exclusive */}
          <View style={styles.switchContainer}>
            <Text style={styles.switchLabel}>App Exclusive</Text>
            <Switch
              value={menuData.is_exclusive}
              onValueChange={(value) => handleInputChange('is_exclusive', value)}
              trackColor={{ false: COLORS.backgroundLight, true: COLORS.primary }}
              thumbColor={COLORS.background}
            />
          </View>
          
          {/* Additional Info */}
          <Text style={styles.inputLabel}>Additional Information (Optional)</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Enter any additional information"
            value={menuData.additional_info}
            onChangeText={(text) => handleInputChange('additional_info', text)}
            multiline
            numberOfLines={4}
          />
        </View>
        
        {/* Submit Button */}
        <TouchableOpacity
          style={styles.submitButton}
          onPress={submitMenu}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color={COLORS.background} />
          ) : (
            <Text style={styles.submitButtonText}>Create Menu</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  contentContainer: {
    padding: SPACING.large,
    paddingBottom: SPACING.xxxl,
  },
  title: {
    fontSize: SIZES.title,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SPACING.large,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.error + '20', // 20% opacity
    padding: SPACING.medium,
    borderRadius: RADIUS.medium,
    marginBottom: SPACING.large,
  },
  errorText: {
    flex: 1,
    fontSize: SIZES.small,
    color: COLORS.error,
    marginLeft: SPACING.small,
  },
  toggleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.large,
    padding: SPACING.medium,
    backgroundColor: COLORS.backgroundLight,
    borderRadius: RADIUS.medium,
  },
  toggleLabel: {
    fontSize: SIZES.medium,
    color: COLORS.text,
  },
  imageSection: {
    marginBottom: SPACING.large,
  },
  sectionTitle: {
    fontSize: SIZES.large,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SPACING.medium,
  },
  imagePreviewContainer: {
    position: 'relative',
    marginBottom: SPACING.medium,
  },
  imagePreview: {
    width: '100%',
    height: 200,
    borderRadius: RADIUS.medium,
  },
  removeImageButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: COLORS.background,
    borderRadius: RADIUS.round,
    padding: 4,
  },
  uploadButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: SPACING.medium,
  },
  uploadButton: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.backgroundLight,
    borderRadius: RADIUS.medium,
    padding: SPACING.large,
    width: '45%',
  },
  uploadButtonText: {
    marginTop: SPACING.small,
    fontSize: SIZES.medium,
    color: COLORS.text,
  },
  ocrLoadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: SPACING.medium,
  },
  ocrLoadingText: {
    marginLeft: SPACING.small,
    fontSize: SIZES.medium,
    color: COLORS.textLight,
  },
  menuDetailsSection: {
    marginBottom: SPACING.large,
  },
  inputLabel: {
    fontSize: SIZES.medium,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SPACING.small,
  },
  input: {
    backgroundColor: COLORS.backgroundLight,
    borderRadius: RADIUS.medium,
    padding: SPACING.medium,
    fontSize: SIZES.medium,
    color: COLORS.text,
    marginBottom: SPACING.large,
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  menuTypeContainer: {
    flexDirection: 'row',
    marginBottom: SPACING.large,
  },
  menuTypeButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.backgroundLight,
    padding: SPACING.medium,
    marginRight: SPACING.small,
    borderRadius: RADIUS.medium,
  },
  selectedMenuType: {
    backgroundColor: COLORS.primary,
  },
  menuTypeText: {
    fontSize: SIZES.medium,
    color: COLORS.text,
  },
  selectedMenuTypeText: {
    color: COLORS.background,
    fontWeight: 'bold',
  },
  tagsContainer: {
    marginBottom: SPACING.large,
  },
  tagInputContainer: {
    flexDirection: 'row',
    marginBottom: SPACING.medium,
  },
  tagInput: {
    flex: 1,
    backgroundColor: COLORS.backgroundLight,
    borderRadius: RADIUS.medium,
    padding: SPACING.medium,
    fontSize: SIZES.medium,
    color: COLORS.text,
    marginRight: SPACING.small,
  },
  addTagButton: {
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.medium,
    width: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tagsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.backgroundLight,
    borderRadius: RADIUS.medium,
    paddingHorizontal: SPACING.medium,
    paddingVertical: SPACING.small,
    marginRight: SPACING.small,
    marginBottom: SPACING.small,
  },
  tagText: {
    fontSize: SIZES.small,
    color: COLORS.text,
    marginRight: SPACING.xs,
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.large,
    padding: SPACING.medium,
    backgroundColor: COLORS.backgroundLight,
    borderRadius: RADIUS.medium,
  },
  switchLabel: {
    fontSize: SIZES.medium,
    color: COLORS.text,
  },
  drinkOptionsContainer: {
    marginBottom: SPACING.large,
  },
  submitButton: {
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.medium,
    padding: SPACING.medium,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitButtonText: {
    fontSize: SIZES.large,
    fontWeight: 'bold',
    color: COLORS.background,
  },
});

export default MenuUploadScreen; 