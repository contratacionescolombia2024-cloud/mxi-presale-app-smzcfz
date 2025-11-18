
// This is an EXAMPLE file showing how to use translations in the home screen
// To apply these changes, you would need to:
// 1. Import useLanguage hook
// 2. Replace hardcoded strings with t() function calls

import { useLanguage } from '@/contexts/LanguageContext';

// In the component:
export default function HomeScreen() {
  const { t } = useLanguage();
  // ... other hooks

  return (
    // ... JSX with translations
    <View>
      <Text style={styles.greeting}>{t('welcome')}, {user?.name || 'User'}!</Text>
      <Text style={styles.subtitle}>{t('yourMXIDashboard')}</Text>
      
      {/* Token Launch Countdown */}
      <View style={styles.countdownCard}>
        <Text style={styles.countdownTitle}>{t('mxiTokenLaunch')}</Text>
        <Text style={styles.countdownSubtitle}>{t('countdownToLaunch')}</Text>
        
        <View style={styles.countdownContainer}>
          <View style={styles.countdownItem}>
            <Text style={styles.countdownNumber}>{countdown.days}</Text>
            <Text style={styles.countdownLabel}>{t('days')}</Text>
          </View>
          <View style={styles.countdownItem}>
            <Text style={styles.countdownNumber}>{countdown.hours}</Text>
            <Text style={styles.countdownLabel}>{t('hours')}</Text>
          </View>
          <View style={styles.countdownItem}>
            <Text style={styles.countdownNumber}>{countdown.minutes}</Text>
            <Text style={styles.countdownLabel}>{t('minutes')}</Text>
          </View>
          <View style={styles.countdownItem}>
            <Text style={styles.countdownNumber}>{countdown.seconds}</Text>
            <Text style={styles.countdownLabel}>{t('seconds')}</Text>
          </View>
        </View>
      </View>

      {/* Balance Card */}
      <View style={styles.balanceCard}>
        <Text style={styles.balanceLabel}>{t('totalMXIBalance')}</Text>
        <Text style={styles.balanceAmount}>{totalMXI.toFixed(2)} MXI</Text>
        
        <View style={styles.balanceBreakdown}>
          <View style={styles.balanceRow}>
            <Text style={styles.balanceRowLabel}>{t('mxiPurchased')}</Text>
            <Text style={styles.balanceRowValue}>{purchasedMXI.toFixed(2)} MXI</Text>
          </View>
          
          <View style={styles.balanceRow}>
            <Text style={styles.balanceRowLabel}>{t('referralCommissions')}</Text>
            <Text style={styles.balanceRowValue}>{referralMXI.toFixed(2)} MXI</Text>
          </View>

          <View style={styles.balanceRow}>
            <Text style={styles.balanceRowLabel}>{t('totalReferrals')}</Text>
            <Text style={styles.balanceRowValue}>{referralStats?.totalReferrals || 0}</Text>
          </View>

          <View style={styles.balanceRow}>
            <Text style={styles.balanceRowLabel}>
              • {t('level')} 1 ({referralStats?.level1Count || 0} {t('refs')})
            </Text>
            <Text style={styles.balanceRowValue}>
              {(referralStats?.level1MXI || 0).toFixed(2)} MXI
            </Text>
          </View>
        </View>
      </View>

      {/* Action Cards */}
      <View style={styles.actionsGrid}>
        <TouchableOpacity 
          style={[styles.actionCard, styles.actionCardPurchase]}
          onPress={() => router.push('/purchase')}
        >
          <IconSymbol name={ICONS.SHOPPING_CART} size={32} color={colors.accent} />
          <Text style={styles.actionLabel}>{t('purchaseMXI')}</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.actionCard, styles.actionCardVesting]}
          onPress={() => router.push('/vesting')}
        >
          <IconSymbol name={ICONS.TRENDING_UP} size={32} color={colors.success} />
          <Text style={styles.actionLabel}>{t('vesting')}</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.actionCard, styles.actionCardReferrals]}
          onPress={() => router.push('/referrals')}
        >
          <IconSymbol name={ICONS.PEOPLE} size={32} color={colors.highlight} />
          <Text style={styles.actionLabel}>{t('referrals')}</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.actionCard, styles.actionCardKYC]}
          onPress={() => router.push('/kyc')}
        >
          <IconSymbol name={ICONS.VERIFIED_USER} size={32} color="#14B8A6" />
          <Text style={styles.actionLabel}>{t('kycVerification')}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
