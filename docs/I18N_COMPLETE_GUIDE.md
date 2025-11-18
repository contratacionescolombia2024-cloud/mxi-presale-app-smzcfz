
# Complete Internationalization (i18n) Guide for MXI App

## Overview

The MXI app now supports **three languages**:
- 🇺🇸 **English** (en)
- 🇪🇸 **Spanish** (es) - Español
- 🇧🇷 **Portuguese** (pt) - Português

## Architecture

### Core Components

1. **LanguageContext** (`contexts/LanguageContext.tsx`)
   - Manages language state across the app
   - Handles language persistence with AsyncStorage
   - Auto-detects device language on first launch
   - Provides `t()` function for translations

2. **Translations** (`constants/translations.ts`)
   - Contains all translation strings for all languages
   - Organized by feature/screen
   - Type-safe with TypeScript

3. **Language Settings Screen** (`app/(tabs)/language-settings.tsx`)
   - User-friendly interface to change language
   - Shows current selection with checkmark
   - Displays language flags and native names

## How to Use Translations

### 1. Import the useLanguage Hook

```typescript
import { useLanguage } from '@/contexts/LanguageContext';
```

### 2. Use the Translation Function

```typescript
const { t, locale } = useLanguage();

// Simple translation
<Text>{t('welcome')}</Text>

// With parameters (future enhancement)
<Text>{t('confirmTransferMessage', { amount: '100' })}</Text>
```

### 3. Check Current Language

```typescript
const { locale } = useLanguage();

if (locale === 'es') {
  // Spanish-specific logic
}
```

## Translation Coverage

### ✅ Fully Translated Screens

- **Home Screen** - Dashboard with all metrics
- **Login/Register** - Authentication flows
- **Purchase Screen** - MXI token purchase
- **Vesting Screen** - Vesting rewards and projections
- **Referrals Screen** - Referral program and transfers
- **Language Settings** - Language selection interface
- **Profile Screen** - User profile information
- **KYC Screen** - Verification status

### 📝 Translation Keys Available

#### Common
- `welcome`, `loading`, `error`, `success`
- `cancel`, `confirm`, `save`, `delete`, `edit`
- `back`, `next`, `submit`, `close`

#### Authentication
- `login`, `register`, `logout`
- `email`, `password`, `confirmPassword`
- `forgotPassword`, `resetPassword`
- `verifyEmail`, `emailVerified`

#### Home & Dashboard
- `yourMXIDashboard`, `mxiTokenLaunch`
- `totalMXIBalance`, `mxiPurchased`
- `referralCommissions`, `vestingRewards`
- `tournamentWinnings`, `commissionsAvailable`

#### Vesting
- `vestingRewardsTitle`, `currentRewards`
- `purchasedMXIBase`, `monthlyRate`
- `projectedEarnings`, `sevenDays`, `fifteenDays`, `thirtyDays`

#### Referrals
- `referralProgram`, `earnUpToCommission`
- `totalReferralEarnings`, `unifyToBalance`
- `viewTransferHistory`, `transferToBalance`
- `commissionLevels`, `howItWorks`

#### Purchase
- `buyMXITokens`, `stageDetails`
- `currentPricePerMXI`, `selectPaymentMethod`
- `completePurchase`, `youWillReceive`

#### Settings
- `language`, `selectLanguage`
- `english`, `spanish`, `portuguese`

## Adding New Translations

### Step 1: Add to English (Base Language)

```typescript
// In constants/translations.ts
en: {
  // ... existing translations
  newFeature: 'New Feature',
  newFeatureDescription: 'This is a new feature',
}
```

### Step 2: Add Spanish Translation

```typescript
es: {
  // ... existing translations
  newFeature: 'Nueva Característica',
  newFeatureDescription: 'Esta es una nueva característica',
}
```

### Step 3: Add Portuguese Translation

```typescript
pt: {
  // ... existing translations
  newFeature: 'Novo Recurso',
  newFeatureDescription: 'Este é um novo recurso',
}
```

### Step 4: Use in Your Component

```typescript
const { t } = useLanguage();

<Text>{t('newFeature')}</Text>
<Text>{t('newFeatureDescription')}</Text>
```

## Language Detection

The app automatically detects the user's device language on first launch:

1. Checks AsyncStorage for saved preference
2. If no preference, detects device language
3. Maps device language to supported languages:
   - `es-*` → Spanish
   - `pt-*` → Portuguese
   - Everything else → English (default)
4. Saves the detected/selected language

## Language Persistence

- Language preference is saved to AsyncStorage
- Key: `@mxi_app_language`
- Persists across app restarts
- User can change anytime from Settings

## Best Practices

### ✅ DO

- Always use `t()` function for user-facing text
- Add translations for all three languages simultaneously
- Use descriptive translation keys (e.g., `purchaseSuccessMessage`)
- Group related translations together
- Test all languages before releasing

### ❌ DON'T

- Don't hardcode user-facing strings
- Don't use translation keys as display text
- Don't forget to add all three language versions
- Don't use complex nested objects (keep flat structure)

## Testing Languages

### Manual Testing

1. Go to Language Settings screen
2. Select each language
3. Navigate through all screens
4. Verify all text is translated correctly

### Programmatic Testing

```typescript
// Test language switching
const { setLocale } = useLanguage();

await setLocale('es'); // Switch to Spanish
await setLocale('pt'); // Switch to Portuguese
await setLocale('en'); // Switch to English
```

## Common Issues & Solutions

### Issue: Text Not Translating

**Solution:** 
- Check if translation key exists in all language objects
- Verify you're using `t('key')` not just `'key'`
- Check for typos in translation keys

### Issue: Language Not Persisting

**Solution:**
- Verify AsyncStorage permissions
- Check LanguageContext is properly wrapped around app
- Clear app data and test again

### Issue: Wrong Language on First Launch

**Solution:**
- Check device language settings
- Verify language detection logic in LanguageContext
- Test with different device languages

## Future Enhancements

### Planned Features

1. **Parameter Interpolation**
   ```typescript
   t('welcomeUser', { name: 'John' })
   // Output: "Welcome, John!"
   ```

2. **Pluralization**
   ```typescript
   t('itemCount', { count: 5 })
   // Output: "5 items" or "1 item"
   ```

3. **Date/Number Formatting**
   ```typescript
   formatDate(date, locale)
   formatNumber(1234.56, locale)
   ```

4. **Additional Languages**
   - French (fr)
   - German (de)
   - Chinese (zh)
   - Japanese (ja)

## Translation Statistics

- **Total Translation Keys:** 150+
- **Languages Supported:** 3
- **Screens Covered:** 8+
- **Coverage:** ~95% of user-facing text

## Contributing Translations

To contribute translations:

1. Fork the repository
2. Add translations to `constants/translations.ts`
3. Test thoroughly
4. Submit pull request with:
   - Language code
   - Native language name
   - Flag emoji
   - All translation strings

## Support

For translation issues or suggestions:
- Check this documentation first
- Review existing translation keys
- Test with all three languages
- Report issues with specific examples

---

**Last Updated:** January 2025
**Version:** 1.0.0
**Languages:** English, Spanish, Portuguese
