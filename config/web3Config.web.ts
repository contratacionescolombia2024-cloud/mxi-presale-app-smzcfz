
import { createWeb3Modal } from '@web3modal/wagmi/react';
import { defaultWagmiConfig } from '@web3modal/wagmi/react/config';
import { bsc } from 'wagmi/chains';

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

// Wagmi configuration
const metadata = {
  name: 'MXI Presale',
  description: 'MXI Token Presale Platform',
  url: 'https://mxistrategic.live',
  icons: ['https://mxistrategic.live/icon.png'],
};

export const wagmiConfig = defaultWagmiConfig({
  chains: [bsc],
  projectId: WALLETCONNECT_PROJECT_ID,
  metadata,
});

// Create Web3Modal instance
let web3Modal: any = null;

export function initWeb3Modal() {
  if (typeof window !== 'undefined' && !web3Modal) {
    web3Modal = createWeb3Modal({
      wagmiConfig,
      projectId: WALLETCONNECT_PROJECT_ID,
      chains: [bsc],
      themeMode: 'dark',
      themeVariables: {
        '--w3m-accent': '#8B5CF6',
        '--w3m-border-radius-master': '12px',
      },
    });
  }
  return web3Modal;
}

// Query client for React Query
import { QueryClient } from '@tanstack/react-query';
export const queryClient = new QueryClient();
