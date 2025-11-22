
import React, { useEffect } from 'react';
import { WagmiProvider } from 'wagmi';
import { QueryClientProvider } from '@tanstack/react-query';
import { wagmiConfig, queryClient, initWeb3Modal } from '@/config/web3Config';

export function Web3Provider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Initialize Web3Modal on mount
    initWeb3Modal();
  }, []);

  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </WagmiProvider>
  );
}
