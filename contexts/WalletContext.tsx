
import React, { createContext, useContext, useState, useCallback } from 'react';
import { Platform } from 'react-native';
import {
  WalletType,
  WalletConnectionResult,
  connectMetaMask,
  connectWalletConnect,
  disconnectWallet as disconnectWalletUtil,
  getUSDTBalance,
  sendUSDTPayment,
} from '@/utils/walletConnection';

interface WalletContextType {
  isConnected: boolean;
  walletType: WalletType | null;
  address: string | null;
  usdtBalance: string | null;
  isLoading: boolean;
  connectWallet: (type: WalletType) => Promise<void>;
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
  const [isConnected, setIsConnected] = useState(false);
  const [walletType, setWalletType] = useState<WalletType | null>(null);
  const [address, setAddress] = useState<string | null>(null);
  const [usdtBalance, setUsdtBalance] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [provider, setProvider] = useState<any | null>(null);
  const [signer, setSigner] = useState<any | null>(null);

  const connectWallet = useCallback(async (type: WalletType) => {
    setIsLoading(true);
    try {
      console.log('🔗 Connecting wallet:', type);

      // Check if on native platform
      if (Platform.OS !== 'web') {
        throw new Error('Wallet connection is only available on web. Please use the web version of the app to connect your wallet.');
      }

      let result: WalletConnectionResult;

      if (type === 'metamask') {
        result = await connectMetaMask();
      } else if (type === 'walletconnect' || type === 'trustwallet') {
        result = await connectWalletConnect();
      } else {
        throw new Error('Unsupported wallet type');
      }

      setProvider(result.provider);
      setSigner(result.signer);
      setAddress(result.address);
      setWalletType(type);
      setIsConnected(true);

      // Get USDT balance
      const balance = await getUSDTBalance(result.provider, result.address);
      setUsdtBalance(balance);

      console.log('✅ Wallet connected successfully');
    } catch (error: any) {
      console.error('❌ Failed to connect wallet:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const disconnectWallet = useCallback(async () => {
    setIsLoading(true);
    try {
      if (walletType) {
        await disconnectWalletUtil(walletType);
      }

      setProvider(null);
      setSigner(null);
      setAddress(null);
      setWalletType(null);
      setIsConnected(false);
      setUsdtBalance(null);

      console.log('✅ Wallet disconnected');
    } catch (error) {
      console.error('❌ Failed to disconnect wallet:', error);
    } finally {
      setIsLoading(false);
    }
  }, [walletType]);

  const refreshBalance = useCallback(async () => {
    if (!provider || !address) {
      console.log('⚠️ No provider or address to refresh balance');
      return;
    }

    try {
      console.log('🔄 Refreshing USDT balance...');
      const balance = await getUSDTBalance(provider, address);
      setUsdtBalance(balance);
      console.log('✅ Balance refreshed:', balance);
    } catch (error) {
      console.error('❌ Failed to refresh balance:', error);
    }
  }, [provider, address]);

  const sendPayment = useCallback(
    async (amountUSDT: number): Promise<string> => {
      if (!signer) {
        throw new Error('Wallet not connected');
      }

      if (Platform.OS !== 'web') {
        throw new Error('Wallet payments are only available on web. Please use the web version of the app.');
      }

      try {
        console.log('💸 Sending payment:', amountUSDT, 'USDT');
        const txHash = await sendUSDTPayment(signer, amountUSDT);
        console.log('✅ Payment sent, tx hash:', txHash);

        // Refresh balance after payment
        await refreshBalance();

        return txHash;
      } catch (error: any) {
        console.error('❌ Payment failed:', error);
        throw error;
      }
    },
    [signer, refreshBalance]
  );

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
