
import React, { useEffect, useMemo } from 'react';
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

  // CRITICAL: Create tabs array with ONLY serializable primitive values
  // This prevents WorkletsError by ensuring no complex Href objects reach worklets
  // The route strings are cast to 'any' to satisfy TypeScript, but they're just strings
  const tabs: TabBarItem[] = useMemo(() => {
    const tabsArray: TabBarItem[] = [
      {
        name: '(home)',
        route: '/(tabs)/(home)/' as any,
        iosIcon: APP_ICONS.home.ios,
        androidIcon: APP_ICONS.home.android,
        label: APP_ICONS.home.label,
      },
      {
        name: 'purchase',
        route: '/(tabs)/purchase' as any,
        iosIcon: APP_ICONS.purchase.ios,
        androidIcon: APP_ICONS.purchase.android,
        label: 'Buy',
      },
      {
        name: 'tournaments',
        route: '/(tabs)/tournaments' as any,
        iosIcon: 'trophy.fill',
        androidIcon: 'emoji-events',
        label: 'Tournaments',
      },
      {
        name: 'ecosystem',
        route: '/(tabs)/ecosystem' as any,
        iosIcon: 'globe',
        androidIcon: 'public',
        label: 'Ecosystem',
      },
      {
        name: 'profile',
        route: '/(tabs)/profile' as any,
        iosIcon: APP_ICONS.profile.ios,
        androidIcon: APP_ICONS.profile.android,
        label: APP_ICONS.profile.label,
      },
    ];
    
    console.log('📋 Tab Layout - Configured tabs:', tabsArray);
    return tabsArray;
  }, []); // Empty dependency array - tabs never change

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
        <Stack.Screen name="tournaments" />
        <Stack.Screen name="ecosystem" />
        <Stack.Screen name="vesting" />
        <Stack.Screen name="referrals" />
        <Stack.Screen name="profile" />
        <Stack.Screen name="kyc" />
        <Stack.Screen name="messages" />
        <Stack.Screen name="admin" />
        <Stack.Screen name="balance-management" />
        <Stack.Screen name="edit-profile" />
      </Stack>
      <FloatingTabBar tabs={tabs} />
    </>
  );
}
