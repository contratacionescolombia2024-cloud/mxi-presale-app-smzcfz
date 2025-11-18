
# i18n Integration Examples

This guide shows how to integrate translations into existing screens.

## Example 1: Simple Text Translation

### Before (Hardcoded)
```typescript
<Text style={styles.title}>Welcome to MXI</Text>
<Text style={styles.subtitle}>Your Dashboard</Text>
```

### After (Translated)
```typescript
import { useLanguage } from '@/contexts/LanguageContext';

const { t } = useLanguage();

<Text style={styles.title}>{t('welcome')}</Text>
<Text style={styles.subtitle}>{t('yourMXIDashboard')}</Text>
```

## Example 2: Button Labels

### Before
```typescript
<TouchableOpacity onPress={handleSave}>
  <Text>Save Changes</Text>
</TouchableOpacity>

<TouchableOpacity onPress={handleCancel}>
  <Text>Cancel</Text>
</TouchableOpacity>
```

### After
```typescript
const { t } = useLanguage();

<TouchableOpacity onPress={handleSave}>
  <Text>{t('save')}</Text>
</TouchableOpacity>

<TouchableOpacity onPress={handleCancel}>
  <Text>{t('cancel')}</Text>
</TouchableOpacity>
```

## Example 3: Alert Messages

### Before
```typescript
Alert.alert(
  'Success',
  'Your purchase was completed successfully',
  [{ text: 'OK' }]
);
```

### After
```typescript
const { t } = useLanguage();

Alert.alert(
  t('success'),
  t('purchaseInitiated'),
  [{ text: t('ok') }]
);
```

## Example 4: Form Labels

### Before
```typescript
<View>
  <Text>Email Address</Text>
  <TextInput placeholder="Enter your email" />
  
  <Text>Password</Text>
  <TextInput placeholder="Enter your password" secureTextEntry />
</View>
```

### After
```typescript
const { t } = useLanguage();

<View>
  <Text>{t('email')}</Text>
  <TextInput placeholder={t('enterEmail')} />
  
  <Text>{t('password')}</Text>
  <TextInput placeholder={t('enterPassword')} secureTextEntry />
</View>
```

## Example 5: Status Messages

### Before
```typescript
const getStatusText = (status: string) => {
  switch (status) {
    case 'approved': return 'Approved';
    case 'pending': return 'Pending';
    case 'rejected': return 'Rejected';
    default: return 'Unknown';
  }
};
```

### After
```typescript
const { t } = useLanguage();

const getStatusText = (status: string) => {
  switch (status) {
    case 'approved': return t('approved');
    case 'pending': return t('pending');
    case 'rejected': return t('rejected');
    default: return t('error');
  }
};
```

## Example 6: List Items

### Before
```typescript
const levels = [
  { level: 1, label: 'Level 1', commission: '5%' },
  { level: 2, label: 'Level 2', commission: '2%' },
  { level: 3, label: 'Level 3', commission: '1%' },
];

{levels.map((item) => (
  <View key={item.level}>
    <Text>{item.label}</Text>
    <Text>Commission Rate: {item.commission}</Text>
  </View>
))}
```

### After
```typescript
const { t } = useLanguage();

const levels = [
  { level: 1, commission: '5%' },
  { level: 2, commission: '2%' },
  { level: 3, commission: '1%' },
];

{levels.map((item) => (
  <View key={item.level}>
    <Text>{t('level')} {item.level}</Text>
    <Text>{t('commissionRate')}: {item.commission}</Text>
  </View>
))}
```

## Example 7: Conditional Text

### Before
```typescript
<Text>
  {isVerified ? 'Verified' : 'Not Verified'}
</Text>
```

### After
```typescript
const { t } = useLanguage();

<Text>
  {isVerified ? t('verified') : t('notVerified')}
</Text>
```

## Example 8: Info Cards

### Before
```typescript
<View style={styles.infoCard}>
  <Text style={styles.infoTitle}>How It Works</Text>
  <Text style={styles.infoText}>
    - Earn 3% monthly on your purchased MXI{'\n'}
    - Rewards calculated per second{'\n'}
    - Updates in real-time
  </Text>
</View>
```

### After
```typescript
const { t } = useLanguage();

<View style={styles.infoCard}>
  <Text style={styles.infoTitle}>{t('howVestingWorks')}</Text>
  <Text style={styles.infoText}>
    {t('vestingInfo1')}{'\n'}
    {t('vestingInfo3')}{'\n'}
    {t('vestingInfo4')}
  </Text>
</View>
```

## Example 9: Navigation Titles

### Before
```typescript
// In _layout.tsx or navigation config
<Stack.Screen 
  name="purchase" 
  options={{ title: 'Purchase MXI' }} 
/>
```

### After
```typescript
import { useLanguage } from '@/contexts/LanguageContext';

const { t } = useLanguage();

<Stack.Screen 
  name="purchase" 
  options={{ title: t('purchaseMXI') }} 
/>
```

## Example 10: Error Messages

### Before
```typescript
try {
  await purchaseMXI(amount);
} catch (error) {
  Alert.alert('Purchase Failed', 'Please try again.');
}
```

### After
```typescript
const { t } = useLanguage();

try {
  await purchaseMXI(amount);
} catch (error) {
  Alert.alert(t('purchaseFailed'), t('pleaseTryAgain'));
}
```

## Example 11: Loading States

### Before
```typescript
{isLoading ? (
  <View>
    <ActivityIndicator />
    <Text>Loading...</Text>
  </View>
) : (
  <Content />
)}
```

### After
```typescript
const { t } = useLanguage();

{isLoading ? (
  <View>
    <ActivityIndicator />
    <Text>{t('loading')}</Text>
  </View>
) : (
  <Content />
)}
```

## Example 12: Date Formatting (Future Enhancement)

### Current Approach
```typescript
<Text>{new Date().toLocaleDateString()}</Text>
```

### Future with Locale Support
```typescript
const { locale } = useLanguage();

<Text>
  {new Date().toLocaleDateString(locale === 'pt' ? 'pt-BR' : locale === 'es' ? 'es-ES' : 'en-US')}
</Text>
```

## Complete Screen Example

### Before
```typescript
export default function VestingScreen() {
  return (
    <View>
      <Text style={styles.title}>Vesting Rewards</Text>
      <Text style={styles.subtitle}>3% Monthly Returns</Text>
      
      <View style={styles.card}>
        <Text>Current Rewards</Text>
        <Text>{rewards} MXI</Text>
      </View>
      
      <TouchableOpacity onPress={handleRefresh}>
        <Text>Refresh</Text>
      </TouchableOpacity>
    </View>
  );
}
```

### After
```typescript
import { useLanguage } from '@/contexts/LanguageContext';

export default function VestingScreen() {
  const { t } = useLanguage();
  
  return (
    <View>
      <Text style={styles.title}>{t('vestingRewardsTitle')}</Text>
      <Text style={styles.subtitle}>{t('monthlyReturns')}</Text>
      
      <View style={styles.card}>
        <Text>{t('currentRewards')}</Text>
        <Text>{rewards} MXI</Text>
      </View>
      
      <TouchableOpacity onPress={handleRefresh}>
        <Text>{t('refresh')}</Text>
      </TouchableOpacity>
    </View>
  );
}
```

## Best Practices Summary

1. **Import once at component level**
   ```typescript
   const { t, locale } = useLanguage();
   ```

2. **Use for ALL user-facing text**
   - Titles, labels, buttons
   - Error messages, alerts
   - Placeholders, tooltips
   - Status messages

3. **Don't translate**
   - API endpoints
   - Database field names
   - Code comments
   - Console logs (optional)

4. **Test thoroughly**
   - Switch between all languages
   - Check text overflow
   - Verify special characters
   - Test on different devices

5. **Keep organized**
   - Group related translations
   - Use descriptive key names
   - Maintain consistency
   - Document new keys

---

**Need Help?** Check the main i18n documentation or quick reference guide.
