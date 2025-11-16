
export const colors = {
  // Dark theme colors
  background: '#0A0E27',
  card: '#1A1F3A',
  border: '#2A2F4A',
  
  // Text colors
  text: '#FFFFFF',
  textSecondary: '#A0A0B8',
  
  // Brand colors
  primary: '#6C5CE7',
  secondary: '#00B894',
  accent: '#FDCB6E',
  highlight: '#FD79A8',
  
  // Status colors
  success: '#4CAF50',
  warning: '#FF9800',
  error: '#F44336',
  info: '#2196F3',
  
  // Additional colors
  dark: '#0A0E27',
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
