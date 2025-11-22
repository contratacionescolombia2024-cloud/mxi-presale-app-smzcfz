
import { useEffect } from 'react';
import { Platform } from 'react-native';
import { Stack } from 'expo-router';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { AuthProvider } from '@/contexts/AuthContext';
import { LanguageProvider } from '@/contexts/LanguageContext';
import { PreSaleProvider } from '@/contexts/PreSaleContext';
import { WalletProvider } from '@/contexts/WalletContext';
import { WidgetProvider } from '@/contexts/WidgetContext';
import { Web3Provider } from '@/components/Web3Provider';

// Prevent the splash screen from auto-hiding
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  useEffect(() => {
    if (error) {
      console.error('Font loading error:', error);
    }
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded && !error) {
    return null;
  }

  // Core app structure
  const AppStack = (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(auth)" />
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="ecosystem" />
      <Stack.Screen name="games" />
      <Stack.Screen name="mini-battle-game" />
      <Stack.Screen name="+not-found" />
    </Stack>
  );

  // Core providers
  const CoreProviders = (
    <AuthProvider>
      <LanguageProvider>
        <PreSaleProvider>
          <WalletProvider>
            <WidgetProvider>
              {AppStack}
            </WidgetProvider>
          </WalletProvider>
        </PreSaleProvider>
      </LanguageProvider>
    </AuthProvider>
  );

  // Only wrap with Web3Provider on web
  if (Platform.OS === 'web') {
    return <Web3Provider>{CoreProviders}</Web3Provider>;
  }

  return CoreProviders;
}
