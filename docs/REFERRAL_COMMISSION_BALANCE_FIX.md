
# Referral Commission Balance Fix

## Problem Identified

The user reported that referral commissions (5000 MXI for `inversionesingo@gmail.com`) were not appearing as available for challenges, even though they were displayed in the balance.

### Root Cause

The referral commissions were stored in the `referrals` table (`commission_mxi` field) but were NOT being synced to the `vesting.commission_balance` field. This caused a disconnect where:

- **Display**: Showed referral commissions from the `referrals` table
- **Availability**: Only checked `vesting.commission_balance` (which was 0)

## Solution Implemented

### 1. Removed Redundant Display Line

**File**: `app/(tabs)/(home)/index.tsx`

**Change**: Removed the "Referral Commissions (Available)" line from the balance card, as it was redundant and confusing. The balance breakdown now shows:

- 💎 MXI Purchased
- 🎁 Referral Commissions (total earned from referrals table)
- 🏆 Tournament Winnings (Available) - from `vesting.tournaments_balance`
- 💼 Commissions (Available for Challenges) - from `vesting.commission_balance`

### 2. Database Synchronization

**Migration**: `sync_referral_commissions_to_balance`

Created a migration that:

1. **One-time sync**: Updated all users' `commission_balance` to match their total referral commissions from the `referrals` table
2. **Automatic sync**: Created a trigger function that automatically updates `commission_balance` whenever referrals are inserted or updated

```sql
-- Sync function
CREATE OR REPLACE FUNCTION sync_commission_balance()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE vesting
  SET commission_balance = COALESCE(
    (SELECT SUM(commission_mxi) 
     FROM referrals 
     WHERE referrer_id = NEW.referrer_id),
    0
  )
  WHERE user_id = NEW.referrer_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger
CREATE TRIGGER sync_commission_balance_trigger
AFTER INSERT OR UPDATE ON referrals
FOR EACH ROW
EXECUTE FUNCTION sync_commission_balance();
```

### 3. Consistent Labeling

Updated all balance displays across the app to use consistent terminology:

- **Home Page** (`app/(tabs)/(home)/index.tsx`):
  - "Tournament Winnings (Available)"
  - "Commissions (Available for Challenges)"

- **Tournaments Page** (`app/(tabs)/tournaments.tsx`):
  - "Tournament Winnings"
  - "Commissions"

- **Games Page** (`app/games/[gameType].tsx`):
  - "Tournament Winnings"
  - "Commissions"

## Verification

After the migration, the balances were verified:

### Before Fix
```
inversionesingo@gmail.com:
- total_mxi: 55458.50
- purchased_mxi: 42875.00
- tournaments_balance: 0
- commission_balance: 0 ❌
- total_referral_commissions: 4962.50
```

### After Fix
```
inversionesingo@gmail.com:
- total_mxi: 55458.50
- purchased_mxi: 42875.00
- tournaments_balance: 0
- commission_balance: 4962.50 ✅
- total_referral_commissions: 4962.50
```

## Impact

1. **Referral commissions are now available for challenges**: Users can now use their referral commissions to pay for tournament entry fees and mini-battles
2. **Automatic synchronization**: Future referral earnings will automatically be reflected in the `commission_balance` field
3. **Clearer UI**: Removed redundant display line and clarified which balances are available for challenges
4. **Consistent terminology**: All pages now use the same labels for balances

## Testing Recommendations

1. Verify that referral commissions appear in the commission balance on the home page
2. Test creating a mini-battle using commission balance
3. Test joining a tournament using commission balance
4. Verify that new referral earnings automatically update the commission balance
5. Check that the balance displays are consistent across all pages (home, tournaments, games)

## Related Files

- `app/(tabs)/(home)/index.tsx` - Home page balance display
- `app/(tabs)/tournaments.tsx` - Tournaments page with balance selection
- `app/games/[gameType].tsx` - Individual game page with balance selection
- Migration: `sync_referral_commissions_to_balance` - Database sync logic
