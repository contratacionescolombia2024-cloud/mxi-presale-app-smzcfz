
import React, { useEffect } from 'react';
import { Stack, Redirect } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import FloatingTabBar, { TabBarItem } from '@/components/FloatingTabBar';
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
    console.log('📱 Tab Layout - Auth State:', {
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
    console.log('⏳ Tab Layout - Still loading auth state...');
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    console.log('🚫 Tab Layout - Not authenticated, redirecting to login');
    return <Redirect href="/(auth)/login" />;
  }

  console.log('✅ Tab Layout - User is authenticated, showing tabs');

  const tabs: TabBarItem[] = [
    {
      name: '(home)',
      route: '/(tabs)/(home)/',
      iosIcon: 'house.fill',
      androidIcon: 'home',
      label: 'Home',
    },
    {
      name: 'purchase',
      route: '/(tabs)/purchase',
      iosIcon: 'cart.fill',
      androidIcon: 'shopping_cart',
      label: 'Buy',
    },
    {
      name: 'vesting',
      route: '/(tabs)/vesting',
      iosIcon: 'chart.line.uptrend.xyaxis',
      androidIcon: 'trending_up',
      label: 'Vesting',
    },
    {
      name: 'referrals',
      route: '/(tabs)/referrals',
      iosIcon: 'person.2.fill',
      androidIcon: 'people',
      label: 'Referrals',
    },
    {
      name: 'profile',
      route: '/(tabs)/profile',
      iosIcon: 'person.fill',
      androidIcon: 'person',
      label: 'Profile',
    },
  ];

  return (
    <>
      <Stack
        screenOptions={{
          headerShown: false,
          animation: 'none',
        }}
      >
        <Stack.Screen name="(home)" />
        <Stack.Screen name="purchase" />
        <Stack.Screen name="vesting" />
        <Stack.Screen name="referrals" />
        <Stack.Screen name="profile" />
        <Stack.Screen name="kyc" />
        <Stack.Screen name="messages" />
        <Stack.Screen name="admin" />
      </Stack>
      <FloatingTabBar tabs={tabs} />
    </>
  );
}
