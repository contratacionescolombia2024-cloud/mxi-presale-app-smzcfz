
import React, { createContext, useContext, ReactNode } from 'react';

interface WalletContextType {
  address: string | null;
  isConnected: boolean;
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export function WalletProvider({ children }: { children: ReactNode }) {
  const connect = async () => {
    console.log('Wallet connection feature has been removed');
  };

  const disconnect = async () => {
    console.log('Wallet disconnection feature has been removed');
  };

  return (
    <WalletContext.Provider 
      value={{ 
        address: null, 
        isConnected: false, 
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
