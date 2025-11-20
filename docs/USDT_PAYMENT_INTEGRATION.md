
# USDT BEP-20 Payment Integration Guide

## Overview

This document describes the complete USDT BEP-20 payment integration for the MXI presale app. Users can pay with MetaMask, Trust Wallet, or any WalletConnect-compatible wallet on the Binance Smart Chain (BSC).

## Architecture

### Frontend (React Native + Expo)

**Components:**
- `WalletConnector.tsx` - Universal wallet connection component
- `purchase.tsx` - Purchase screen with USDT payment flow

**Utilities:**
- `utils/walletConnect.ts` - WalletConnect integration
- `utils/metamask.ts` - MetaMask-specific utilities

### Backend (Supabase Edge Functions)

**Edge Function:**
- `verify-usdt-purchase` - Verifies blockchain transactions and processes purchases

### Database Tables

**metamask_transactions:**
- Stores all USDT payment transactions
- Tracks status: pending → confirmed
- Links to users and presale stages

**vesting:**
- Updated with purchased MXI
- Triggers referral commission calculations

**referrals:**
- Automatically updated with commission_mxi when purchases are verified

## Payment Flow

### 1. User Connects Wallet

```typescript
// User clicks "Connect Wallet"
// Modal shows options: MetaMask or WalletConnect

// MetaMask Flow:
- Detects window.ethereum
- Requests accounts: ethereum.request({ method: 'eth_requestAccounts' })
- Validates BSC network (chainId 56)
- If wrong network, prompts switch to BSC

// WalletConnect Flow:
- Creates WalletConnectProvider with BSC RPC
- Shows QR code modal
- User scans with Trust Wallet or other mobile wallet
- Establishes connection
```

### 2. User Enters Purchase Amount

```typescript
// User inputs USDT amount (20 - 50,000)
// App calculates MXI tokens based on current stage price
// Example: 100 USDT at stage 1 (0.40 USDT/MXI) = 250 MXI
```

### 3. USDT Transfer Transaction

```typescript
// Contract: 0x55d398326f99059fF775485246999027B3197955 (USDT BEP-20)
// Recipient: 0x68F0d7c607617DA0b1a0dC7b72885E11ddFec623 (Project Wallet)

const usdtContract = new ethers.Contract(USDT_CONTRACT_ADDRESS, USDT_ABI, signer);
const amountInWei = ethers.parseUnits(amountInUSDT.toString(), 18);
const tx = await usdtContract.transfer(PROJECT_WALLET_ADDRESS, amountInWei);
await tx.wait(); // Wait for confirmation
```

### 4. Transaction Saved to Database

```typescript
// Save as 'pending' immediately after transaction submission
await supabase.from('metamask_transactions').insert({
  user_id: userId,
  wallet_address: walletAddress,
  transaction_hash: txHash,
  amount_usd: usdtAmount,
  mxi_amount: mxiAmount,
  payment_currency: 'USDT',
  stage: currentStage,
  status: 'pending',
});
```

### 5. Backend Verification

```typescript
// Edge Function: verify-usdt-purchase
// Called by frontend after transaction submission

// Verification Steps:
1. Fetch transaction receipt from BSC blockchain
2. Check minimum confirmations (3 blocks)
3. Verify transaction status (success)
4. Verify recipient is project wallet
5. Verify USDT contract address
6. Verify transfer amount matches
7. Update transaction status to 'confirmed'
8. Update user's vesting balance
9. Process referral commissions
10. Update presale stage sold_mxi
```

### 6. Referral Commission Distribution

```typescript
// Automatically triggered by verify-usdt-purchase
await supabase.rpc('process_referral_commissions', {
  p_user_id: userId,
  p_purchase_amount: mxiComprados,
});

// Commission Rates:
// Level 1 (Direct referral): 5%
// Level 2 (Referral's referral): 2%
// Level 3 (Third level): 1%

// Example: User buys 1000 MXI
// - Level 1 referrer gets: 50 MXI (5%)
// - Level 2 referrer gets: 20 MXI (2%)
// - Level 3 referrer gets: 10 MXI (1%)
```

## Configuration

### BSC Network Details

```typescript
Chain ID: 56 (0x38 in hex)
Network Name: Binance Smart Chain
RPC URL: https://bsc-dataseed.binance.org/
Block Explorer: https://bscscan.com
Native Currency: BNB
```

### Smart Contract Addresses

```typescript
// USDT Contract (BEP-20)
USDT_CONTRACT_ADDRESS = '0x55d398326f99059fF775485246999027B3197955'

// Project Wallet (REPLACE WITH YOUR ACTUAL WALLET)
PROJECT_WALLET_ADDRESS = '0x68F0d7c607617DA0b1a0dC7b72885E11ddFec623'
```

### Minimum ABI for USDT

```typescript
const USDT_ABI = [
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
    inputs: [{ name: 'owner', type: 'address' }],
    outputs: [{ type: 'uint256' }],
  },
];
```

## Security Features

### Frontend Security

1. **No Private Keys Stored**
   - All transactions signed in user's wallet
   - Private keys never leave MetaMask/Trust Wallet

2. **Network Validation**
   - Enforces BSC network before transactions
   - Prompts user to switch if on wrong network

3. **Amount Validation**
   - Min: 20 USDT
   - Max: 50,000 USDT
   - Prevents invalid inputs

### Backend Security

1. **Transaction Verification**
   - Verifies on-chain transaction receipt
   - Checks minimum confirmations (3 blocks)
   - Validates recipient address
   - Validates USDT contract
   - Validates transfer amount

2. **Duplicate Prevention**
   - Checks if transaction hash already processed
   - Prevents double-spending

3. **Service Role Key**
   - Edge function uses service role for database access
   - Bypasses RLS for administrative operations

## User Experience

### Wallet Connection Modal

```
┌─────────────────────────────────────┐
│  Connect Wallet                  ✕  │
├─────────────────────────────────────┤
│  Choose your preferred wallet       │
│                                     │
│  ┌───────────────────────────────┐ │
│  │  🦊  MetaMask              →  │ │
│  │      Browser extension wallet │ │
│  └───────────────────────────────┘ │
│                                     │
│  ┌───────────────────────────────┐ │
│  │  📱  WalletConnect         →  │ │
│  │      Trust Wallet, Rainbow    │ │
│  └───────────────────────────────┘ │
│                                     │
│  ℹ️ Make sure you're on BSC network│
└─────────────────────────────────────┘
```

### Purchase Flow

```
1. Connect Wallet
   ↓
2. Enter USDT Amount
   ↓
3. Review MXI Calculation
   ↓
4. Click "Pay X USDT"
   ↓
5. Approve in Wallet
   ↓
6. Transaction Submitted
   ↓
7. Verify Transaction (3 confirmations)
   ↓
8. MXI Credited + Commissions Distributed
```

## Testing

### Test on BSC Testnet

1. Switch to BSC Testnet (Chain ID: 97)
2. Get test BNB from faucet
3. Deploy test USDT contract or use existing testnet USDT
4. Update contract addresses in code
5. Test full payment flow

### Manual Verification

```bash
# Check transaction on BSCScan
https://bscscan.com/tx/[TRANSACTION_HASH]

# Verify USDT transfer
- From: User's wallet
- To: Project wallet
- Token: USDT (BEP-20)
- Amount: Correct USDT amount
```

## Troubleshooting

### Common Issues

**1. "MetaMask is not installed"**
- Solution: Install MetaMask browser extension
- Link: https://metamask.io/download/

**2. "Wrong Network"**
- Solution: Switch to BSC Mainnet in wallet
- Chain ID: 56

**3. "Insufficient USDT balance"**
- Solution: Ensure wallet has enough USDT tokens
- Check balance on BSCScan

**4. "Transaction needs more confirmations"**
- Solution: Wait for 3 block confirmations (~9 seconds on BSC)
- Click "Verify Transaction" button after waiting

**5. "User rejected the transaction"**
- Solution: User cancelled in wallet - try again

### Error Codes

```typescript
// Frontend Errors
- 4001: User rejected request
- 4902: Chain not added to wallet

// Backend Errors
- 400: Invalid transaction data
- 404: Transaction not found
- 202: Needs more confirmations
- 500: Server error
```

## Monitoring

### Database Queries

```sql
-- Check pending transactions
SELECT * FROM metamask_transactions 
WHERE status = 'pending' 
ORDER BY created_at DESC;

-- Check confirmed transactions
SELECT * FROM metamask_transactions 
WHERE status = 'confirmed' 
ORDER BY confirmed_at DESC;

-- Check user's total purchases
SELECT 
  user_id,
  SUM(mxi_amount) as total_mxi,
  SUM(amount_usd) as total_usd,
  COUNT(*) as purchase_count
FROM metamask_transactions
WHERE status = 'confirmed'
GROUP BY user_id;
```

### Edge Function Logs

```bash
# View Edge Function logs in Supabase Dashboard
# Navigate to: Edge Functions → verify-usdt-purchase → Logs

# Look for:
- ✅ Transaction verified successfully
- ❌ Error messages
- 🔍 Verification attempts
```

## Future Enhancements

1. **Multi-Currency Support**
   - Add BNB payment option
   - Add other BEP-20 tokens

2. **Automatic Verification**
   - Background job to auto-verify pending transactions
   - Webhook from blockchain indexer

3. **Transaction History**
   - User dashboard showing all transactions
   - Export to CSV

4. **Price Oracle**
   - Real-time BNB/USD price from Chainlink
   - Dynamic conversion rates

5. **Gas Estimation**
   - Show estimated gas fees before transaction
   - Warn if gas price is high

## Support

For issues or questions:
1. Check transaction on BSCScan
2. Verify wallet has sufficient USDT and BNB (for gas)
3. Ensure BSC network is selected
4. Contact support with transaction hash

## License

This integration is part of the MXI presale application.
