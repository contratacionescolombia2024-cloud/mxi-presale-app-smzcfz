
import { useEffect } from 'react';
import { Redirect, Platform } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { ActivityIndicator, View, StyleSheet } from 'react-native';
import { colors } from '@/styles/commonStyles';

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
});

export default function TabLayout() {
  const { isAuthenticated, isAdmin, isLoading, user } = useAuth();

  useEffect(() => {
    console.log('📱 iOS Tab Layout - Auth State:', {
      isAuthenticated,
      isAdmin,
      isLoading,
      hasUser: !!user,
      userId: user?.id,
      userEmail: user?.email,
    });
  }, [isAuthenticated, isAdmin, isLoading, user]);

  // Show loading indicator while checking auth
  if (isLoading) {
    console.log('⏳ iOS Tab Layout - Still loading auth state...');
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    console.log('🚫 iOS Tab Layout - Not authenticated, redirecting to login');
    return <Redirect href="/(auth)/login" />;
  }

  console.log('✅ iOS Tab Layout - User is authenticated, showing native tabs');

  // Only use NativeTabs on actual iOS devices, not on web
  if (Platform.OS === 'ios') {
    // Dynamic import to avoid loading on web
    const { NativeTabs, Icon, Label } = require('expo-router/unstable-native-tabs');
    
    return (
      <NativeTabs>
        <NativeTabs.Trigger key="home" name="(home)">
          <Icon sf="house.fill" />
          <Label>Home</Label>
        </NativeTabs.Trigger>
        <NativeTabs.Trigger key="purchase" name="purchase">
          <Icon sf="cart.fill" />
          <Label>Buy</Label>
        </NativeTabs.Trigger>
        <NativeTabs.Trigger key="tournaments" name="tournaments">
          <Icon sf="trophy.fill" />
          <Label>Tournaments</Label>
        </NativeTabs.Trigger>
        <NativeTabs.Trigger key="ecosystem" name="ecosystem">
          <Icon sf="globe" />
          <Label>Ecosystem</Label>
        </NativeTabs.Trigger>
        <NativeTabs.Trigger key="profile" name="profile">
          <Icon sf="person.fill" />
          <Label>Profile</Label>
        </NativeTabs.Trigger>
      </NativeTabs>
    );
  }

  // Fallback: This shouldn't happen since we have platform-specific files,
  // but just in case, redirect to the default layout
  console.log('⚠️ iOS Tab Layout loaded on non-iOS platform, this should not happen');
  return <Redirect href="/(tabs)/(home)/" />;
}
