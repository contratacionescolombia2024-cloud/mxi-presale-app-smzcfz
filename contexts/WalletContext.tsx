
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Platform } from 'react-native';
import { useAccount, useDisconnect, useWalletClient } from 'wagmi';
import { BrowserProvider, Contract, parseUnits, formatUnits } from 'ethers';
import { 
  USDT_CONTRACT_ADDRESS, 
  PROJECT_WALLET_ADDRESS, 
  USDT_ABI,
  BSC_CHAIN_ID 
} from '@/config/web3Config';

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
  const [usdtBalance, setUsdtBalance] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [walletType, setWalletType] = useState<string | null>(null);

  // Wagmi hooks (only work on web)
  const { address, isConnected, chain } = useAccount();
  const { disconnect } = useDisconnect();
  const { data: walletClient } = useWalletClient();

  // Check if we're on web platform
  const isWeb = Platform.OS === 'web';

  // Refresh USDT balance
  const refreshBalance = async () => {
    if (!isWeb || !address || !isConnected) {
      console.log('Cannot refresh balance: not on web or not connected');
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
  };

  // Auto-refresh balance when connected
  useEffect(() => {
    if (isWeb && isConnected && address) {
      refreshBalance();
      
      // Refresh every 30 seconds
      const interval = setInterval(refreshBalance, 30000);
      return () => clearInterval(interval);
    }
  }, [isWeb, isConnected, address]);

  // Detect wallet type
  useEffect(() => {
    if (isWeb && isConnected) {
      if (typeof window !== 'undefined') {
        const ethereum = (window as any).ethereum;
        if (ethereum?.isMetaMask) {
          setWalletType('metamask');
        } else if (ethereum?.isTrust) {
          setWalletType('trustwallet');
        } else {
          setWalletType('walletconnect');
        }
      }
    } else {
      setWalletType(null);
    }
  }, [isWeb, isConnected]);

  const connectWallet = async (type: string) => {
    if (!isWeb) {
      throw new Error('Wallet connection is only available on web. Please use the web version of the app to connect your wallet.');
    }

    console.log('🔗 Connecting wallet:', type);
    // Web3Modal handles the connection automatically
    // The user just needs to click the <w3m-button /> component
  };

  const disconnectWallet = async () => {
    if (!isWeb) {
      console.log('Not on web platform');
      return;
    }

    try {
      console.log('🔌 Disconnecting wallet...');
      disconnect();
      setUsdtBalance(null);
      setWalletType(null);
      console.log('✅ Wallet disconnected');
    } catch (error) {
      console.error('❌ Error disconnecting wallet:', error);
    }
  };

  const sendPayment = async (amountUSDT: number): Promise<string> => {
    if (!isWeb) {
      throw new Error('Payment is only available on web. Please use the web version of the app.');
    }

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
  };

  return (
    <WalletContext.Provider
      value={{
        isConnected: isWeb ? isConnected : false,
        walletType,
        address: isWeb ? (address || null) : null,
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
