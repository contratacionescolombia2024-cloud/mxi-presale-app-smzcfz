
# Crypto Payment Deployment Checklist

Use this checklist to ensure everything is properly configured before deploying the crypto payment feature.

## Pre-Deployment

### 1. WalletConnect Configuration
- [ ] Created WalletConnect account at https://cloud.walletconnect.com/
- [ ] Created new project in WalletConnect dashboard
- [ ] Copied Project ID
- [ ] Updated `config/web3Config.ts` with Project ID
- [ ] Verified Project ID is not committed to public repository

### 2. Contract Addresses
- [ ] Verified USDT BEP20 contract address: `0x55d398326f99059fF775485246999027B3197955`
- [ ] Verified project wallet address: `0x68F0d7c607617DA0b1a0dC7b72885E11ddFec623`
- [ ] Confirmed project wallet has access to private keys
- [ ] Tested receiving USDT to project wallet

### 3. Database Setup
- [ ] Verified `metamask_transactions` table exists
- [ ] Checked RLS policies are enabled
- [ ] Tested `increment_sold_mxi` function
- [ ] Verified vesting table structure

### 4. Edge Function
- [ ] Deployed `validate-usdt-payment` Edge Function
- [ ] Tested Edge Function with sample data
- [ ] Verified Edge Function has access to Supabase
- [ ] Checked Edge Function logs for errors

### 5. Frontend Testing
- [ ] Tested on Chrome
- [ ] Tested on Firefox
- [ ] Tested on Safari
- [ ] Tested on mobile browsers
- [ ] Verified Web3Modal button appears
- [ ] Tested wallet connection flow
- [ ] Verified USDT balance displays correctly

### 6. Payment Flow Testing
- [ ] Connected MetaMask successfully
- [ ] Connected Trust Wallet successfully
- [ ] Connected via WalletConnect successfully
- [ ] Tested payment with minimum amount (20 USDT)
- [ ] Tested payment with maximum amount (50,000 USDT)
- [ ] Verified amount validation works
- [ ] Tested insufficient balance error
- [ ] Tested insufficient gas error
- [ ] Verified transaction sends successfully
- [ ] Confirmed transaction on BscScan
- [ ] Waited for 3 confirmations
- [ ] Verified MXI balance updated
- [ ] Checked vesting balance increased

### 7. Error Handling
- [ ] Tested wallet not connected error
- [ ] Tested wrong network error
- [ ] Tested transaction rejection
- [ ] Tested insufficient USDT error
- [ ] Tested insufficient BNB error
- [ ] Verified error messages are clear
- [ ] Tested duplicate transaction prevention

### 8. Security
- [ ] Verified all transactions are validated on blockchain
- [ ] Confirmed 3 confirmation requirement
- [ ] Tested amount verification
- [ ] Verified sender/recipient validation
- [ ] Checked duplicate transaction prevention
- [ ] Reviewed RLS policies
- [ ] Tested unauthorized access prevention

### 9. Monitoring
- [ ] Set up transaction monitoring query
- [ ] Created alert for failed transactions
- [ ] Set up daily transaction report
- [ ] Configured Edge Function logging
- [ ] Set up error notifications

### 10. Documentation
- [ ] Reviewed all documentation files
- [ ] Created user guide for crypto payments
- [ ] Prepared FAQ section
- [ ] Set up support contact
- [ ] Created troubleshooting guide

## Deployment Steps

### 1. Environment Variables
```bash
# Set in production environment
WALLETCONNECT_PROJECT_ID=your_project_id_here
```

### 2. Deploy Edge Function
```bash
# Deploy to Supabase
supabase functions deploy validate-usdt-payment
```

### 3. Deploy Frontend
```bash
# Build for production
npm run build:web

# Deploy to hosting service
# (Vercel, Netlify, etc.)
```

### 4. Verify Deployment
- [ ] Visited production URL
- [ ] Connected wallet on production
- [ ] Made test payment on production
- [ ] Verified transaction confirmed
- [ ] Checked MXI balance updated

## Post-Deployment

### 1. Monitoring (First 24 Hours)
- [ ] Monitor transaction success rate
- [ ] Check for failed transactions
- [ ] Review Edge Function logs
- [ ] Monitor gas prices
- [ ] Track user feedback

### 2. User Communication
- [ ] Announced crypto payment feature
- [ ] Shared user guide
- [ ] Provided support contact
- [ ] Set up FAQ page

### 3. Performance Tracking
- [ ] Track number of crypto payments
- [ ] Monitor average transaction time
- [ ] Track confirmation times
- [ ] Measure user satisfaction

## Rollback Plan

If issues occur:

1. **Disable Feature**
   - Remove "Crypto Payment" button from home screen
   - Display maintenance message on connect-wallet screen

2. **Investigate Issues**
   - Check Edge Function logs
   - Review failed transactions
   - Analyze error patterns

3. **Fix and Redeploy**
   - Fix identified issues
   - Test thoroughly
   - Redeploy with fixes

## Support Contacts

- **Technical Issues:** [Your support email]
- **WalletConnect Support:** https://walletconnect.com/support
- **Supabase Support:** https://supabase.com/support
- **BSC Support:** https://www.bnbchain.org/en/support

## Success Metrics

Track these metrics after deployment:

- [ ] Number of wallet connections
- [ ] Number of successful payments
- [ ] Average transaction value
- [ ] Transaction success rate
- [ ] Average confirmation time
- [ ] User satisfaction score

## Notes

Add any deployment-specific notes here:

---

**Deployment Date:** _________________

**Deployed By:** _________________

**Version:** _________________

**Status:** ☐ Success ☐ Issues ☐ Rolled Back

**Notes:**
_________________________________________________________________
_________________________________________________________________
_________________________________________________________________
