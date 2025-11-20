
export const colors = {
  // Dark theme colors - Premium palette with BLACK background
  background: '#000000', // Changed to pure black
  card: '#151829',
  cardBackground: '#151829',
  border: '#252840',
  
  // Text colors
  text: '#FFFFFF',
  textSecondary: '#9CA3AF',
  
  // Brand colors - Premium gradient tones
  primary: '#8B5CF6',
  secondary: '#10B981',
  accent: '#F59E0B',
  highlight: '#EC4899',
  
  // Status colors
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
  info: '#3B82F6',
  
  // Section background colors - Subtle differentiation
  sectionPurple: 'rgba(139, 92, 246, 0.08)',
  sectionGreen: 'rgba(16, 185, 129, 0.08)',
  sectionBlue: 'rgba(59, 130, 246, 0.08)',
  sectionOrange: 'rgba(245, 158, 11, 0.08)',
  sectionOrangeStrong: 'rgba(217, 119, 6, 0.08)',
  sectionPink: 'rgba(236, 72, 153, 0.08)',
  sectionTeal: 'rgba(20, 184, 166, 0.08)',
  
  // Additional colors
  dark: '#000000', // Changed to pure black
  light: '#FFFFFF',
};

export const commonStyles = {
  card: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 100,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '700' as const,
    color: colors.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600' as const,
    color: colors.text,
    marginBottom: 16,
  },
  row: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'center' as const,
    paddingVertical: 12,
  },
  label: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  value: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: colors.text,
  },
};

export const buttonStyles = {
  primary: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  primaryText: {
    color: colors.light,
    fontSize: 16,
    fontWeight: '600' as const,
  },
  secondary: {
    backgroundColor: colors.secondary,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  secondaryText: {
    color: colors.light,
    fontSize: 16,
    fontWeight: '600' as const,
  },
  outline: {
    backgroundColor: 'transparent',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    borderWidth: 2,
    borderColor: colors.primary,
  },
  textOutline: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: '600' as const,
  },
  text: {
    color: colors.light,
    fontSize: 16,
    fontWeight: '600' as const,
  },
  disabled: {
    opacity: 0.5,
  },
};
