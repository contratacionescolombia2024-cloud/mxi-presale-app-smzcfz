
# Persistent Vesting System

## Overview

The MXI app now implements a **persistent vesting system** that continues to calculate and accumulate rewards even when the app is closed. This ensures users receive their full 3% monthly vesting rewards on their purchased MXI tokens, regardless of app usage patterns.

## Key Features

### 1. **Server-Side Vesting Calculations**
- Vesting rewards are calculated and stored in the database using PostgreSQL functions
- Calculations happen on the server, independent of the app being open
- Time-based calculations ensure accurate rewards based on elapsed time

### 2. **Automatic Balance Adjustment**
- When `purchased_mxi` changes (increases or decreases), vesting automatically adjusts
- Pending rewards are calculated before balance changes take effect
- Future vesting is based on the new balance amount

### 3. **Real-Time Synchronization**
- App syncs with server every 30 seconds when active
- Immediate sync when app comes to foreground
- Background service calls edge function every 5 minutes to update all users

### 4. **Client-Side Display Updates**
- Smooth UI updates every second for better user experience
- Display updates are cosmetic and sync with server periodically
- Server is the source of truth for actual rewards

## Architecture

### Database Functions

#### `calculate_and_update_vesting_rewards(p_user_id uuid)`
Calculates vesting rewards for a specific user based on time elapsed since last update.

**Formula:**
```
reward_increment = (purchased_mxi × monthly_rate × seconds_elapsed) / seconds_in_month
new_rewards = current_rewards + reward_increment
```

**Returns:**
- `user_id`: User UUID
- `purchased_mxi`: Base amount for vesting calculations
- `old_rewards`: Rewards before calculation
- `new_rewards`: Rewards after calculation
- `seconds_elapsed`: Time since last update
- `monthly_rate`: Current vesting rate (default 0.03 = 3%)

#### `adjust_vesting_on_balance_change()`
Trigger function that automatically adjusts vesting when `purchased_mxi` changes.

**Process:**
1. Detects change in `purchased_mxi`
2. Calculates pending rewards based on OLD balance
3. Updates `current_rewards` with pending amount
4. Future vesting uses NEW balance

#### `update_all_vesting_rewards()`
Batch updates vesting rewards for all users with `purchased_mxi > 0`.

**Returns:**
- `updated_count`: Number of users updated
- `total_rewards_added`: Total rewards across all users

### Edge Function

#### `update-vesting-rewards`
Serverless function that updates all vesting rewards.

**Endpoint:** `https://[project-ref].supabase.co/functions/v1/update-vesting-rewards`

**Method:** POST

**Response:**
```json
{
  "success": true,
  "message": "Vesting rewards updated successfully",
  "data": {
    "updated_count": 10,
    "total_rewards_added": 123.456
  },
  "timestamp": "2025-01-18T12:00:00.000Z"
}
```

### Background Service

#### `vestingBackgroundService.ts`
Client-side service that periodically calls the edge function.

**Functions:**
- `startVestingBackgroundService()`: Starts periodic updates (every 5 minutes)
- `stopVestingBackgroundService()`: Stops the service
- `updateAllVestingRewards()`: Manually triggers edge function
- `calculateUserVestingRewards(userId)`: Calculates rewards for specific user

## How It Works

### When App is Open
1. **Initial Load**: Server calculates any pending rewards since last session
2. **Periodic Sync**: Every 30 seconds, app syncs with server
3. **Display Updates**: UI updates every second for smooth experience
4. **Foreground Event**: When app comes to foreground, immediate sync

### When App is Closed
1. **Background Service**: Edge function called every 5 minutes
2. **Server Calculations**: Database functions continue calculating rewards
3. **Persistent Storage**: All rewards stored in database
4. **Next Open**: Full catch-up calculation when user returns

### When Balance Changes
1. **Purchase Made**: `purchased_mxi` increases
   - Pending rewards calculated on old balance
   - New vesting rate based on new balance
   
2. **Balance Decreases**: `purchased_mxi` decreases (if implemented)
   - Pending rewards calculated on old balance
   - Future vesting adjusted to new balance
   - No loss of already earned rewards

## Database Schema

### `vesting` Table
```sql
CREATE TABLE vesting (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id),
  total_mxi numeric DEFAULT 0,           -- Total MXI (purchased + commissions)
  purchased_mxi numeric DEFAULT 0,       -- Only purchased MXI (vesting base)
  current_rewards numeric DEFAULT 0,     -- Accumulated vesting rewards
  monthly_rate numeric DEFAULT 0.03,     -- 3% monthly rate
  last_update timestamptz DEFAULT now(), -- Last calculation timestamp
  tournaments_balance numeric DEFAULT 0,
  commission_balance numeric DEFAULT 0,
  created_at timestamptz DEFAULT now()
);
```

### `vesting_status` View
Real-time view showing current vesting status for all users:
```sql
SELECT 
  user_id,
  user_name,
  purchased_mxi,
  current_rewards,
  calculated_current_rewards,  -- What rewards SHOULD be right now
  monthly_earnings_potential,
  seconds_since_update
FROM vesting_status;
```

## Important Notes

### Vesting Calculation Rules
1. **Only Purchased MXI**: Vesting is calculated ONLY on `purchased_mxi`, not on referral commissions
2. **3% Monthly Rate**: Default rate is 3% per month (0.03)
3. **Per-Second Calculation**: Rewards accumulate every second for precision
4. **Compound Interest**: Rewards are added to balance and can be used

### Balance Relationship
```
total_mxi = purchased_mxi + referral_commissions + tournament_winnings
vesting_base = purchased_mxi (ONLY)
monthly_vesting = purchased_mxi × 0.03
```

### Example Scenario
```
User purchases 1000 MXI
- purchased_mxi: 1000
- Monthly vesting: 1000 × 0.03 = 30 MXI
- Daily vesting: 30 / 30 = 1 MXI
- Per second: 1 / 86400 ≈ 0.0000116 MXI

After 1 day (app closed):
- Server calculates: 86400 seconds × 0.0000116 = 1 MXI
- current_rewards: 1 MXI
- User opens app: Sees 1 MXI vesting rewards

User earns 500 MXI from referrals:
- total_mxi: 1500 (1000 purchased + 500 referral)
- purchased_mxi: 1000 (unchanged)
- Vesting still based on 1000 MXI only
```

## Setup Instructions

### 1. Database Migration
The migration `persistent_vesting_system` has been applied, which includes:
- Database functions for vesting calculations
- Trigger for automatic balance adjustments
- View for monitoring vesting status

### 2. Edge Function Deployment
The edge function `update-vesting-rewards` has been deployed and is active.

### 3. Client Integration
The app automatically:
- Starts background service on launch
- Syncs with server periodically
- Calculates rewards when coming to foreground

### 4. Optional: Cron Job (Recommended for Production)
For production, set up a cron job to call the edge function:

**Using Supabase Cron (if available):**
```sql
SELECT cron.schedule(
  'update-vesting-rewards',
  '*/5 * * * *',  -- Every 5 minutes
  $$
  SELECT net.http_post(
    url := 'https://[project-ref].supabase.co/functions/v1/update-vesting-rewards',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer [service-role-key]"}'::jsonb
  );
  $$
);
```

**Using External Cron Service:**
- Use services like cron-job.org, EasyCron, or AWS EventBridge
- Call the edge function every 5 minutes
- Endpoint: `https://[project-ref].supabase.co/functions/v1/update-vesting-rewards`

## Monitoring

### Check Vesting Status
```sql
-- View all users' vesting status
SELECT * FROM vesting_status ORDER BY purchased_mxi DESC;

-- Check specific user
SELECT * FROM vesting_status WHERE user_id = '[user-uuid]';

-- Check users with outdated calculations (> 1 hour)
SELECT * FROM vesting_status WHERE seconds_since_update > 3600;
```

### Manual Update
```sql
-- Update all users
SELECT * FROM update_all_vesting_rewards();

-- Update specific user
SELECT * FROM calculate_and_update_vesting_rewards('[user-uuid]');
```

### Edge Function Logs
Check Supabase dashboard → Edge Functions → update-vesting-rewards → Logs

## Troubleshooting

### Issue: Vesting not updating when app is closed
**Solution:** 
- Check if edge function is being called (check logs)
- Verify cron job is running (if set up)
- Manually call edge function to test

### Issue: Vesting rewards seem incorrect
**Solution:**
- Check `vesting_status` view for calculated vs stored rewards
- Verify `purchased_mxi` is correct
- Check `last_update` timestamp
- Manually trigger calculation: `SELECT * FROM calculate_and_update_vesting_rewards('[user-uuid]');`

### Issue: Balance change not adjusting vesting
**Solution:**
- Verify trigger is active: `SELECT * FROM pg_trigger WHERE tgname = 'trigger_adjust_vesting_on_balance_change';`
- Check trigger logs in database
- Manually update: `UPDATE vesting SET purchased_mxi = [new-amount] WHERE user_id = '[user-uuid]';`

## Testing

### Test Vesting Calculation
```sql
-- 1. Create test user vesting record
INSERT INTO vesting (user_id, purchased_mxi, current_rewards, monthly_rate, last_update)
VALUES ('[test-user-uuid]', 1000, 0, 0.03, NOW() - INTERVAL '1 day');

-- 2. Calculate rewards (should be ~1 MXI for 1 day)
SELECT * FROM calculate_and_update_vesting_rewards('[test-user-uuid]');

-- 3. Verify results
SELECT * FROM vesting WHERE user_id = '[test-user-uuid]';
```

### Test Balance Adjustment
```sql
-- 1. Set initial balance
UPDATE vesting SET purchased_mxi = 1000, current_rewards = 10, last_update = NOW() - INTERVAL '1 hour'
WHERE user_id = '[test-user-uuid]';

-- 2. Change balance (trigger should fire)
UPDATE vesting SET purchased_mxi = 500 WHERE user_id = '[test-user-uuid]';

-- 3. Check that rewards were calculated before change
SELECT * FROM vesting WHERE user_id = '[test-user-uuid]';
-- current_rewards should be > 10 (pending rewards added)
-- future vesting now based on 500 MXI
```

## Performance Considerations

- **Database Load**: Batch updates every 5 minutes are efficient
- **Edge Function**: Serverless, scales automatically
- **Client Impact**: Minimal, only syncs every 30 seconds when active
- **Storage**: Negligible, only stores current rewards value

## Future Enhancements

1. **Vesting History**: Track historical vesting rewards
2. **Adjustable Rates**: Allow admin to change vesting rate per user
3. **Vesting Locks**: Implement time-locked vesting periods
4. **Compound Vesting**: Option to automatically reinvest rewards
5. **Vesting Analytics**: Dashboard showing vesting trends

## Conclusion

The persistent vesting system ensures fair and accurate reward distribution for all MXI token holders. By leveraging server-side calculations and background services, users receive their full vesting rewards regardless of app usage patterns, creating a trustworthy and transparent reward system.
