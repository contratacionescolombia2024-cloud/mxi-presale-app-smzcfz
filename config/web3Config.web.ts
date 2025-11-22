
import { defaultWagmiConfig } from '@web3modal/wagmi/react/config';
import { bsc, bscTestnet } from 'wagmi/chains';

export const projectId = 'YOUR_PROJECT_ID'; // Replace with your WalletConnect project ID

const metadata = {
  name: 'MXI Presale',
  description: 'MXI Token Presale Platform',
  url: 'https://mxi-presale.com',
  icons: ['https://mxi-presale.com/icon.png'],
};

const chains = [bsc, bscTestnet] as const;

export const wagmiConfig = defaultWagmiConfig({
  chains,
  projectId,
  metadata,
});
