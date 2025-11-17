
# Referral Transfer to Balance - Fix & History Implementation

## Issue Summary
The "Transfer to Balance" button in the referrals screen was not properly debiting referral earnings when transferring funds to the main balance. Additionally, there was no transfer history tracking similar to the admin balance management feature.

## Changes Implemented

### 1. Database Migration - Transfer History Table
**File:** Migration `create_referral_transfer_history`

Created a new table `referral_transfer_history` to track all referral-to-balance transfers:

**Table Structure:**
- `id` - UUID primary key
- `user_id` - Reference to the user making the transfer
- `amount_transferred` - Amount of MXI transferred
- `old_referral_balance` - Referral balance before transfer
- `new_referral_balance` - Referral balance after transfer
- `old_total_mxi` - Total MXI before transfer
- `new_total_mxi` - Total MXI after transfer
- `old_purchased_mxi` - Purchased MXI before transfer
- `new_purchased_mxi` - Purchased MXI after transfer
- `status` - 'success' or 'error'
- `error_message` - Error details if status is 'error'
- `created_at` - Timestamp of the transfer

**RLS Policies:**
- Users can view their own transfer history
- Admins can view all transfer history

**Indexes:**
- `idx_referral_transfer_history_user_id` - For fast user-specific queries
- `idx_referral_transfer_history_created_at` - For chronological ordering

### 2. Fixed RPC Function - user_transfer_referral_to_balance
**File:** Migration `fix_user_transfer_referral_to_balance`

**Key Changes:**
1. **Proper Referral Debit Logic:** The function now actually debits the referral earnings from the `referrals` table by reducing the `commission_mxi` field
2. **FIFO Approach:** Debits from oldest referrals first (First In, First Out)
3. **History Recording:** Automatically records each transfer in the `referral_transfer_history` table
4. **Error Handling:** Catches exceptions and records them in the history table with error details

**How It Works:**
```sql
-- For each referral record with commission_mxi > 0 (oldest first):
1. If referral has enough commission to cover remaining amount:
   - Deduct the remaining amount from that referral
   - Stop processing
2. If referral doesn't have enough:
   - Deduct all of it (set commission_mxi to 0)
   - Continue to next referral with remaining amount
```

**Example:**
User has 3 referral records:
- Referral 1: 30 MXI
- Referral 2: 40 MXI  
- Referral 3: 50 MXI
- Total: 120 MXI

User transfers 75 MXI:
- Referral 1: 30 MXI → 0 MXI (deducted 30)
- Referral 2: 40 MXI → 0 MXI (deducted 40)
- Referral 3: 50 MXI → 45 MXI (deducted 5)
- New total: 45 MXI

### 3. Updated Referrals Screen UI
**File:** `app/(tabs)/referrals.tsx`

**New Features:**

#### Transfer History Button
- Added "View Transfer History" button below the "Unify to Balance" button
- Opens a modal showing all past transfers
- Automatically loads history when modal opens

#### Transfer History Modal
Displays comprehensive transfer information:
- **Date & Time** - When the transfer occurred
- **Amount Transferred** - How much MXI was moved
- **Referral Balance Change** - Before → After
- **Total MXI Change** - Before → After
- **Status Indicator** - Success (green checkmark) or Error (red X)
- **Error Messages** - Displayed for failed transfers

**Visual Design:**
- Success transfers: Green checkmark icon, success badge
- Failed transfers: Red X icon, red border, error message box
- Empty state: Inbox icon with helpful message
- Loading state: Spinner with "Loading history..." text

#### Enhanced Transfer Flow
1. User clicks "Unify to Balance"
2. Modal opens with current referral earnings displayed
3. User enters amount (minimum 50 MXI)
4. Info box reminds user that:
   - Minimum is 50 MXI
   - No commissions will be generated
   - Referral earnings will be debited
   - Action cannot be undone
5. User clicks "Transfer to Balance"
6. Confirmation modal appears with warning
7. User confirms
8. Transfer executes
9. Success message shows:
   - Updated total MXI
   - Updated purchased MXI
   - Remaining referral earnings
10. History automatically reloads

### 4. Real-time Updates
After a successful transfer:
- Referral stats are reloaded (`forceReloadReferrals()`)
- Transfer history is reloaded
- User sees updated balances immediately

## Testing Checklist

### Before Transfer
- [ ] User has at least 50 MXI in referral earnings
- [ ] "Unify to Balance" button is enabled
- [ ] "View Transfer History" button is visible

### During Transfer
- [ ] Amount validation works (minimum 50 MXI)
- [ ] Cannot transfer more than available earnings
- [ ] Confirmation modal shows correct amount
- [ ] Warning messages are clear
- [ ] Loading state shows during processing

### After Transfer
- [ ] Referral earnings are debited correctly
- [ ] Main balance (total_mxi) increases by transfer amount
- [ ] Purchased MXI increases by transfer amount
- [ ] Transfer appears in history immediately
- [ ] History shows correct before/after values
- [ ] Success message displays all updated values

### History Modal
- [ ] Shows all past transfers in chronological order (newest first)
- [ ] Success transfers show green checkmark
- [ ] Failed transfers show red X and error message
- [ ] Empty state displays when no history exists
- [ ] Loading state shows while fetching data
- [ ] Modal can be closed with X button

### Edge Cases
- [ ] Transfer with exactly 50 MXI works
- [ ] Transfer with all available earnings works
- [ ] Multiple small transfers debit correctly
- [ ] Failed transfers are recorded in history
- [ ] Network errors are handled gracefully

## Database Verification Queries

### Check Transfer History
```sql
SELECT 
  id,
  user_id,
  amount_transferred,
  old_referral_balance,
  new_referral_balance,
  status,
  created_at
FROM referral_transfer_history
ORDER BY created_at DESC
LIMIT 10;
```

### Verify Referral Debit
```sql
-- Before transfer
SELECT SUM(commission_mxi) as total_referral_earnings
FROM referrals
WHERE referrer_id = 'USER_ID';

-- After transfer (should be reduced by transfer amount)
SELECT SUM(commission_mxi) as total_referral_earnings
FROM referrals
WHERE referrer_id = 'USER_ID';
```

### Check Vesting Balance Increase
```sql
SELECT 
  total_mxi,
  purchased_mxi,
  last_update
FROM vesting
WHERE user_id = 'USER_ID';
```

## Benefits

1. **Accurate Accounting:** Referral earnings are now properly debited when transferred
2. **Full Transparency:** Users can see complete history of all transfers
3. **Error Tracking:** Failed transfers are recorded with error messages
4. **Audit Trail:** Admins can track all referral-to-balance transfers
5. **User Confidence:** Clear before/after values build trust
6. **Consistent UX:** History modal matches admin balance management style

## Future Enhancements

Potential improvements for future iterations:

1. **Export History:** Allow users to export transfer history as CSV/PDF
2. **Filters:** Add date range filters to history modal
3. **Pagination:** Implement pagination for users with many transfers
4. **Notifications:** Send email/push notification on successful transfer
5. **Undo Feature:** Allow reversal of recent transfers (within time window)
6. **Analytics:** Show charts/graphs of transfer patterns over time

## Related Files

- `app/(tabs)/referrals.tsx` - Main referrals screen with transfer UI
- `app/(tabs)/admin.tsx` - Admin panel (reference for history design)
- `app/(tabs)/balance-management.tsx` - Admin balance management (similar history pattern)
- Database migrations:
  - `create_referral_transfer_history` - Creates history table
  - `fix_user_transfer_referral_to_balance` - Fixes RPC function

## Notes

- The transfer does NOT generate new referral commissions (by design)
- Minimum transfer amount is 50 MXI
- Transfers are permanent and cannot be undone
- History is stored indefinitely (no automatic cleanup)
- RLS policies ensure users can only see their own history
- Admins can view all transfer history for audit purposes
