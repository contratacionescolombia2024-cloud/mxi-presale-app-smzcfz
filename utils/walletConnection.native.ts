
// Web3 functionality has been removed

export type WalletType = 'metamask' | 'walletconnect' | 'trustwallet';

export interface WalletConnectionResult {
  provider: any;
  signer: any;
  address: string;
  chainId: number;
}

export const BSC_CHAIN_ID = 56;
export const BSC_CHAIN_ID_HEX = '0x38';
export const BSC_RPC_URL = 'https://bsc-dataseed.binance.org/';
export const USDT_CONTRACT_ADDRESS = '0x55d398326f99059fF775485246999027B3197955';
export const PROJECT_WALLET_ADDRESS = '0x68F0d7c607617DA0b1a0dC7b72885E11ddFec623';
export const USDT_ABI: any[] = [];

export function isMetaMaskInstalled(): boolean {
  return false;
}

export async function connectMetaMask(): Promise<WalletConnectionResult> {
  throw new Error('Wallet connection feature has been removed.');
}

export async function switchToBSC(): Promise<void> {
  throw new Error('Wallet connection feature has been removed.');
}

export async function connectWalletConnect(): Promise<WalletConnectionResult> {
  throw new Error('Wallet connection feature has been removed.');
}

export async function getUSDTBalance(
  provider: any,
  address: string
): Promise<string> {
  throw new Error('Wallet connection feature has been removed.');
}

export async function sendUSDTPayment(
  signer: any,
  amountUSDT: number
): Promise<string> {
  throw new Error('Wallet connection feature has been removed.');
}

export async function disconnectWallet(walletType: WalletType): Promise<void> {
  console.log('Wallet connection feature has been removed.');
}
