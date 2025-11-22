
import React, { useEffect, useState } from 'react';
import { WagmiProvider } from 'wagmi';
import { QueryClientProvider } from '@tanstack/react-query';
import { wagmiConfig, queryClient, initWeb3Modal } from '@/config/web3Config';

export function Web3Provider({ children }: { children: React.ReactNode }) {
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    console.log('🌐 Web3Provider: Initializing for web platform...');
    
    // Initialize Web3Modal on mount
    try {
      initWeb3Modal();
      setIsInitialized(true);
      console.log('✅ Web3Provider: Initialization complete');
    } catch (error) {
      console.error('❌ Web3Provider: Initialization failed:', error);
      // Still set initialized to true to render children
      setIsInitialized(true);
    }
  }, []);

  // Show loading state while initializing
  if (!isInitialized) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        backgroundColor: '#1a1a2e',
        color: '#ffffff',
      }}>
        <div>
          <p>Loading Web3...</p>
        </div>
      </div>
    );
  }

  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </WagmiProvider>
  );
}
