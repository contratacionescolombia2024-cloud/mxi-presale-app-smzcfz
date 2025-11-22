
import React from 'react';
import { createWeb3Modal } from '@web3modal/wagmi/react';
import { WagmiProvider } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { wagmiConfig, projectId } from '@/config/web3Config';

const queryClient = new QueryClient();

// Create modal
createWeb3Modal({
  wagmiConfig,
  projectId,
  enableAnalytics: true,
  enableOnramp: true,
});

export function Web3Provider({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </WagmiProvider>
  );
}
