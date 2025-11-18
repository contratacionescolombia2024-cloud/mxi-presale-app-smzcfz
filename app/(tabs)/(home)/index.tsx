
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Platform,
  Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import { usePreSale } from '@/contexts/PreSaleContext';
import { IconSymbol } from '@/components/IconSymbol';
import { ICONS } from '@/constants/AppIcons';
import React, { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { colors, commonStyles } from '@/styles/commonStyles';
import { SafeAreaView } from 'react-native-safe-area-context';
import AppFooter from '@/components/AppFooter';
import { supabase } from '@/app/integrations/supabase/client';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    padding: 16,
    paddingTop: Platform.OS === 'android' ? 48 : 16,
    paddingBottom: 100,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    position: 'relative',
  },
  logoContainer: {
    alignItems: 'center',
  },
  logo: {
    width: 120,
    height: 48,
    resizeMode: 'contain',
  },
  languageButton: {
    position: 'absolute',
    right: 0,
    top: 0,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.card,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.primary,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
    zIndex: 1000,
  },
  languageButtonText: {
    fontSize: 18,
  },
  header: {
    marginBottom: 16,
  },
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  countdownCard: {
    backgroundColor: colors.card,
    marginBottom: 16,
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#D97706',
    shadowColor: '#D97706',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 10,
    overflow: 'hidden',
  },
  countdownHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  rocketIcon: {
    fontSize: 24,
  },
  countdownTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.text,
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  countdownSubtitle: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 16,
    textAlign: 'center',
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  countdownContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 10,
    marginBottom: 14,
    width: '100%',
  },
  countdownItem: {
    alignItems: 'center',
    backgroundColor: colors.background,
    borderRadius: 12,
    padding: 10,
    flex: 1,
    maxWidth: 70,
    borderWidth: 2,
    borderColor: '#D97706',
    shadowColor: '#D97706',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 5,
  },
  countdownNumber: {
    fontSize: 22,
    fontWeight: '900',
    color: '#D97706',
    marginBottom: 4,
    textShadowColor: 'rgba(217, 119, 6, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  countdownLabel: {
    fontSize: 9,
    color: colors.textSecondary,
    textTransform: 'uppercase',
    fontWeight: '700',
    letterSpacing: 0.8,
  },
  launchDateContainer: {
    backgroundColor: 'rgba(217, 119, 6, 0.15)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: 'rgba(217, 119, 6, 0.3)',
  },
  launchDate: {
    fontSize: 13,
    fontWeight: '700',
    color: '#D97706',
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  balanceCard: {
    backgroundColor: colors.sectionGreen,
    borderRadius: 16,
    padding: 18,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: 'rgba(16, 185, 129, 0.4)',
  },
  balanceLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 6,
    fontWeight: '500',
  },
  balanceAmount: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.secondary,
    marginBottom: 12,
  },
  balanceBreakdown: {
    gap: 8,
  },
  balanceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  balanceRowLabel: {
    fontSize: 13,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  balanceRowValue: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(16, 185, 129, 0.3)',
    marginVertical: 6,
  },
  vestingCard: {
    backgroundColor: colors.sectionPurple,
    borderRadius: 16,
    padding: 18,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: 'rgba(139, 92, 246, 0.4)',
  },
  vestingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  vestingTitle: {
    fontSize: 17,
    fontWeight: 'bold',
    color: colors.text,
  },
  vestingBadge: {
    backgroundColor: colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
  vestingBadgeText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#fff',
  },
  vestingMetrics: {
    gap: 12,
  },
  vestingRewardsContainer: {
    backgroundColor: 'rgba(139, 92, 246, 0.15)',
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.3)',
  },
  vestingRewardsLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 6,
    fontWeight: '500',
  },
  vestingRewardsAmount: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 4,
  },
  vestingRewardsUpdate: {
    fontSize: 10,
    color: colors.textSecondary,
    fontStyle: 'italic',
  },
  vestingNote: {
    fontSize: 10,
    color: colors.primary,
    fontStyle: 'italic',
    marginTop: 4,
  },
  metricRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  metricLabel: {
    fontSize: 13,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  metricValue: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text,
  },
  projectionsContainer: {
    marginTop: 6,
    gap: 6,
  },
  projectionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 10,
    backgroundColor: 'rgba(139, 92, 246, 0.1)',
    borderRadius: 6,
  },
  projectionLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  projectionValue: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.primary,
  },
  phaseCountersContainer: {
    marginBottom: 16,
    gap: 12,
  },
  salesStatusCard: {
    backgroundColor: colors.sectionBlue,
    borderRadius: 16,
    padding: 18,
    borderWidth: 2,
    borderColor: 'rgba(59, 130, 246, 0.4)',
  },
  salesStatusHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  salesStatusTitle: {
    fontSize: 17,
    fontWeight: 'bold',
    color: colors.text,
  },
  phaseBadge: {
    backgroundColor: colors.info,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    shadowColor: colors.info,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
  phaseBadgeText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#fff',
  },
  salesMetrics: {
    gap: 12,
  },
  progressBarContainer: {
    marginTop: 6,
  },
  progressBar: {
    height: 8,
    backgroundColor: 'rgba(59, 130, 246, 0.2)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.info,
    borderRadius: 4,
  },
  progressText: {
    fontSize: 11,
    color: colors.info,
    fontWeight: '600',
    marginTop: 4,
    textAlign: 'right',
  },
  phaseCountdownContainer: {
    backgroundColor: 'rgba(59, 130, 246, 0.15)',
    borderRadius: 12,
    padding: 12,
    marginTop: 6,
    borderWidth: 1.5,
    borderColor: 'rgba(59, 130, 246, 0.3)',
  },
  phaseCountdownTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 10,
    textAlign: 'center',
    letterSpacing: 0.3,
  },
  phaseCountdownGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    gap: 6,
  },
  phaseCountdownItem: {
    alignItems: 'center',
    backgroundColor: colors.background,
    borderRadius: 10,
    padding: 8,
    flex: 1,
    borderWidth: 1.5,
    borderColor: 'rgba(59, 130, 246, 0.4)',
  },
  phaseCountdownNumber: {
    fontSize: 18,
    fontWeight: '900',
    color: colors.info,
    marginBottom: 3,
  },
  phaseCountdownLabel: {
    fontSize: 9,
    color: colors.textSecondary,
    textTransform: 'uppercase',
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  globalVestingCard: {
    backgroundColor: colors.sectionPink,
    borderRadius: 16,
    padding: 18,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: 'rgba(236, 72, 153, 0.4)',
  },
  globalVestingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  globalVestingTitle: {
    fontSize: 17,
    fontWeight: 'bold',
    color: colors.text,
  },
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(236, 72, 153, 0.2)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#4ade80',
  },
  liveBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.text,
  },
  globalMetricsGrid: {
    gap: 10,
  },
  globalMetricRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(236, 72, 153, 0.1)',
    padding: 12,
    borderRadius: 10,
  },
  globalMetricLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  globalMetricValue: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.highlight,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 16,
  },
  actionCard: {
    flex: 1,
    minWidth: '47%',
    borderRadius: 14,
    padding: 16,
    alignItems: 'center',
    gap: 10,
    borderWidth: 2,
  },
  actionCardPurchase: {
    backgroundColor: colors.sectionOrange,
    borderColor: 'rgba(245, 158, 11, 0.4)',
  },
  actionCardVesting: {
    backgroundColor: colors.sectionGreen,
    borderColor: 'rgba(16, 185, 129, 0.4)',
  },
  actionCardReferrals: {
    backgroundColor: colors.sectionPink,
    borderColor: 'rgba(236, 72, 153, 0.4)',
  },
  actionCardKYC: {
    backgroundColor: colors.sectionTeal,
    borderColor: 'rgba(20, 184, 166, 0.4)',
  },
  actionLabel: {
    fontSize: 12,
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

interface GlobalMetrics {
  totalMXIInDistribution: number;
  totalUsersEarning: number;
  globalVestingRewards: number;
  totalPurchasedMXI: number;
}

const languageFlags: Record<string, string> = {
  en: '🇺🇸',
  es: '🇪🇸',
  pt: '🇧🇷',
};

export default function HomeScreen() {
  const { currentStage, vestingData, referralStats, isLoading, refreshData } = usePreSale();
  const { user } = useAuth();
  const { t, locale } = useLanguage();
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);
  const [globalMetrics, setGlobalMetrics] = useState<GlobalMetrics | null>(null);
  const [countdown, setCountdown] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });
  const [phaseCountdown, setPhaseCountdown] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  // Load global metrics
  const loadGlobalMetrics = useCallback(async () => {
    try {
      const { data: vestingRecords, error: vestingError } = await supabase
        .from('vesting')
        .select('total_mxi, purchased_mxi, current_rewards');

      if (vestingError) {
        console.error('Error loading global vesting:', vestingError);
        return;
      }

      const totalMXIInDistribution = vestingRecords?.reduce((sum, record) => 
        sum + (parseFloat(record.total_mxi?.toString() || '0')), 0) || 0;
      
      const totalPurchasedMXI = vestingRecords?.reduce((sum, record) => 
        sum + (parseFloat(record.purchased_mxi?.toString() || '0')), 0) || 0;
      
      const globalVestingRewards = vestingRecords?.reduce((sum, record) => 
        sum + (parseFloat(record.current_rewards?.toString() || '0')), 0) || 0;

      const totalUsersEarning = vestingRecords?.filter(record => 
        parseFloat(record.purchased_mxi?.toString() || '0') > 0).length || 0;

      setGlobalMetrics({
        totalMXIInDistribution,
        totalUsersEarning,
        globalVestingRewards,
        totalPurchasedMXI,
      });
    } catch (error) {
      console.error('Failed to load global metrics:', error);
    }
  }, []);

  // Real-time subscription for global metrics
  useEffect(() => {
    loadGlobalMetrics();

    const vestingSubscription = supabase
      .channel('global-vesting-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'vesting',
        },
        () => {
          loadGlobalMetrics();
        }
      )
      .subscribe();

    const stageSubscription = supabase
      .channel('presale-stage-changes')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'presale_stages',
        },
        () => {
          refreshData();
        }
      )
      .subscribe();

    return () => {
      vestingSubscription.unsubscribe();
      stageSubscription.unsubscribe();
    };
  }, [loadGlobalMetrics, refreshData]);

  // Real-time update for global vesting rewards (every second)
  useEffect(() => {
    if (!globalMetrics?.totalPurchasedMXI) return;

    const interval = setInterval(() => {
      setGlobalMetrics((prev) => {
        if (!prev) return null;

        const monthlyRate = 0.03;
        const secondlyRate = monthlyRate / (30 * 24 * 60 * 60);
        const increment = prev.totalPurchasedMXI * secondlyRate;

        return {
          ...prev,
          globalVestingRewards: prev.globalVestingRewards + increment,
        };
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [globalMetrics?.totalPurchasedMXI]);

  // Countdown to February 20, 2026 (Token Launch)
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

  // Countdown to current phase end
  useEffect(() => {
    if (!currentStage?.endDate) return;

    const targetDate = new Date(currentStage.endDate).getTime();

    const updatePhaseCountdown = () => {
      const now = new Date().getTime();
      const distance = targetDate - now;

      if (distance > 0) {
        setPhaseCountdown({
          days: Math.floor(distance / (1000 * 60 * 60 * 24)),
          hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((distance % (1000 * 60)) / 1000),
        });
      } else {
        setPhaseCountdown({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      }
    };

    updatePhaseCountdown();
    const interval = setInterval(updatePhaseCountdown, 1000);

    return () => clearInterval(interval);
  }, [currentStage?.endDate]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refreshData();
    await loadGlobalMetrics();
    setRefreshing(false);
  }, [refreshData, loadGlobalMetrics]);

  if (isLoading && !currentStage) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={{ color: colors.textSecondary, marginTop: 16 }}>{t('loading')}</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Calculate MXI breakdown
  const totalMXI = vestingData?.totalMXI || 0;
  const purchasedMXI = vestingData?.purchasedMXI || 0;
  const referralMXI = referralStats?.totalMXIEarned || 0;
  const vestingRewards = vestingData?.currentRewards || 0;
  const tournamentsBalance = vestingData?.tournamentsBalance || 0;
  const commissionBalance = vestingData?.commissionBalance || 0;
  
  // Calculate progress based on TOTAL MXI IN DISTRIBUTION (from all users)
  const totalMXIAvailable = 25000000;
  const totalDistributed = globalMetrics?.totalMXIInDistribution || 0;
  const progress = (totalDistributed / totalMXIAvailable) * 100;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
        }
      >
        <View style={styles.topBar}>
          <View style={styles.logoContainer}>
            <Image
              source={require('@/assets/images/842fdc6d-790f-4b06-a0ae-10c12b6f2fb0.png')}
              style={styles.logo}
            />
          </View>
          <TouchableOpacity 
            style={styles.languageButton}
            onPress={() => router.push('/language-settings')}
          >
            <Text style={styles.languageButtonText}>{languageFlags[locale]}</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.header}>
          <Text style={styles.greeting}>{t('welcome')}, {user?.name || 'User'}!</Text>
          <Text style={styles.subtitle}>{t('yourMXIDashboard')}</Text>
        </View>

        {/* Token Launch Countdown */}
        <View style={styles.countdownCard}>
          <View style={styles.countdownHeader}>
            <Text style={styles.rocketIcon}>🚀</Text>
            <Text style={styles.countdownTitle}>{t('mxiTokenLaunch')}</Text>
          </View>
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

          <View style={styles.launchDateContainer}>
            <Text style={styles.launchDate}>📅 February 20, 2026</Text>
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

            <View style={styles.divider} />
            
            <View style={styles.balanceRow}>
              <Text style={styles.balanceRowLabel}>{t('totalReferrals')}</Text>
              <Text style={styles.balanceRowValue}>{referralStats?.totalReferrals || 0}</Text>
            </View>

            <View style={styles.balanceRow}>
              <Text style={styles.balanceRowLabel}>• {t('level')} 1 ({referralStats?.level1Count || 0} {t('refs')})</Text>
              <Text style={styles.balanceRowValue}>
                {(referralStats?.level1MXI || 0).toFixed(2)} MXI
              </Text>
            </View>

            <View style={styles.balanceRow}>
              <Text style={styles.balanceRowLabel}>• {t('level')} 2 ({referralStats?.level2Count || 0} {t('refs')})</Text>
              <Text style={styles.balanceRowValue}>
                {(referralStats?.level2MXI || 0).toFixed(2)} MXI
              </Text>
            </View>

            <View style={styles.balanceRow}>
              <Text style={styles.balanceRowLabel}>• {t('level')} 3 ({referralStats?.level3Count || 0} {t('refs')})</Text>
              <Text style={styles.balanceRowValue}>
                {(referralStats?.level3MXI || 0).toFixed(2)} MXI
              </Text>
            </View>

            <View style={styles.divider} />

            <View style={styles.balanceRow}>
              <Text style={[styles.balanceRowLabel, { fontWeight: '700', color: colors.text }]}>
                {t('tournamentWinnings')}
              </Text>
              <Text style={[styles.balanceRowValue, { color: colors.accent, fontSize: 15 }]}>
                {tournamentsBalance.toFixed(2)} MXI
              </Text>
            </View>

            <View style={styles.balanceRow}>
              <Text style={[styles.balanceRowLabel, { fontWeight: '700', color: colors.text }]}>
                {t('commissionsAvailable')}
              </Text>
              <Text style={[styles.balanceRowValue, { color: colors.secondary, fontSize: 15 }]}>
                {commissionBalance.toFixed(2)} MXI
              </Text>
            </View>

            <View style={styles.divider} />

            <View style={styles.balanceRow}>
              <Text style={styles.balanceRowLabel}>{t('vestingRewards')}</Text>
              <Text style={styles.balanceRowValue}>{vestingRewards.toFixed(4)} MXI</Text>
            </View>
          </View>
        </View>

        {/* Vesting Display */}
        <View style={styles.vestingCard}>
          <View style={styles.vestingHeader}>
            <Text style={styles.vestingTitle}>{t('vestingRewardsTitle')}</Text>
            <View style={styles.vestingBadge}>
              <Text style={styles.vestingBadgeText}>{t('live')}</Text>
            </View>
          </View>
          
          <View style={styles.vestingMetrics}>
            <View style={styles.vestingRewardsContainer}>
              <Text style={styles.vestingRewardsLabel}>{t('currentRewards')}</Text>
              <Text style={styles.vestingRewardsAmount}>
                {vestingRewards.toFixed(6)} MXI
              </Text>
              <Text style={styles.vestingRewardsUpdate}>
                {t('updatingEverySecond')}
              </Text>
              <Text style={styles.vestingNote}>
                {t('calculatedOnPurchased')}
              </Text>
            </View>

            <View style={styles.metricRow}>
              <Text style={styles.metricLabel}>{t('purchasedMXIBase')}</Text>
              <Text style={styles.metricValue}>{purchasedMXI.toFixed(2)} MXI</Text>
            </View>

            <View style={styles.metricRow}>
              <Text style={styles.metricLabel}>{t('monthlyRate')}</Text>
              <Text style={styles.metricValue}>{((vestingData?.monthlyRate || 0.03) * 100).toFixed(1)}%</Text>
            </View>

            <View style={styles.projectionsContainer}>
              <Text style={[styles.metricLabel, { marginBottom: 6 }]}>{t('projectedEarnings')}</Text>
              
              <View style={styles.projectionRow}>
                <Text style={styles.projectionLabel}>{t('sevenDays')}</Text>
                <Text style={styles.projectionValue}>
                  +{(vestingData?.projections?.days7 || 0).toFixed(4)} MXI
                </Text>
              </View>

              <View style={styles.projectionRow}>
                <Text style={styles.projectionLabel}>{t('fifteenDays')}</Text>
                <Text style={styles.projectionValue}>
                  +{(vestingData?.projections?.days15 || 0).toFixed(4)} MXI
                </Text>
              </View>

              <View style={styles.projectionRow}>
                <Text style={styles.projectionLabel}>{t('thirtyDays')}</Text>
                <Text style={styles.projectionValue}>
                  +{(vestingData?.projections?.days30 || 0).toFixed(4)} MXI
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Current Phase Status */}
        <View style={styles.phaseCountersContainer}>
          <View style={styles.salesStatusCard}>
            <View style={styles.salesStatusHeader}>
              <Text style={styles.salesStatusTitle}>{t('currentPhaseStatus')}</Text>
              <View style={styles.phaseBadge}>
                <Text style={styles.phaseBadgeText}>{t('phase')} {currentStage?.stage || 1}</Text>
              </View>
            </View>
            
            <View style={styles.salesMetrics}>
              <View style={styles.metricRow}>
                <Text style={styles.metricLabel}>{t('totalMXIInDistribution')}</Text>
                <Text style={styles.metricValue}>
                  {(globalMetrics?.totalMXIInDistribution || 0).toLocaleString(undefined, { maximumFractionDigits: 2 })} MXI
                </Text>
              </View>

              <View style={styles.metricRow}>
                <Text style={styles.metricLabel}>{t('globalVestingRewards')}</Text>
                <Text style={styles.metricValue}>
                  {(globalMetrics?.globalVestingRewards || 0).toFixed(4)} MXI
                </Text>
              </View>

              <View style={styles.divider} />

              <View style={styles.metricRow}>
                <Text style={styles.metricLabel}>{t('currentPhasePrice')}</Text>
                <Text style={styles.metricValue}>${currentStage?.price.toFixed(2) || '0.00'} USDT</Text>
              </View>
              
              <View style={styles.metricRow}>
                <Text style={styles.metricLabel}>{t('overallProgress')}</Text>
                <Text style={styles.metricValue}>
                  {totalDistributed.toLocaleString(undefined, { maximumFractionDigits: 0 })} / {totalMXIAvailable.toLocaleString()} MXI
                </Text>
              </View>
              
              <View style={styles.progressBarContainer}>
                <View style={styles.progressBar}>
                  <View style={[styles.progressFill, { width: `${Math.min(progress, 100)}%` }]} />
                </View>
                <Text style={styles.progressText}>{progress.toFixed(2)}% {t('complete')}</Text>
              </View>

              <View style={styles.divider} />

              <View style={styles.phaseCountdownContainer}>
                <Text style={styles.phaseCountdownTitle}>{t('phaseEndsIn')}</Text>
                <View style={styles.phaseCountdownGrid}>
                  <View style={styles.phaseCountdownItem}>
                    <Text style={styles.phaseCountdownNumber}>{phaseCountdown.days}</Text>
                    <Text style={styles.phaseCountdownLabel}>{t('days')}</Text>
                  </View>
                  <View style={styles.phaseCountdownItem}>
                    <Text style={styles.phaseCountdownNumber}>{phaseCountdown.hours}</Text>
                    <Text style={styles.phaseCountdownLabel}>{t('hours')}</Text>
                  </View>
                  <View style={styles.phaseCountdownItem}>
                    <Text style={styles.phaseCountdownNumber}>{phaseCountdown.minutes}</Text>
                    <Text style={styles.phaseCountdownLabel}>{t('minutes')}</Text>
                  </View>
                  <View style={styles.phaseCountdownItem}>
                    <Text style={styles.phaseCountdownNumber}>{phaseCountdown.seconds}</Text>
                    <Text style={styles.phaseCountdownLabel}>{t('seconds')}</Text>
                  </View>
                </View>
              </View>

              <View style={styles.metricRow}>
                <Text style={styles.metricLabel}>{t('endDate')}</Text>
                <Text style={styles.metricValue}>
                  {currentStage ? new Date(currentStage.endDate).toLocaleDateString() : 'N/A'}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Action Cards */}
        <View style={styles.actionsGrid}>
          <TouchableOpacity 
            style={[styles.actionCard, styles.actionCardPurchase]}
            onPress={() => router.push('/purchase')}
          >
            <IconSymbol 
              name={ICONS.SHOPPING_CART}
              size={32} 
              color={colors.accent}
            />
            <Text style={styles.actionLabel}>{t('purchaseMXI')}</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.actionCard, styles.actionCardVesting]}
            onPress={() => router.push('/vesting')}
          >
            <IconSymbol 
              name={ICONS.TRENDING_UP}
              size={32} 
              color={colors.success}
            />
            <Text style={styles.actionLabel}>{t('vesting')}</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.actionCard, styles.actionCardReferrals]}
            onPress={() => router.push('/referrals')}
          >
            <IconSymbol 
              name={ICONS.PEOPLE}
              size={32} 
              color={colors.highlight}
            />
            <Text style={styles.actionLabel}>{t('referrals')}</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.actionCard, styles.actionCardKYC]}
            onPress={() => router.push('/kyc')}
          >
            <IconSymbol 
              name={ICONS.VERIFIED_USER}
              size={32} 
              color="#14B8A6"
            />
            <Text style={styles.actionLabel}>{t('kycVerification')}</Text>
          </TouchableOpacity>
        </View>

        <AppFooter />
      </ScrollView>
    </SafeAreaView>
  );
}
