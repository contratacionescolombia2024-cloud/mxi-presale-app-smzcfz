
import React, { ReactNode, useEffect } from 'react';
import { Platform } from 'react-native';
import { WagmiProvider } from 'wagmi';
import { QueryClientProvider } from '@tanstack/react-query';
import { wagmiConfig, queryClient, initWeb3Modal } from '@/config/web3Config';

interface Web3ProviderProps {
  children: ReactNode;
}

export function Web3Provider({ children }: Web3ProviderProps) {
  // Only initialize Web3Modal on web platform
  useEffect(() => {
    if (Platform.OS === 'web') {
      initWeb3Modal();
    }
  }, []);

  // On web, wrap with Wagmi and QueryClient providers
  if (Platform.OS === 'web') {
    return (
      <WagmiProvider config={wagmiConfig}>
        <QueryClientProvider client={queryClient}>
          {children}
        </QueryClientProvider>
      </WagmiProvider>
    );
  }

  // On native, just return children without Web3 providers
  return <>{children}</>;
}
