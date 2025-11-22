
import { useEffect } from 'react';
import { Platform } from 'react-native';
import { Stack } from 'expo-router';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import 'react-native-reanimated';
import { AuthProvider } from '@/contexts/AuthContext';
import { LanguageProvider } from '@/contexts/LanguageContext';
import { PreSaleProvider } from '@/contexts/PreSaleContext';
import { WalletProvider } from '@/contexts/WalletContext';
import { WidgetProvider } from '@/contexts/WidgetContext';
import { Web3Provider } from '@/components/Web3Provider';

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  console.log('🚀 RootLayout: Platform =', Platform.OS);

  // CRITICAL: Stack navigation structure
  const AppStack = (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(auth)" />
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="ecosystem" />
      <Stack.Screen name="games" />
      <Stack.Screen name="mini-battle-game" />
      <Stack.Screen
        name="modal"
        options={{
          presentation: 'modal',
        }}
      />
      <Stack.Screen
        name="formsheet"
        options={{
          presentation: 'formSheet',
        }}
      />
      <Stack.Screen
        name="transparent-modal"
        options={{
          presentation: 'transparentModal',
          animation: 'fade',
        }}
      />
    </Stack>
  );

  // CRITICAL: Core app providers (always present)
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

  // CRITICAL: Only wrap with Web3Provider on web platform
  if (Platform.OS === 'web') {
    console.log('🌐 RootLayout: Wrapping with Web3Provider for web');
    return <Web3Provider>{CoreProviders}</Web3Provider>;
  }

  console.log('📱 RootLayout: Native platform, skipping Web3Provider');
  return CoreProviders;
}
