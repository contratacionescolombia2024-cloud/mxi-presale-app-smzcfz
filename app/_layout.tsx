
import { Stack } from 'expo-router';
import { AuthProvider } from '@/contexts/AuthContext';
import { PreSaleProvider } from '@/contexts/PreSaleContext';
import { LanguageProvider } from '@/contexts/LanguageContext';
import { WalletProvider } from '@/contexts/WalletContext';
import { Web3Provider } from '@/components/Web3Provider';
import { useEffect } from 'react';
import { Platform } from 'react-native';
import * as SplashScreen from 'expo-splash-screen';

// Prevent splash screen from auto-hiding
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  useEffect(() => {
    // Hide splash screen after a short delay
    const timer = setTimeout(() => {
      SplashScreen.hideAsync();
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <LanguageProvider>
      <Web3Provider>
        <AuthProvider>
          <WalletProvider>
            <PreSaleProvider>
              <Stack
                screenOptions={{
                  headerShown: false,
                  animation: Platform.OS === 'ios' ? 'default' : 'fade',
                }}
              >
                <Stack.Screen name="(auth)" />
                <Stack.Screen name="(tabs)" />
                <Stack.Screen name="modal" options={{ presentation: 'modal' }} />
                <Stack.Screen name="formsheet" options={{ presentation: 'formSheet' }} />
                <Stack.Screen name="transparent-modal" options={{ presentation: 'transparentModal' }} />
              </Stack>
            </PreSaleProvider>
          </WalletProvider>
        </AuthProvider>
      </Web3Provider>
    </LanguageProvider>
  );
}
