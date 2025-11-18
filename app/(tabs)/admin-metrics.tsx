
import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  ActivityIndicator,
  RefreshControl,
  TextInput,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '@/contexts/AuthContext';
import { Redirect } from 'expo-router';
import { colors, commonStyles } from '@/styles/commonStyles';
import { IconSymbol } from '@/components/IconSymbol';
import { supabase } from '@/app/integrations/supabase/client';

interface SystemMetrics {
  totalUsers: number;
  totalMXISold: number;
  totalRevenue: number;
  totalCommissions: number;
  totalChallengeWinnings: number;
  totalVestingRewards: number;
  totalPurchasedMXI: number;
  totalReferralMXI: number;
  activeUsers: number;
  pendingKYC: number;
}

interface UserData {
  id: string;
  name: string;
  email: string;
  total_mxi: number;
  purchased_mxi: number;
  commission_balance: number;
  tournaments_balance: number;
  current_rewards: number;
  referral_code: string;
  referred_by: string | null;
  kyc_status: string;
  created_at: string;
}

interface SalesData {
  user_id: string;
  user_name: string;
  total_purchased: number;
  total_spent: number;
  purchase_count: number;
  first_purchase: string;
  last_purchase: string;
}

export default function AdminMetricsScreen() {
  const { isAdmin } = useAuth();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [metrics, setMetrics] = useState<SystemMetrics | null>(null);
  const [userData, setUserData] = useState<UserData[]>([]);
  const [salesData, setSalesData] = useState<SalesData[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null);
  const [showUserModal, setShowUserModal] = useState(false);

  const loadSystemMetrics = useCallback(async () => {
    try {
      console.log('📊 Loading comprehensive system metrics...');

      // Get all users count
      const { count: totalUsers } = await supabase
        .from('users_profiles')
        .select('*', { count: 'exact', head: true });

      // Get all vesting data for comprehensive metrics
      const { data: vestingData } = await supabase
        .from('vesting')
        .select('total_mxi, purchased_mxi, commission_balance, tournaments_balance, current_rewards');

      // Get all purchases for revenue
      const { data: purchases } = await supabase
        .from('purchases')
        .select('amount_usd, mxi_amount')
        .eq('status', 'completed');

      // Get all referrals for commission tracking
      const { data: referrals } = await supabase
        .from('referrals')
        .select('commission_mxi');

      // Get pending KYC count
      const { count: pendingKYC } = await supabase
        .from('users_profiles')
        .select('*', { count: 'exact', head: true })
        .eq('kyc_status', 'pending');

      // Calculate metrics
      const totalMXISold = vestingData?.reduce((sum, v) => 
        sum + parseFloat(v.total_mxi?.toString() || '0'), 0) || 0;

      const totalPurchasedMXI = vestingData?.reduce((sum, v) => 
        sum + parseFloat(v.purchased_mxi?.toString() || '0'), 0) || 0;

      const totalCommissions = vestingData?.reduce((sum, v) => 
        sum + parseFloat(v.commission_balance?.toString() || '0'), 0) || 0;

      const totalChallengeWinnings = vestingData?.reduce((sum, v) => 
        sum + parseFloat(v.tournaments_balance?.toString() || '0'), 0) || 0;

      const totalVestingRewards = vestingData?.reduce((sum, v) => 
        sum + parseFloat(v.current_rewards?.toString() || '0'), 0) || 0;

      const totalRevenue = purchases?.reduce((sum, p) => 
        sum + parseFloat(p.amount_usd?.toString() || '0'), 0) || 0;

      const totalReferralMXI = referrals?.reduce((sum, r) => 
        sum + parseFloat(r.commission_mxi?.toString() || '0'), 0) || 0;

      const activeUsers = vestingData?.filter(v => 
        parseFloat(v.total_mxi?.toString() || '0') > 0).length || 0;

      const systemMetrics: SystemMetrics = {
        totalUsers: totalUsers || 0,
        totalMXISold,
        totalRevenue,
        totalCommissions,
        totalChallengeWinnings,
        totalVestingRewards,
        totalPurchasedMXI,
        totalReferralMXI,
        activeUsers,
        pendingKYC: pendingKYC || 0,
      };

      console.log('✅ System metrics loaded:', systemMetrics);
      setMetrics(systemMetrics);
    } catch (error) {
      console.error('❌ Error loading system metrics:', error);
    }
  }, []);

  const loadUserData = useCallback(async () => {
    try {
      console.log('👥 Loading comprehensive user data...');

      const { data, error } = await supabase
        .from('users_profiles')
        .select(`
          id,
          name,
          email,
          referral_code,
          referred_by,
          kyc_status,
          created_at
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Get vesting data for each user
      const { data: vestingData } = await supabase
        .from('vesting')
        .select('user_id, total_mxi, purchased_mxi, commission_balance, tournaments_balance, current_rewards');

      // Merge data
      const enrichedData: UserData[] = data?.map(user => {
        const vesting = vestingData?.find(v => v.user_id === user.id);
        return {
          ...user,
          total_mxi: parseFloat(vesting?.total_mxi?.toString() || '0'),
          purchased_mxi: parseFloat(vesting?.purchased_mxi?.toString() || '0'),
          commission_balance: parseFloat(vesting?.commission_balance?.toString() || '0'),
          tournaments_balance: parseFloat(vesting?.tournaments_balance?.toString() || '0'),
          current_rewards: parseFloat(vesting?.current_rewards?.toString() || '0'),
        };
      }) || [];

      console.log(`✅ Loaded ${enrichedData.length} users with complete data`);
      setUserData(enrichedData);
    } catch (error) {
      console.error('❌ Error loading user data:', error);
    }
  }, []);

  const loadSalesData = useCallback(async () => {
    try {
      console.log('💰 Loading sales data...');

      const { data: purchases } = await supabase
        .from('purchases')
        .select('user_id, amount_usd, mxi_amount, created_at')
        .eq('status', 'completed');

      const { data: profiles } = await supabase
        .from('users_profiles')
        .select('id, name');

      // Aggregate sales by user
      const salesMap = new Map<string, SalesData>();

      purchases?.forEach(purchase => {
        const userId = purchase.user_id;
        const profile = profiles?.find(p => p.id === userId);
        
        if (!salesMap.has(userId)) {
          salesMap.set(userId, {
            user_id: userId,
            user_name: profile?.name || 'Unknown',
            total_purchased: 0,
            total_spent: 0,
            purchase_count: 0,
            first_purchase: purchase.created_at,
            last_purchase: purchase.created_at,
          });
        }

        const userData = salesMap.get(userId)!;
        userData.total_purchased += parseFloat(purchase.mxi_amount?.toString() || '0');
        userData.total_spent += parseFloat(purchase.amount_usd?.toString() || '0');
        userData.purchase_count += 1;
        
        if (new Date(purchase.created_at) < new Date(userData.first_purchase)) {
          userData.first_purchase = purchase.created_at;
        }
        if (new Date(purchase.created_at) > new Date(userData.last_purchase)) {
          userData.last_purchase = purchase.created_at;
        }
      });

      const salesArray = Array.from(salesMap.values()).sort((a, b) => b.total_spent - a.total_spent);
      console.log(`✅ Loaded sales data for ${salesArray.length} users`);
      setSalesData(salesArray);
    } catch (error) {
      console.error('❌ Error loading sales data:', error);
    }
  }, []);

  const loadAllData = useCallback(async () => {
    setLoading(true);
    try {
      await Promise.all([
        loadSystemMetrics(),
        loadUserData(),
        loadSalesData(),
      ]);
    } catch (error) {
      console.error('❌ Error loading data:', error);
    } finally {
      setLoading(false);
    }
  }, [loadSystemMetrics, loadUserData, loadSalesData]);

  useEffect(() => {
    if (isAdmin) {
      loadAllData();
    }
  }, [isAdmin, loadAllData]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadAllData();
    setRefreshing(false);
  };

  if (!isAdmin) {
    return <Redirect href="/(tabs)/(home)/" />;
  }

  const filteredUsers = userData.filter(u =>
    u.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.referral_code?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredSales = salesData.filter(s =>
    s.user_name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <IconSymbol 
          ios_icon_name="chart.bar.xaxis" 
          android_material_icon_name="analytics" 
          size={40} 
          color={colors.primary} 
        />
        <Text style={styles.title}>System Metrics</Text>
        <TouchableOpacity onPress={onRefresh} disabled={refreshing}>
          {refreshing ? (
            <ActivityIndicator size="small" color={colors.primary} />
          ) : (
            <IconSymbol 
              ios_icon_name="arrow.clockwise" 
              android_material_icon_name="refresh" 
              size={24} 
              color={colors.primary} 
            />
          )}
        </TouchableOpacity>
      </View>

      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {loading && !metrics ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={styles.loadingText}>Loading metrics...</Text>
          </View>
        ) : (
          <React.Fragment>
            {/* System Overview */}
            <Text style={styles.sectionTitle}>System Overview</Text>
            <View style={styles.metricsGrid}>
              <View style={[commonStyles.card, styles.metricCard, { backgroundColor: colors.sectionBlue }]}>
                <IconSymbol 
                  ios_icon_name="person.3.fill" 
                  android_material_icon_name="group" 
                  size={32} 
                  color={colors.info} 
                />
                <Text style={styles.metricValue}>{metrics?.totalUsers || 0}</Text>
                <Text style={styles.metricLabel}>Total Users</Text>
              </View>

              <View style={[commonStyles.card, styles.metricCard, { backgroundColor: colors.sectionGreen }]}>
                <IconSymbol 
                  ios_icon_name="checkmark.circle.fill" 
                  android_material_icon_name="check_circle" 
                  size={32} 
                  color={colors.success} 
                />
                <Text style={styles.metricValue}>{metrics?.activeUsers || 0}</Text>
                <Text style={styles.metricLabel}>Active Users</Text>
              </View>

              <View style={[commonStyles.card, styles.metricCard, { backgroundColor: colors.sectionOrange }]}>
                <IconSymbol 
                  ios_icon_name="bitcoinsign.circle.fill" 
                  android_material_icon_name="currency_bitcoin" 
                  size={32} 
                  color={colors.accent} 
                />
                <Text style={styles.metricValue}>{metrics?.totalMXISold.toLocaleString(undefined, { maximumFractionDigits: 0 }) || 0}</Text>
                <Text style={styles.metricLabel}>Total MXI Sold</Text>
              </View>

              <View style={[commonStyles.card, styles.metricCard, { backgroundColor: colors.sectionPurple }]}>
                <IconSymbol 
                  ios_icon_name="dollarsign.circle.fill" 
                  android_material_icon_name="attach_money" 
                  size={32} 
                  color={colors.primary} 
                />
                <Text style={styles.metricValue}>${metrics?.totalRevenue.toLocaleString(undefined, { maximumFractionDigits: 0 }) || 0}</Text>
                <Text style={styles.metricLabel}>Total Revenue</Text>
              </View>
            </View>

            {/* MXI Distribution Breakdown */}
            <Text style={styles.sectionTitle}>MXI Distribution</Text>
            <View style={commonStyles.card}>
              <View style={styles.distributionRow}>
                <Text style={styles.distributionLabel}>💎 Purchased MXI</Text>
                <Text style={styles.distributionValue}>
                  {metrics?.totalPurchasedMXI.toLocaleString(undefined, { maximumFractionDigits: 2 }) || 0} MXI
                </Text>
              </View>
              <View style={styles.distributionRow}>
                <Text style={styles.distributionLabel}>🎁 Referral Commissions</Text>
                <Text style={styles.distributionValue}>
                  {metrics?.totalReferralMXI.toLocaleString(undefined, { maximumFractionDigits: 2 }) || 0} MXI
                </Text>
              </View>
              <View style={styles.distributionRow}>
                <Text style={styles.distributionLabel}>💼 Commission Balance</Text>
                <Text style={styles.distributionValue}>
                  {metrics?.totalCommissions.toLocaleString(undefined, { maximumFractionDigits: 2 }) || 0} MXI
                </Text>
              </View>
              <View style={styles.distributionRow}>
                <Text style={styles.distributionLabel}>🏆 Challenge Winnings</Text>
                <Text style={styles.distributionValue}>
                  {metrics?.totalChallengeWinnings.toLocaleString(undefined, { maximumFractionDigits: 2 }) || 0} MXI
                </Text>
              </View>
              <View style={styles.distributionRow}>
                <Text style={styles.distributionLabel}>📈 Vesting Rewards</Text>
                <Text style={styles.distributionValue}>
                  {metrics?.totalVestingRewards.toLocaleString(undefined, { maximumFractionDigits: 4 }) || 0} MXI
                </Text>
              </View>
              <View style={[styles.distributionRow, styles.totalRow]}>
                <Text style={styles.totalLabel}>Total MXI in System</Text>
                <Text style={styles.totalValue}>
                  {metrics?.totalMXISold.toLocaleString(undefined, { maximumFractionDigits: 2 }) || 0} MXI
                </Text>
              </View>
            </View>

            {/* Sales Leaderboard */}
            <Text style={styles.sectionTitle}>Top Sales</Text>
            <View style={commonStyles.card}>
              <TextInput
                style={styles.searchInput}
                placeholder="Search by user name..."
                placeholderTextColor={colors.textSecondary}
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
              {filteredSales.slice(0, 10).map((sale, index) => (
                <View key={sale.user_id} style={styles.salesRow}>
                  <View style={styles.rankBadge}>
                    <Text style={styles.rankText}>#{index + 1}</Text>
                  </View>
                  <View style={styles.salesInfo}>
                    <Text style={styles.salesName}>{sale.user_name}</Text>
                    <Text style={styles.salesDetail}>
                      {sale.total_purchased.toFixed(2)} MXI • ${sale.total_spent.toFixed(2)} • {sale.purchase_count} purchases
                    </Text>
                  </View>
                </View>
              ))}
            </View>

            {/* User Database */}
            <Text style={styles.sectionTitle}>User Database ({filteredUsers.length} users)</Text>
            <View style={commonStyles.card}>
              <TextInput
                style={styles.searchInput}
                placeholder="Search users by name, email, or referral code..."
                placeholderTextColor={colors.textSecondary}
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
            </View>

            {filteredUsers.map((user) => (
              <TouchableOpacity
                key={user.id}
                style={styles.userCard}
                onPress={() => {
                  setSelectedUser(user);
                  setShowUserModal(true);
                }}
              >
                <View style={styles.userInfo}>
                  <Text style={styles.userName}>{user.name}</Text>
                  <Text style={styles.userEmail}>{user.email}</Text>
                  <View style={styles.userMetrics}>
                    <Text style={styles.userMetric}>💎 {user.total_mxi.toFixed(2)} MXI</Text>
                    <Text style={styles.userMetric}>🎁 {user.commission_balance.toFixed(2)} MXI</Text>
                    <Text style={styles.userMetric}>🏆 {user.tournaments_balance.toFixed(2)} MXI</Text>
                  </View>
                  <Text style={styles.userDetail}>Code: {user.referral_code}</Text>
                  {user.referred_by && (
                    <Text style={styles.userDetail}>Referred by: {user.referred_by}</Text>
                  )}
                </View>
                <IconSymbol 
                  ios_icon_name="chevron.right" 
                  android_material_icon_name="chevron_right" 
                  size={24} 
                  color={colors.textSecondary} 
                />
              </TouchableOpacity>
            ))}
          </React.Fragment>
        )}
      </ScrollView>

      {/* User Details Modal */}
      <Modal
        visible={showUserModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowUserModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>User Details</Text>
              <TouchableOpacity onPress={() => setShowUserModal(false)}>
                <IconSymbol 
                  ios_icon_name="xmark.circle.fill" 
                  android_material_icon_name="cancel" 
                  size={28} 
                  color={colors.textSecondary} 
                />
              </TouchableOpacity>
            </View>

            {selectedUser && (
              <ScrollView>
                <View style={styles.modalSection}>
                  <Text style={styles.modalUserName}>{selectedUser.name}</Text>
                  <Text style={styles.modalUserEmail}>{selectedUser.email}</Text>
                </View>

                <View style={styles.modalSection}>
                  <Text style={styles.modalSectionTitle}>Balance Overview</Text>
                  <View style={styles.balanceGrid}>
                    <View style={styles.balanceItem}>
                      <Text style={styles.balanceItemLabel}>Total MXI</Text>
                      <Text style={styles.balanceItemValue}>{selectedUser.total_mxi.toFixed(2)}</Text>
                    </View>
                    <View style={styles.balanceItem}>
                      <Text style={styles.balanceItemLabel}>Purchased</Text>
                      <Text style={styles.balanceItemValue}>{selectedUser.purchased_mxi.toFixed(2)}</Text>
                    </View>
                    <View style={styles.balanceItem}>
                      <Text style={styles.balanceItemLabel}>Commissions</Text>
                      <Text style={styles.balanceItemValue}>{selectedUser.commission_balance.toFixed(2)}</Text>
                    </View>
                    <View style={styles.balanceItem}>
                      <Text style={styles.balanceItemLabel}>Challenges</Text>
                      <Text style={styles.balanceItemValue}>{selectedUser.tournaments_balance.toFixed(2)}</Text>
                    </View>
                    <View style={styles.balanceItem}>
                      <Text style={styles.balanceItemLabel}>Vesting</Text>
                      <Text style={styles.balanceItemValue}>{selectedUser.current_rewards.toFixed(4)}</Text>
                    </View>
                  </View>
                </View>

                <View style={styles.modalSection}>
                  <Text style={styles.modalSectionTitle}>Account Info</Text>
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Referral Code:</Text>
                    <Text style={styles.infoValue}>{selectedUser.referral_code}</Text>
                  </View>
                  {selectedUser.referred_by && (
                    <View style={styles.infoRow}>
                      <Text style={styles.infoLabel}>Referred By:</Text>
                      <Text style={styles.infoValue}>{selectedUser.referred_by}</Text>
                    </View>
                  )}
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>KYC Status:</Text>
                    <Text style={[styles.infoValue, { color: selectedUser.kyc_status === 'approved' ? colors.success : colors.warning }]}>
                      {selectedUser.kyc_status}
                    </Text>
                  </View>
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Joined:</Text>
                    <Text style={styles.infoValue}>
                      {new Date(selectedUser.created_at).toLocaleDateString()}
                    </Text>
                  </View>
                </View>
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 20,
    paddingTop: Platform.OS === 'android' ? 48 : 20,
    paddingBottom: 12,
  },
  title: {
    flex: 1,
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 100,
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: colors.textSecondary,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 16,
    marginTop: 8,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 24,
  },
  metricCard: {
    width: '48%',
    alignItems: 'center',
    padding: 20,
  },
  metricValue: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    marginTop: 12,
  },
  metricLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 4,
    textAlign: 'center',
  },
  distributionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  distributionLabel: {
    fontSize: 15,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  distributionValue: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
  },
  totalRow: {
    borderBottomWidth: 0,
    borderTopWidth: 2,
    borderTopColor: colors.primary,
    marginTop: 8,
    paddingTop: 16,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
  },
  totalValue: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.primary,
  },
  searchInput: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: 14,
    fontSize: 16,
    color: colors.text,
    marginBottom: 16,
  },
  salesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  rankBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rankText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.card,
  },
  salesInfo: {
    flex: 1,
  },
  salesName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  salesDetail: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  userCard: {
    ...commonStyles.card,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    marginBottom: 12,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 8,
  },
  userMetrics: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 8,
  },
  userMetric: {
    fontSize: 12,
    color: colors.text,
    fontWeight: '600',
  },
  userDetail: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.card,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
  },
  modalSection: {
    marginBottom: 24,
  },
  modalUserName: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
  },
  modalUserEmail: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  modalSectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 16,
  },
  balanceGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  balanceItem: {
    width: '48%',
    backgroundColor: colors.background,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  balanceItemLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 8,
  },
  balanceItemValue: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  infoLabel: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
});
