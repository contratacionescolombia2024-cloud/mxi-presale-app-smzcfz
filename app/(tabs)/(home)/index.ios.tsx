
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '@/contexts/AuthContext';
import { IconSymbol } from '@/components/IconSymbol';
import { useRouter } from 'expo-router';
import { colors, commonStyles } from '@/styles/commonStyles';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { usePreSale } from '@/contexts/PreSaleContext';
import React, { useEffect, useState } from 'react';
import { LinearGradient } from 'expo-linear-gradient';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 100,
  },
  header: {
    marginBottom: 24,
  },
  greeting: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  countdownCard: {
    marginBottom: 24,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
  },
  countdownGradient: {
    padding: 24,
    alignItems: 'center',
  },
  countdownTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 8,
    textAlign: 'center',
  },
  countdownSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 20,
    textAlign: 'center',
  },
  countdownContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
    marginBottom: 16,
  },
  countdownItem: {
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 12,
    minWidth: 70,
  },
  countdownNumber: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 4,
  },
  countdownLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    textTransform: 'uppercase',
    fontWeight: '600',
  },
  launchDate: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.accent,
    textAlign: 'center',
  },
  balanceCard: {
    ...commonStyles.card,
    marginBottom: 24,
    padding: 24,
  },
  balanceLabel: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 8,
  },
  balanceAmount: {
    fontSize: 36,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 16,
  },
  balanceBreakdown: {
    gap: 12,
  },
  balanceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  balanceRowLabel: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  balanceRowValue: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  stageCard: {
    ...commonStyles.card,
    marginBottom: 24,
    padding: 20,
  },
  stageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  stageTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
  },
  stageBadge: {
    backgroundColor: colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  stageBadgeText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#fff',
  },
  stageInfo: {
    gap: 12,
  },
  stageRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  stageLabel: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  stageValue: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  progressBar: {
    height: 8,
    backgroundColor: colors.border,
    borderRadius: 4,
    marginTop: 8,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 4,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 24,
  },
  actionCard: {
    ...commonStyles.card,
    flex: 1,
    minWidth: '47%',
    padding: 20,
    alignItems: 'center',
    gap: 12,
  },
  actionLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    textAlign: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default function HomeScreen() {
  const { currentStage, vestingData, referralStats, isLoading, refreshData } = usePreSale();
  const { user } = useAuth();
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);
  const [countdown, setCountdown] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  // Countdown to February 20, 2026
  useEffect(() => {
    const targetDate = new Date('2026-02-20T00:00:00').getTime();

    const updateCountdown = () => {
      const now = new Date().getTime();
      const distance = targetDate - now;

      if (distance > 0) {
        setCountdown({
          days: Math.floor(distance / (1000 * 60 * 60 * 24)),
          hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((distance % (1000 * 60)) / 1000),
        });
      } else {
        setCountdown({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      }
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);

    return () => clearInterval(interval);
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await refreshData();
    setRefreshing(false);
  };

  if (isLoading && !currentStage) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={{ color: colors.textSecondary, marginTop: 16 }}>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const totalMXI = (vestingData?.totalMXI || 0) + (referralStats?.totalMXIEarned || 0);
  const progress = currentStage ? (currentStage.soldMXI / currentStage.totalMXI) * 100 : 0;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
        }
      >
        <View style={styles.header}>
          <Text style={styles.greeting}>Welcome, {user?.name || 'User'}!</Text>
          <Text style={styles.subtitle}>Your MXI Dashboard</Text>
        </View>

        {/* Countdown Timer */}
        <View style={styles.countdownCard}>
          <LinearGradient
            colors={[colors.primary, colors.secondary]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.countdownGradient}
          >
            <Text style={styles.countdownTitle}>🚀 MXI Token Launch</Text>
            <Text style={styles.countdownSubtitle}>Countdown to Launch</Text>
            
            <View style={styles.countdownContainer}>
              <View style={styles.countdownItem}>
                <Text style={styles.countdownNumber}>{countdown.days}</Text>
                <Text style={styles.countdownLabel}>Days</Text>
              </View>
              <View style={styles.countdownItem}>
                <Text style={styles.countdownNumber}>{countdown.hours}</Text>
                <Text style={styles.countdownLabel}>Hours</Text>
              </View>
              <View style={styles.countdownItem}>
                <Text style={styles.countdownNumber}>{countdown.minutes}</Text>
                <Text style={styles.countdownLabel}>Min</Text>
              </View>
              <View style={styles.countdownItem}>
                <Text style={styles.countdownNumber}>{countdown.seconds}</Text>
                <Text style={styles.countdownLabel}>Sec</Text>
              </View>
            </View>

            <Text style={styles.launchDate}>February 20, 2026</Text>
          </LinearGradient>
        </View>

        <View style={styles.balanceCard}>
          <Text style={styles.balanceLabel}>Total MXI Balance</Text>
          <Text style={styles.balanceAmount}>{totalMXI.toFixed(2)} MXI</Text>
          
          <View style={styles.balanceBreakdown}>
            <View style={styles.balanceRow}>
              <Text style={styles.balanceRowLabel}>Purchased MXI</Text>
              <Text style={styles.balanceRowValue}>{(vestingData?.totalMXI || 0).toFixed(2)}</Text>
            </View>
            <View style={styles.balanceRow}>
              <Text style={styles.balanceRowLabel}>Referral MXI</Text>
              <Text style={styles.balanceRowValue}>{(referralStats?.totalMXIEarned || 0).toFixed(2)}</Text>
            </View>
            <View style={styles.balanceRow}>
              <Text style={styles.balanceRowLabel}>Vesting Rewards</Text>
              <Text style={styles.balanceRowValue}>{(vestingData?.currentRewards || 0).toFixed(4)}</Text>
            </View>
          </View>
        </View>

        {currentStage && (
          <View style={styles.stageCard}>
            <View style={styles.stageHeader}>
              <Text style={styles.stageTitle}>Current Pre-Sale Stage</Text>
              <View style={styles.stageBadge}>
                <Text style={styles.stageBadgeText}>Stage {currentStage.stage}</Text>
              </View>
            </View>
            
            <View style={styles.stageInfo}>
              <View style={styles.stageRow}>
                <Text style={styles.stageLabel}>Price per MXI</Text>
                <Text style={styles.stageValue}>${currentStage.price.toFixed(2)} USDT</Text>
              </View>
              <View style={styles.stageRow}>
                <Text style={styles.stageLabel}>Sold</Text>
                <Text style={styles.stageValue}>
                  {currentStage.soldMXI.toLocaleString()} / {currentStage.totalMXI.toLocaleString()}
                </Text>
              </View>
              <View style={styles.progressBar}>
                <View style={[styles.progressFill, { width: `${progress}%` }]} />
              </View>
            </View>
          </View>
        )}

        <View style={styles.actionsGrid}>
          <TouchableOpacity 
            style={styles.actionCard}
            onPress={() => router.push('/purchase')}
          >
            <IconSymbol 
              ios_icon_name="cart.fill" 
              android_material_icon_name="shopping_cart" 
              size={40} 
              color={colors.accent}
              type="hierarchical"
            />
            <Text style={styles.actionLabel}>Purchase MXI</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.actionCard}
            onPress={() => router.push('/vesting')}
          >
            <IconSymbol 
              ios_icon_name="chart.line.uptrend.xyaxis" 
              android_material_icon_name="trending_up" 
              size={40} 
              color={colors.success}
              type="hierarchical"
            />
            <Text style={styles.actionLabel}>Vesting</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.actionCard}
            onPress={() => router.push('/referrals')}
          >
            <IconSymbol 
              ios_icon_name="person.2.fill" 
              android_material_icon_name="people" 
              size={40} 
              color={colors.secondary}
              type="hierarchical"
            />
            <Text style={styles.actionLabel}>Referrals</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.actionCard}
            onPress={() => router.push('/kyc')}
          >
            <IconSymbol 
              ios_icon_name="checkmark.shield.fill" 
              android_material_icon_name="verified_user" 
              size={40} 
              color={colors.info}
              type="hierarchical"
            />
            <Text style={styles.actionLabel}>KYC Verification</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
