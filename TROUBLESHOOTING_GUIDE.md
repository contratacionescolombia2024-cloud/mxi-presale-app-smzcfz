
# 🔧 Troubleshooting Guide - MXI Presale App

## Common Issues and Solutions

---

## 🚨 Critical Errors

### 1. WorkletsError: createSerializableObject

**Error Message**:
```
WorkletsError: [Worklets] createSerializableObject should never be called in JSWorklets
```

**Cause**: Complex objects being passed to React Native Reanimated worklets.

**Solution**:
1. Ensure you're using the latest code (all fixes applied)
2. Clear Metro cache:
   ```bash
   npm start -- --clear
   ```
3. Restart the app completely
4. If issue persists, check that no custom code is passing complex objects to `useAnimatedStyle`

**Prevention**:
- Only use primitive values in worklet dependencies
- Extract complex calculations outside of `useAnimatedStyle`
- Memoize all context values properly

---

### 2. App Won't Start / White Screen

**Symptoms**:
- App shows white screen
- App crashes immediately
- Metro bundler errors

**Solutions**:

**Step 1: Clear All Caches**
```bash
# Clear node modules
rm -rf node_modules

# Clear Expo cache
rm -rf .expo

# Clear platform builds
rm -rf android/build
rm -rf ios/build

# Clear Metro cache
rm -rf /tmp/metro-*
rm -rf /tmp/haste-*

# Reinstall
npm install
```

**Step 2: Reset Metro Bundler**
```bash
npm start -- --clear --reset-cache
```

**Step 3: Check for Errors**
```bash
# Check for linting errors
npm run lint

# Check for TypeScript errors
npx tsc --noEmit
```

---

### 3. Database Connection Errors

**Error Message**:
```
Error: Failed to connect to Supabase
```

**Causes**:
- No internet connection
- Supabase project is down
- Invalid Supabase credentials
- RLS policies blocking access

**Solutions**:

**Check Internet Connection**:
```bash
ping google.com
```

**Verify Supabase Configuration**:
1. Open `app/integrations/supabase/client.ts`
2. Verify `SUPABASE_URL` and `SUPABASE_ANON_KEY` are correct
3. Check Supabase dashboard is accessible

**Check RLS Policies**:
```sql
-- Run in Supabase SQL Editor
SELECT * FROM pg_policies WHERE tablename = 'users_profiles';
```

**Test Connection**:
```typescript
// Add to a test file
import { supabase } from '@/app/integrations/supabase/client';

async function testConnection() {
  const { data, error } = await supabase
    .from('users_profiles')
    .select('count');
  
  console.log('Connection test:', { data, error });
}
```

---

## ⚠️ Common Warnings

### 1. "Email not confirmed"

**Message**: "Please verify your email address before logging in"

**Solution**:
1. Check your email inbox (including spam folder)
2. Click the verification link
3. If no email received, use "Resend Verification" button
4. Wait a few minutes and try again

**Troubleshooting**:
- Check Supabase email settings
- Verify SMTP configuration
- Check email delivery logs in Supabase

---

### 2. "Invalid login credentials"

**Message**: "Invalid email or password"

**Solutions**:
1. Double-check email and password
2. Use "Forgot Password" if needed
3. Ensure email is verified
4. Check for typos (email is case-sensitive)

**Reset Password**:
1. Click "Forgot Password"
2. Enter your email
3. Check email for reset link
4. Click link and set new password
5. Return to app and login

---

### 3. Web3 Wallet Connection Issues (Web Only)

**Symptoms**:
- Wallet won't connect
- Transaction fails
- Balance shows 0

**Solutions**:

**MetaMask Not Detected**:
1. Install MetaMask extension
2. Refresh the page
3. Click "Connect Wallet" again

**Wrong Network**:
1. Open MetaMask
2. Click network dropdown
3. Select "Binance Smart Chain"
4. If not available, add BSC network:
   - Network Name: Binance Smart Chain
   - RPC URL: https://bsc-dataseed.binance.org/
   - Chain ID: 56
   - Symbol: BNB
   - Block Explorer: https://bscscan.com

**Insufficient Balance**:
- Ensure you have enough USDT for the purchase
- Ensure you have enough BNB for gas fees (usually ~$0.50)

**Transaction Rejected**:
- Check MetaMask for pending transactions
- Cancel stuck transactions
- Try again with higher gas price

---

## 🐛 Platform-Specific Issues

### iOS Issues

**1. App Won't Build**
```bash
# Clean iOS build
cd ios
pod deintegrate
pod install
cd ..

# Rebuild
npm run ios
```

**2. Simulator Issues**
```bash
# Reset simulator
xcrun simctl erase all

# Restart simulator
# Quit Simulator app and reopen
```

**3. Code Signing Errors**
- Open Xcode
- Select project
- Go to Signing & Capabilities
- Select your team
- Enable "Automatically manage signing"

---

### Android Issues

**1. App Won't Build**
```bash
# Clean Android build
cd android
./gradlew clean
cd ..

# Rebuild
npm run android
```

**2. Emulator Issues**
```bash
# List emulators
emulator -list-avds

# Start specific emulator
emulator -avd Pixel_5_API_31

# Or use Android Studio AVD Manager
```

**3. Gradle Errors**
```bash
# Clear Gradle cache
cd android
./gradlew clean
./gradlew --stop
cd ..

# Delete Gradle cache
rm -rf ~/.gradle/caches/
```

---

### Web Issues

**1. Build Errors**
```bash
# Clear web build
rm -rf web-build

# Rebuild
npm run web
```

**2. Web3Modal Not Loading**
- Check browser console for errors
- Verify WalletConnect Project ID is set
- Clear browser cache
- Try incognito mode

**3. CORS Errors**
- This is expected in development
- Use production build for testing
- Or configure CORS in your server

---

## 📊 Performance Issues

### 1. Slow App Performance

**Symptoms**:
- Laggy animations
- Slow navigation
- High memory usage

**Solutions**:

**Check for Memory Leaks**:
```typescript
// Add to useEffect cleanup
useEffect(() => {
  // Your code
  
  return () => {
    // Cleanup subscriptions
    // Clear intervals
    // Remove listeners
  };
}, []);
```

**Optimize Images**:
- Use optimized image formats (WebP)
- Compress images
- Use appropriate sizes
- Implement lazy loading

**Reduce Re-renders**:
- Use React.memo for components
- Implement useMemo for expensive calculations
- Use useCallback for functions
- Check React DevTools Profiler

---

### 2. Real-time Updates Not Working

**Symptoms**:
- Vesting rewards not updating
- Referral stats not refreshing
- Balance not changing

**Solutions**:

**Check Supabase Realtime**:
```typescript
// Test realtime connection
const channel = supabase
  .channel('test')
  .on('postgres_changes', 
    { event: '*', schema: 'public', table: 'vesting' },
    (payload) => console.log('Change received!', payload)
  )
  .subscribe();
```

**Verify Subscriptions**:
- Check console for subscription logs
- Ensure subscriptions are not being unsubscribed early
- Verify RLS policies allow SELECT

**Force Refresh**:
- Pull down to refresh on mobile
- Click refresh button
- Restart the app

---

## 🔐 Security Issues

### 1. "Account Blocked"

**Message**: "Your account has been blocked"

**Cause**: Admin blocked your account

**Solution**:
1. Contact support
2. Provide your email address
3. Wait for admin to review
4. Account will be unblocked if appropriate

---

### 2. "Session Expired"

**Message**: "Your session has expired"

**Solution**:
1. Logout completely
2. Clear app data (if on mobile)
3. Login again
4. If issue persists, reset password

---

## 📱 Device-Specific Issues

### 1. iPhone Notch Issues

**Symptom**: Content hidden behind notch

**Solution**:
- App uses SafeAreaView
- If issue persists, check paddingTop values
- Ensure using latest code

---

### 2. Android Back Button

**Symptom**: Back button doesn't work

**Solution**:
- This is expected behavior with Expo Router
- Use in-app navigation
- Or implement custom back handler

---

## 🔍 Debugging Tips

### Enable Detailed Logging

**Add to your code**:
```typescript
// Enable verbose logging
console.log('🔍 Debug:', { variable1, variable2 });

// Log function calls
console.log('📞 Function called:', functionName);

// Log errors with context
console.error('❌ Error:', error, { context });
```

### Use React DevTools

1. Install React DevTools extension
2. Open DevTools
3. Go to Components tab
4. Inspect component props and state

### Use Expo DevTools

```bash
# Start with DevTools
npm run dev

# Press 'm' to open DevTools
# Press 'j' to open debugger
```

### Check Metro Bundler Logs

- Look for red errors
- Check for warnings
- Verify all imports resolve

---

## 📞 Getting Help

### Before Asking for Help

1. ✅ Check this troubleshooting guide
2. ✅ Check console logs for errors
3. ✅ Try clearing caches
4. ✅ Try restarting the app
5. ✅ Check if issue is reproducible

### When Asking for Help

Provide:
1. **Error message** (full text)
2. **Platform** (iOS/Android/Web)
3. **Steps to reproduce**
4. **Console logs**
5. **Screenshots** (if applicable)
6. **What you've tried**

### Support Channels

- **Email**: support@mxistrategic.live
- **Discord**: [Your Discord]
- **Twitter**: @MXIStragic
- **Website**: https://mxistrategic.live

---

## 🎓 Best Practices

### Development

1. **Always clear cache** when switching branches
2. **Test on all platforms** before committing
3. **Check console logs** regularly
4. **Use TypeScript** for type safety
5. **Follow code style** guidelines

### Production

1. **Test thoroughly** before deploying
2. **Monitor error logs** after deployment
3. **Have rollback plan** ready
4. **Communicate** with users about updates
5. **Keep backups** of database

---

## ✅ Quick Fixes Checklist

When something goes wrong, try these in order:

1. [ ] Check console for errors
2. [ ] Clear Metro cache: `npm start -- --clear`
3. [ ] Restart the app
4. [ ] Clear node_modules: `rm -rf node_modules && npm install`
5. [ ] Clear all caches (see above)
6. [ ] Check internet connection
7. [ ] Verify Supabase is accessible
8. [ ] Check for app updates
9. [ ] Try on different device/platform
10. [ ] Contact support

---

**Last Updated**: January 2025
**Version**: 1.0.0

**Remember**: Most issues can be resolved by clearing caches and restarting! 🔄
