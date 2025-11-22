
import React, { createContext, useContext, useState, ReactNode } from 'react';

interface WalletContextType {
  address: string | null;
  isConnected: boolean;
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export function WalletProvider({ children }: { children: ReactNode }) {
  const [address, setAddress] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  const connect = async () => {
    console.log('Wallet connection not implemented for this platform');
  };

  const disconnect = async () => {
    setAddress(null);
    setIsConnected(false);
  };

  return (
    <WalletContext.Provider value={{ address, isConnected, connect, disconnect }}>
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
