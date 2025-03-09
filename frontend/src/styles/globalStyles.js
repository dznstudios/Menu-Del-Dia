import { StyleSheet } from 'react-native';

// Colors
export const COLORS = {
  primary: '#FF9800', // Orange
  primaryLight: '#FFB74D', // Light Orange
  primaryDark: '#F57C00', // Dark Orange
  accent: '#FFC107', // Amber
  accentLight: '#FFD54F', // Light Amber
  accentDark: '#FFA000', // Dark Amber
  text: '#212121', // Almost Black
  textLight: '#757575', // Gray
  background: '#FFFFFF', // White
  backgroundLight: '#F5F5F5', // Light Gray
  success: '#4CAF50', // Green
  error: '#F44336', // Red
  warning: '#FFEB3B', // Yellow
  info: '#2196F3', // Blue
};

// Typography
export const FONTS = {
  regular: 'System',
  medium: 'System',
  bold: 'System',
  light: 'System',
};

// Font sizes
export const SIZES = {
  xs: 10,
  small: 12,
  medium: 14,
  large: 16,
  xl: 18,
  xxl: 20,
  xxxl: 24,
  title: 28,
  subtitle: 22,
};

// Spacing
export const SPACING = {
  xs: 4,
  small: 8,
  medium: 12,
  large: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
};

// Border radius
export const RADIUS = {
  small: 4,
  medium: 8,
  large: 12,
  xl: 16,
  xxl: 20,
  round: 50,
};

// Shadow
export const SHADOW = {
  small: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  medium: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  large: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 6,
  },
};

// Global styles
const globalStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rowBetween: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  rowAround: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  column: {
    flexDirection: 'column',
  },
  padding: {
    padding: SPACING.large,
  },
  paddingHorizontal: {
    paddingHorizontal: SPACING.large,
  },
  paddingVertical: {
    paddingVertical: SPACING.large,
  },
  margin: {
    margin: SPACING.large,
  },
  marginHorizontal: {
    marginHorizontal: SPACING.large,
  },
  marginVertical: {
    marginVertical: SPACING.large,
  },
  card: {
    backgroundColor: COLORS.background,
    borderRadius: RADIUS.medium,
    padding: SPACING.large,
    marginVertical: SPACING.medium,
    ...SHADOW.medium,
  },
  title: {
    fontSize: SIZES.title,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SPACING.medium,
  },
  subtitle: {
    fontSize: SIZES.subtitle,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SPACING.small,
  },
  text: {
    fontSize: SIZES.medium,
    color: COLORS.text,
  },
  textLight: {
    fontSize: SIZES.medium,
    color: COLORS.textLight,
  },
  button: {
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.medium,
    padding: SPACING.medium,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: COLORS.background,
    fontSize: SIZES.large,
    fontWeight: 'bold',
  },
  input: {
    borderWidth: 1,
    borderColor: COLORS.textLight,
    borderRadius: RADIUS.medium,
    padding: SPACING.medium,
    fontSize: SIZES.medium,
    color: COLORS.text,
    marginBottom: SPACING.medium,
  },
  error: {
    color: COLORS.error,
    fontSize: SIZES.small,
    marginBottom: SPACING.medium,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.textLight,
    marginVertical: SPACING.medium,
  },
});

export default globalStyles; 