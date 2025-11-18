
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import { colors, commonStyles } from '@/styles/commonStyles';
import React, { useEffect, useState } from 'react';
import { IconSymbol } from '@/components/IconSymbol';
import { SafeAreaView } from 'react-native-safe-area-context';
import { usePreSale } from '@/contexts/PreSaleContext';
import { useAuth } from '@/contexts/AuthContext';
import AppFooter from '@/components/AppFooter';
import { supabase } from '@/app/integrations/supabase/client';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 100,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  logo: {
    width: 150,
    height: 60,
    resizeMode: 'contain',
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
    backgroundColor: colors.sectionOrangeStrong,
    marginBottom: 24,
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(217, 119, 6, 0.4)',
  },
  countdownTitle: {
    fontSize: 20,
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
    backgroundColor: 'rgba(217, 119, 6, 0.15)',
    borderRadius: 12,
    padding: 12,
    minWidth: 70,
    borderWidth: 1,
    borderColor: 'rgba(217, 119, 6, 0.3)',
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
    color: '#D97706',
    textAlign: 'center',
  },
  balanceCard: {
    backgroundColor: colors.sectionGreen,
    borderRadius: 20,
    padding: 24,
    marginBottom: 24,
    borderWidth: 2,
    borderColor: 'rgba(16, 185, 129, 0.4)',
  },
  balanceLabel: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 8,
    fontWeight: '500',
  },
  balanceAmount: {
    fontSize: 36,
    fontWeight: 'bold',
    color: colors.secondary,
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
    fontSize: 15,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  balanceRowValue: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.text,
  },
  balanceRowHighlight: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.text,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(16, 185, 129, 0.3)',
    marginVertical: 8,
  },
  vestingCard: {
    backgroundColor: colors.sectionPurple,
    borderRadius: 20,
    padding: 24,
    marginBottom: 24,
    borderWidth: 2,
    borderColor: 'rgba(139, 92, 246, 0.4)',
  },
  vestingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  vestingTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
  },
  vestingBadge: {
    backgroundColor: colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  vestingBadgeText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#fff',
  },
  vestingMetrics: {
    gap: 16,
  },
  vestingRewardsContainer: {
    backgroundColor: 'rgba(139, 92, 246, 0.15)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.3)',
  },
  vestingRewardsLabel: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 8,
    fontWeight: '500',
  },
  vestingRewardsAmount: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 4,
  },
  vestingRewardsUpdate: {
    fontSize: 12,
    color: colors.textSecondary,
    fontStyle: 'italic',
  },
  vestingNote: {
    fontSize: 12,
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
    fontSize: 15,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  metricValue: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
  projectionsContainer: {
    marginTop: 8,
    gap: 8,
  },
  projectionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: 'rgba(139, 92, 246, 0.1)',
    borderRadius: 8,
  },
  projectionLabel: {
    fontSize: 13,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  projectionValue: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
  },
  phaseCountersContainer: {
    marginBottom: 24,
    gap: 16,
  },
  salesStatusCard: {
    backgroundColor: colors.sectionBlue,
    borderRadius: 20,
    padding: 24,
    borderWidth: 2,
    borderColor: 'rgba(59, 130, 246, 0.4)',
  },
  salesStatusHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  salesStatusTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
  },
  phaseBadge: {
    backgroundColor: colors.info,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    shadowColor: colors.info,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  phaseBadgeText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#fff',
  },
  salesMetrics: {
    gap: 16,
  },
  progressBarContainer: {
    marginTop: 8,
  },
  progressBar: {
    height: 10,
    backgroundColor: 'rgba(59, 130, 246, 0.2)',
    borderRadius: 5,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.info,
    borderRadius: 5,
  },
  progressText: {
    fontSize: 13,
    color: colors.info,
    fontWeight: '600',
    marginTop: 6,
    textAlign: 'right',
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 24,
  },
  actionCard: {
    flex: 1,
    minWidth: '47%',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    gap: 12,
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

interface GlobalMetrics {
  totalMXIInDistribution: number;
  totalUsersEarning: number;
  globalVestingRewards: number;
  totalPurchasedMXI: number;
}

export default function HomeScreen() {
  const { currentStage, vestingData, referralStats, isLoading, refreshData } = usePreSale();
  const { user } = useAuth();
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
  const loadGlobalMetrics = async () => {
    try {
      console.log('🌍 Loading global metrics...');
      
      // Get all vesting data
      const { data: vestingRecords, error: vestingError } = await supabase
        .from('vesting')
        .select('total_mxi, purchased_mxi, current_rewards');

      if (vestingError) {
        console.error('❌ Error loading global vesting:', vestingError);
        return;
      }

      // Calculate totals
      const totalMXIInDistribution = vestingRecords?.reduce((sum, record) => 
        sum + (parseFloat(record.total_mxi?.toString() || '0')), 0) || 0;
      
      const totalPurchasedMXI = vestingRecords?.reduce((sum, record) => 
        sum + (parseFloat(record.purchased_mxi?.toString() || '0')), 0) || 0;
      
      const globalVestingRewards = vestingRecords?.reduce((sum, record) => 
        sum + (parseFloat(record.current_rewards?.toString() || '0')), 0) || 0;

      const totalUsersEarning = vestingRecords?.filter(record => 
        parseFloat(record.purchased_mxi?.toString() || '0') > 0).length || 0;

      console.log('✅ Global metrics loaded:', {
        totalMXIInDistribution,
        totalPurchasedMXI,
        globalVestingRewards,
        totalUsersEarning,
      });

      setGlobalMetrics({
        totalMXIInDistribution,
        totalUsersEarning,
        globalVestingRewards,
        totalPurchasedMXI,
      });
    } catch (error) {
      console.error('❌ Failed to load global metrics:', error);
    }
  };

  // Real-time subscription for global metrics
  useEffect(() => {
    loadGlobalMetrics();

    // Subscribe to vesting changes
    const vestingSubscription = supabase
      .channel('global-vesting-changes-ios')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'vesting',
        },
        () => {
          console.log('🔔 Global vesting change detected, reloading metrics');
          loadGlobalMetrics();
        }
      )
      .subscribe();

    // Subscribe to presale stage changes
    const stageSubscription = supabase
      .channel('presale-stage-changes-ios')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'presale_stages',
        },
        () => {
          console.log('🔔 Presale stage change detected, reloading data');
          refreshData();
        }
      )
      .subscribe();

    return () => {
      vestingSubscription.unsubscribe();
      stageSubscription.unsubscribe();
    };
  }, []);

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

  // Debug logging for referral stats
  useEffect(() => {
    console.log('🏠 ========================================');
    console.log('🏠 HOME SCREEN - DATA UPDATE');
    console.log('🏠 ========================================');
    console.log('🏠 Vesting Data:', {
      totalMXI: vestingData?.totalMXI,
      purchasedMXI: vestingData?.purchasedMXI,
      currentRewards: vestingData?.currentRewards,
      note: 'Vesting rewards calculated ONLY on purchasedMXI'
    });
    console.log('🏠 Referral Stats:', {
      totalReferrals: referralStats?.totalReferrals,
      level1Count: referralStats?.level1Count,
      level2Count: referralStats?.level2Count,
      level3Count: referralStats?.level3Count,
      level1MXI: referralStats?.level1MXI,
      level2MXI: referralStats?.level2MXI,
      level3MXI: referralStats?.level3MXI,
      totalMXIEarned: referralStats?.totalMXIEarned,
    });
    console.log('🏠 ========================================');
  }, [referralStats, vestingData]);

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

  const onRefresh = async () => {
    console.log('🔄 Home Screen - Manual refresh triggered');
    setRefreshing(true);
    await refreshData();
    await loadGlobalMetrics();
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

  // Calculate MXI breakdown using the new purchased_mxi field
  const totalMXI = vestingData?.totalMXI || 0;
  const purchasedMXI = vestingData?.purchasedMXI || 0;
  const referralMXI = referralStats?.totalMXIEarned || 0;
  const vestingRewards = vestingData?.currentRewards || 0;
  const tournamentsBalance = vestingData?.tournamentsBalance || 0;
  const commissionBalance = vestingData?.commissionBalance || 0;
  
  console.log('🏠 Display Values:', {
    totalMXI,
    purchasedMXI,
    referralMXI,
    vestingRewards,
    tournamentsBalance,
    commissionBalance,
    'Calculation check': `${purchasedMXI} + ${referralMXI} = ${purchasedMXI + referralMXI} (should equal ${totalMXI})`,
  });
  
  // Calculate progress based on TOTAL MXI IN DISTRIBUTION (from all users)
  const totalMXIAvailable = 25000000; // Total MXI available for presale
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
        {/* Logo at the top */}
        <View style={styles.logoContainer}>
          <Image
            source={require('@/assets/images/842fdc6d-790f-4b06-a0ae-10c12b6f2fb0.png')}
            style={styles.logo}
          />
        </View>

        <View style={styles.header}>
          <Text style={styles.greeting}>Welcome, {user?.name || 'User'}!</Text>
          <Text style={styles.subtitle}>Your MXI Dashboard</Text>
        </View>

        {/* Countdown Timer - Translucent Orange */}
        <View style={styles.countdownCard}>
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
        </View>

        {/* Balance Card - STANDARDIZED FORMAT AND COLORS */}
        <View style={styles.balanceCard}>
          <Text style={styles.balanceLabel}>💰 Total MXI Balance</Text>
          <Text style={styles.balanceAmount}>{totalMXI.toFixed(2)} MXI</Text>
          
          <View style={styles.balanceBreakdown}>
            {/* STANDARDIZED: MXI Purchased */}
            <View style={styles.balanceRow}>
              <Text style={styles.balanceRowLabel}>💎 MXI Purchased</Text>
              <Text style={styles.balanceRowValue}>{purchasedMXI.toFixed(2)} MXI</Text>
            </View>
            
            {/* STANDARDIZED: Referral Commission - Same format and color */}
            <View style={styles.balanceRow}>
              <Text style={styles.balanceRowLabel}>🎁 Referral Commission</Text>
              <Text style={styles.balanceRowValue}>{referralMXI.toFixed(2)} MXI</Text>
            </View>

            <View style={styles.divider} />
            
            <View style={styles.balanceRow}>
              <Text style={styles.balanceRowLabel}>Total Referrals</Text>
              <Text style={styles.balanceRowValue}>{referralStats?.totalReferrals || 0}</Text>
            </View>

            <View style={styles.balanceRow}>
              <Text style={styles.balanceRowLabel}>• Level 1 ({referralStats?.level1Count || 0} refs)</Text>
              <Text style={styles.balanceRowValue}>
                {(referralStats?.level1MXI || 0).toFixed(2)} MXI
              </Text>
            </View>

            <View style={styles.balanceRow}>
              <Text style={styles.balanceRowLabel}>• Level 2 ({referralStats?.level2Count || 0} refs)</Text>
              <Text style={styles.balanceRowValue}>
                {(referralStats?.level2MXI || 0).toFixed(2)} MXI
              </Text>
            </View>

            <View style={styles.balanceRow}>
              <Text style={styles.balanceRowLabel}>• Level 3 ({referralStats?.level3Count || 0} refs)</Text>
              <Text style={styles.balanceRowValue}>
                {(referralStats?.level3MXI || 0).toFixed(2)} MXI
              </Text>
            </View>

            <View style={styles.divider} />

            {/* NEW: Challenge Winnings Balance */}
            <View style={styles.balanceRow}>
              <Text style={styles.balanceRowLabel}>🏆 Challenge Winnings</Text>
              <Text style={styles.balanceRowValue}>{tournamentsBalance.toFixed(2)} MXI</Text>
            </View>

            {/* Commission Balance */}
            <View style={styles.balanceRow}>
              <Text style={styles.balanceRowLabel}>💼 Commission Balance</Text>
              <Text style={styles.balanceRowValue}>{commissionBalance.toFixed(2)} MXI</Text>
            </View>

            <View style={styles.divider} />

            <View style={styles.balanceRow}>
              <Text style={styles.balanceRowLabel}>Vesting Rewards</Text>
              <Text style={styles.balanceRowValue}>{vestingRewards.toFixed(4)} MXI</Text>
            </View>
          </View>
        </View>

        {/* Vesting Display with Real-Time Updates - ONLY ON PURCHASED MXI */}
        <View style={styles.vestingCard}>
          <View style={styles.vestingHeader}>
            <Text style={styles.vestingTitle}>📈 Vesting Rewards</Text>
            <View style={styles.vestingBadge}>
              <Text style={styles.vestingBadgeText}>Live</Text>
            </View>
          </View>
          
          <View style={styles.vestingMetrics}>
            {/* Real-time rewards display */}
            <View style={styles.vestingRewardsContainer}>
              <Text style={styles.vestingRewardsLabel}>Current Rewards (Real-Time)</Text>
              <Text style={styles.vestingRewardsAmount}>
                {vestingRewards.toFixed(6)} MXI
              </Text>
              <Text style={styles.vestingRewardsUpdate}>
                ⚡ Updating every second
              </Text>
              <Text style={styles.vestingNote}>
                💡 Calculated only on purchased MXI
              </Text>
            </View>

            <View style={styles.metricRow}>
              <Text style={styles.metricLabel}>Purchased MXI (Vesting Base)</Text>
              <Text style={styles.metricValue}>{purchasedMXI.toFixed(2)} MXI</Text>
            </View>

            <View style={styles.metricRow}>
              <Text style={styles.metricLabel}>Monthly Rate</Text>
              <Text style={styles.metricValue}>{((vestingData?.monthlyRate || 0.03) * 100).toFixed(1)}%</Text>
            </View>

            {/* Projections - Based ONLY on purchased MXI */}
            <View style={styles.projectionsContainer}>
              <Text style={[styles.metricLabel, { marginBottom: 8 }]}>Projected Earnings (on Purchased MXI)</Text>
              
              <View style={styles.projectionRow}>
                <Text style={styles.projectionLabel}>7 Days</Text>
                <Text style={styles.projectionValue}>
                  +{(vestingData?.projections?.days7 || 0).toFixed(4)} MXI
                </Text>
              </View>

              <View style={styles.projectionRow}>
                <Text style={styles.projectionLabel}>15 Days</Text>
                <Text style={styles.projectionValue}>
                  +{(vestingData?.projections?.days15 || 0).toFixed(4)} MXI
                </Text>
              </View>

              <View style={styles.projectionRow}>
                <Text style={styles.projectionLabel}>30 Days</Text>
                <Text style={styles.projectionValue}>
                  +{(vestingData?.projections?.days30 || 0).toFixed(4)} MXI
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* UNIFIED: Current Phase Status with Global Data */}
        <View style={styles.phaseCountersContainer}>
          <View style={styles.salesStatusCard}>
            <View style={styles.salesStatusHeader}>
              <Text style={styles.salesStatusTitle}>📊 Current Phase Status</Text>
              <View style={styles.phaseBadge}>
                <Text style={styles.phaseBadgeText}>Phase {currentStage?.stage || 1}</Text>
              </View>
            </View>
            
            <View style={styles.salesMetrics}>
              {/* UNIFIED: Show total MXI in distribution from all users */}
              <View style={styles.metricRow}>
                <Text style={styles.metricLabel}>Total MXI in Distribution</Text>
                <Text style={styles.metricValue}>
                  {(globalMetrics?.totalMXIInDistribution || 0).toLocaleString(undefined, { maximumFractionDigits: 2 })} MXI
                </Text>
              </View>

              <View style={styles.metricRow}>
                <Text style={styles.metricLabel}>Global Vesting Rewards</Text>
                <Text style={styles.metricValue}>
                  {(globalMetrics?.globalVestingRewards || 0).toFixed(4)} MXI
                </Text>
              </View>

              <View style={styles.divider} />

              <View style={styles.metricRow}>
                <Text style={styles.metricLabel}>Current Phase Price</Text>
                <Text style={styles.metricValue}>${currentStage?.price.toFixed(2) || '0.00'} USDT</Text>
              </View>
              
              <View style={styles.metricRow}>
                <Text style={styles.metricLabel}>Overall Progress</Text>
                <Text style={styles.metricValue}>
                  {totalDistributed.toLocaleString(undefined, { maximumFractionDigits: 0 })} / {totalMXIAvailable.toLocaleString()} MXI
                </Text>
              </View>
              
              <View style={styles.progressBarContainer}>
                <View style={styles.progressBar}>
                  <View style={[styles.progressFill, { width: `${Math.min(progress, 100)}%` }]} />
                </View>
                <Text style={styles.progressText}>{progress.toFixed(2)}% Complete</Text>
              </View>

              <View style={styles.divider} />

              {/* Phase End Countdown */}
              <View style={styles.metricRow}>
                <Text style={styles.metricLabel}>Phase Ends In</Text>
                <Text style={styles.metricValue}>
                  {phaseCountdown.days}d {phaseCountdown.hours}h {phaseCountdown.minutes}m {phaseCountdown.seconds}s
                </Text>
              </View>

              <View style={styles.metricRow}>
                <Text style={styles.metricLabel}>End Date</Text>
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
              ios_icon_name="cart.fill"
              android_material_icon_name="shopping_cart"
              size={40} 
              color={colors.accent}
            />
            <Text style={styles.actionLabel}>Purchase MXI</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.actionCard, styles.actionCardVesting]}
            onPress={() => router.push('/vesting')}
          >
            <IconSymbol 
              ios_icon_name="chart.line.uptrend.xyaxis"
              android_material_icon_name="trending_up"
              size={40} 
              color={colors.success}
            />
            <Text style={styles.actionLabel}>Vesting</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.actionCard, styles.actionCardReferrals]}
            onPress={() => router.push('/referrals')}
          >
            <IconSymbol 
              ios_icon_name="person.3.fill"
              android_material_icon_name="people"
              size={40} 
              color={colors.highlight}
            />
            <Text style={styles.actionLabel}>Referrals</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.actionCard, styles.actionCardKYC]}
            onPress={() => router.push('/kyc')}
          >
            <IconSymbol 
              ios_icon_name="checkmark.shield.fill"
              android_material_icon_name="verified_user"
              size={40} 
              color="#14B8A6"
            />
            <Text style={styles.actionLabel}>KYC Verification</Text>
          </TouchableOpacity>
        </View>

        <AppFooter />
      </ScrollView>
    </SafeAreaView>
  );
}
