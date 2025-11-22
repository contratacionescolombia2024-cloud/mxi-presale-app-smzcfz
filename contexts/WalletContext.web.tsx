
import React, { createContext, useContext, ReactNode } from 'react';
import { useAccount, useConnect, useDisconnect } from 'wagmi';

interface WalletContextType {
  address: string | null;
  isConnected: boolean;
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export function WalletProvider({ children }: { children: ReactNode }) {
  const { address, isConnected } = useAccount();
  const { connectAsync, connectors } = useConnect();
  const { disconnectAsync } = useDisconnect();

  const connect = async () => {
    try {
      if (connectors.length > 0) {
        await connectAsync({ connector: connectors[0] });
      }
    } catch (error) {
      console.error('Failed to connect wallet:', error);
    }
  };

  const disconnect = async () => {
    try {
      await disconnectAsync();
    } catch (error) {
      console.error('Failed to disconnect wallet:', error);
    }
  };

  return (
    <WalletContext.Provider 
      value={{ 
        address: address || null, 
        isConnected, 
        connect, 
        disconnect 
      }}
    >
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
}
