
import { useEffect } from 'react';
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

// CRITICAL: Define tabs as a constant outside the component
// This ensures the array is stable and never recreated
const TABS: TabBarItem[] = [
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
    name: 'tournaments',
    route: '/(tabs)/tournaments',
    iosIcon: 'trophy.fill',
    androidIcon: 'emoji-events',
    label: 'Tournaments',
  },
  {
    name: 'ecosystem',
    route: '/(tabs)/ecosystem',
    iosIcon: 'globe',
    androidIcon: 'public',
    label: 'Ecosystem',
  },
  {
    name: 'profile',
    route: '/(tabs)/profile',
    iosIcon: APP_ICONS.profile.ios,
    androidIcon: APP_ICONS.profile.android,
    label: APP_ICONS.profile.label,
  },
];

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
        <Stack.Screen name="connect-wallet" />
        <Stack.Screen name="purchase-crypto" />
        <Stack.Screen name="purchase-confirmation" />
        <Stack.Screen name="admin-metrics" />
        <Stack.Screen name="admin-users-table" />
        <Stack.Screen name="admin-withdrawals" />
        <Stack.Screen name="phase-control-admin" />
        <Stack.Screen name="vesting-admin" />
        <Stack.Screen name="tournament-admin" />
        <Stack.Screen name="game-settings" />
        <Stack.Screen name="language-settings" />
      </Stack>
      <FloatingTabBar tabs={TABS} />
    </>
  );
}
