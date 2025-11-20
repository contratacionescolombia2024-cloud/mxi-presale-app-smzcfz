
import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Platform,
  ActivityIndicator,
  RefreshControl,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { Redirect } from 'expo-router';
import { colors, commonStyles } from '@/styles/commonStyles';
import { IconSymbol } from '@/components/IconSymbol';
import { supabase } from '@/app/integrations/supabase/client';

interface UserTableData {
  id: string;
  name: string;
  email: string;
  referral_code: string;
  referred_by: string | null;
  kyc_status: string;
  created_at: string;
  total_mxi: number;
  purchased_mxi: number;
  commission_balance: number;
  current_rewards: number;
  purchase_count: number;
  total_deposits: number;
}

type SortField = 'name' | 'email' | 'total_mxi' | 'purchased_mxi' | 'commission_balance' | 'total_deposits' | 'created_at';
type SortDirection = 'asc' | 'desc';

export default function AdminUsersTableScreen() {
  const { isAdmin } = useAuth();
  const { t } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [users, setUsers] = useState<UserTableData[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<UserTableData[]>([]);
  
  // Search and filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [filterKYC, setFilterKYC] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [filterMinMXI, setFilterMinMXI] = useState('');
  const [filterMaxMXI, setFilterMaxMXI] = useState('');
  const [filterMinDeposit, setFilterMinDeposit] = useState('');
  const [filterMaxDeposit, setFilterMaxDeposit] = useState('');
  const [filterHasReferrer, setFilterHasReferrer] = useState<'all' | 'yes' | 'no'>('all');
  
  // Sort states
  const [sortField, setSortField] = useState<SortField>('created_at');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  
  // Modal states
  const [selectedUser, setSelectedUser] = useState<UserTableData | null>(null);
  const [showUserModal, setShowUserModal] = useState(false);
  const [showFiltersModal, setShowFiltersModal] = useState(false);

  const loadUsers = useCallback(async () => {
    try {
      console.log('📊 Loading comprehensive user table data...');
      
      const { data: profiles, error: profilesError } = await supabase
        .from('users_profiles')
        .select('id, name, email, referral_code, referred_by, kyc_status, created_at');

      if (profilesError) throw profilesError;

      const { data: vestingData, error: vestingError } = await supabase
        .from('vesting')
        .select('user_id, total_mxi, purchased_mxi, commission_balance, current_rewards');

      if (vestingError) throw vestingError;

      const { data: purchases, error: purchasesError } = await supabase
        .from('purchases')
        .select('user_id, amount_usd')
        .eq('status', 'completed');

      if (purchasesError) throw purchasesError;

      // Aggregate purchase data by user
      const purchasesByUser = new Map<string, { count: number; total: number }>();
      purchases?.forEach(p => {
        const userId = p.user_id;
        if (!purchasesByUser.has(userId)) {
          purchasesByUser.set(userId, { count: 0, total: 0 });
        }
        const userData = purchasesByUser.get(userId)!;
        userData.count += 1;
        userData.total += parseFloat(p.amount_usd?.toString() || '0');
      });

      // Merge all data
      const enrichedUsers: UserTableData[] = profiles?.map(profile => {
        const vesting = vestingData?.find(v => v.user_id === profile.id);
        const purchaseData = purchasesByUser.get(profile.id) || { count: 0, total: 0 };

        return {
          id: profile.id,
          name: profile.name || 'N/A',
          email: profile.email || 'N/A',
          referral_code: profile.referral_code || 'N/A',
          referred_by: profile.referred_by,
          kyc_status: profile.kyc_status || 'pending',
          created_at: profile.created_at,
          total_mxi: parseFloat(vesting?.total_mxi?.toString() || '0'),
          purchased_mxi: parseFloat(vesting?.purchased_mxi?.toString() || '0'),
          commission_balance: parseFloat(vesting?.commission_balance?.toString() || '0'),
          current_rewards: parseFloat(vesting?.current_rewards?.toString() || '0'),
          purchase_count: purchaseData.count,
          total_deposits: purchaseData.total,
        };
      }) || [];

      console.log(`✅ Loaded ${enrichedUsers.length} users with complete data`);
      setUsers(enrichedUsers);
      setFilteredUsers(enrichedUsers);
    } catch (error) {
      console.error('❌ Error loading users:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isAdmin) {
      loadUsers();
    }
  }, [isAdmin, loadUsers]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadUsers();
    setRefreshing(false);
  };

  // Apply filters and search
  useEffect(() => {
    let result = [...users];

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(u =>
        u.name.toLowerCase().includes(query) ||
        u.email.toLowerCase().includes(query) ||
        u.referral_code.toLowerCase().includes(query) ||
        (u.referred_by && u.referred_by.toLowerCase().includes(query))
      );
    }

    // KYC filter
    if (filterKYC !== 'all') {
      result = result.filter(u => u.kyc_status === filterKYC);
    }

    // MXI balance filter
    if (filterMinMXI) {
      const min = parseFloat(filterMinMXI);
      if (!isNaN(min)) {
        result = result.filter(u => u.total_mxi >= min);
      }
    }
    if (filterMaxMXI) {
      const max = parseFloat(filterMaxMXI);
      if (!isNaN(max)) {
        result = result.filter(u => u.total_mxi <= max);
      }
    }

    // Deposit filter
    if (filterMinDeposit) {
      const min = parseFloat(filterMinDeposit);
      if (!isNaN(min)) {
        result = result.filter(u => u.total_deposits >= min);
      }
    }
    if (filterMaxDeposit) {
      const max = parseFloat(filterMaxDeposit);
      if (!isNaN(max)) {
        result = result.filter(u => u.total_deposits <= max);
      }
    }

    // Referrer filter
    if (filterHasReferrer === 'yes') {
      result = result.filter(u => u.referred_by !== null);
    } else if (filterHasReferrer === 'no') {
      result = result.filter(u => u.referred_by === null);
    }

    // Sort
    result.sort((a, b) => {
      let aVal: any = a[sortField];
      let bVal: any = b[sortField];

      // Handle null values
      if (aVal === null) aVal = '';
      if (bVal === null) bVal = '';

      // Convert to comparable values
      if (typeof aVal === 'string') {
        aVal = aVal.toLowerCase();
        bVal = bVal.toLowerCase();
      }

      if (sortDirection === 'asc') {
        return aVal > bVal ? 1 : aVal < bVal ? -1 : 0;
      } else {
        return aVal < bVal ? 1 : aVal > bVal ? -1 : 0;
      }
    });

    setFilteredUsers(result);
  }, [users, searchQuery, filterKYC, filterMinMXI, filterMaxMXI, filterMinDeposit, filterMaxDeposit, filterHasReferrer, sortField, sortDirection]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const clearFilters = () => {
    setSearchQuery('');
    setFilterKYC('all');
    setFilterMinMXI('');
    setFilterMaxMXI('');
    setFilterMinDeposit('');
    setFilterMaxDeposit('');
    setFilterHasReferrer('all');
    setSortField('created_at');
    setSortDirection('desc');
  };

  const activeFiltersCount = () => {
    let count = 0;
    if (searchQuery.trim()) count++;
    if (filterKYC !== 'all') count++;
    if (filterMinMXI) count++;
    if (filterMaxMXI) count++;
    if (filterMinDeposit) count++;
    if (filterMaxDeposit) count++;
    if (filterHasReferrer !== 'all') count++;
    return count;
  };

  if (!isAdmin) {
    return <Redirect href="/(tabs)/(home)/" />;
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <IconSymbol 
            ios_icon_name="tablecells.fill" 
            android_material_icon_name="table_chart" 
            size={40} 
            color={colors.primary} 
          />
          <View>
            <Text style={styles.title}>{t('userDatabase')}</Text>
            <Text style={styles.subtitle}>
              {filteredUsers.length} {t('of')} {users.length} {t('users')}
            </Text>
          </View>
        </View>
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

      {/* Search and Filter Bar */}
      <View style={styles.searchBar}>
        <View style={styles.searchInputContainer}>
          <IconSymbol 
            ios_icon_name="magnifyingglass" 
            android_material_icon_name="search" 
            size={20} 
            color={colors.textSecondary} 
          />
          <TextInput
            style={styles.searchInput}
            placeholder={t('searchByNameEmailOrCode')}
            placeholderTextColor={colors.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <IconSymbol 
                ios_icon_name="xmark.circle.fill" 
                android_material_icon_name="cancel" 
                size={20} 
                color={colors.textSecondary} 
              />
            </TouchableOpacity>
          )}
        </View>
        <TouchableOpacity 
          style={[styles.filterButton, activeFiltersCount() > 0 && styles.filterButtonActive]}
          onPress={() => setShowFiltersModal(true)}
        >
          <IconSymbol 
            ios_icon_name="line.3.horizontal.decrease.circle.fill" 
            android_material_icon_name="filter_list" 
            size={24} 
            color={activeFiltersCount() > 0 ? colors.card : colors.primary} 
          />
          {activeFiltersCount() > 0 && (
            <View style={styles.filterBadge}>
              <Text style={styles.filterBadgeText}>{activeFiltersCount()}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* Sort Options - Fixed with better spacing */}
      <View style={styles.sortBarContainer}>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false} 
          contentContainerStyle={styles.sortBarContent}
        >
          <TouchableOpacity 
            style={[styles.sortChip, sortField === 'name' && styles.sortChipActive]}
            onPress={() => handleSort('name')}
          >
            <Text style={[styles.sortChipText, sortField === 'name' && styles.sortChipTextActive]}>
              {t('name')} {sortField === 'name' && (sortDirection === 'asc' ? '↑' : '↓')}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.sortChip, sortField === 'total_mxi' && styles.sortChipActive]}
            onPress={() => handleSort('total_mxi')}
          >
            <Text style={[styles.sortChipText, sortField === 'total_mxi' && styles.sortChipTextActive]}>
              {t('totalMXI')} {sortField === 'total_mxi' && (sortDirection === 'asc' ? '↑' : '↓')}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.sortChip, sortField === 'purchased_mxi' && styles.sortChipActive]}
            onPress={() => handleSort('purchased_mxi')}
          >
            <Text style={[styles.sortChipText, sortField === 'purchased_mxi' && styles.sortChipTextActive]}>
              {t('purchased')} {sortField === 'purchased_mxi' && (sortDirection === 'asc' ? '↑' : '↓')}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.sortChip, sortField === 'total_deposits' && styles.sortChipActive]}
            onPress={() => handleSort('total_deposits')}
          >
            <Text style={[styles.sortChipText, sortField === 'total_deposits' && styles.sortChipTextActive]}>
              {t('deposits')} {sortField === 'total_deposits' && (sortDirection === 'asc' ? '↑' : '↓')}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.sortChip, sortField === 'created_at' && styles.sortChipActive]}
            onPress={() => handleSort('created_at')}
          >
            <Text style={[styles.sortChipText, sortField === 'created_at' && styles.sortChipTextActive]}>
              {t('date')} {sortField === 'created_at' && (sortDirection === 'asc' ? '↑' : '↓')}
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      {/* User Table */}
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={styles.loadingText}>{t('loadingUsers')}</Text>
          </View>
        ) : filteredUsers.length === 0 ? (
          <View style={styles.emptyState}>
            <IconSymbol 
              ios_icon_name="person.3.slash.fill" 
              android_material_icon_name="person_off" 
              size={64} 
              color={colors.textSecondary} 
            />
            <Text style={styles.emptyText}>{t('noUsersFound')}</Text>
            {activeFiltersCount() > 0 && (
              <TouchableOpacity style={styles.clearFiltersButton} onPress={clearFilters}>
                <Text style={styles.clearFiltersText}>{t('clearFilters')}</Text>
              </TouchableOpacity>
            )}
          </View>
        ) : (
          <>
            {filteredUsers.map((user, index) => (
              <TouchableOpacity
                key={user.id}
                style={styles.userCard}
                onPress={() => {
                  setSelectedUser(user);
                  setShowUserModal(true);
                }}
              >
                <View style={styles.userCardHeader}>
                  <View style={styles.userCardHeaderLeft}>
                    <Text style={styles.userName}>{user.name}</Text>
                    <View style={[
                      styles.kycBadge,
                      user.kyc_status === 'approved' && styles.kycBadgeApproved,
                      user.kyc_status === 'rejected' && styles.kycBadgeRejected,
                      user.kyc_status === 'pending' && styles.kycBadgePending,
                    ]}>
                      <Text style={styles.kycBadgeText}>{t(user.kyc_status).toUpperCase()}</Text>
                    </View>
                  </View>
                  <IconSymbol 
                    ios_icon_name="chevron.right" 
                    android_material_icon_name="chevron_right" 
                    size={24} 
                    color={colors.textSecondary} 
                  />
                </View>

                <Text style={styles.userEmail}>{user.email}</Text>

                <View style={styles.userStats}>
                  <View style={styles.statItem}>
                    <IconSymbol 
                      ios_icon_name="bitcoinsign.circle.fill" 
                      android_material_icon_name="currency_bitcoin" 
                      size={16} 
                      color={colors.primary} 
                    />
                    <Text style={styles.statLabel}>{t('totalMXI')}:</Text>
                    <Text style={styles.statValue}>{user.total_mxi.toFixed(2)}</Text>
                  </View>
                  <View style={styles.statItem}>
                    <IconSymbol 
                      ios_icon_name="cart.fill" 
                      android_material_icon_name="shopping_cart" 
                      size={16} 
                      color={colors.secondary} 
                    />
                    <Text style={styles.statLabel}>{t('purchased')}:</Text>
                    <Text style={styles.statValue}>{user.purchased_mxi.toFixed(2)}</Text>
                  </View>
                </View>

                <View style={styles.userStats}>
                  <View style={styles.statItem}>
                    <IconSymbol 
                      ios_icon_name="gift.fill" 
                      android_material_icon_name="card_giftcard" 
                      size={16} 
                      color={colors.accent} 
                    />
                    <Text style={styles.statLabel}>{t('commissions')}:</Text>
                    <Text style={styles.statValue}>{user.commission_balance.toFixed(2)}</Text>
                  </View>
                  <View style={styles.statItem}>
                    <IconSymbol 
                      ios_icon_name="dollarsign.circle.fill" 
                      android_material_icon_name="attach_money" 
                      size={16} 
                      color={colors.success} 
                    />
                    <Text style={styles.statLabel}>{t('deposits')}:</Text>
                    <Text style={styles.statValue}>${user.total_deposits.toFixed(2)}</Text>
                  </View>
                </View>

                <View style={styles.userFooter}>
                  <Text style={styles.userCode}>{t('code')}: {user.referral_code}</Text>
                  {user.referred_by && (
                    <Text style={styles.userReferrer}>{t('ref')}: {user.referred_by}</Text>
                  )}
                </View>
              </TouchableOpacity>
            ))}
          </>
        )}
      </ScrollView>

      {/* Filters Modal */}
      <Modal
        visible={showFiltersModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowFiltersModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{t('advancedFilters')}</Text>
              <TouchableOpacity onPress={() => setShowFiltersModal(false)}>
                <IconSymbol 
                  ios_icon_name="xmark.circle.fill" 
                  android_material_icon_name="cancel" 
                  size={28} 
                  color={colors.textSecondary} 
                />
              </TouchableOpacity>
            </View>

            <ScrollView>
              {/* KYC Status Filter */}
              <Text style={styles.filterLabel}>{t('kycStatus')}</Text>
              <View style={styles.filterOptions}>
                <TouchableOpacity
                  style={[styles.filterOption, filterKYC === 'all' && styles.filterOptionActive]}
                  onPress={() => setFilterKYC('all')}
                >
                  <Text style={[styles.filterOptionText, filterKYC === 'all' && styles.filterOptionTextActive]}>
                    {t('all')}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.filterOption, filterKYC === 'pending' && styles.filterOptionActive]}
                  onPress={() => setFilterKYC('pending')}
                >
                  <Text style={[styles.filterOptionText, filterKYC === 'pending' && styles.filterOptionTextActive]}>
                    {t('pending')}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.filterOption, filterKYC === 'approved' && styles.filterOptionActive]}
                  onPress={() => setFilterKYC('approved')}
                >
                  <Text style={[styles.filterOptionText, filterKYC === 'approved' && styles.filterOptionTextActive]}>
                    {t('approved')}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.filterOption, filterKYC === 'rejected' && styles.filterOptionActive]}
                  onPress={() => setFilterKYC('rejected')}
                >
                  <Text style={[styles.filterOptionText, filterKYC === 'rejected' && styles.filterOptionTextActive]}>
                    {t('rejected')}
                  </Text>
                </TouchableOpacity>
              </View>

              {/* MXI Balance Filter */}
              <Text style={styles.filterLabel}>{t('totalMXIBalance')}</Text>
              <View style={styles.rangeInputs}>
                <TextInput
                  style={styles.rangeInput}
                  placeholder={t('min')}
                  placeholderTextColor={colors.textSecondary}
                  value={filterMinMXI}
                  onChangeText={setFilterMinMXI}
                  keyboardType="decimal-pad"
                />
                <Text style={styles.rangeSeparator}>-</Text>
                <TextInput
                  style={styles.rangeInput}
                  placeholder={t('max')}
                  placeholderTextColor={colors.textSecondary}
                  value={filterMaxMXI}
                  onChangeText={setFilterMaxMXI}
                  keyboardType="decimal-pad"
                />
              </View>

              {/* Deposit Amount Filter */}
              <Text style={styles.filterLabel}>{t('totalDepositsUSD')}</Text>
              <View style={styles.rangeInputs}>
                <TextInput
                  style={styles.rangeInput}
                  placeholder={t('min')}
                  placeholderTextColor={colors.textSecondary}
                  value={filterMinDeposit}
                  onChangeText={setFilterMinDeposit}
                  keyboardType="decimal-pad"
                />
                <Text style={styles.rangeSeparator}>-</Text>
                <TextInput
                  style={styles.rangeInput}
                  placeholder={t('max')}
                  placeholderTextColor={colors.textSecondary}
                  value={filterMaxDeposit}
                  onChangeText={setFilterMaxDeposit}
                  keyboardType="decimal-pad"
                />
              </View>

              {/* Has Referrer Filter */}
              <Text style={styles.filterLabel}>{t('referralStatus')}</Text>
              <View style={styles.filterOptions}>
                <TouchableOpacity
                  style={[styles.filterOption, filterHasReferrer === 'all' && styles.filterOptionActive]}
                  onPress={() => setFilterHasReferrer('all')}
                >
                  <Text style={[styles.filterOptionText, filterHasReferrer === 'all' && styles.filterOptionTextActive]}>
                    {t('all')}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.filterOption, filterHasReferrer === 'yes' && styles.filterOptionActive]}
                  onPress={() => setFilterHasReferrer('yes')}
                >
                  <Text style={[styles.filterOptionText, filterHasReferrer === 'yes' && styles.filterOptionTextActive]}>
                    {t('hasReferrer')}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.filterOption, filterHasReferrer === 'no' && styles.filterOptionActive]}
                  onPress={() => setFilterHasReferrer('no')}
                >
                  <Text style={[styles.filterOptionText, filterHasReferrer === 'no' && styles.filterOptionTextActive]}>
                    {t('noReferrer')}
                  </Text>
                </TouchableOpacity>
              </View>

              <View style={styles.modalActions}>
                <TouchableOpacity style={styles.clearButton} onPress={clearFilters}>
                  <Text style={styles.clearButtonText}>{t('clearAll')}</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.applyButton} 
                  onPress={() => setShowFiltersModal(false)}
                >
                  <Text style={styles.applyButtonText}>{t('applyFilters')}</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

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
              <Text style={styles.modalTitle}>{t('userDetails')}</Text>
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
                <View style={styles.detailSection}>
                  <Text style={styles.detailName}>{selectedUser.name}</Text>
                  <Text style={styles.detailEmail}>{selectedUser.email}</Text>
                  <View style={[
                    styles.detailKycBadge,
                    selectedUser.kyc_status === 'approved' && styles.kycBadgeApproved,
                    selectedUser.kyc_status === 'rejected' && styles.kycBadgeRejected,
                    selectedUser.kyc_status === 'pending' && styles.kycBadgePending,
                  ]}>
                    <Text style={styles.kycBadgeText}>KYC: {t(selectedUser.kyc_status).toUpperCase()}</Text>
                  </View>
                </View>

                <View style={styles.detailSection}>
                  <Text style={styles.detailSectionTitle}>{t('balanceOverview')}</Text>
                  <View style={styles.detailGrid}>
                    <View style={styles.detailGridItem}>
                      <Text style={styles.detailGridLabel}>{t('totalMXI')}</Text>
                      <Text style={styles.detailGridValue}>{selectedUser.total_mxi.toFixed(2)}</Text>
                    </View>
                    <View style={styles.detailGridItem}>
                      <Text style={styles.detailGridLabel}>{t('purchased')}</Text>
                      <Text style={styles.detailGridValue}>{selectedUser.purchased_mxi.toFixed(2)}</Text>
                    </View>
                    <View style={styles.detailGridItem}>
                      <Text style={styles.detailGridLabel}>{t('commissions')}</Text>
                      <Text style={styles.detailGridValue}>{selectedUser.commission_balance.toFixed(2)}</Text>
                    </View>
                    <View style={styles.detailGridItem}>
                      <Text style={styles.detailGridLabel}>{t('vesting')}</Text>
                      <Text style={styles.detailGridValue}>{selectedUser.current_rewards.toFixed(4)}</Text>
                    </View>
                  </View>
                </View>

                <View style={styles.detailSection}>
                  <Text style={styles.detailSectionTitle}>{t('purchaseHistory')}</Text>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailRowLabel}>{t('totalDeposits')}:</Text>
                    <Text style={styles.detailRowValue}>${selectedUser.total_deposits.toFixed(2)}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailRowLabel}>{t('purchaseCount')}:</Text>
                    <Text style={styles.detailRowValue}>{selectedUser.purchase_count}</Text>
                  </View>
                </View>

                <View style={styles.detailSection}>
                  <Text style={styles.detailSectionTitle}>{t('referralInformation')}</Text>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailRowLabel}>{t('referralCode')}:</Text>
                    <Text style={styles.detailRowValue}>{selectedUser.referral_code}</Text>
                  </View>
                  {selectedUser.referred_by && (
                    <View style={styles.detailRow}>
                      <Text style={styles.detailRowLabel}>{t('referredBy')}:</Text>
                      <Text style={styles.detailRowValue}>{selectedUser.referred_by}</Text>
                    </View>
                  )}
                </View>

                <View style={styles.detailSection}>
                  <Text style={styles.detailSectionTitle}>{t('accountInformation')}</Text>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailRowLabel}>{t('userId')}:</Text>
                    <Text style={[styles.detailRowValue, styles.detailRowValueSmall]}>{selectedUser.id}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailRowLabel}>{t('joined')}:</Text>
                    <Text style={styles.detailRowValue}>
                      {new Date(selectedUser.created_at).toLocaleDateString()} {new Date(selectedUser.created_at).toLocaleTimeString()}
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
    justifyContent: 'space-between',
    padding: 20,
    paddingTop: Platform.OS === 'android' ? 48 : 20,
    paddingBottom: 12,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
  },
  subtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 2,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.card,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: colors.text,
  },
  filterButton: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: colors.card,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  filterButtonActive: {
    backgroundColor: colors.primary,
  },
  filterBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: colors.error,
    borderRadius: 10,
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.card,
  },
  sortBarContainer: {
    marginBottom: 16,
    minHeight: 56,
  },
  sortBarContent: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    gap: 8,
    alignItems: 'center',
  },
  sortChip: {
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 24,
    backgroundColor: colors.card,
    marginRight: 8,
    minWidth: 90,
    alignItems: 'center',
    justifyContent: 'center',
    height: 44,
  },
  sortChipActive: {
    backgroundColor: colors.primary,
  },
  sortChipText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  sortChipTextActive: {
    color: colors.card,
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
  emptyState: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: colors.textSecondary,
    marginTop: 16,
    textAlign: 'center',
  },
  clearFiltersButton: {
    marginTop: 16,
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: colors.primary,
    borderRadius: 8,
  },
  clearFiltersText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.card,
  },
  userCard: {
    ...commonStyles.card,
    padding: 16,
    marginBottom: 12,
  },
  userCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  userCardHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
  },
  kycBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  kycBadgeApproved: {
    backgroundColor: `${colors.success}20`,
  },
  kycBadgeRejected: {
    backgroundColor: `${colors.error}20`,
  },
  kycBadgePending: {
    backgroundColor: `${colors.warning}20`,
  },
  kycBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.text,
  },
  userEmail: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 12,
  },
  userStats: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 8,
  },
  statItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statLabel: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  statValue: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.text,
  },
  userFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  userCode: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  userReferrer: {
    fontSize: 12,
    color: colors.primary,
    fontWeight: '600',
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
    maxHeight: '85%',
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
  filterLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginTop: 16,
    marginBottom: 12,
  },
  filterOptions: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  filterOption: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: colors.background,
    borderWidth: 2,
    borderColor: colors.border,
  },
  filterOptionActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  filterOptionText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  filterOptionTextActive: {
    color: colors.card,
  },
  rangeInputs: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  rangeInput: {
    flex: 1,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: colors.text,
  },
  rangeSeparator: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 24,
  },
  clearButton: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    backgroundColor: colors.background,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center',
  },
  clearButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  applyButton: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    backgroundColor: colors.primary,
    alignItems: 'center',
  },
  applyButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.card,
  },
  detailSection: {
    marginBottom: 24,
  },
  detailName: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
  },
  detailEmail: {
    fontSize: 16,
    color: colors.textSecondary,
    marginBottom: 12,
  },
  detailKycBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  detailSectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 16,
  },
  detailGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  detailGridItem: {
    width: '48%',
    backgroundColor: colors.background,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  detailGridLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 8,
  },
  detailGridValue: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  detailRowLabel: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  detailRowValue: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    textAlign: 'right',
    flex: 1,
    marginLeft: 12,
  },
  detailRowValueSmall: {
    fontSize: 10,
  },
});
