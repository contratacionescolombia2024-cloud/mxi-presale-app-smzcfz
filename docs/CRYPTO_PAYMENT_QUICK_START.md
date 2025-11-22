
# Crypto Payment Quick Start Guide

This guide will help you quickly set up and test the USDT BEP20 payment integration.

## Prerequisites

- WalletConnect Project ID (get from https://cloud.walletconnect.com/)
- MetaMask or another Web3 wallet
- Some USDT BEP20 tokens for testing
- Some BNB for gas fees

## Setup (5 minutes)

### 1. Configure WalletConnect

Edit `config/web3Config.ts`:

```typescript
export const WALLETCONNECT_PROJECT_ID = 'YOUR_PROJECT_ID_HERE';
```

### 2. Start the App

```bash
npm run web
```

### 3. Test Wallet Connection

1. Open http://localhost:8081 in your browser
2. Navigate to "Connect Wallet" from home screen
3. Click the Web3Modal button
4. Select MetaMask (or your preferred wallet)
5. Approve the connection
6. Verify your wallet address and USDT balance appear

### 4. Test Payment

1. Click "Purchase MXI with USDT" button
2. Enter amount (e.g., 20 USDT)
3. Review the MXI amount you'll receive
4. Click "Pay with USDT"
5. Approve transaction in MetaMask
6. Wait for confirmation (1-2 minutes)
7. Check your MXI balance updated

## User Flow Diagram

```
┌─────────────────┐
│   Home Screen   │
└────────┬────────┘
         │
         ├─────────────────┐
         │                 │
         v                 v
┌─────────────────┐  ┌──────────────────┐
│ Connect Wallet  │  │  Purchase MXI    │
│                 │  │  (Standard)      │
│ • MetaMask      │  └──────────────────┘
│ • Trust Wallet  │
│ • WalletConnect │
└────────┬────────┘
         │
         v
┌─────────────────┐
│ Wallet Connected│
│                 │
│ • Address       │
│ • USDT Balance  │
└────────┬────────┘
         │
         v
┌─────────────────┐
│ Purchase Crypto │
│                 │
│ • Enter Amount  │
│ • See MXI calc  │
│ • Pay USDT      │
└────────┬────────┘
         │
         v
┌─────────────────┐
│ Confirm in      │
│ Wallet          │
└────────┬────────┘
         │
         v
┌─────────────────┐
│ Transaction     │
│ Sent            │
└────────┬────────┘
         │
         v
┌─────────────────┐
│ Backend         │
│ Validation      │
│                 │
│ • Verify TX     │
│ • Check Amount  │
│ • Wait 3 conf   │
└────────┬────────┘
         │
         v
┌─────────────────┐
│ Confirmation    │
│ Screen          │
│                 │
│ • TX Hash       │
│ • Status        │
│ • MXI Received  │
└─────────────────┘
```

## Testing Checklist

- [ ] WalletConnect Project ID configured
- [ ] App runs on web
- [ ] Can connect MetaMask
- [ ] Wallet address displays correctly
- [ ] USDT balance shows
- [ ] Can enter purchase amount
- [ ] MXI calculation is correct
- [ ] Transaction sends successfully
- [ ] Can view transaction on BscScan
- [ ] Transaction confirms after 3 blocks
- [ ] MXI balance updates
- [ ] Vesting balance increases

## Common Issues

### Issue: "Project ID is required"
**Solution:** Set `WALLETCONNECT_PROJECT_ID` in `config/web3Config.ts`

### Issue: "Wallet not connected"
**Solution:** Click "Connect Wallet" first before purchasing

### Issue: "Insufficient USDT balance"
**Solution:** Make sure you have enough USDT BEP20 tokens

### Issue: "Insufficient BNB for gas fees"
**Solution:** Add some BNB to your wallet for transaction fees

### Issue: "Please switch to BSC network"
**Solution:** Change network in MetaMask to Binance Smart Chain

### Issue: "Transaction not confirming"
**Solution:** 
1. Check transaction on BscScan
2. Wait for 3 confirmations (1-2 minutes)
3. Check Edge Function logs in Supabase

## Next Steps

After successful testing:

1. **Production Setup**
   - Use environment variables for Project ID
   - Set up monitoring for failed transactions
   - Configure email notifications

2. **User Documentation**
   - Create user guide for crypto payments
   - Add FAQ section
   - Provide support contact

3. **Monitoring**
   - Set up alerts for failed transactions
   - Monitor gas prices
   - Track conversion rates

## Support

For help:
- Check Edge Function logs in Supabase Dashboard
- View transaction on BscScan: https://bscscan.com/tx/[TX_HASH]
- Review documentation in `docs/USDT_BEP20_PAYMENT_INTEGRATION.md`
