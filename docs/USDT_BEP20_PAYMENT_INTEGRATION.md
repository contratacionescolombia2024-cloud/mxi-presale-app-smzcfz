
# USDT BEP20 Payment Integration

This document describes the USDT BEP20 payment integration for the MXI presale app.

## Overview

Users can now purchase MXI tokens using USDT BEP20 on Binance Smart Chain (BSC) through MetaMask, Trust Wallet, or any WalletConnect-compatible wallet.

## Architecture

### Frontend Components

1. **WalletContext** (`contexts/WalletContext.tsx`)
   - Manages wallet connection state
   - Handles wallet connection/disconnection
   - Manages USDT balance
   - Sends USDT payments

2. **Wallet Connection Utilities** (`utils/walletConnection.ts`)
   - MetaMask connection
   - WalletConnect integration
   - BSC network switching
   - USDT contract interaction
   - Payment processing

3. **Screens**
   - `connect-wallet.tsx` - Wallet connection screen
   - `purchase-crypto.tsx` - Crypto purchase screen
   - `purchase-confirmation.tsx` - Transaction history and confirmation

### Backend Components

1. **Edge Function** (`verify-usdt-transaction`)
   - Verifies transactions on BSC blockchain
   - Checks transaction confirmations (minimum 3)
   - Validates USDT transfer to project wallet
   - Credits MXI tokens to user's vesting account
   - Updates presale stage sold MXI counter

2. **Database**
   - `metamask_transactions` table stores all crypto transactions
   - Tracks transaction status (pending, confirmed, failed)
   - Links transactions to users and presale stages

## Configuration

### Fixed Values

- **Network**: BSC Mainnet (Chain ID: 56)
- **USDT Contract**: `0x55d398326f99059fF775485246999027B3197955`
- **Project Wallet**: `0x68F0d7c607617DA0b1a0dC7b72885E11ddFec623`
- **RPC URL**: `https://bsc-dataseed.binance.org/`
- **Min Confirmations**: 3 blocks

### Purchase Limits

- **Minimum**: 20 USDT
- **Maximum**: 50,000 USDT

## User Flow

### 1. Connect Wallet

1. User navigates to "Connect Wallet" screen
2. Selects wallet type (MetaMask or WalletConnect)
3. Approves connection in wallet
4. App verifies BSC network (switches if needed)
5. Displays wallet address and USDT balance

### 2. Purchase MXI

1. User navigates to "Purchase with Crypto" screen
2. Enters USDT amount to spend
3. App calculates MXI tokens to receive
4. User clicks "Purchase with USDT"
5. Wallet prompts for transaction approval
6. User approves transaction
7. Transaction is sent to blockchain
8. App saves transaction to database with "pending" status

### 3. Verification

1. Backend edge function monitors pending transactions
2. Fetches transaction receipt from BSC
3. Waits for 3 confirmations
4. Verifies:
   - Transaction succeeded
   - USDT token contract
   - Destination is project wallet
   - Amount matches purchase
5. Updates transaction status to "confirmed"
6. Credits MXI to user's vesting account
7. Updates presale stage sold MXI counter

### 4. Confirmation

1. User can view transaction history
2. See transaction status (pending/confirmed/failed)
3. View transaction on BscScan
4. Check MXI balance in vesting section

## Security Features

1. **Transaction Verification**
   - All transactions verified on-chain
   - Minimum 3 block confirmations required
   - Amount validation with 1% tolerance
   - Destination address verification

2. **Smart Contract Interaction**
   - Direct interaction with USDT BEP20 contract
   - No intermediary contracts
   - User maintains full custody until payment

3. **Backend Validation**
   - Server-side transaction verification
   - Prevents double-spending
   - Validates all transaction parameters

## Error Handling

### Common Errors

1. **MetaMask Not Installed**
   - Error: "MetaMask is not installed"
   - Solution: Install MetaMask browser extension

2. **Wrong Network**
   - Error: "Please connect to BSC network"
   - Solution: App automatically prompts to switch network

3. **Insufficient USDT**
   - Error: "Insufficient USDT balance"
   - Solution: Add USDT to wallet

4. **Insufficient BNB**
   - Error: "Insufficient BNB for gas fees"
   - Solution: Add BNB to wallet for gas

5. **Transaction Rejected**
   - Error: "Transaction was rejected by user"
   - Solution: User must approve transaction in wallet

6. **Amount Mismatch**
   - Error: "Amount mismatch"
   - Solution: Contact support (rare, indicates blockchain issue)

## Testing

### Test on BSC Testnet

To test on BSC Testnet:

1. Update configuration:
   ```typescript
   export const BSC_CHAIN_ID = 97; // Testnet
   export const BSC_CHAIN_ID_HEX = '0x61';
   export const BSC_RPC_URL = 'https://data-seed-prebsc-1-s1.binance.org:8545/';
   ```

2. Get testnet BNB from faucet
3. Deploy test USDT contract or use existing testnet USDT
4. Update contract addresses

### Manual Testing Checklist

- [ ] Connect MetaMask wallet
- [ ] Connect WalletConnect wallet
- [ ] Switch to BSC network
- [ ] View USDT balance
- [ ] Purchase MXI with USDT
- [ ] Approve transaction in wallet
- [ ] View transaction in history
- [ ] Verify transaction on BscScan
- [ ] Check MXI credited in vesting
- [ ] Disconnect wallet

## Monitoring

### Transaction Monitoring

Monitor transactions in Supabase:

```sql
-- View pending transactions
SELECT * FROM metamask_transactions 
WHERE status = 'pending' 
ORDER BY created_at DESC;

-- View confirmed transactions
SELECT * FROM metamask_transactions 
WHERE status = 'confirmed' 
ORDER BY confirmed_at DESC;

-- View failed transactions
SELECT * FROM metamask_transactions 
WHERE status = 'failed' 
ORDER BY created_at DESC;
```

### Edge Function Logs

View edge function logs in Supabase dashboard:
- Navigate to Edge Functions
- Select `verify-usdt-transaction`
- View logs for verification details

## Troubleshooting

### Transaction Stuck in Pending

1. Check transaction on BscScan
2. Verify transaction succeeded on blockchain
3. Check number of confirmations
4. Manually trigger verification edge function if needed

### MXI Not Credited

1. Verify transaction is confirmed in database
2. Check vesting table for user
3. Verify MXI amount was added to purchased_mxi
4. Check edge function logs for errors

### Wallet Connection Issues

1. Clear browser cache
2. Disconnect wallet from app
3. Reconnect wallet
4. Ensure correct network (BSC)
5. Check wallet has BNB for gas

## Future Enhancements

1. **Multi-Token Support**
   - Add support for BNB payments
   - Add support for other BEP20 tokens

2. **Automatic Verification**
   - Implement webhook for automatic verification
   - Real-time transaction monitoring

3. **Gas Estimation**
   - Show estimated gas fees before transaction
   - Optimize gas usage

4. **Transaction History**
   - Enhanced transaction history UI
   - Export transaction history
   - Email notifications

5. **Referral Integration**
   - Automatic referral commission for crypto purchases
   - Multi-level commission tracking

## Support

For issues or questions:
- Check transaction on BscScan: https://bscscan.com
- Contact support with transaction hash
- Provide wallet address and timestamp
