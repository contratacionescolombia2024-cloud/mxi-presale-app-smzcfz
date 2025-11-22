
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

// CRITICAL: Define all functions at module level to ensure serializability
// These functions are defined outside the component to prevent closure issues

function showWebOnlyAlert(): void {
  Alert.alert(
    'Web Only Feature',
    'Wallet connection and crypto payments are only available on the web version of this app. Please visit the web version to use this feature.',
    [{ text: 'OK' }]
  );
}

async function connectWalletNative(_type: string): Promise<void> {
  console.log('⚠️ WalletProvider: Connect wallet called on native platform');
  showWebOnlyAlert();
  throw new Error('Wallet connection is only available on web');
}

async function disconnectWalletNative(): Promise<void> {
  console.log('⚠️ WalletProvider: Disconnect wallet called on native platform');
}

async function refreshBalanceNative(): Promise<void> {
  console.log('⚠️ WalletProvider: Refresh balance called on native platform');
}

async function sendPaymentNative(_amountUSDT: number): Promise<string> {
  console.log('⚠️ WalletProvider: Send payment called on native platform');
  showWebOnlyAlert();
  throw new Error('Payment is only available on web');
}

// CRITICAL: Create a constant context value with only primitives and module-level functions
// This object is completely serializable and never changes
const NATIVE_WALLET_CONTEXT: WalletContextType = Object.freeze({
  isConnected: false,
  walletType: null,
  address: null,
  usdtBalance: null,
  isLoading: false,
  connectWallet: connectWalletNative,
  disconnectWallet: disconnectWalletNative,
  refreshBalance: refreshBalanceNative,
  sendPayment: sendPaymentNative,
});

// Native implementation - Web3Modal is not supported on native platforms
export function WalletProvider({ children }: { children: ReactNode }) {
  console.log('💼 WalletProvider: Native implementation loaded');

  // CRITICAL: Use the frozen constant value to prevent any re-renders or object recreation
  // This ensures the context value is always the same reference
  return (
    <WalletContext.Provider value={NATIVE_WALLET_CONTEXT}>
      {children}
    </WalletContext.Provider>
  );
}
