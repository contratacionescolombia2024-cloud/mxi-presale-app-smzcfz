
# i18n Quick Reference Guide

## Quick Start

### 1. Import Hook
```typescript
import { useLanguage } from '@/contexts/LanguageContext';
```

### 2. Use in Component
```typescript
const { t, locale, setLocale } = useLanguage();

// Translate text
<Text>{t('welcome')}</Text>

// Check current language
if (locale === 'es') { /* Spanish */ }

// Change language
await setLocale('pt');
```

## Common Translation Keys

### Navigation & Actions
```typescript
t('back')           // Back / Atrás / Voltar
t('next')           // Next / Siguiente / Próximo
t('cancel')         // Cancel / Cancelar / Cancelar
t('confirm')        // Confirm / Confirmar / Confirmar
t('save')           // Save / Guardar / Salvar
t('close')          // Close / Cerrar / Fechar
```

### Authentication
```typescript
t('login')          // Login / Iniciar Sesión / Entrar
t('register')       // Register / Registrarse / Registrar
t('email')          // Email / Correo Electrónico / E-mail
t('password')       // Password / Contraseña / Senha
t('welcomeBack')    // Welcome Back / Bienvenido de Nuevo / Bem-vindo de Volta
```

### Dashboard
```typescript
t('yourMXIDashboard')        // Your MXI Dashboard
t('totalMXIBalance')         // 💰 Total MXI Balance
t('mxiPurchased')            // 💎 MXI Purchased
t('referralCommissions')     // 🎁 Referral Commissions
t('vestingRewards')          // Vesting Rewards
t('tournamentWinnings')      // 🏆 Tournament Winnings
```

### Vesting
```typescript
t('vestingRewardsTitle')     // 📈 Vesting Rewards
t('currentRewards')          // Current Rewards (Real-Time)
t('purchasedMXIBase')        // Purchased MXI (Vesting Base)
t('monthlyRate')             // Monthly Rate
t('projectedEarnings')       // Projected Earnings
```

### Referrals
```typescript
t('referralProgram')         // Referral Program
t('totalReferralEarnings')   // Total Referral Earnings
t('unifyToBalance')          // Unify to Balance
t('viewTransferHistory')     // View Transfer History
t('commissionLevels')        // Commission Levels
```

### Purchase
```typescript
t('purchaseMXI')             // Purchase MXI
t('buyMXITokens')            // Buy MXI tokens at current stage price
t('selectPaymentMethod')     // 💳 Select Payment Method
t('completePurchase')        // Complete Purchase
t('youWillReceive')          // You will receive
```

### Status & Messages
```typescript
t('loading')        // Loading... / Cargando... / Carregando...
t('success')        // Success / Éxito / Sucesso
t('error')          // Error / Error / Erro
t('approved')       // Approved / Aprobado / Aprovado
t('pending')        // Pending / Pendiente / Pendente
t('verified')       // Verified / Verificado / Verificado
```

### Time Units
```typescript
t('days')           // Days / Días / Dias
t('hours')          // Hours / Horas / Horas
t('minutes')        // Min / Min / Min
t('seconds')        // Sec / Seg / Seg
t('sevenDays')      // 7 Days / 7 Días / 7 Dias
t('fifteenDays')    // 15 Days / 15 Días / 15 Dias
t('thirtyDays')     // 30 Days / 30 Días / 30 Dias
```

## Language Codes

```typescript
'en' // English 🇺🇸
'es' // Spanish 🇪🇸 (Español)
'pt' // Portuguese 🇧🇷 (Português)
```

## Checking Current Language

```typescript
const { locale } = useLanguage();

// Simple check
if (locale === 'es') {
  // Spanish-specific code
}

// Switch statement
switch (locale) {
  case 'en':
    // English
    break;
  case 'es':
    // Spanish
    break;
  case 'pt':
    // Portuguese
    break;
}
```

## Changing Language Programmatically

```typescript
const { setLocale } = useLanguage();

// Change to Spanish
await setLocale('es');

// Change to Portuguese
await setLocale('pt');

// Change to English
await setLocale('en');
```

## Loading State

```typescript
const { isLoading } = useLanguage();

if (isLoading) {
  return <ActivityIndicator />;
}
```

## Example Component

```typescript
import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useLanguage } from '@/contexts/LanguageContext';

export default function MyComponent() {
  const { t, locale, setLocale } = useLanguage();

  return (
    <View>
      <Text>{t('welcome')}</Text>
      <Text>{t('yourMXIDashboard')}</Text>
      
      <TouchableOpacity onPress={() => setLocale('es')}>
        <Text>{t('spanish')}</Text>
      </TouchableOpacity>
      
      <TouchableOpacity onPress={() => setLocale('pt')}>
        <Text>{t('portuguese')}</Text>
      </TouchableOpacity>
      
      <TouchableOpacity onPress={() => setLocale('en')}>
        <Text>{t('english')}</Text>
      </TouchableOpacity>
    </View>
  );
}
```

## Adding New Translations

1. **Add to `constants/translations.ts`:**

```typescript
en: {
  myNewKey: 'My New Text',
}
es: {
  myNewKey: 'Mi Nuevo Texto',
}
pt: {
  myNewKey: 'Meu Novo Texto',
}
```

2. **Use in component:**

```typescript
<Text>{t('myNewKey')}</Text>
```

## Tips

- ✅ Always add translations for all 3 languages
- ✅ Use descriptive key names
- ✅ Test with all languages
- ✅ Keep translations in sync
- ❌ Don't hardcode user-facing text
- ❌ Don't use translation keys as display text

## Troubleshooting

### Text not translating?
- Check key exists in all language objects
- Verify you're using `t('key')` not `'key'`
- Check for typos

### Language not persisting?
- Check AsyncStorage permissions
- Verify LanguageContext wrapper
- Clear app data and retry

### Wrong language on launch?
- Check device language settings
- Verify detection logic
- Test with different device languages

---

**Quick Access:** Settings → Language Settings
**Default Language:** English (auto-detected from device)
**Supported:** English, Spanish, Portuguese
