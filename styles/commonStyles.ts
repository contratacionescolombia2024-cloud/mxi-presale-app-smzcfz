
import { StyleSheet, ViewStyle, TextStyle } from 'react-native';

// Dark, professional wallet-like theme
export const colors = {
  // Dark backgrounds
  background: '#0A0E27',
  backgroundSecondary: '#131829',
  
  // Text colors
  text: '#FFFFFF',
  textSecondary: '#8F92A1',
  textTertiary: '#5A5D6E',
  
  // Primary colors - Professional blue/purple gradient
  primary: '#6C5CE7',
  primaryLight: '#A29BFE',
  primaryDark: '#5F3DC4',
  
  // Secondary colors - Accent teal
  secondary: '#00CEC9',
  secondaryLight: '#81ECEC',
  
  // Accent colors
  accent: '#A29BFE',
  accentGold: '#FDCB6E',
  
  // Card and surfaces
  card: '#1A1F3A',
  cardElevated: '#232A45',
  
  // Status colors
  success: '#00B894',
  warning: '#FDCB6E',
  error: '#FF7675',
  info: '#74B9FF',
  
  // Borders and dividers
  border: '#2D3348',
  borderLight: '#3A4058',
  
  // Overlay and shadows
  overlay: 'rgba(10, 14, 39, 0.9)',
  shadow: 'rgba(0, 0, 0, 0.5)',
};

export const buttonStyles = StyleSheet.create({
  primary: {
    backgroundColor: colors.primary,
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0px 4px 12px rgba(108, 92, 231, 0.3)',
    elevation: 4,
  },
  secondary: {
    backgroundColor: colors.secondary,
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0px 4px 12px rgba(0, 206, 201, 0.3)',
    elevation: 4,
  },
  outline: {
    backgroundColor: 'transparent',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  textOutline: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  primaryText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
});

export const commonStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    boxShadow: '0px 4px 16px rgba(0, 0, 0, 0.3)',
    elevation: 5,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardElevated: {
    backgroundColor: colors.cardElevated,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    boxShadow: '0px 8px 24px rgba(0, 0, 0, 0.4)',
    elevation: 8,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
    letterSpacing: 0.3,
  },
  text: {
    fontSize: 16,
    color: colors.text,
    lineHeight: 24,
  },
  textSecondary: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  input: {
    backgroundColor: colors.backgroundSecondary,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: colors.text,
    marginBottom: 16,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  center: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
