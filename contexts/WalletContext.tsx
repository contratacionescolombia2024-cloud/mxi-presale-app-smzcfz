
import React, { createContext, useContext, ReactNode } from 'react';
import { Platform, Alert } from 'react-native';

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

// Native implementation - Web3Modal is not supported on native platforms
export function WalletProvider({ children }: { children: ReactNode }) {
  const showWebOnlyAlert = () => {
    Alert.alert(
      'Web Only Feature',
      'Wallet connection and crypto payments are only available on the web version of this app. Please visit the web version to use this feature.',
      [{ text: 'OK' }]
    );
  };

  const connectWallet = async (type: string) => {
    showWebOnlyAlert();
    throw new Error('Wallet connection is only available on web');
  };

  const disconnectWallet = async () => {
    console.log('Wallet features not available on native');
  };

  const refreshBalance = async () => {
    console.log('Wallet features not available on native');
  };

  const sendPayment = async (amountUSDT: number): Promise<string> => {
    showWebOnlyAlert();
    throw new Error('Payment is only available on web');
  };

  return (
    <WalletContext.Provider
      value={{
        isConnected: false,
        walletType: null,
        address: null,
        usdtBalance: null,
        isLoading: false,
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
