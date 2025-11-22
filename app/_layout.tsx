
import { useEffect, useState } from 'react';
import { Platform, View, Text, ActivityIndicator } from 'react-native';
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
  console.warn('⚠️ Error preventing splash screen auto-hide:', error);
});

// Error Boundary Component
function ErrorBoundary({ children }: { children: React.ReactNode }) {
  const [hasError, setHasError] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const errorHandler = (event: ErrorEvent) => {
      console.error('❌ Global error caught:', event.error);
      setHasError(true);
      setError(event.error);
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('error', errorHandler);
      return () => window.removeEventListener('error', errorHandler);
    }
  }, []);

  if (hasError) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20, backgroundColor: '#1a1a2e' }}>
        <Text style={{ color: '#ff6b6b', fontSize: 18, fontWeight: 'bold', marginBottom: 10 }}>
          ⚠️ Application Error
        </Text>
        <Text style={{ color: '#fff', fontSize: 14, textAlign: 'center', marginBottom: 10 }}>
          {error?.message || 'An unexpected error occurred'}
        </Text>
        {error?.stack && (
          <Text style={{ color: '#666', fontSize: 10, textAlign: 'center', marginTop: 10 }}>
            {error.stack.split('\n').slice(0, 3).join('\n')}
          </Text>
        )}
        <Text style={{ color: '#888', fontSize: 12, marginTop: 20, textAlign: 'center' }}>
          Please restart the app
        </Text>
      </View>
    );
  }

  return <>{children}</>;
}

export default function RootLayout() {
  console.log('🎨 RootLayout: Initializing...');
  console.log('🚀 RootLayout: Platform =', Platform.OS);
  
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
      // Add a small delay to ensure everything is ready
      setTimeout(() => {
        SplashScreen.hideAsync().catch((hideError) => {
          console.warn('⚠️ Error hiding splash screen:', hideError);
        });
      }, 100);
    }
  }, [loaded]);

  // Show loading indicator while fonts are loading
  if (!loaded && !error) {
    console.log('⏳ Waiting for fonts to load...');
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#1a1a2e' }}>
        <ActivityIndicator size="large" color="#4ecdc4" />
        <Text style={{ color: '#fff', marginTop: 20 }}>Loading...</Text>
      </View>
    );
  }

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

  // Core providers wrapped in error boundary
  const CoreProviders = (
    <ErrorBoundary>
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
    </ErrorBoundary>
  );

  // Only wrap with Web3Provider on web
  if (Platform.OS === 'web') {
    console.log('🌐 RootLayout: Web platform - enabling Web3');
    return <Web3Provider>{CoreProviders}</Web3Provider>;
  }

  console.log('📱 RootLayout: Native platform - Web3 disabled');
  return CoreProviders;
}
