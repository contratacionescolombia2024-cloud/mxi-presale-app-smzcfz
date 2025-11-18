
# Internationalization (i18n) Implementation Guide

## Overview

The MXI Presale app now supports multiple languages:
- **English (en)** - Default
- **Spanish (es)** - Español
- **Portuguese (pt)** - Português

## Architecture

### 1. Translation Files
Location: `constants/translations.ts`

Contains all translation strings organized by language code. Each language has the same keys with translated values.

```typescript
export const translations = {
  en: {
    welcome: 'Welcome',
    login: 'Login',
    // ... more translations
  },
  es: {
    welcome: 'Bienvenido',
    login: 'Iniciar Sesión',
    // ... more translations
  },
  pt: {
    welcome: 'Bem-vindo',
    login: 'Entrar',
    // ... more translations
  },
};
```

### 2. Language Context
Location: `contexts/LanguageContext.tsx`

Provides language management functionality throughout the app:
- Detects device language on first launch
- Persists user's language preference
- Provides translation function `t()`
- Allows language switching

### 3. Language Settings Screen
Location: `app/(tabs)/language-settings.tsx`

User interface for selecting preferred language with:
- Visual language selector with flags
- Current language indicator
- Instant language switching

## Usage

### In Components

1. **Import the hook:**
```typescript
import { useLanguage } from '@/contexts/LanguageContext';
```

2. **Use the translation function:**
```typescript
export default function MyComponent() {
  const { t, locale } = useLanguage();
  
  return (
    <View>
      <Text>{t('welcome')}</Text>
      <Text>{t('yourMXIDashboard')}</Text>
    </View>
  );
}
```

### Adding New Translations

1. Open `constants/translations.ts`
2. Add the new key to all language objects:

```typescript
export const translations = {
  en: {
    // ... existing translations
    newKey: 'New English Text',
  },
  es: {
    // ... existing translations
    newKey: 'Nuevo Texto en Español',
  },
  pt: {
    // ... existing translations
    newKey: 'Novo Texto em Português',
  },
};
```

3. Use it in your component:
```typescript
<Text>{t('newKey')}</Text>
```

## Features

### Automatic Language Detection
On first app launch, the system:
1. Checks for saved language preference
2. If none exists, detects device language
3. Maps device language to supported languages
4. Defaults to English if device language is not supported

### Language Persistence
User's language choice is saved using AsyncStorage and persists across app sessions.

### Real-time Updates
When language is changed, all screens using the `t()` function automatically update to show the new language.

## Implementation Status

### ✅ Completed
- Translation infrastructure (i18n-js + expo-localization)
- Language context and provider
- Language settings screen
- Profile screen translations
- Device language detection
- Language persistence

### 🔄 To Be Implemented
To fully translate the app, add the `useLanguage` hook and replace hardcoded strings in:

- Home screen (`app/(tabs)/(home)/index.tsx`)
- Purchase screen (`app/(tabs)/purchase.tsx`)
- Vesting screen (`app/(tabs)/vesting.tsx`)
- Referrals screen (`app/(tabs)/referrals.tsx`)
- KYC screen (`app/(tabs)/kyc.tsx`)
- Messages screen (`app/(tabs)/messages.tsx`)
- Admin screens
- Auth screens (login, register, etc.)
- Game screens
- Tournament screens

### Example Implementation Pattern

For each screen:

1. **Import the hook:**
```typescript
import { useLanguage } from '@/contexts/LanguageContext';
```

2. **Get the translation function:**
```typescript
const { t } = useLanguage();
```

3. **Replace hardcoded strings:**
```typescript
// Before:
<Text>Welcome</Text>

// After:
<Text>{t('welcome')}</Text>
```

4. **For dynamic content:**
```typescript
// Before:
<Text>Welcome, {userName}!</Text>

// After:
<Text>{t('welcome')}, {userName}!</Text>
```

## Translation Keys Reference

See `constants/translations.ts` for the complete list of available translation keys.

### Common Keys
- `welcome`, `loading`, `error`, `success`
- `cancel`, `confirm`, `save`, `delete`, `edit`
- `back`, `next`, `submit`, `close`

### Auth Keys
- `login`, `register`, `logout`
- `email`, `password`, `confirmPassword`
- `forgotPassword`, `resetPassword`

### Home Screen Keys
- `yourMXIDashboard`, `mxiTokenLaunch`
- `totalMXIBalance`, `mxiPurchased`
- `referralCommissions`, `vestingRewards`

### Profile Keys
- `profile`, `accountInformation`
- `referralCode`, `identification`, `address`
- `editProfile`, `kycVerification`

## Best Practices

1. **Always use translation keys** instead of hardcoded strings
2. **Keep keys descriptive** and organized by feature
3. **Maintain consistency** across all three languages
4. **Test all languages** before releasing updates
5. **Use the same key** for the same concept across the app
6. **Add comments** for context when translations might be ambiguous

## Testing

To test different languages:
1. Go to Profile screen
2. Tap on "Language" / "Idioma" / "Idioma"
3. Select desired language
4. Navigate through the app to verify translations

## Future Enhancements

Potential improvements:
- Add more languages (French, German, Chinese, etc.)
- Implement RTL (Right-to-Left) support for Arabic/Hebrew
- Add date/time localization
- Add number formatting based on locale
- Implement pluralization rules
- Add translation management system for non-developers
