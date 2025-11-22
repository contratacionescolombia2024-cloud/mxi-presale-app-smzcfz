
# 🚀 Quick Start Guide - MXI Presale App

## Prerequisites

- Node.js 18+ installed
- npm or yarn package manager
- Expo CLI (installed automatically)
- iOS Simulator (for iOS development)
- Android Studio (for Android development)
- Modern web browser (for web development)

---

## 📦 Installation

### 1. Install Dependencies
```bash
npm install
```

### 2. Verify Installation
```bash
npm run lint
```

This should complete without errors.

---

## 🏃 Running the App

### Development Mode (All Platforms)
```bash
npm run dev
```

This will start the Expo development server with a QR code you can scan with:
- **iOS**: Expo Go app from App Store
- **Android**: Expo Go app from Play Store
- **Web**: Press `w` to open in browser

### Platform-Specific Commands

**iOS Simulator**:
```bash
npm run ios
```

**Android Emulator**:
```bash
npm run android
```

**Web Browser**:
```bash
npm run web
```

---

## 🔧 Configuration

### Supabase Setup

The app is already configured to connect to Supabase project: `kllolspugrhdgytwdmzp`

**Database Tables** (already created):
- `users_profiles` - User profile information
- `presale_stages` - Presale phase configuration
- `purchases` - Purchase records
- `vesting` - Vesting rewards tracking
- `referrals` - Referral system data
- `tournaments` - Tournament information
- `tournament_participants` - Tournament participation
- `kyc_submissions` - KYC verification data
- `messages` - User-admin messaging

### Web3 Configuration (Web Only)

**File**: `config/web3Config.web.ts`

Replace `YOUR_WALLETCONNECT_PROJECT_ID` with your actual WalletConnect project ID:
```typescript
export const WALLETCONNECT_PROJECT_ID = 'your-actual-project-id';
```

Get your project ID from: https://cloud.walletconnect.com/

---

## 👤 User Accounts

### Admin Account
The first user registered becomes the admin automatically.

**Admin Features**:
- Access to admin panel
- Manage users
- Control presale phases
- Approve KYC submissions
- View metrics and analytics
- Manage tournaments

### Regular User Account
All subsequent users are regular users.

**User Features**:
- Purchase MXI tokens
- View vesting rewards (real-time)
- Refer other users
- Participate in tournaments
- Submit KYC verification
- Message admin

---

## 🎮 Testing the App

### 1. **Registration Flow**
1. Open the app
2. Click "Register"
3. Fill in details (email, password, name, etc.)
4. Optional: Enter referral code
5. Submit registration
6. Check email for verification link
7. Click verification link
8. Return to app and login

### 2. **Purchase Flow**
1. Login to app
2. Navigate to "Purchase" tab
3. Enter amount (min $10, max $50,000)
4. Choose payment method:
   - Manual (pending admin approval)
   - Crypto (web only - requires wallet connection)
5. Confirm purchase
6. Wait for admin approval (manual) or transaction confirmation (crypto)

### 3. **Vesting System**
1. After purchase approval, vesting starts automatically
2. Navigate to "Vesting" tab
3. Watch real-time rewards accumulation (updates every second)
4. View projections for 7, 15, and 30 days
5. Rewards calculated at 3% monthly rate on purchased MXI

### 4. **Referral System**
1. Navigate to "Referrals" tab
2. Copy your unique referral code
3. Share with friends
4. When they register with your code:
   - Level 1: You earn 5% of their purchases
   - Level 2: You earn 2% of their referrals' purchases
   - Level 3: You earn 1% of level 2 referrals' purchases
5. View earnings breakdown in real-time

### 5. **Tournaments** (Coming Soon)
1. Navigate to "Tournaments" tab
2. View active tournaments
3. Click to participate
4. Play mini-games
5. Compete for MXI prizes

### 6. **Web3 Wallet Connection** (Web Only)
1. Open app in web browser
2. Navigate to "Connect Wallet"
3. Click "Connect Wallet" button
4. Choose wallet (MetaMask, Trust Wallet, or WalletConnect)
5. Approve connection
6. View USDT balance
7. Make purchases with USDT BEP20

---

## 🐛 Troubleshooting

### App Won't Start
```bash
# Clear caches
rm -rf node_modules
rm -rf .expo
rm -rf android/build
rm -rf ios/build

# Reinstall
npm install

# Try again
npm run dev
```

### WorkletsError
This should be fixed in the latest version. If you still see it:
1. Check that you're using the latest code
2. Clear Metro cache: `npm start -- --clear`
3. Restart the app

### Web3 Not Working
1. Ensure you're on web platform (not iOS/Android)
2. Check WalletConnect project ID is set
3. Verify wallet extension is installed
4. Check browser console for errors

### Database Errors
1. Verify Supabase project is active
2. Check internet connection
3. Verify RLS policies are enabled
4. Check console logs for specific errors

### Email Verification Not Working
1. Check spam folder
2. Verify email address is correct
3. Use "Resend Verification" button
4. Check Supabase email settings

---

## 📱 Platform-Specific Notes

### iOS
- Requires macOS for development
- Xcode must be installed for simulator
- Physical device requires Apple Developer account

### Android
- Android Studio required for emulator
- Enable USB debugging for physical device
- May need to accept SDK licenses

### Web
- Works in all modern browsers
- Best experience in Chrome/Firefox
- Web3 features require wallet extension

---

## 🔐 Security Notes

### Production Deployment
Before deploying to production:

1. **Change Supabase Keys**
   - Use production Supabase project
   - Enable RLS on all tables
   - Set up proper authentication policies

2. **Update Web3 Config**
   - Use production WalletConnect project ID
   - Update wallet addresses
   - Test on mainnet with small amounts first

3. **Environment Variables**
   - Never commit sensitive keys
   - Use environment variables for secrets
   - Different configs for dev/staging/prod

4. **Code Signing**
   - iOS: Set up proper provisioning profiles
   - Android: Generate release keystore
   - Web: Set up HTTPS

---

## 📊 Monitoring

### Console Logs
The app includes comprehensive logging:
- 🔐 Authentication events
- 💰 Purchase transactions
- 📈 Vesting calculations
- 👥 Referral tracking
- 🔔 Real-time updates

### Error Tracking
All errors are logged to console with:
- ❌ Error indicator
- Descriptive message
- Stack trace (in development)

---

## 🎨 Customization

### Colors
**File**: `styles/commonStyles.ts`

Change the color scheme:
```typescript
export const colors = {
  primary: '#8B5CF6',  // Purple
  secondary: '#10B981',  // Green
  accent: '#F59E0B',  // Orange
  // ... more colors
};
```

### Translations
**File**: `constants/translations.ts`

Add or modify translations:
```typescript
export const translations = {
  en: {
    welcome: 'Welcome',
    // ... more translations
  },
  es: {
    welcome: 'Bienvenido',
    // ... more translations
  },
};
```

---

## 📞 Support

For issues or questions:
1. Check this guide first
2. Review console logs
3. Check Supabase dashboard
4. Verify all configurations

---

## ✅ Success Indicators

When everything is working correctly, you should see:

**Console Logs**:
```
✅ Polyfills loaded successfully!
✅ Global object configured
✅ Process module polyfilled
✅ Buffer module loaded
🚀 RootLayout: Platform = [platform]
💼 WalletProvider: [Native/Web] implementation loaded
✅ Profile loaded
✅ Current stage loaded
✅ Vesting data loaded
✅ Referral stats calculated
```

**App Behavior**:
- Smooth navigation
- Real-time vesting updates
- Responsive UI
- No error messages
- All features accessible

---

**Happy Coding! 🚀**
