
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

// CRITICAL: Define all functions OUTSIDE component to ensure they're serializable
// These are simple functions with no closures or complex dependencies
function showWebOnlyAlert() {
  Alert.alert(
    'Web Only Feature',
    'Wallet connection and crypto payments are only available on the web version of this app. Please visit the web version to use this feature.',
    [{ text: 'OK' }]
  );
}

async function connectWallet(type: string): Promise<void> {
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

async function sendPayment(amountUSDT: number): Promise<string> {
  console.log('⚠️ WalletProvider: Send payment called on native platform');
  showWebOnlyAlert();
  throw new Error('Payment is only available on web');
}

// CRITICAL: Create context value object ONCE with only primitives and simple functions
// This object is completely serializable and safe for worklets
const NATIVE_CONTEXT_VALUE: WalletContextType = {
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
// CRITICAL: This implementation uses ONLY serializable primitives to avoid worklets errors
export function WalletProvider({ children }: { children: ReactNode }) {
  console.log('💼 WalletProvider: Native implementation loaded');

  // CRITICAL: Use the pre-defined constant value to ensure stability
  // This prevents any re-creation of the context value
  return (
    <WalletContext.Provider value={NATIVE_CONTEXT_VALUE}>
      {children}
    </WalletContext.Provider>
  );
}
