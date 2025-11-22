
import { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { Stack } from 'expo-router';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { AuthProvider } from '@/contexts/AuthContext';
import { LanguageProvider } from '@/contexts/LanguageContext';
import { PreSaleProvider } from '@/contexts/PreSaleContext';
import { WidgetProvider } from '@/contexts/WidgetContext';

// Prevent the splash screen from auto-hiding
SplashScreen.preventAutoHideAsync().catch(console.warn);

export default function RootLayout() {
  const [appReady, setAppReady] = useState(false);
  const [loaded, error] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  useEffect(() => {
    if (error) {
      console.error('❌ Font loading error:', error);
    }
  }, [error]);

  useEffect(() => {
    async function prepare() {
      try {
        // Wait for fonts to load
        if (loaded || error) {
          console.log('✅ Fonts loaded, preparing app...');
          
          // Give a small delay to ensure everything is ready
          await new Promise(resolve => setTimeout(resolve, 100));
          
          setAppReady(true);
          
          // Hide splash screen
          await SplashScreen.hideAsync();
          console.log('✅ App ready, splash screen hidden');
        }
      } catch (e) {
        console.error('❌ Error preparing app:', e);
        setAppReady(true); // Set ready anyway to prevent infinite loading
      }
    }

    prepare();
  }, [loaded, error]);

  // Show loading screen while preparing
  if (!appReady) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#1a1a2e' }}>
        <ActivityIndicator size="large" color="#00d4ff" />
        <Text style={{ color: '#fff', marginTop: 16 }}>Loading MXI Presale...</Text>
      </View>
    );
  }

  return (
    <AuthProvider>
      <LanguageProvider>
        <PreSaleProvider>
          <WidgetProvider>
            <Stack screenOptions={{ headerShown: false }}>
              <Stack.Screen name="(auth)" />
              <Stack.Screen name="(tabs)" />
              <Stack.Screen name="ecosystem" />
              <Stack.Screen name="games" />
              <Stack.Screen name="mini-battle-game" />
              <Stack.Screen name="+not-found" />
            </Stack>
          </WidgetProvider>
        </PreSaleProvider>
      </LanguageProvider>
    </AuthProvider>
  );
}
