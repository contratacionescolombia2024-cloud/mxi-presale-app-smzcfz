
# Admin Panel Verification Protocol

## Pre-Flight Checks

### 1. Database Connection
- ✅ Supabase project: kllolspugrhdgytwdmzp
- ✅ All tables present and accessible
- ✅ RLS policies configured correctly

### 2. Admin Functions Available
- ✅ `admin_add_balance_with_commissions(user_id, mxi_amount)`
- ✅ `admin_add_balance_without_commissions(user_id, mxi_amount)`
- ✅ `admin_get_user_details(user_id)`
- ✅ `admin_update_user_profile(user_id, ...)`
- ✅ `admin_link_referral(user_email, referral_code)`

### 3. Testing Procedure

#### Test 1: Add Balance Without Commissions
```sql
SELECT admin_add_balance_without_commissions(
    '<user_id>'::uuid,
    10::numeric
);
```
**Expected Result**: 
```json
{
  "success": true,
  "user_id": "<user_id>",
  "mxi_added": 10,
  "message": "Balance added successfully without commissions"
}
```

#### Test 2: Add Balance With Commissions
```sql
SELECT admin_add_balance_with_commissions(
    '<user_id>'::uuid,
    100::numeric
);
```
**Expected Result**:
```json
{
  "success": true,
  "user_id": "<user_id>",
  "mxi_added": 100,
  "total_commissions_distributed": 8.0,
  "message": "Balance added successfully and commissions distributed"
}
```

#### Test 3: Verify Balance Update
```sql
SELECT 
    up.email,
    up.name,
    v.total_mxi,
    v.current_rewards
FROM users_profiles up
LEFT JOIN vesting v ON v.user_id = up.id
WHERE up.email = '<user_email>';
```

## Common Issues & Solutions

### Issue 1: "Nothing happened" after adding balance

**Diagnosis Steps:**
1. Check browser console for errors (F12)
2. Verify network tab shows successful API call (Status 200)
3. Manually refresh the admin panel
4. Check database directly with SQL query

**Solution:**
- The admin panel has auto-refresh after operations
- If not refreshing, click the refresh button (↻) in the header
- Clear browser cache if persistent

### Issue 2: Commissions not distributed

**Diagnosis Steps:**
1. Verify user has `referred_by` field set
2. Check referrer exists with matching `referral_code`
3. Verify referral chain (level 1, 2, 3)

**Solution:**
- Use "Link Referral" tab to establish referral relationship
- Commissions only distribute if referral chain exists
- Use "Add Balance" (without commissions) if no referral needed

### Issue 3: User not found

**Diagnosis Steps:**
1. Verify user email is correct
2. Check user exists in `users_profiles` table
3. Verify user has completed registration

**Solution:**
- User must complete email verification
- Profile must exist in `users_profiles` table
- Use exact email address (case-sensitive)

## Admin Panel Usage Guide

### Adding Balance Without Commissions
**Use Case**: Admin wants to add bonus MXI or correct user balance

1. Navigate to "Users" tab
2. Click on target user
3. In "Balance Management" section, select "Add Balance" (left button)
4. Enter amount in MXI
5. Click "Add" button
6. Confirm action
7. Wait for success message
8. Verify balance updated in user details

### Simulating Sale (With Commissions)
**Use Case**: Admin wants to add balance and trigger referral commissions

1. Navigate to "Users" tab
2. Click on target user
3. In "Balance Management" section, select "Simulate Sale" (right button)
4. Enter amount in MXI
5. Review commission breakdown shown
6. Click "Add" button
7. Confirm action with commission details
8. Wait for success message showing commissions distributed
9. Verify:
   - User balance increased
   - Referrer(s) received commissions
   - Referral records created

### Linking Referrals
**Use Case**: Manually establish referral relationship

1. Navigate to "Link Referral" tab
2. Enter user's email address
3. Enter referrer's referral code
4. Click "Link Referral"
5. System will:
   - Establish referral relationship
   - Calculate commissions for existing purchases
   - Distribute commissions to referral chain
6. Success message shows total commissions distributed

## Monitoring & Verification

### Real-Time Monitoring
```sql
-- Check recent balance changes
SELECT 
    up.email,
    up.name,
    v.total_mxi,
    v.last_update
FROM users_profiles up
JOIN vesting v ON v.user_id = up.id
ORDER BY v.last_update DESC
LIMIT 10;

-- Check recent referral commissions
SELECT 
    r.created_at,
    r.level,
    r.commission_mxi,
    referrer.email as referrer_email,
    referred.email as referred_email
FROM referrals r
JOIN users_profiles referrer ON r.referrer_id = referrer.id
JOIN users_profiles referred ON r.referred_id = referred.id
ORDER BY r.created_at DESC
LIMIT 10;
```

### Audit Trail
All operations are logged with timestamps:
- `vesting.last_update` - Last balance modification
- `referrals.created_at` - When commission was created
- `users_profiles.updated_at` - Last profile update

## Emergency Procedures

### Rollback Balance Addition
```sql
-- Remove specific amount from user
UPDATE vesting
SET 
    total_mxi = total_mxi - <amount>,
    last_update = NOW()
WHERE user_id = '<user_id>'::uuid;
```

### Verify System Integrity
```sql
-- Check for orphaned referrals
SELECT * FROM referrals r
WHERE NOT EXISTS (
    SELECT 1 FROM users_profiles WHERE id = r.referrer_id
) OR NOT EXISTS (
    SELECT 1 FROM users_profiles WHERE id = r.referred_id
);

-- Check for negative balances
SELECT 
    up.email,
    v.total_mxi
FROM users_profiles up
JOIN vesting v ON v.user_id = up.id
WHERE v.total_mxi < 0;
```

## Support Contacts

For technical issues:
- Check Supabase logs: Project Dashboard → Logs
- Review API logs for error messages
- Verify RLS policies are not blocking operations
- Ensure admin user has `is_admin = true` in profile
