
import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Platform,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { colors, commonStyles } from '@/styles/commonStyles';
import { Redirect, useRouter } from 'expo-router';
import { supabase } from '@/app/integrations/supabase/client';
import { SafeAreaView } from 'react-native-safe-area-context';
import { IconSymbol } from '@/components/IconSymbol';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';

interface Withdrawal {
  id: string;
  user_id: string;
  wallet_address: string;
  amount: number;
  withdrawal_source: string;
  status: string;
  notes: string | null;
  admin_notes: string | null;
  created_at: string;
  processed_at: string | null;
  user_name?: string;
  user_email?: string;
}

export default function AdminWithdrawalsScreen() {
  const { isAdmin, user } = useAuth();
  const { t } = useLanguage();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [selectedWithdrawal, setSelectedWithdrawal] = useState<Withdrawal | null>(null);
  const [adminNotes, setAdminNotes] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const loadWithdrawals = useCallback(async () => {
    try {
      console.log('📊 Loading withdrawals...');
      
      // Get withdrawals with user information
      const { data: withdrawalsData, error: withdrawalsError } = await supabase
        .from('withdrawals')
        .select('*')
        .order('created_at', { ascending: false });

      if (withdrawalsError) {
        console.error('❌ Error loading withdrawals:', withdrawalsError);
        throw withdrawalsError;
      }

      // Get user profiles to enrich withdrawal data
      const userIds = [...new Set(withdrawalsData?.map(w => w.user_id) || [])];
      const { data: usersData, error: usersError } = await supabase
        .from('users_profiles')
        .select('id, name, email')
        .in('id', userIds);

      if (usersError) {
        console.error('❌ Error loading users:', usersError);
      }

      // Merge user data with withdrawals
      const enrichedWithdrawals = withdrawalsData?.map(withdrawal => {
        const userProfile = usersData?.find(u => u.id === withdrawal.user_id);
        return {
          ...withdrawal,
          user_name: userProfile?.name || 'Unknown',
          user_email: userProfile?.email || 'Unknown',
        };
      }) || [];

      console.log(`✅ Loaded ${enrichedWithdrawals.length} withdrawals`);
      setWithdrawals(enrichedWithdrawals);
    } catch (error: any) {
      console.error('❌ Exception in loadWithdrawals:', error);
      Alert.alert('Error', 'Failed to load withdrawals');
    }
  }, []);

  useEffect(() => {
    if (isAdmin) {
      loadWithdrawals();
    }
  }, [isAdmin, loadWithdrawals]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadWithdrawals();
    setRefreshing(false);
  };

  const handleUpdateStatus = async (withdrawalId: string, newStatus: string) => {
    setLoading(true);

    try {
      const updateData: any = {
        status: newStatus,
        admin_notes: adminNotes.trim() || null,
      };

      if (newStatus === 'completed' || newStatus === 'rejected') {
        updateData.processed_at = new Date().toISOString();
        updateData.processed_by = user?.id;
      }

      const { error } = await supabase
        .from('withdrawals')
        .update(updateData)
        .eq('id', withdrawalId);

      if (error) {
        console.error('Error updating withdrawal:', error);
        throw error;
      }

      Alert.alert(
        'Success',
        `Withdrawal ${newStatus} successfully`,
        [
          {
            text: 'OK',
            onPress: () => {
              setSelectedWithdrawal(null);
              setAdminNotes('');
              loadWithdrawals();
            }
          }
        ]
      );
    } catch (error: any) {
      console.error('Exception updating withdrawal:', error);
      Alert.alert('Error', error.message || 'Failed to update withdrawal');
    } finally {
      setLoading(false);
    }
  };

  const getSourceLabel = (source: string): string => {
    switch (source) {
      case 'referral_balance':
        return t('referralBalance');
      case 'commission_balance':
        return t('commissionBalance');
      case 'tournament_balance':
        return t('tournamentBalance');
      default:
        return source;
    }
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'pending':
        return colors.warning;
      case 'processing':
        return colors.info;
      case 'completed':
        return colors.success;
      case 'rejected':
        return colors.error;
      default:
        return colors.textSecondary;
    }
  };

  const getStatusLabel = (status: string): string => {
    switch (status) {
      case 'pending':
        return t('pending');
      case 'processing':
        return t('processing');
      case 'completed':
        return t('completed');
      case 'rejected':
        return t('rejected');
      default:
        return status;
    }
  };

  if (!isAdmin) {
    console.log('⚠️ User is not admin, redirecting...');
    return <Redirect href="/(tabs)/(home)/" />;
  }

  const filteredWithdrawals = filterStatus === 'all' 
    ? withdrawals 
    : withdrawals.filter(w => w.status === filterStatus);

  const stats = {
    total: withdrawals.length,
    pending: withdrawals.filter(w => w.status === 'pending').length,
    processing: withdrawals.filter(w => w.status === 'processing').length,
    completed: withdrawals.filter(w => w.status === 'completed').length,
    rejected: withdrawals.filter(w => w.status === 'rejected').length,
    totalAmount: withdrawals.reduce((sum, w) => sum + parseFloat(w.amount.toString()), 0),
    pendingAmount: withdrawals.filter(w => w.status === 'pending').reduce((sum, w) => sum + parseFloat(w.amount.toString()), 0),
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <IconSymbol 
            ios_icon_name="chevron.left" 
            android_material_icon_name="arrow_back" 
            size={24} 
            color={colors.text} 
          />
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <IconSymbol 
            ios_icon_name="banknote" 
            android_material_icon_name="account_balance_wallet" 
            size={32} 
            color={colors.primary} 
          />
          <Text style={styles.title}>Withdrawal Management</Text>
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

      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Statistics */}
        <View style={commonStyles.card}>
          <Text style={styles.sectionTitle}>
            <IconSymbol 
              ios_icon_name="chart.bar.fill" 
              android_material_icon_name="bar_chart" 
              size={20} 
              color={colors.secondary} 
            />
            {' '}Statistics
          </Text>
          
          <View style={styles.statsGrid}>
            <View style={styles.statBox}>
              <Text style={styles.statLabel}>Total Requests</Text>
              <Text style={styles.statValue}>{stats.total}</Text>
            </View>
            
            <View style={[styles.statBox, { backgroundColor: `${colors.warning}15` }]}>
              <Text style={styles.statLabel}>Pending</Text>
              <Text style={[styles.statValue, { color: colors.warning }]}>{stats.pending}</Text>
            </View>
            
            <View style={[styles.statBox, { backgroundColor: `${colors.info}15` }]}>
              <Text style={styles.statLabel}>Processing</Text>
              <Text style={[styles.statValue, { color: colors.info }]}>{stats.processing}</Text>
            </View>
            
            <View style={[styles.statBox, { backgroundColor: `${colors.success}15` }]}>
              <Text style={styles.statLabel}>Completed</Text>
              <Text style={[styles.statValue, { color: colors.success }]}>{stats.completed}</Text>
            </View>
            
            <View style={[styles.statBox, { backgroundColor: `${colors.error}15` }]}>
              <Text style={styles.statLabel}>Rejected</Text>
              <Text style={[styles.statValue, { color: colors.error }]}>{stats.rejected}</Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.amountStats}>
            <View style={styles.amountStatRow}>
              <Text style={styles.amountStatLabel}>Total Amount:</Text>
              <Text style={styles.amountStatValue}>{stats.totalAmount.toFixed(2)} USDT</Text>
            </View>
            <View style={styles.amountStatRow}>
              <Text style={styles.amountStatLabel}>Pending Amount:</Text>
              <Text style={[styles.amountStatValue, { color: colors.warning }]}>
                {stats.pendingAmount.toFixed(2)} USDT
              </Text>
            </View>
          </View>
        </View>

        {/* Filter Buttons */}
        <View style={commonStyles.card}>
          <Text style={styles.sectionTitle}>Filter by Status</Text>
          <View style={styles.filterButtons}>
            <TouchableOpacity
              style={[
                styles.filterButton,
                filterStatus === 'all' && styles.filterButtonActive
              ]}
              onPress={() => setFilterStatus('all')}
            >
              <Text style={[
                styles.filterButtonText,
                filterStatus === 'all' && styles.filterButtonTextActive
              ]}>
                All ({stats.total})
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.filterButton,
                filterStatus === 'pending' && styles.filterButtonActive
              ]}
              onPress={() => setFilterStatus('pending')}
            >
              <Text style={[
                styles.filterButtonText,
                filterStatus === 'pending' && styles.filterButtonTextActive
              ]}>
                Pending ({stats.pending})
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.filterButton,
                filterStatus === 'processing' && styles.filterButtonActive
              ]}
              onPress={() => setFilterStatus('processing')}
            >
              <Text style={[
                styles.filterButtonText,
                filterStatus === 'processing' && styles.filterButtonTextActive
              ]}>
                Processing ({stats.processing})
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.filterButton,
                filterStatus === 'completed' && styles.filterButtonActive
              ]}
              onPress={() => setFilterStatus('completed')}
            >
              <Text style={[
                styles.filterButtonText,
                filterStatus === 'completed' && styles.filterButtonTextActive
              ]}>
                Completed ({stats.completed})
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.filterButton,
                filterStatus === 'rejected' && styles.filterButtonActive
              ]}
              onPress={() => setFilterStatus('rejected')}
            >
              <Text style={[
                styles.filterButtonText,
                filterStatus === 'rejected' && styles.filterButtonTextActive
              ]}>
                Rejected ({stats.rejected})
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Withdrawals List */}
        <View style={commonStyles.card}>
          <Text style={styles.sectionTitle}>
            <IconSymbol 
              ios_icon_name="list.bullet" 
              android_material_icon_name="list" 
              size={20} 
              color={colors.highlight} 
            />
            {' '}Withdrawal Requests ({filteredWithdrawals.length})
          </Text>

          {filteredWithdrawals.length > 0 ? (
            filteredWithdrawals.map((withdrawal) => (
              <View key={withdrawal.id} style={styles.withdrawalCard}>
                <View style={styles.withdrawalHeader}>
                  <View style={styles.withdrawalUserInfo}>
                    <Text style={styles.withdrawalUserName}>{withdrawal.user_name}</Text>
                    <Text style={styles.withdrawalUserEmail}>{withdrawal.user_email}</Text>
                  </View>
                  <View style={[
                    styles.statusBadge,
                    { backgroundColor: `${getStatusColor(withdrawal.status)}20` }
                  ]}>
                    <Text style={[
                      styles.statusBadgeText,
                      { color: getStatusColor(withdrawal.status) }
                    ]}>
                      {getStatusLabel(withdrawal.status)}
                    </Text>
                  </View>
                </View>

                <View style={styles.withdrawalAmount}>
                  <Text style={styles.withdrawalAmountText}>
                    {withdrawal.amount.toFixed(2)} USDT
                  </Text>
                  <Text style={styles.withdrawalSource}>
                    {getSourceLabel(withdrawal.withdrawal_source)}
                  </Text>
                </View>

                <View style={styles.withdrawalDetails}>
                  <View style={styles.withdrawalDetailRow}>
                    <IconSymbol 
                      ios_icon_name="wallet.pass" 
                      android_material_icon_name="account_balance_wallet" 
                      size={16} 
                      color={colors.textSecondary} 
                    />
                    <Text style={styles.withdrawalDetailText} numberOfLines={1}>
                      {withdrawal.wallet_address}
                    </Text>
                  </View>

                  <View style={styles.withdrawalDetailRow}>
                    <IconSymbol 
                      ios_icon_name="calendar" 
                      android_material_icon_name="calendar_today" 
                      size={16} 
                      color={colors.textSecondary} 
                    />
                    <Text style={styles.withdrawalDetailText}>
                      {new Date(withdrawal.created_at).toLocaleString()}
                    </Text>
                  </View>

                  {withdrawal.notes && (
                    <View style={styles.notesBox}>
                      <Text style={styles.notesLabel}>User Notes:</Text>
                      <Text style={styles.notesText}>{withdrawal.notes}</Text>
                    </View>
                  )}

                  {withdrawal.admin_notes && (
                    <View style={[styles.notesBox, { backgroundColor: `${colors.warning}10` }]}>
                      <Text style={styles.notesLabel}>Admin Notes:</Text>
                      <Text style={styles.notesText}>{withdrawal.admin_notes}</Text>
                    </View>
                  )}
                </View>

                {withdrawal.status === 'pending' || withdrawal.status === 'processing' ? (
                  <TouchableOpacity
                    style={styles.manageButton}
                    onPress={() => {
                      setSelectedWithdrawal(withdrawal);
                      setAdminNotes(withdrawal.admin_notes || '');
                    }}
                  >
                    <IconSymbol 
                      ios_icon_name="gearshape.fill" 
                      android_material_icon_name="settings" 
                      size={18} 
                      color={colors.card} 
                    />
                    <Text style={styles.manageButtonText}>Manage</Text>
                  </TouchableOpacity>
                ) : null}
              </View>
            ))
          ) : (
            <View style={styles.emptyState}>
              <IconSymbol 
                ios_icon_name="tray" 
                android_material_icon_name="inbox" 
                size={48} 
                color={colors.textSecondary} 
              />
              <Text style={styles.emptyStateText}>No withdrawals found</Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Management Modal */}
      {selectedWithdrawal && (
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Manage Withdrawal</Text>
            
            <View style={styles.modalInfo}>
              <Text style={styles.modalInfoLabel}>User:</Text>
              <Text style={styles.modalInfoValue}>{selectedWithdrawal.user_name}</Text>
            </View>

            <View style={styles.modalInfo}>
              <Text style={styles.modalInfoLabel}>Amount:</Text>
              <Text style={styles.modalInfoValue}>{selectedWithdrawal.amount.toFixed(2)} USDT</Text>
            </View>

            <View style={styles.modalInfo}>
              <Text style={styles.modalInfoLabel}>Wallet:</Text>
              <Text style={styles.modalInfoValue} numberOfLines={1}>
                {selectedWithdrawal.wallet_address}
              </Text>
            </View>

            <Text style={styles.inputLabel}>Admin Notes</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Enter admin notes..."
              placeholderTextColor={colors.textSecondary}
              value={adminNotes}
              onChangeText={setAdminNotes}
              multiline
              numberOfLines={3}
              editable={!loading}
            />

            <View style={styles.modalButtons}>
              {selectedWithdrawal.status === 'pending' && (
                <TouchableOpacity
                  style={[styles.modalButton, styles.modalButtonProcessing]}
                  onPress={() => handleUpdateStatus(selectedWithdrawal.id, 'processing')}
                  disabled={loading}
                >
                  {loading ? (
                    <ActivityIndicator color={colors.card} size="small" />
                  ) : (
                    <Text style={styles.modalButtonText}>Mark as Processing</Text>
                  )}
                </TouchableOpacity>
              )}

              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonComplete]}
                onPress={() => handleUpdateStatus(selectedWithdrawal.id, 'completed')}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color={colors.card} size="small" />
                ) : (
                  <Text style={styles.modalButtonText}>Complete</Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonReject]}
                onPress={() => handleUpdateStatus(selectedWithdrawal.id, 'rejected')}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color={colors.card} size="small" />
                ) : (
                  <Text style={styles.modalButtonText}>Reject</Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonCancel]}
                onPress={() => {
                  setSelectedWithdrawal(null);
                  setAdminNotes('');
                }}
                disabled={loading}
              >
                <Text style={[styles.modalButtonText, { color: colors.text }]}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
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
  backButton: {
    padding: 4,
  },
  headerTitleContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 100,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 16,
  },
  statBox: {
    flex: 1,
    minWidth: '30%',
    backgroundColor: colors.background,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 8,
    textAlign: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: 16,
  },
  amountStats: {
    gap: 12,
  },
  amountStatRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  amountStatLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  amountStatValue: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
  },
  filterButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: colors.background,
    borderWidth: 2,
    borderColor: colors.border,
  },
  filterButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  filterButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.text,
  },
  filterButtonTextActive: {
    color: colors.card,
  },
  withdrawalCard: {
    backgroundColor: colors.background,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  withdrawalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  withdrawalUserInfo: {
    flex: 1,
  },
  withdrawalUserName: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 2,
  },
  withdrawalUserEmail: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusBadgeText: {
    fontSize: 12,
    fontWeight: '700',
  },
  withdrawalAmount: {
    marginBottom: 12,
  },
  withdrawalAmountText: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
  },
  withdrawalSource: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  withdrawalDetails: {
    gap: 8,
  },
  withdrawalDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  withdrawalDetailText: {
    flex: 1,
    fontSize: 13,
    color: colors.textSecondary,
  },
  notesBox: {
    backgroundColor: `${colors.primary}10`,
    padding: 10,
    borderRadius: 8,
    marginTop: 8,
  },
  notesLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  notesText: {
    fontSize: 12,
    color: colors.textSecondary,
    lineHeight: 18,
  },
  manageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: colors.primary,
    padding: 12,
    borderRadius: 8,
    marginTop: 12,
  },
  manageButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.card,
  },
  emptyState: {
    alignItems: 'center',
    padding: 40,
  },
  emptyStateText: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 12,
  },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContainer: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 500,
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 20,
    textAlign: 'center',
  },
  modalInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  modalInfoLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  modalInfoValue: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text,
    flex: 1,
    textAlign: 'right',
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
    marginTop: 16,
  },
  input: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: 14,
    fontSize: 16,
    color: colors.text,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  modalButtons: {
    gap: 10,
    marginTop: 20,
  },
  modalButton: {
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  modalButtonProcessing: {
    backgroundColor: colors.info,
  },
  modalButtonComplete: {
    backgroundColor: colors.success,
  },
  modalButtonReject: {
    backgroundColor: colors.error,
  },
  modalButtonCancel: {
    backgroundColor: colors.border,
  },
  modalButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.card,
  },
});
