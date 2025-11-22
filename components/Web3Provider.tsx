
import React from 'react';
import { Platform } from 'react-native';

// Default export for platforms without specific implementation
export function Web3Provider({ children }: { children: React.ReactNode }) {
  if (Platform.OS === 'web') {
    // This should not be reached due to .web.tsx file
    console.warn('Web3Provider: Using fallback for web platform');
  }
  return <>{children}</>;
}
