
import React, { createContext, useContext, useState, useEffect, ReactNode, useMemo, useCallback } from 'react';
import { useAccount, useDisconnect, useWalletClient } from 'wagmi';
import { BrowserProvider, Contract, parseUnits, formatUnits } from 'ethers';
import { 
  USDT_CONTRACT_ADDRESS, 
  PROJECT_WALLET_ADDRESS, 
  USDT_ABI,
  BSC_CHAIN_ID 
} from '@/config/web3Config.web';

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

export function WalletProvider({ children }: { children: ReactNode }) {
  console.log('💼 WalletProvider: Web implementation loaded');

  const [usdtBalance, setUsdtBalance] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [walletType, setWalletType] = useState<string | null>(null);

  // Wagmi hooks
  const { address, isConnected, chain } = useAccount();
  const { disconnect } = useDisconnect();
  const { data: walletClient } = useWalletClient();

  // Log connection status
  useEffect(() => {
    console.log('🔗 Wallet connection status:', {
      isConnected,
      address,
      chain: chain?.name,
    });
  }, [isConnected, address, chain]);

  // Refresh USDT balance
  const refreshBalance = useCallback(async () => {
    if (!address || !isConnected) {
      console.log('⚠️ Cannot refresh balance: not connected');
      return;
    }

    try {
      setIsLoading(true);
      console.log('🔄 Refreshing USDT balance for:', address);

      // Create ethers provider from window.ethereum
      if (typeof window !== 'undefined' && (window as any).ethereum) {
        const provider = new BrowserProvider((window as any).ethereum);
        const contract = new Contract(USDT_CONTRACT_ADDRESS, USDT_ABI, provider);
        
        const balance = await contract.balanceOf(address);
        const decimals = await contract.decimals();
        const formattedBalance = formatUnits(balance, decimals);
        
        console.log('💰 USDT Balance:', formattedBalance);
        setUsdtBalance(formattedBalance);
      }
    } catch (error) {
      console.error('❌ Error refreshing balance:', error);
      setUsdtBalance('0');
    } finally {
      setIsLoading(false);
    }
  }, [address, isConnected]);

  // Auto-refresh balance when connected
  useEffect(() => {
    if (isConnected && address) {
      console.log('🔄 Auto-refreshing balance...');
      refreshBalance();
      
      // Refresh every 30 seconds
      const interval = setInterval(refreshBalance, 30000);
      return () => clearInterval(interval);
    }
  }, [isConnected, address, refreshBalance]);

  // Detect wallet type
  useEffect(() => {
    if (isConnected) {
      if (typeof window !== 'undefined') {
        const ethereum = (window as any).ethereum;
        if (ethereum?.isMetaMask) {
          setWalletType('metamask');
          console.log('🦊 MetaMask detected');
        } else if (ethereum?.isTrust) {
          setWalletType('trustwallet');
          console.log('🛡️ Trust Wallet detected');
        } else {
          setWalletType('walletconnect');
          console.log('🔗 WalletConnect detected');
        }
      }
    } else {
      setWalletType(null);
    }
  }, [isConnected]);

  const connectWallet = useCallback(async (type: string) => {
    console.log('🔗 Connecting wallet:', type);
    // Web3Modal handles the connection automatically
    // The user just needs to click the <w3m-button /> component
  }, []);

  const disconnectWallet = useCallback(async () => {
    try {
      console.log('🔌 Disconnecting wallet...');
      disconnect();
      setUsdtBalance(null);
      setWalletType(null);
      console.log('✅ Wallet disconnected');
    } catch (error) {
      console.error('❌ Error disconnecting wallet:', error);
    }
  }, [disconnect]);

  const sendPayment = useCallback(async (amountUSDT: number): Promise<string> => {
    if (!isConnected || !address) {
      throw new Error('Wallet not connected');
    }

    if (chain?.id !== BSC_CHAIN_ID) {
      throw new Error('Please switch to Binance Smart Chain (BSC) network');
    }

    try {
      setIsLoading(true);
      console.log('💸 Sending USDT payment:', amountUSDT);

      // Create ethers provider and signer
      if (typeof window !== 'undefined' && (window as any).ethereum) {
        const provider = new BrowserProvider((window as any).ethereum);
        const signer = await provider.getSigner();
        const contract = new Contract(USDT_CONTRACT_ADDRESS, USDT_ABI, signer);

        // Get decimals
        const decimals = await contract.decimals();
        console.log('📊 USDT decimals:', decimals);

        // Convert amount to wei
        const amountInWei = parseUnits(amountUSDT.toString(), decimals);
        console.log('💰 Amount in wei:', amountInWei.toString());

        // Check balance
        const balance = await contract.balanceOf(address);
        console.log('💰 User USDT balance:', formatUnits(balance, decimals));

        if (balance < amountInWei) {
          throw new Error('Insufficient USDT balance');
        }

        // Send transaction
        console.log('📤 Sending transaction...');
        const tx = await contract.transfer(PROJECT_WALLET_ADDRESS, amountInWei);
        console.log('✅ Transaction sent:', tx.hash);

        // Wait for confirmation
        console.log('⏳ Waiting for confirmation...');
        const receipt = await tx.wait();
        console.log('✅ Transaction confirmed:', receipt);

        // Refresh balance
        await refreshBalance();

        return tx.hash;
      }

      throw new Error('Ethereum provider not found');
    } catch (error: any) {
      console.error('❌ Payment error:', error);
      
      // Handle specific errors
      if (error.code === 'ACTION_REJECTED') {
        throw new Error('Transaction was rejected by user');
      } else if (error.message?.includes('insufficient funds')) {
        throw new Error('Insufficient BNB for gas fees');
      } else if (error.message?.includes('Insufficient USDT balance')) {
        throw new Error('Insufficient USDT balance');
      } else {
        throw new Error(error.message || 'Failed to send USDT payment');
      }
    } finally {
      setIsLoading(false);
    }
  }, [isConnected, address, chain, refreshBalance]);

  // Memoize context value to prevent unnecessary re-renders
  // This is critical for worklets compatibility
  const contextValue = useMemo<WalletContextType>(() => ({
    isConnected,
    walletType,
    address: address || null,
    usdtBalance,
    isLoading,
    connectWallet,
    disconnectWallet,
    refreshBalance,
    sendPayment,
  }), [isConnected, walletType, address, usdtBalance, isLoading, connectWallet, disconnectWallet, refreshBalance, sendPayment]);

  return (
    <WalletContext.Provider value={contextValue}>
      {children}
    </WalletContext.Provider>
  );
}
