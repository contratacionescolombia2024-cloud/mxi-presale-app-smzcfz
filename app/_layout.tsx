
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
SplashScreen.preventAutoHideAsync().catch((error) => {
  console.warn('Error preventing splash screen auto-hide:', error);
});

export default function RootLayout() {
  console.log('🎨 RootLayout: Initializing...');
  
  const [loaded, error] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  useEffect(() => {
    if (error) {
      console.error('❌ Font loading error:', error);
    }
  }, [error]);

  useEffect(() => {
    if (loaded) {
      console.log('✅ Fonts loaded, hiding splash screen');
      SplashScreen.hideAsync().catch((hideError) => {
        console.warn('Error hiding splash screen:', hideError);
      });
    }
  }, [loaded]);

  // Don't render anything until fonts are loaded
  if (!loaded && !error) {
    console.log('⏳ Waiting for fonts to load...');
    return null;
  }

  console.log('🚀 RootLayout: Platform =', Platform.OS);
  console.log('🚀 RootLayout: Fonts loaded =', loaded);

  // Core app structure
  const AppStack = (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(auth)" />
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="ecosystem" />
      <Stack.Screen name="games" />
      <Stack.Screen name="mini-battle-game" />
      <Stack.Screen name="modal" options={{ presentation: 'modal' }} />
      <Stack.Screen name="formsheet" options={{ presentation: 'formSheet' }} />
      <Stack.Screen name="transparent-modal" options={{ presentation: 'transparentModal', animation: 'fade' }} />
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
    console.log('🌐 RootLayout: Web platform - enabling Web3');
    return <Web3Provider>{CoreProviders}</Web3Provider>;
  }

  console.log('📱 RootLayout: Native platform - Web3 disabled');
  return CoreProviders;
}
