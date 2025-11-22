
// Native (iOS/Android) version - Web3Modal is not supported on native platforms
// This file provides the constants and types but no actual Web3Modal functionality

// WalletConnect Project ID - Replace with your actual project ID
export const WALLETCONNECT_PROJECT_ID = 'YOUR_WALLETCONNECT_PROJECT_ID';

// BSC Mainnet Configuration
export const BSC_CHAIN_ID = 56;
export const BSC_CHAIN_ID_HEX = '0x38';
export const BSC_RPC_URL = 'https://bsc-dataseed.binance.org/';

// USDT BEP20 Contract
export const USDT_CONTRACT_ADDRESS = '0x55d398326f99059fF775485246999027B3197955';
export const PROJECT_WALLET_ADDRESS = '0x68F0d7c607617DA0b1a0dC7b72885E11ddFec623';

// Minimal USDT ABI for transfer and balance functions
export const USDT_ABI = [
  {
    constant: false,
    inputs: [
      { name: '_to', type: 'address' },
      { name: '_value', type: 'uint256' },
    ],
    name: 'transfer',
    outputs: [{ name: '', type: 'bool' }],
    type: 'function',
  },
  {
    constant: true,
    inputs: [{ name: '_owner', type: 'address' }],
    name: 'balanceOf',
    outputs: [{ name: 'balance', type: 'uint256' }],
    type: 'function',
  },
  {
    constant: true,
    inputs: [],
    name: 'decimals',
    outputs: [{ name: '', type: 'uint8' }],
    type: 'function',
  },
];

// Dummy wagmi config for native platforms
export const wagmiConfig = null;

// Dummy init function for native platforms
export function initWeb3Modal() {
  console.log('Web3Modal is only available on web platform');
  return null;
}

// Query client for React Query
import { QueryClient } from '@tanstack/react-query';
export const queryClient = new QueryClient();
