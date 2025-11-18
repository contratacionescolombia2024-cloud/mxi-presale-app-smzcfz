
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useLanguage } from '@/contexts/LanguageContext';
import { IconSymbol } from '@/components/IconSymbol';
import { colors } from '@/styles/commonStyles';

const styles = StyleSheet.create({
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
  },
  subtitle: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  countdownCard: {
    backgroundColor: colors.card,
    padding: 20,
    borderRadius: 16,
  },
  countdownTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
  },
  countdownSubtitle: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  countdownContainer: {
    flexDirection: 'row',
    gap: 10,
  },
  countdownItem: {
    alignItems: 'center',
  },
  countdownNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
  },
  countdownLabel: {
    fontSize: 10,
    color: colors.textSecondary,
  },
  balanceCard: {
    backgroundColor: colors.card,
    padding: 20,
    borderRadius: 16,
  },
  balanceLabel: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  balanceAmount: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.text,
  },
  balanceBreakdown: {
    gap: 8,
  },
  balanceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  balanceRowLabel: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  balanceRowValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.text,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  actionCard: {
    flex: 1,
    minWidth: '47%',
    padding: 16,
    borderRadius: 14,
    alignItems: 'center',
  },
  actionLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.text,
  },
});

// This is an EXAMPLE file showing how to use translations in the home screen
// To apply these changes, you would need to:
// 1. Import useLanguage hook
// 2. Replace hardcoded strings with t() function calls

// In the component:
export default function HomeScreen() {
  const { t } = useLanguage();
  // ... other hooks

  const user = { name: 'User' };
  const countdown = { days: 0, hours: 0, minutes: 0, seconds: 0 };
  const totalMXI = 0;
  const purchasedMXI = 0;
  const referralMXI = 0;
  const referralStats = { totalReferrals: 0, level1Count: 0, level1MXI: 0 };

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
          style={styles.actionCard}
          onPress={() => console.log('Purchase')}
        >
          <IconSymbol ios_icon_name="cart.fill" android_material_icon_name="shopping_cart" size={32} color={colors.accent} />
          <Text style={styles.actionLabel}>{t('purchaseMXI')}</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.actionCard}
          onPress={() => console.log('Vesting')}
        >
          <IconSymbol ios_icon_name="chart.line.uptrend.xyaxis" android_material_icon_name="trending_up" size={32} color={colors.success} />
          <Text style={styles.actionLabel}>{t('vesting')}</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.actionCard}
          onPress={() => console.log('Referrals')}
        >
          <IconSymbol ios_icon_name="person.3.fill" android_material_icon_name="people" size={32} color={colors.highlight} />
          <Text style={styles.actionLabel}>{t('referrals')}</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.actionCard}
          onPress={() => console.log('KYC')}
        >
          <IconSymbol ios_icon_name="checkmark.shield.fill" android_material_icon_name="verified_user" size={32} color="#14B8A6" />
          <Text style={styles.actionLabel}>{t('kycVerification')}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
