
import React, { useEffect } from "react";
import { useColorScheme, Alert } from "react-native";
import * as SplashScreen from "expo-splash-screen";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { useNetworkState } from "expo-network";
import { SystemBars } from "react-native-edge-to-edge";
import { StatusBar } from "expo-status-bar";
import { AuthProvider } from "@/contexts/AuthContext";
import { PreSaleProvider } from "@/contexts/PreSaleContext";
import "react-native-reanimated";
import {
  DarkTheme,
  DefaultTheme,
  Theme,
  ThemeProvider,
} from "@react-navigation/native";
import { Stack, useRouter, useSegments } from "expo-router";
import { useFonts } from "expo-font";
import * as Linking from "expo-linking";

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

const customLightTheme: Theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: '#6200ee',
    background: '#f9f9f9',
    card: '#ffffff',
    text: '#212121',
    border: '#e0e0e0',
    notification: '#ff4081',
  },
};

const customDarkTheme: Theme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    primary: '#bb86fc',
    background: '#121212',
    card: '#1e1e1e',
    text: '#e0e0e0',
    border: '#2c2c2c',
    notification: '#ff4081',
  },
};

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const router = useRouter();
  const [loaded] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
  });

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  // Handle deep linking for password reset
  useEffect(() => {
    const handleDeepLink = (event: { url: string }) => {
      console.log('🔗 Deep link received:', event.url);
      
      const url = Linking.parse(event.url);
      console.log('🔗 Parsed URL:', url);
      
      // Handle password reset deep link
      if (url.path === 'reset-password' || url.hostname === 'reset-password') {
        console.log('🔐 Navigating to reset password screen');
        router.push('/(auth)/reset-password');
      }
    };

    // Listen for deep links
    const subscription = Linking.addEventListener('url', handleDeepLink);

    // Check if app was opened with a deep link
    Linking.getInitialURL().then((url) => {
      if (url) {
        console.log('🔗 Initial URL:', url);
        handleDeepLink({ url });
      }
    });

    return () => {
      subscription.remove();
    };
  }, []);

  const { isConnected } = useNetworkState();

  if (!loaded) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AuthProvider>
        <PreSaleProvider>
          <ThemeProvider value={colorScheme === "dark" ? customDarkTheme : customLightTheme}>
            <SystemBars style={colorScheme === "dark" ? "light" : "dark"} />
            <StatusBar style={colorScheme === "dark" ? "light" : "dark"} />
            <Stack screenOptions={{ headerShown: false }}>
              <Stack.Screen name="(auth)" />
              <Stack.Screen name="(tabs)" />
            </Stack>
          </ThemeProvider>
        </PreSaleProvider>
      </AuthProvider>
    </GestureHandlerRootView>
  );
}
