
import React, { useEffect } from 'react';
import { Redirect } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { ActivityIndicator, View, StyleSheet } from 'react-native';
import { colors } from '@/styles/commonStyles';
import { NativeTabs, Icon, Label } from 'expo-router/unstable-native-tabs';

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
      <NativeTabs.Trigger key="vesting" name="vesting">
        <Icon sf="chart.line.uptrend.xyaxis" />
        <Label>Vesting</Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger key="referrals" name="referrals">
        <Icon sf="person.2.fill" />
        <Label>Referrals</Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger key="profile" name="profile">
        <Icon sf="person.fill" />
        <Label>Profile</Label>
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
