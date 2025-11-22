
// Native platform stub - Web3 is not supported on native platforms
// This file prevents accidental imports of Web3 config on native

console.log('⚠️ Web3Config: Native platform detected - Web3 features disabled');

// Export empty/stub values to prevent import errors
export const WALLETCONNECT_PROJECT_ID = '';
export const BSC_CHAIN_ID = 56;
export const BSC_CHAIN_ID_HEX = '0x38';
export const BSC_RPC_URL = '';
export const USDT_CONTRACT_ADDRESS = '';
export const PROJECT_WALLET_ADDRESS = '';
export const USDT_ABI: any[] = [];
export const wagmiConfig: any = null;
export const queryClient: any = null;

export function initWeb3Modal() {
  console.warn('⚠️ Web3Modal is not available on native platforms');
  return null;
}
