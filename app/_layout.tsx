
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

  // Only wrap with Web3Provider on web platform
  const AppContent = (
    <AuthProvider>
      <LanguageProvider>
        <PreSaleProvider>
          <WalletProvider>
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
          </WalletProvider>
        </PreSaleProvider>
      </LanguageProvider>
    </AuthProvider>
  );

  // Wrap with Web3Provider only on web
  if (Platform.OS === 'web') {
    return <Web3Provider>{AppContent}</Web3Provider>;
  }

  return AppContent;
}
