
# USDT BEP20 Payment Integration with Web3Modal v3

This document describes the complete integration of Web3Modal v3 for crypto wallet connections and USDT BEP20 payments in the MXI Presale app.

## Overview

The integration allows users to:
- Connect their crypto wallets (MetaMask, Trust Wallet, WalletConnect v2)
- Pay with USDT BEP20 on Binance Smart Chain (BSC)
- Have transactions automatically validated and credited

## Architecture

### Frontend (React Native + Expo)

1. **Web3Modal v3 Integration**
   - Uses `@web3modal/wagmi` for wallet connection UI
   - Supports MetaMask, Trust Wallet, and WalletConnect v2
   - Only available on web platform (not native mobile)

2. **Wallet Context** (`contexts/WalletContext.tsx`)
   - Manages wallet connection state
   - Handles USDT balance queries
   - Sends USDT payments using ethers.js

3. **Screens**
   - `/connect-wallet` - Connect wallet screen with Web3Modal button
   - `/purchase-crypto` - USDT payment screen
   - `/purchase-confirmation` - Transaction confirmation and status

### Backend (Supabase Edge Function)

**Function:** `validate-usdt-payment`

Validates USDT BEP20 transactions by:
1. Fetching transaction receipt from BSC blockchain
2. Verifying transaction status (success/failed)
3. Confirming contract address is USDT BEP20
4. Verifying sender wallet address
5. Checking recipient is project wallet
6. Validating transfer amount
7. Requiring 3 blockchain confirmations
8. Updating user's MXI balance after confirmation

## Configuration

### 1. WalletConnect Project ID

You need to get a WalletConnect Project ID from https://cloud.walletconnect.com/

Update in `config/web3Config.ts`:
```typescript
export const WALLETCONNECT_PROJECT_ID = 'YOUR_PROJECT_ID_HERE';
```

### 2. Contract Addresses

**USDT BEP20 Contract:**
```
0x55d398326f99059fF775485246999027B3197955
```

**Project Wallet (Recipient):**
```
0x68F0d7c607617DA0b1a0dC7b72885E11ddFec623
```

### 3. BSC Network

- Chain ID: 56
- RPC URL: https://bsc-dataseed.binance.org/
- Block Explorer: https://bscscan.com

## User Flow

### 1. Connect Wallet

1. User navigates to "Connect Wallet" screen
2. Clicks Web3Modal button
3. Selects wallet (MetaMask, Trust Wallet, or WalletConnect)
4. Approves connection in wallet
5. App displays wallet address and USDT balance

### 2. Purchase MXI with USDT

1. User navigates to "Purchase with Crypto"
2. Enters USDT amount (min: 20, max: 50,000)
3. App calculates MXI amount based on current stage price
4. User clicks "Pay with USDT"
5. Wallet prompts for transaction approval
6. User confirms transaction
7. Transaction is sent to blockchain

### 3. Transaction Validation

1. Frontend submits transaction hash to backend
2. Backend validates transaction on BSC blockchain:
   - Checks transaction exists and succeeded
   - Verifies USDT contract address
   - Confirms sender and recipient addresses
   - Validates transfer amount
   - Waits for 3 confirmations
3. Backend saves transaction to `metamask_transactions` table
4. After 3 confirmations, backend updates user's vesting balance
5. User sees confirmation screen with transaction details

## Database Schema

### `metamask_transactions` Table

```sql
CREATE TABLE metamask_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  wallet_address TEXT NOT NULL,
  transaction_hash TEXT UNIQUE NOT NULL,
  amount_usd NUMERIC NOT NULL,
  mxi_amount NUMERIC NOT NULL,
  payment_currency TEXT CHECK (payment_currency IN ('USDT', 'BNB')),
  stage INTEGER REFERENCES presale_stages(stage),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'failed')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  confirmed_at TIMESTAMPTZ
);
```

## Security Features

1. **Transaction Validation**
   - All transactions are verified on the blockchain
   - Cannot fake or manipulate transaction data
   - Requires 3 confirmations before crediting

2. **Amount Verification**
   - Backend verifies exact USDT amount transferred
   - Checks recipient is project wallet
   - Validates sender matches connected wallet

3. **Duplicate Prevention**
   - Transaction hashes are unique
   - Cannot reuse the same transaction

4. **RLS Policies**
   - Users can only view their own transactions
   - Admin can view all transactions

## Error Handling

### Common Errors

1. **"Wallet not connected"**
   - User needs to connect wallet first

2. **"Insufficient USDT balance"**
   - User doesn't have enough USDT

3. **"Insufficient BNB for gas fees"**
   - User needs BNB to pay transaction fees

4. **"Transaction rejected by user"**
   - User cancelled transaction in wallet

5. **"Please switch to BSC network"**
   - Wallet is on wrong network

6. **"Transaction not found"**
   - Transaction hash doesn't exist on blockchain

7. **"Amount mismatch"**
   - Transferred amount doesn't match expected amount

## Testing

### Test on BSC Testnet

For testing, you can use BSC Testnet:
- Chain ID: 97
- RPC URL: https://data-seed-prebsc-1-s1.binance.org:8545/
- Faucet: https://testnet.binance.org/faucet-smart

Update contract addresses for testnet USDT.

### Manual Testing Steps

1. Connect MetaMask to BSC Mainnet
2. Get some USDT BEP20 tokens
3. Connect wallet in app
4. Try purchasing MXI with different amounts
5. Verify transaction on BscScan
6. Check balance updates after 3 confirmations

## Monitoring

### Transaction Status

Monitor transactions in Supabase:
```sql
SELECT 
  user_id,
  wallet_address,
  transaction_hash,
  amount_usd,
  mxi_amount,
  status,
  created_at,
  confirmed_at
FROM metamask_transactions
ORDER BY created_at DESC;
```

### Failed Transactions

Check for failed transactions:
```sql
SELECT * FROM metamask_transactions
WHERE status = 'failed'
ORDER BY created_at DESC;
```

## Troubleshooting

### Web3Modal not showing

- Make sure you're on web platform (not native)
- Check WalletConnect Project ID is set
- Verify Web3Provider is wrapping the app

### Transaction not confirming

- Check transaction on BscScan
- Verify transaction succeeded on blockchain
- Check Edge Function logs in Supabase
- Ensure 3 confirmations have passed

### Balance not updating

- Check `metamask_transactions` table for transaction status
- Verify Edge Function successfully updated vesting table
- Check for errors in Edge Function logs

## Future Enhancements

1. **Support for other tokens**
   - Add BNB payment option
   - Support other stablecoins (BUSD, USDC)

2. **Gas estimation**
   - Show estimated gas fees before transaction
   - Warn if insufficient BNB for gas

3. **Transaction history**
   - Show all user's crypto transactions
   - Export transaction history

4. **Automatic retries**
   - Retry failed validations
   - Handle network issues gracefully

5. **Email notifications**
   - Send email when transaction confirmed
   - Alert on failed transactions

## Support

For issues or questions:
- Check Edge Function logs in Supabase Dashboard
- Verify transaction on BscScan
- Contact support with transaction hash
