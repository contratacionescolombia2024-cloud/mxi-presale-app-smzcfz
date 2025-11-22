
import React, { createContext, useContext, useState } from 'react';

// Placeholder wallet context - wallet integration removed after reversion
interface WalletContextType {
  isConnected: boolean;
  walletType: string | null;
  address: string | null;
  usdtBalance: string | null;
  isLoading: boolean;
  connectWallet: (type: string) => Promise<void>;
  disconnectWallet: () => Promise<void>;
  refreshBalance: () => Promise<void>;
  sendPayment: (amountUSDT: number) => Promise<string>;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export function useWallet() {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
}

export function WalletProvider({ children }: { children: React.ReactNode }) {
  const [isConnected] = useState(false);
  const [walletType] = useState<string | null>(null);
  const [address] = useState<string | null>(null);
  const [usdtBalance] = useState<string | null>(null);
  const [isLoading] = useState(false);

  const connectWallet = async (type: string) => {
    console.log('Wallet connection not available - feature removed after reversion');
    throw new Error('Wallet connection feature is currently unavailable');
  };

  const disconnectWallet = async () => {
    console.log('Wallet disconnection not available');
  };

  const refreshBalance = async () => {
    console.log('Balance refresh not available');
  };

  const sendPayment = async (amountUSDT: number): Promise<string> => {
    console.log('Payment not available');
    throw new Error('Payment feature is currently unavailable');
  };

  return (
    <WalletContext.Provider
      value={{
        isConnected,
        walletType,
        address,
        usdtBalance,
        isLoading,
        connectWallet,
        disconnectWallet,
        refreshBalance,
        sendPayment,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
}
