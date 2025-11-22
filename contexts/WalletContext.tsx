
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
// This implementation uses ONLY serializable primitives to avoid worklets errors
export function WalletProvider({ children }: { children: ReactNode }) {
  console.log('💼 WalletProvider: Native implementation loaded');

  const showWebOnlyAlert = () => {
    Alert.alert(
      'Web Only Feature',
      'Wallet connection and crypto payments are only available on the web version of this app. Please visit the web version to use this feature.',
      [{ text: 'OK' }]
    );
  };

  // All functions are simple arrow functions with no closures over complex objects
  const connectWallet = async (type: string) => {
    console.log('⚠️ WalletProvider: Connect wallet called on native platform');
    showWebOnlyAlert();
    throw new Error('Wallet connection is only available on web');
  };

  const disconnectWallet = async () => {
    console.log('⚠️ WalletProvider: Disconnect wallet called on native platform');
  };

  const refreshBalance = async () => {
    console.log('⚠️ WalletProvider: Refresh balance called on native platform');
  };

  const sendPayment = async (amountUSDT: number): Promise<string> => {
    console.log('⚠️ WalletProvider: Send payment called on native platform');
    showWebOnlyAlert();
    throw new Error('Payment is only available on web');
  };

  // Context value uses ONLY primitive types and simple functions
  // No complex objects, no hooks, no external dependencies
  const contextValue: WalletContextType = {
    isConnected: false,
    walletType: null,
    address: null,
    usdtBalance: null,
    isLoading: false,
    connectWallet,
    disconnectWallet,
    refreshBalance,
    sendPayment,
  };

  return (
    <WalletContext.Provider value={contextValue}>
      {children}
    </WalletContext.Provider>
  );
}
