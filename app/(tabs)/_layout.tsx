
import React from 'react';
import { Stack, Redirect } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import FloatingTabBar, { TabBarItem } from '@/components/FloatingTabBar';

export default function TabLayout() {
  const { isAuthenticated, isAdmin } = useAuth();

  if (!isAuthenticated) {
    return <Redirect href="/(auth)/login" />;
  }

  const tabs: TabBarItem[] = [
    {
      name: '(home)',
      route: '/(tabs)/(home)/',
      icon: 'home',
      label: 'Home',
    },
    {
      name: 'purchase',
      route: '/(tabs)/purchase',
      icon: 'shopping_cart',
      label: 'Buy MXI',
    },
    {
      name: 'vesting',
      route: '/(tabs)/vesting',
      icon: 'trending_up',
      label: 'Vesting',
    },
    {
      name: 'referrals',
      route: '/(tabs)/referrals',
      icon: 'people',
      label: 'Referrals',
    },
    {
      name: 'profile',
      route: '/(tabs)/profile',
      icon: 'person',
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
