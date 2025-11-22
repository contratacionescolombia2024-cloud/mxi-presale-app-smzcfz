
import React from 'react';
import { Platform } from 'react-native';

// Native fallback - no Web3 functionality
export function Web3Provider({ children }: { children: React.ReactNode }) {
  console.log('Web3Provider: Native platform detected, skipping Web3 initialization');
  return <>{children}</>;
}
