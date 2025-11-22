
# Web3 Configuration

This directory contains the Web3Modal v3 configuration for crypto wallet integration.

## Setup Instructions

### 1. Get WalletConnect Project ID

1. Go to https://cloud.walletconnect.com/
2. Sign up or log in
3. Create a new project
4. Copy your Project ID

### 2. Update Configuration

Edit `web3Config.ts` and replace the placeholder:

```typescript
export const WALLETCONNECT_PROJECT_ID = 'YOUR_WALLETCONNECT_PROJECT_ID';
```

With your actual Project ID:

```typescript
export const WALLETCONNECT_PROJECT_ID = 'abc123def456...';
```

### 3. Verify Contract Addresses

Make sure these addresses are correct:

- **USDT BEP20:** `0x55d398326f99059fF775485246999027B3197955`
- **Project Wallet:** `0x68F0d7c607617DA0b1a0dC7b72885E11ddFec623`

### 4. Test Connection

1. Run the app on web: `npm run web`
2. Navigate to "Connect Wallet"
3. Click the Web3Modal button
4. Connect with MetaMask or another wallet
5. Verify your wallet address and USDT balance appear

## Configuration Options

### Supported Chains

Currently configured for:
- Binance Smart Chain (BSC) Mainnet

To add more chains, update the `chains` array in `web3Config.ts`:

```typescript
import { bsc, ethereum, polygon } from 'wagmi/chains';

export const wagmiConfig = defaultWagmiConfig({
  chains: [bsc, ethereum, polygon],
  // ...
});
```

### Theme Customization

Customize Web3Modal appearance:

```typescript
createWeb3Modal({
  // ...
  themeMode: 'dark', // or 'light'
  themeVariables: {
    '--w3m-accent': '#8B5CF6', // Primary color
    '--w3m-border-radius-master': '12px', // Border radius
  },
});
```

## Troubleshooting

### "Project ID is required"

Make sure you've set `WALLETCONNECT_PROJECT_ID` in `web3Config.ts`.

### Web3Modal not appearing

1. Check you're running on web platform (not native)
2. Verify Web3Provider is wrapping your app in `app/_layout.tsx`
3. Check browser console for errors

### Wallet not connecting

1. Make sure you have a compatible wallet installed (MetaMask, Trust Wallet, etc.)
2. Check you're on the correct network (BSC)
3. Try refreshing the page

## Security Notes

- Never commit your WalletConnect Project ID to public repositories
- Use environment variables for production
- Keep your project wallet private key secure
- Always verify transactions on BscScan before crediting users
