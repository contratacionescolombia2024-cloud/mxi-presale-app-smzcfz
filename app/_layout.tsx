
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
  // Keep this simple and avoid any complex objects
  const AppStack = (
    <Stack>
      <Stack.Screen name="(auth)" options={{ headerShown: false }} />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="ecosystem" options={{ headerShown: false }} />
      <Stack.Screen name="games" options={{ headerShown: false }} />
      <Stack.Screen name="mini-battle-game" options={{ headerShown: false }} />
      <Stack.Screen
        name="modal"
        options={{
          presentation: 'modal',
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="formsheet"
        options={{
          presentation: 'formSheet',
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="transparent-modal"
        options={{
          presentation: 'transparentModal',
          headerShown: false,
          animation: 'fade',
        }}
      />
    </Stack>
  );

  // CRITICAL: Core app providers (always present)
  // These must be simple and not contain any complex objects
  const CoreProviders = (
    <AuthProvider>
      <LanguageProvider>
        <PreSaleProvider>
          <WalletProvider>
            {AppStack}
          </WalletProvider>
        </PreSaleProvider>
      </LanguageProvider>
    </AuthProvider>
  );

  // CRITICAL: Only wrap with Web3Provider on web platform
  // This prevents any Web3-related code from being loaded on native
  if (Platform.OS === 'web') {
    console.log('🌐 RootLayout: Wrapping with Web3Provider for web');
    return <Web3Provider>{CoreProviders}</Web3Provider>;
  }

  console.log('📱 RootLayout: Native platform, skipping Web3Provider');
  return CoreProviders;
}
