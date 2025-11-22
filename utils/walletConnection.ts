
import { ethers } from 'ethers';
import WalletConnectProvider from '@walletconnect/web3-provider';

// BSC Mainnet Configuration
export const BSC_CHAIN_ID = 56;
export const BSC_CHAIN_ID_HEX = '0x38';
export const BSC_RPC_URL = 'https://bsc-dataseed.binance.org/';

// USDT BEP20 Contract
export const USDT_CONTRACT_ADDRESS = '0x55d398326f99059fF775485246999027B3197955';
export const PROJECT_WALLET_ADDRESS = '0x68F0d7c607617DA0b1a0dC7b72885E11ddFec623';

// Minimal USDT ABI for transfer function
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
    inputs: [{ name: 'account', type: 'address' }],
    outputs: [{ type: 'uint256' }],
  },
  {
    name: 'decimals',
    type: 'function',
    inputs: [],
    outputs: [{ type: 'uint8' }],
  },
];

export type WalletType = 'metamask' | 'walletconnect' | 'trustwallet';

export interface WalletConnectionResult {
  provider: ethers.BrowserProvider;
  signer: ethers.Signer;
  address: string;
  chainId: number;
}

/**
 * Check if MetaMask is installed
 */
export function isMetaMaskInstalled(): boolean {
  if (typeof window === 'undefined') return false;
  return typeof (window as any).ethereum !== 'undefined';
}

/**
 * Connect to MetaMask wallet
 */
export async function connectMetaMask(): Promise<WalletConnectionResult> {
  console.log('🦊 Connecting to MetaMask...');

  if (!isMetaMaskInstalled()) {
    throw new Error('MetaMask is not installed. Please install MetaMask extension.');
  }

  const ethereum = (window as any).ethereum;

  try {
    // Request account access
    const accounts = await ethereum.request({ method: 'eth_requestAccounts' });
    console.log('✅ MetaMask accounts:', accounts);

    if (!accounts || accounts.length === 0) {
      throw new Error('No accounts found in MetaMask');
    }

    // Create provider and signer
    const provider = new ethers.BrowserProvider(ethereum);
    const signer = await provider.getSigner();
    const address = await signer.getAddress();
    const network = await provider.getNetwork();
    const chainId = Number(network.chainId);

    console.log('✅ Connected to MetaMask:', { address, chainId });

    // Check if on BSC network
    if (chainId !== BSC_CHAIN_ID) {
      console.log('⚠️ Wrong network, switching to BSC...');
      await switchToBSC();
      
      // Re-fetch network info after switch
      const newNetwork = await provider.getNetwork();
      const newChainId = Number(newNetwork.chainId);
      
      if (newChainId !== BSC_CHAIN_ID) {
        throw new Error('Failed to switch to BSC network');
      }
    }

    return {
      provider,
      signer,
      address,
      chainId: BSC_CHAIN_ID,
    };
  } catch (error: any) {
    console.error('❌ MetaMask connection error:', error);
    throw new Error(error.message || 'Failed to connect to MetaMask');
  }
}

/**
 * Switch to BSC network in MetaMask
 */
export async function switchToBSC(): Promise<void> {
  const ethereum = (window as any).ethereum;

  try {
    // Try to switch to BSC
    await ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: BSC_CHAIN_ID_HEX }],
    });
    console.log('✅ Switched to BSC network');
  } catch (switchError: any) {
    // If BSC is not added, add it
    if (switchError.code === 4902) {
      console.log('📝 Adding BSC network to MetaMask...');
      try {
        await ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [
            {
              chainId: BSC_CHAIN_ID_HEX,
              chainName: 'Binance Smart Chain',
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
        console.log('✅ BSC network added to MetaMask');
      } catch (addError) {
        console.error('❌ Failed to add BSC network:', addError);
        throw new Error('Failed to add BSC network to MetaMask');
      }
    } else {
      throw switchError;
    }
  }
}

/**
 * Connect to WalletConnect (Trust Wallet and others)
 */
export async function connectWalletConnect(): Promise<WalletConnectionResult> {
  console.log('🔗 Connecting to WalletConnect...');

  try {
    // Create WalletConnect Provider
    const wcProvider = new WalletConnectProvider({
      rpc: {
        [BSC_CHAIN_ID]: BSC_RPC_URL,
      },
      chainId: BSC_CHAIN_ID,
      qrcode: true,
    });

    // Enable session (shows QR Code modal)
    await wcProvider.enable();
    console.log('✅ WalletConnect enabled');

    // Create ethers provider and signer
    const provider = new ethers.BrowserProvider(wcProvider as any);
    const signer = await provider.getSigner();
    const address = await signer.getAddress();
    const network = await provider.getNetwork();
    const chainId = Number(network.chainId);

    console.log('✅ Connected to WalletConnect:', { address, chainId });

    if (chainId !== BSC_CHAIN_ID) {
      throw new Error('Please connect to Binance Smart Chain (BSC) network');
    }

    return {
      provider,
      signer,
      address,
      chainId,
    };
  } catch (error: any) {
    console.error('❌ WalletConnect connection error:', error);
    throw new Error(error.message || 'Failed to connect to WalletConnect');
  }
}

/**
 * Get USDT balance for an address
 */
export async function getUSDTBalance(
  provider: ethers.BrowserProvider,
  address: string
): Promise<string> {
  try {
    const contract = new ethers.Contract(USDT_CONTRACT_ADDRESS, USDT_ABI, provider);
    const balance = await contract.balanceOf(address);
    const decimals = await contract.decimals();
    const formattedBalance = ethers.formatUnits(balance, decimals);
    console.log('💰 USDT Balance:', formattedBalance);
    return formattedBalance;
  } catch (error) {
    console.error('❌ Error getting USDT balance:', error);
    throw new Error('Failed to get USDT balance');
  }
}

/**
 * Send USDT payment
 */
export async function sendUSDTPayment(
  signer: ethers.Signer,
  amountUSDT: number
): Promise<string> {
  console.log('💸 Sending USDT payment:', amountUSDT);

  try {
    // Create contract instance with signer
    const contract = new ethers.Contract(USDT_CONTRACT_ADDRESS, USDT_ABI, signer);

    // Get decimals (USDT has 18 decimals on BSC)
    const decimals = await contract.decimals();
    console.log('📊 USDT decimals:', decimals);

    // Convert amount to wei
    const amountInWei = ethers.parseUnits(amountUSDT.toString(), decimals);
    console.log('💰 Amount in wei:', amountInWei.toString());

    // Check balance
    const userAddress = await signer.getAddress();
    const balance = await contract.balanceOf(userAddress);
    console.log('💰 User USDT balance:', ethers.formatUnits(balance, decimals));

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

    return tx.hash;
  } catch (error: any) {
    console.error('❌ Payment error:', error);
    
    // Handle specific errors
    if (error.code === 'ACTION_REJECTED') {
      throw new Error('Transaction was rejected by user');
    } else if (error.message.includes('insufficient funds')) {
      throw new Error('Insufficient BNB for gas fees');
    } else if (error.message.includes('Insufficient USDT balance')) {
      throw new Error('Insufficient USDT balance');
    } else {
      throw new Error(error.message || 'Failed to send USDT payment');
    }
  }
}

/**
 * Disconnect wallet
 */
export async function disconnectWallet(walletType: WalletType): Promise<void> {
  console.log('🔌 Disconnecting wallet:', walletType);

  if (walletType === 'walletconnect' || walletType === 'trustwallet') {
    // WalletConnect disconnect is handled by the provider
    console.log('✅ WalletConnect disconnected');
  } else if (walletType === 'metamask') {
    // MetaMask doesn't have a disconnect method, just clear local state
    console.log('✅ MetaMask disconnected (local state cleared)');
  }
}
