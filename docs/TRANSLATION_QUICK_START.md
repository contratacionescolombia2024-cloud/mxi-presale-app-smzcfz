
# Quick Start: Translating Your Screens

## Step-by-Step Guide

### 1. Import the Language Hook

At the top of your component file:

```typescript
import { useLanguage } from '@/contexts/LanguageContext';
```

### 2. Use the Hook in Your Component

```typescript
export default function MyScreen() {
  const { t } = useLanguage();
  
  // ... rest of your component
}
```

### 3. Replace Hardcoded Text

**Before:**
```typescript
<Text style={styles.title}>Purchase MXI</Text>
<Text style={styles.subtitle}>Buy MXI tokens at current stage price</Text>
```

**After:**
```typescript
<Text style={styles.title}>{t('purchaseMXI')}</Text>
<Text style={styles.subtitle}>{t('buyMXITokens')}</Text>
```

### 4. Handle Dynamic Content

**Before:**
```typescript
<Text>Welcome, {user.name}!</Text>
```

**After:**
```typescript
<Text>{t('welcome')}, {user.name}!</Text>
```

### 5. Update Alert Messages

**Before:**
```typescript
Alert.alert('Error', 'Invalid amount');
```

**After:**
```typescript
Alert.alert(t('error'), t('invalidAmount'));
```

## Common Patterns

### Buttons
```typescript
<TouchableOpacity onPress={handleSubmit}>
  <Text>{t('submit')}</Text>
</TouchableOpacity>
```

### Form Labels
```typescript
<Text style={styles.label}>{t('email')}</Text>
<TextInput placeholder={t('enterAmount')} />
```

### Status Messages
```typescript
<Text>{t('loading')}</Text>
<Text>{t('success')}</Text>
<Text>{t('error')}</Text>
```

### Navigation Items
```typescript
<Text>{t('profile')}</Text>
<Text>{t('settings')}</Text>
<Text>{t('messages')}</Text>
```

## Available Translation Keys

### Authentication
- `login`, `register`, `logout`
- `email`, `password`, `confirmPassword`
- `forgotPassword`, `resetPassword`
- `verifyEmail`, `emailVerified`

### Common Actions
- `save`, `cancel`, `delete`, `edit`
- `submit`, `confirm`, `close`, `back`, `next`

### Home & Dashboard
- `welcome`, `yourMXIDashboard`
- `totalMXIBalance`, `mxiPurchased`
- `referralCommissions`, `vestingRewards`
- `tournamentWinnings`, `commissionsAvailable`

### Purchase
- `purchaseMXI`, `buyMXITokens`
- `amount`, `enterAmount`
- `minimum`, `maximum`
- `youWillReceive`, `pricePerMXI`
- `selectPaymentMethod`, `completePurchase`

### Profile
- `profile`, `accountInformation`
- `referralCode`, `identification`, `address`
- `memberSince`, `verified`, `notVerified`
- `editProfile`, `kycVerification`

### Vesting
- `vestingRewardsTitle`, `currentRewards`
- `monthlyRate`, `projectedEarnings`
- `sevenDays`, `fifteenDays`, `thirtyDays`

### Phase Status
- `currentPhaseStatus`, `phase`
- `totalMXIInDistribution`, `globalVestingRewards`
- `currentPhasePrice`, `overallProgress`
- `phaseEndsIn`, `endDate`

### Time Units
- `days`, `hours`, `minutes`, `seconds`

### Status
- `approved`, `pending`, `rejected`
- `live`, `complete`

### Languages
- `language`, `selectLanguage`
- `english`, `spanish`, `portuguese`

## Tips

1. **Check existing keys first** - Many common phrases are already translated
2. **Use descriptive key names** - `purchaseMXI` is better than `btn1`
3. **Keep context in mind** - "Close" button vs "Close" as in "nearby"
4. **Test all languages** - Switch languages in settings to verify
5. **Add new keys to all languages** - English, Spanish, AND Portuguese

## Need a New Translation?

If you need a translation key that doesn't exist:

1. Open `constants/translations.ts`
2. Add the key to all three language objects:

```typescript
export const translations = {
  en: {
    // ... existing keys
    myNewKey: 'My New English Text',
  },
  es: {
    // ... existing keys
    myNewKey: 'Mi Nuevo Texto en Español',
  },
  pt: {
    // ... existing keys
    myNewKey: 'Meu Novo Texto em Português',
  },
};
```

3. Use it: `{t('myNewKey')}`

## Example: Complete Screen Translation

```typescript
import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useLanguage } from '@/contexts/LanguageContext';

export default function ExampleScreen() {
  const { t } = useLanguage();

  return (
    <View>
      <Text style={styles.title}>{t('welcome')}</Text>
      <Text style={styles.subtitle}>{t('yourMXIDashboard')}</Text>
      
      <TouchableOpacity onPress={handlePurchase}>
        <Text>{t('purchaseMXI')}</Text>
      </TouchableOpacity>
      
      <TouchableOpacity onPress={handleVesting}>
        <Text>{t('vesting')}</Text>
      </TouchableOpacity>
      
      <TouchableOpacity onPress={handleReferrals}>
        <Text>{t('referrals')}</Text>
      </TouchableOpacity>
    </View>
  );
}
```

## Testing Your Translations

1. Run the app
2. Go to Profile → Language
3. Switch between English, Spanish, and Portuguese
4. Navigate to your screen
5. Verify all text displays correctly in each language

That's it! You're ready to translate your screens. 🌍
