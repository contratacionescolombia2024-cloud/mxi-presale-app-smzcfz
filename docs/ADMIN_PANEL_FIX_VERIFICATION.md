
# Admin Panel Referral and Balance Management Fix

## Overview

This document describes the fixes implemented to resolve issues with referral linking and balance management in the admin panel.

## Issues Identified

### 1. Referral Linking Issue
**Problem**: When setting `referred_by` to `REFAFE832B5` for `contratacionescolombia2024@gmail.com`, the system was not properly establishing the multi-level referral relationships.

**Root Cause**: The database function `admin_link_referral` had insufficient error handling and logging, making it difficult to diagnose issues.

### 2. Balance Management Issue
**Problem**: Adding MXI to a user's account via the "Add Balance" button in the admin panel was not working properly.

**Root Cause**: Similar to the referral linking issue, the `admin_add_balance_without_commissions` and `admin_add_balance_with_commissions` functions lacked comprehensive error handling and logging.

## Solutions Implemented

### 1. Enhanced Database Functions

All three critical database functions have been completely rewritten with:

- **Comprehensive Logging**: Every step of the process is now logged using `RAISE NOTICE` statements
- **Better Error Handling**: All functions now have `EXCEPTION` blocks that catch and log errors
- **Case-Insensitive Matching**: Email and referral code matching now uses `UPPER(TRIM())` to handle case variations
- **Detailed Response Objects**: Functions now return detailed JSON responses including success status, error messages, and operation details
- **Override Capability**: The `admin_link_referral` function now allows overriding existing referral relationships (admin-only feature)

### 2. Updated Functions

#### `admin_link_referral(p_referred_email text, p_referrer_code text)`
- Links a user to a referral code
- Automatically establishes multi-level relationships (up to 3 levels)
- Processes all existing purchases retroactively
- Distributes commissions to all referrers in the chain
- **New**: Allows overriding existing referral relationships
- **New**: Deletes old referral relationships before creating new ones

#### `admin_add_balance_without_commissions(p_user_id uuid, p_mxi_amount numeric)`
- Adds MXI balance to a user's account
- Does NOT trigger referral commissions
- Tracks the added amount as `purchased_mxi` for vesting calculations
- Returns detailed information about the operation

#### `admin_add_balance_with_commissions(p_user_id uuid, p_mxi_amount numeric)`
- Adds MXI balance to a user's account
- DOES trigger referral commissions (5%, 2%, 1% for levels 1, 2, 3)
- Tracks the added amount as `purchased_mxi` for vesting calculations
- Distributes commissions to all referrers in the chain
- Returns detailed information about commissions distributed

## Testing Instructions

### Test Case 1: Link Referral

**Objective**: Link `contratacionescolombia2024@gmail.com` to `REFAFE832B5` (idmac1991@gmail.com)

**Steps**:
1. Log in as admin
2. Navigate to Admin Panel → Link Referral tab
3. Enter:
   - User Email: `contratacionescolombia2024@gmail.com`
   - Referral Code: `REFAFE832B5`
4. Click "Link Referral"

**Expected Result**:
- Success message appears
- `contratacionescolombia2024@gmail.com` now has `referred_by = REFAFE832B5`
- Level 1 referrer: `idmac1991@gmail.com` (REFAFE832B5)
- Level 2 referrer: `inversionesingo@gmail.com` (ADMINMXI)
- If the user has any completed purchases, commissions are calculated and distributed retroactively

**Verification SQL**:
```sql
-- Check the referral relationship
SELECT 
  email,
  name,
  referral_code,
  referred_by
FROM users_profiles
WHERE email = 'contratacionescolombia2024@gmail.com';

-- Check referral records
SELECT 
  r.id,
  up_referrer.email as referrer_email,
  up_referred.email as referred_email,
  r.level,
  r.commission_mxi,
  r.mxi_earned
FROM referrals r
LEFT JOIN users_profiles up_referrer ON r.referrer_id = up_referrer.id
LEFT JOIN users_profiles up_referred ON r.referred_id = up_referred.id
WHERE up_referred.email = 'contratacionescolombia2024@gmail.com'
ORDER BY r.level;
```

### Test Case 2: Add Balance Without Commissions

**Objective**: Add 100 MXI to `contratacionescolombia2024@gmail.com` without triggering commissions

**Steps**:
1. Log in as admin
2. Navigate to Admin Panel → Users tab
3. Click on `contratacionescolombia2024@gmail.com`
4. In the Balance Management section:
   - Select "Add Balance" (without commissions)
   - Enter Amount: `100`
   - Click "Add"

**Expected Result**:
- Success message appears
- User's `total_mxi` increases by 100
- User's `purchased_mxi` increases by 100
- NO commissions are distributed to referrers

**Verification SQL**:
```sql
-- Check vesting balance
SELECT 
  up.email,
  v.total_mxi,
  v.purchased_mxi
FROM vesting v
LEFT JOIN users_profiles up ON v.user_id = up.id
WHERE up.email = 'contratacionescolombia2024@gmail.com';
```

### Test Case 3: Add Balance With Commissions

**Objective**: Add 100 MXI to `contratacionescolombia2024@gmail.com` and trigger commissions

**Steps**:
1. Log in as admin
2. Navigate to Admin Panel → Users tab
3. Click on `contratacionescolombia2024@gmail.com`
4. In the Balance Management section:
   - Select "Simulate Sale" (with commissions)
   - Enter Amount: `100`
   - Click "Add"

**Expected Result**:
- Success message appears with commission details
- User's `total_mxi` increases by 100
- User's `purchased_mxi` increases by 100
- Level 1 referrer (`idmac1991@gmail.com`) receives 5 MXI commission
- Level 2 referrer (`inversionesingo@gmail.com`) receives 2 MXI commission
- Total commissions distributed: 7 MXI

**Verification SQL**:
```sql
-- Check all vesting balances
SELECT 
  up.email,
  v.total_mxi,
  v.purchased_mxi,
  (v.total_mxi - v.purchased_mxi) as commission_mxi
FROM vesting v
LEFT JOIN users_profiles up ON v.user_id = up.id
WHERE up.email IN (
  'contratacionescolombia2024@gmail.com',
  'idmac1991@gmail.com',
  'inversionesingo@gmail.com'
)
ORDER BY up.email;

-- Check referral commissions
SELECT 
  up_referrer.email as referrer_email,
  up_referred.email as referred_email,
  r.level,
  r.commission_mxi,
  r.mxi_earned
FROM referrals r
LEFT JOIN users_profiles up_referrer ON r.referrer_id = up_referrer.id
LEFT JOIN users_profiles up_referred ON r.referred_id = up_referred.id
WHERE up_referred.email = 'contratacionescolombia2024@gmail.com'
ORDER BY r.level;
```

## Debugging

### Viewing Database Logs

To view detailed logs from the database functions, check the Postgres logs in the Supabase dashboard:

1. Go to Supabase Dashboard
2. Navigate to Logs → Postgres
3. Look for `NOTICE` level logs

The logs will show:
- Function entry with parameters
- User lookup results
- Referrer lookup results
- Commission calculations
- Database updates
- Success/error messages

### Common Issues and Solutions

#### Issue: "User not found"
**Solution**: Verify the email address is correct and the user exists in the `users_profiles` table.

#### Issue: "Referrer not found"
**Solution**: Verify the referral code is correct and exists in the `users_profiles` table.

#### Issue: "Users cannot refer themselves"
**Solution**: Ensure the referral code doesn't belong to the same user being linked.

#### Issue: Balance not updating
**Solution**: 
1. Check the Postgres logs for error messages
2. Verify the user has a record in the `vesting` table
3. Ensure the amount is a positive number

## Real-Time Updates

The system now includes real-time subscriptions that automatically update the UI when:
- Referral relationships are created or modified
- Vesting balances change
- Referral commissions are distributed

Users should see updates in real-time without needing to manually refresh the page.

## Database Schema

### Key Tables

#### `users_profiles`
- `id`: User UUID
- `email`: User email
- `referral_code`: User's unique referral code
- `referred_by`: Referral code of the user who referred them

#### `referrals`
- `referrer_id`: UUID of the referrer
- `referred_id`: UUID of the referred user
- `level`: Referral level (1, 2, or 3)
- `commission_mxi`: Total commission earned
- `mxi_earned`: Total MXI earned (same as commission_mxi)

#### `vesting`
- `user_id`: User UUID
- `total_mxi`: Total MXI balance (purchased + commissions)
- `purchased_mxi`: MXI from purchases only (used for vesting calculations)
- `current_rewards`: Current vesting rewards

## Commission Structure

- **Level 1**: 5% of purchase amount
- **Level 2**: 2% of purchase amount
- **Level 3**: 1% of purchase amount

**Example**: If a user purchases 1000 MXI:
- Level 1 referrer receives: 50 MXI
- Level 2 referrer receives: 20 MXI
- Level 3 referrer receives: 10 MXI
- Total commissions: 80 MXI

## Notes

- Vesting rewards are calculated ONLY on `purchased_mxi`, not on commission earnings
- The admin panel allows overriding existing referral relationships
- All database operations are logged for debugging purposes
- Real-time subscriptions ensure the UI stays in sync with the database
