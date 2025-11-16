
import React, { useEffect } from 'react';
import { Stack, Redirect } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import FloatingTabBar, { TabBarItem } from '@/components/FloatingTabBar';
import { ActivityIndicator, View, StyleSheet } from 'react-native';
import { colors } from '@/styles/commonStyles';
import { APP_ICONS } from '@/constants/AppIcons';

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

  if (isLoading) {
    console.log('⏳ Tab Layout - Still loading auth state...');
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!isAuthenticated) {
    console.log('🚫 Tab Layout - Not authenticated, redirecting to login');
    return <Redirect href="/(auth)/login" />;
  }

  console.log('✅ Tab Layout - User is authenticated, showing tabs');

  // Use centralized icon configuration
  const tabs: TabBarItem[] = [
    {
      name: '(home)',
      route: '/(tabs)/(home)/',
      iosIcon: APP_ICONS.home.ios,
      androidIcon: APP_ICONS.home.android,
      label: APP_ICONS.home.label,
    },
    {
      name: 'purchase',
      route: '/(tabs)/purchase',
      iosIcon: APP_ICONS.purchase.ios,
      androidIcon: APP_ICONS.purchase.android,
      label: 'Buy',
    },
    {
      name: 'vesting',
      route: '/(tabs)/vesting',
      iosIcon: APP_ICONS.vesting.ios,
      androidIcon: APP_ICONS.vesting.android,
      label: APP_ICONS.vesting.label,
    },
    {
      name: 'referrals',
      route: '/(tabs)/referrals',
      iosIcon: APP_ICONS.referrals.ios,
      androidIcon: APP_ICONS.referrals.android,
      label: APP_ICONS.referrals.label,
    },
    {
      name: 'profile',
      route: '/(tabs)/profile',
      iosIcon: APP_ICONS.profile.ios,
      androidIcon: APP_ICONS.profile.android,
      label: APP_ICONS.profile.label,
    },
  ];

  console.log('📋 Tab Layout - Configured tabs:', tabs);

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
