
import React, { createContext, useContext, ReactNode } from 'react';
import { Alert } from 'react-native';

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

// CRITICAL: Native implementation with ONLY serializable primitives
// All functions are defined at module level to ensure they're serializable
function showWebOnlyAlert() {
  Alert.alert(
    'Web Only Feature',
    'Wallet connection and crypto payments are only available on the web version of this app. Please visit the web version to use this feature.',
    [{ text: 'OK' }]
  );
}

async function connectWallet(_type: string): Promise<void> {
  console.log('⚠️ WalletProvider: Connect wallet called on native platform');
  showWebOnlyAlert();
  throw new Error('Wallet connection is only available on web');
}

async function disconnectWallet(): Promise<void> {
  console.log('⚠️ WalletProvider: Disconnect wallet called on native platform');
}

async function refreshBalance(): Promise<void> {
  console.log('⚠️ WalletProvider: Refresh balance called on native platform');
}

async function sendPayment(_amountUSDT: number): Promise<string> {
  console.log('⚠️ WalletProvider: Send payment called on native platform');
  showWebOnlyAlert();
  throw new Error('Payment is only available on web');
}

// CRITICAL: Create a constant context value with only primitives
// This object never changes and is completely serializable
const NATIVE_WALLET_CONTEXT: WalletContextType = {
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

// Native implementation - Web3Modal is not supported on native platforms
export function WalletProvider({ children }: { children: ReactNode }) {
  console.log('💼 WalletProvider: Native implementation loaded');

  // CRITICAL: Use the constant value to prevent any re-renders or object recreation
  return (
    <WalletContext.Provider value={NATIVE_WALLET_CONTEXT}>
      {children}
    </WalletContext.Provider>
  );
}
