
import { ethers } from 'ethers';

// BSC Mainnet Configuration
export const BSC_CHAIN_ID = '0x38'; // 56 in decimal
export const BSC_CHAIN_ID_DECIMAL = 56;
export const BSC_NETWORK_NAME = 'Binance Smart Chain';
export const BSC_RPC_URL = 'https://bsc-dataseed.binance.org/';
export const BSC_BLOCK_EXPLORER = 'https://bscscan.com';
export const BSC_CURRENCY_SYMBOL = 'BNB';

// Project wallet address
export const PROJECT_WALLET_ADDRESS = '0x68F0d7c607617DA0b1a0dC7b72885E11ddFec623';

// USDT Contract on BSC
export const USDT_CONTRACT_ADDRESS = '0x55d398326f99059fF775485246999027B3197955';

// ERC20 ABI for USDT transfers
export const ERC20_ABI = [
  'function balanceOf(address owner) view returns (uint256)',
  'function decimals() view returns (uint8)',
  'function symbol() view returns (string)',
  'function transfer(address to, uint256 amount) returns (bool)',
];

export interface MetaMaskState {
  isInstalled: boolean;
  isConnected: boolean;
  account: string | null;
  chainId: string | null;
  balance: string | null;
}

export interface NetworkInfo {
  chainId: string;
  chainName: string;
  isCorrectNetwork: boolean;
}

/**
 * Check if MetaMask is installed
 */
export function isMetaMaskInstalled(): boolean {
  if (typeof window === 'undefined') return false;
  const { ethereum } = window as any;
  return Boolean(ethereum && ethereum.isMetaMask);
}

/**
 * Connect to MetaMask and request accounts
 */
export async function connectMetaMask(): Promise<string[]> {
  if (!isMetaMaskInstalled()) {
    throw new Error('MetaMask is not installed. Please install MetaMask extension.');
  }

  const { ethereum } = window as any;
  
  try {
    const accounts = await ethereum.request({ 
      method: 'eth_requestAccounts' 
    });
    
    console.log('✅ MetaMask connected:', accounts);
    return accounts;
  } catch (error: any) {
    console.error('❌ MetaMask connection error:', error);
    if (error.code === 4001) {
      throw new Error('User rejected the connection request');
    }
    throw new Error('Failed to connect to MetaMask');
  }
}

/**
 * Get current network information
 */
export async function getNetworkInfo(): Promise<NetworkInfo> {
  if (!isMetaMaskInstalled()) {
    throw new Error('MetaMask is not installed');
  }

  const { ethereum } = window as any;
  
  try {
    const chainId = await ethereum.request({ method: 'eth_chainId' });
    const isCorrectNetwork = chainId === BSC_CHAIN_ID;
    
    return {
      chainId,
      chainName: isCorrectNetwork ? BSC_NETWORK_NAME : 'Unknown Network',
      isCorrectNetwork,
    };
  } catch (error) {
    console.error('❌ Error getting network info:', error);
    throw new Error('Failed to get network information');
  }
}

/**
 * Switch to BSC network
 */
export async function switchToBSC(): Promise<void> {
  if (!isMetaMaskInstalled()) {
    throw new Error('MetaMask is not installed');
  }

  const { ethereum } = window as any;
  
  try {
    // Try to switch to BSC
    await ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: BSC_CHAIN_ID }],
    });
    console.log('✅ Switched to BSC network');
  } catch (error: any) {
    console.error('❌ Error switching network:', error);
    
    // If the chain hasn't been added to MetaMask, add it
    if (error.code === 4902) {
      try {
        await ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [
            {
              chainId: BSC_CHAIN_ID,
              chainName: BSC_NETWORK_NAME,
              nativeCurrency: {
                name: 'BNB',
                symbol: 'BNB',
                decimals: 18,
              },
              rpcUrls: [BSC_RPC_URL],
              blockExplorerUrls: [BSC_BLOCK_EXPLORER],
            },
          ],
        });
        console.log('✅ BSC network added and switched');
      } catch (addError) {
        console.error('❌ Error adding BSC network:', addError);
        throw new Error('Failed to add BSC network to MetaMask');
      }
    } else {
      throw new Error('Failed to switch to BSC network');
    }
  }
}

/**
 * Get BNB balance for an address
 */
export async function getBNBBalance(address: string): Promise<string> {
  if (!isMetaMaskInstalled()) {
    throw new Error('MetaMask is not installed');
  }

  const { ethereum } = window as any;
  const provider = new ethers.BrowserProvider(ethereum);
  
  try {
    const balance = await provider.getBalance(address);
    const balanceInBNB = ethers.formatEther(balance);
    return balanceInBNB;
  } catch (error) {
    console.error('❌ Error getting BNB balance:', error);
    throw new Error('Failed to get BNB balance');
  }
}

/**
 * Get USDT balance for an address
 */
export async function getUSDTBalance(address: string): Promise<string> {
  if (!isMetaMaskInstalled()) {
    throw new Error('MetaMask is not installed');
  }

  const { ethereum } = window as any;
  const provider = new ethers.BrowserProvider(ethereum);
  
  try {
    const usdtContract = new ethers.Contract(
      USDT_CONTRACT_ADDRESS,
      ERC20_ABI,
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
 * Send BNB payment
 */
export async function sendBNBPayment(
  fromAddress: string,
  amountInUSD: number,
  bnbPriceInUSD: number
): Promise<string> {
  if (!isMetaMaskInstalled()) {
    throw new Error('MetaMask is not installed');
  }

  const { ethereum } = window as any;
  
  try {
    // Calculate BNB amount
    const bnbAmount = amountInUSD / bnbPriceInUSD;
    const valueInWei = ethers.parseEther(bnbAmount.toString());
    
    console.log('💰 Sending BNB payment:', {
      amountInUSD,
      bnbAmount,
      valueInWei: valueInWei.toString(),
    });
    
    // Send transaction
    const transactionHash = await ethereum.request({
      method: 'eth_sendTransaction',
      params: [
        {
          from: fromAddress,
          to: PROJECT_WALLET_ADDRESS,
          value: '0x' + valueInWei.toString(16),
        },
      ],
    });
    
    console.log('✅ BNB transaction sent:', transactionHash);
    return transactionHash;
  } catch (error: any) {
    console.error('❌ Error sending BNB payment:', error);
    if (error.code === 4001) {
      throw new Error('User rejected the transaction');
    }
    throw new Error('Failed to send BNB payment');
  }
}

/**
 * Send USDT payment
 */
export async function sendUSDTPayment(
  fromAddress: string,
  amountInUSDT: number
): Promise<string> {
  if (!isMetaMaskInstalled()) {
    throw new Error('MetaMask is not installed');
  }

  const { ethereum } = window as any;
  const provider = new ethers.BrowserProvider(ethereum);
  const signer = await provider.getSigner();
  
  try {
    const usdtContract = new ethers.Contract(
      USDT_CONTRACT_ADDRESS,
      ERC20_ABI,
      signer
    );
    
    // Get USDT decimals
    const decimals = await usdtContract.decimals();
    const amountInWei = ethers.parseUnits(amountInUSDT.toString(), decimals);
    
    console.log('💰 Sending USDT payment:', {
      amountInUSDT,
      amountInWei: amountInWei.toString(),
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
    throw new Error('Failed to send USDT payment');
  }
}

/**
 * Get current BNB price in USD (simplified - in production use a price oracle)
 */
export async function getBNBPriceInUSD(): Promise<number> {
  try {
    // In production, use a reliable price oracle like Chainlink or CoinGecko API
    // For now, we'll use a placeholder that should be replaced with real price feed
    const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=binancecoin&vs_currencies=usd');
    const data = await response.json();
    return data.binancecoin.usd;
  } catch (error) {
    console.error('❌ Error fetching BNB price:', error);
    // Fallback price (should be updated regularly in production)
    return 600; // Default BNB price
  }
}

/**
 * Listen for account changes
 */
export function onAccountsChanged(callback: (accounts: string[]) => void): () => void {
  if (!isMetaMaskInstalled()) return () => {};
  
  const { ethereum } = window as any;
  
  const handler = (accounts: string[]) => {
    console.log('🔄 MetaMask accounts changed:', accounts);
    callback(accounts);
  };
  
  ethereum.on('accountsChanged', handler);
  
  return () => {
    ethereum.removeListener('accountsChanged', handler);
  };
}

/**
 * Listen for chain changes
 */
export function onChainChanged(callback: (chainId: string) => void): () => void {
  if (!isMetaMaskInstalled()) return () => {};
  
  const { ethereum } = window as any;
  
  const handler = (chainId: string) => {
    console.log('🔄 MetaMask chain changed:', chainId);
    callback(chainId);
  };
  
  ethereum.on('chainChanged', handler);
  
  return () => {
    ethereum.removeListener('chainChanged', handler);
  };
}
