
import WalletConnectProvider from '@walletconnect/web3-provider';
import { ethers } from 'ethers';

// BSC Configuration
export const BSC_CHAIN_ID = 56;
export const BSC_CHAIN_ID_HEX = '0x38';
export const BSC_RPC_URL = 'https://bsc-dataseed.binance.org/';
export const BSC_NETWORK_NAME = 'Binance Smart Chain';

// Project wallet address - REPLACE WITH YOUR ACTUAL WALLET
export const PROJECT_WALLET_ADDRESS = '0x68F0d7c607617DA0b1a0dC7b72885E11ddFec623';

// USDT Contract on BSC
export const USDT_CONTRACT_ADDRESS = '0x55d398326f99059fF775485246999027B3197955';

// Minimal ERC20 ABI for USDT transfer
export const USDT_ABI = [
  {
    name: 'transfer',
    type: 'function',
    inputs: [
      { name: 'to', type: 'address' },
      { name: 'value', type: 'uint256' },
    ],
    outputs: [{ type: 'bool' }],
  },
  {
    name: 'balanceOf',
    type: 'function',
    inputs: [{ name: 'owner', type: 'address' }],
    outputs: [{ type: 'uint256' }],
  },
  {
    name: 'decimals',
    type: 'function',
    inputs: [],
    outputs: [{ type: 'uint8' }],
  },
];

export type WalletType = 'metamask' | 'walletconnect' | 'trust';

interface WalletConnectionResult {
  address: string;
  provider: any;
  signer: any;
  chainId: number;
}

/**
 * Connect to MetaMask wallet
 */
export async function connectMetaMask(): Promise<WalletConnectionResult> {
  if (typeof window === 'undefined' || !window.ethereum) {
    throw new Error('MetaMask is not installed. Please install MetaMask extension.');
  }

  const { ethereum } = window as any;

  try {
    // Request accounts
    const accounts = await ethereum.request({
      method: 'eth_requestAccounts',
    });

    if (!accounts || accounts.length === 0) {
      throw new Error('No accounts found');
    }

    // Check network
    const chainId = await ethereum.request({ method: 'eth_chainId' });
    const chainIdDecimal = parseInt(chainId, 16);

    // Switch to BSC if not already on it
    if (chainIdDecimal !== BSC_CHAIN_ID) {
      try {
        await ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: BSC_CHAIN_ID_HEX }],
        });
      } catch (switchError: any) {
        // If BSC is not added, add it
        if (switchError.code === 4902) {
          await ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [
              {
                chainId: BSC_CHAIN_ID_HEX,
                chainName: BSC_NETWORK_NAME,
                nativeCurrency: {
                  name: 'BNB',
                  symbol: 'BNB',
                  decimals: 18,
                },
                rpcUrls: [BSC_RPC_URL],
                blockExplorerUrls: ['https://bscscan.com'],
              },
            ],
          });
        } else {
          throw switchError;
        }
      }
    }

    const provider = new ethers.BrowserProvider(ethereum);
    const signer = await provider.getSigner();

    console.log('✅ MetaMask connected:', accounts[0]);

    return {
      address: accounts[0],
      provider,
      signer,
      chainId: BSC_CHAIN_ID,
    };
  } catch (error: any) {
    console.error('❌ MetaMask connection error:', error);
    if (error.code === 4001) {
      throw new Error('User rejected the connection request');
    }
    throw new Error('Failed to connect to MetaMask');
  }
}

/**
 * Connect to WalletConnect (Trust Wallet and others)
 */
export async function connectWalletConnect(): Promise<WalletConnectionResult> {
  try {
    // Create WalletConnect Provider
    const provider = new WalletConnectProvider({
      rpc: {
        [BSC_CHAIN_ID]: BSC_RPC_URL,
      },
      chainId: BSC_CHAIN_ID,
      qrcode: true,
    });

    console.log('🔗 Enabling WalletConnect...');

    // Enable session (shows QR Code modal)
    await provider.enable();

    console.log('✅ WalletConnect enabled');

    // Get accounts
    const accounts = provider.accounts;
    if (!accounts || accounts.length === 0) {
      throw new Error('No accounts found');
    }

    // Create ethers provider and signer
    const ethersProvider = new ethers.BrowserProvider(provider as any);
    const signer = await ethersProvider.getSigner();

    console.log('✅ WalletConnect connected:', accounts[0]);

    return {
      address: accounts[0],
      provider: ethersProvider,
      signer,
      chainId: BSC_CHAIN_ID,
    };
  } catch (error: any) {
    console.error('❌ WalletConnect connection error:', error);
    if (error.message?.includes('User closed modal')) {
      throw new Error('User cancelled the connection');
    }
    throw new Error('Failed to connect to WalletConnect');
  }
}

/**
 * Get USDT balance for an address
 */
export async function getUSDTBalance(
  address: string,
  provider: any
): Promise<string> {
  try {
    const usdtContract = new ethers.Contract(
      USDT_CONTRACT_ADDRESS,
      USDT_ABI,
      provider
    );

    const balance = await usdtContract.balanceOf(address);
    const decimals = await usdtContract.decimals();
    const balanceInUSDT = ethers.formatUnits(balance, decimals);

    return balanceInUSDT;
  } catch (error) {
    console.error('❌ Error getting USDT balance:', error);
    throw new Error('Failed to get USDT balance');
  }
}

/**
 * Send USDT payment
 */
export async function sendUSDTPayment(
  signer: any,
  amountInUSDT: number
): Promise<string> {
  try {
    const usdtContract = new ethers.Contract(
      USDT_CONTRACT_ADDRESS,
      USDT_ABI,
      signer
    );

    // Get USDT decimals (should be 18 for BSC USDT)
    const decimals = await usdtContract.decimals();
    const amountInWei = ethers.parseUnits(amountInUSDT.toString(), decimals);

    console.log('💰 Sending USDT payment:', {
      amountInUSDT,
      amountInWei: amountInWei.toString(),
      to: PROJECT_WALLET_ADDRESS,
    });

    // Send USDT transfer transaction
    const tx = await usdtContract.transfer(PROJECT_WALLET_ADDRESS, amountInWei);

    console.log('⏳ USDT transaction submitted:', tx.hash);

    // Wait for transaction confirmation
    await tx.wait();

    console.log('✅ USDT transaction confirmed:', tx.hash);
    return tx.hash;
  } catch (error: any) {
    console.error('❌ Error sending USDT payment:', error);
    if (error.code === 'ACTION_REJECTED') {
      throw new Error('User rejected the transaction');
    }
    if (error.message?.includes('insufficient funds')) {
      throw new Error('Insufficient USDT balance');
    }
    throw new Error('Failed to send USDT payment');
  }
}

/**
 * Disconnect WalletConnect
 */
export async function disconnectWalletConnect(provider: any): Promise<void> {
  try {
    if (provider && typeof provider.disconnect === 'function') {
      await provider.disconnect();
      console.log('✅ WalletConnect disconnected');
    }
  } catch (error) {
    console.error('❌ Error disconnecting WalletConnect:', error);
  }
}
