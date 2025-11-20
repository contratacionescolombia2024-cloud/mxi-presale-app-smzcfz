
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
import { useRouter } from 'expo-router';
import { supabase } from '@/app/integrations/supabase/client';
import { SafeAreaView } from 'react-native-safe-area-context';
import { IconSymbol } from '@/components/IconSymbol';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';

interface VestingData {
  commission_balance: number;
  tournaments_balance: number;
  total_mxi: number;
  purchased_mxi: number;
}

interface Withdrawal {
  id: string;
  wallet_address: string;
  amount: number;
  withdrawal_source: string;
  status: string;
  notes: string | null;
  admin_notes: string | null;
  created_at: string;
  processed_at: string | null;
}

type WithdrawalSource = 'referral_balance' | 'commission_balance' | 'tournament_balance';

export default function WithdrawalsScreen() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [vestingData, setVestingData] = useState<VestingData | null>(null);
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  
  // Form state
  const [walletAddress, setWalletAddress] = useState('');
  const [amount, setAmount] = useState('');
  const [selectedSource, setSelectedSource] = useState<WithdrawalSource | null>(null);
  const [notes, setNotes] = useState('');

  const loadVestingData = useCallback(async () => {
    if (!user?.id) return;

    try {
      const { data, error } = await supabase
        .from('vesting')
        .select('commission_balance, tournaments_balance, total_mxi, purchased_mxi')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) {
        console.error('Error loading vesting data:', error);
        return;
      }

      setVestingData(data);
    } catch (error) {
      console.error('Exception loading vesting data:', error);
    }
  }, [user?.id]);

  const loadWithdrawals = useCallback(async () => {
    if (!user?.id) return;

    try {
      const { data, error } = await supabase
        .from('withdrawals')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error loading withdrawals:', error);
        return;
      }

      setWithdrawals(data || []);
    } catch (error) {
      console.error('Exception loading withdrawals:', error);
    }
  }, [user?.id]);

  useEffect(() => {
    loadVestingData();
    loadWithdrawals();
  }, [loadVestingData, loadWithdrawals]);

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([loadVestingData(), loadWithdrawals()]);
    setRefreshing(false);
  };

  const getAvailableBalance = (source: WithdrawalSource): number => {
    if (!vestingData) return 0;

    switch (source) {
      case 'referral_balance':
        // Referral balance is calculated from total_mxi - purchased_mxi - tournaments_balance - commission_balance
        return Math.max(0, (vestingData.total_mxi || 0) - (vestingData.purchased_mxi || 0) - (vestingData.tournaments_balance || 0) - (vestingData.commission_balance || 0));
      case 'commission_balance':
        return vestingData.commission_balance || 0;
      case 'tournament_balance':
        return vestingData.tournaments_balance || 0;
      default:
        return 0;
    }
  };

  const handleSubmitWithdrawal = async () => {
    // Validation
    if (!walletAddress.trim()) {
      Alert.alert(t('invalidWalletAddress'), t('pleaseEnterWalletAddress'));
      return;
    }

    if (!selectedSource) {
      Alert.alert(t('error'), t('pleaseSelectSource'));
      return;
    }

    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum < 20 || amountNum > 10000) {
      Alert.alert(t('invalidAmount'), t('invalidAmountMessage'));
      return;
    }

    const availableBalance = getAvailableBalance(selectedSource);
    if (amountNum > availableBalance) {
      Alert.alert(
        t('insufficientBalance'),
        `${t('insufficientBalanceMessage')}\n\n${t('availableForWithdrawal')}: ${availableBalance.toFixed(2)} USDT`
      );
      return;
    }

    setLoading(true);

    try {
      // Insert withdrawal request
      const { error: insertError } = await supabase
        .from('withdrawals')
        .insert({
          user_id: user?.id,
          wallet_address: walletAddress.trim(),
          amount: amountNum,
          withdrawal_source: selectedSource,
          notes: notes.trim() || null,
          status: 'pending',
        });

      if (insertError) {
        console.error('Error creating withdrawal:', insertError);
        throw insertError;
      }

      // Deduct from the selected balance
      const updateData: any = {};
      
      if (selectedSource === 'commission_balance') {
        updateData.commission_balance = (vestingData?.commission_balance || 0) - amountNum;
      } else if (selectedSource === 'tournament_balance') {
        updateData.tournaments_balance = (vestingData?.tournaments_balance || 0) - amountNum;
      } else if (selectedSource === 'referral_balance') {
        // For referral balance, we deduct from total_mxi
        updateData.total_mxi = (vestingData?.total_mxi || 0) - amountNum;
      }

      const { error: updateError } = await supabase
        .from('vesting')
        .update(updateData)
        .eq('user_id', user?.id);

      if (updateError) {
        console.error('Error updating balance:', updateError);
        throw updateError;
      }

      Alert.alert(
        t('withdrawalRequested'),
        t('withdrawalRequestedMessage'),
        [
          {
            text: t('ok'),
            onPress: () => {
              // Reset form
              setWalletAddress('');
              setAmount('');
              setSelectedSource(null);
              setNotes('');
              
              // Reload data
              loadVestingData();
              loadWithdrawals();
            }
          }
        ]
      );
    } catch (error: any) {
      console.error('Exception submitting withdrawal:', error);
      Alert.alert(t('withdrawalFailed'), error.message || t('pleaseTryAgain'));
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
          <Text style={styles.title}>{t('withdrawals')}</Text>
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
        {/* Available Balances */}
        <View style={commonStyles.card}>
          <Text style={styles.sectionTitle}>
            <IconSymbol 
              ios_icon_name="chart.bar.fill" 
              android_material_icon_name="bar_chart" 
              size={20} 
              color={colors.secondary} 
            />
            {' '}{t('availableForWithdrawal')}
          </Text>
          
          <View style={styles.balanceGrid}>
            <View style={styles.balanceBox}>
              <Text style={styles.balanceLabel}>{t('referralBalance')}</Text>
              <Text style={styles.balanceValue}>
                {getAvailableBalance('referral_balance').toFixed(2)} USDT
              </Text>
            </View>
            
            <View style={styles.balanceBox}>
              <Text style={styles.balanceLabel}>{t('commissionBalance')}</Text>
              <Text style={styles.balanceValue}>
                {getAvailableBalance('commission_balance').toFixed(2)} USDT
              </Text>
            </View>
            
            <View style={styles.balanceBox}>
              <Text style={styles.balanceLabel}>{t('tournamentBalance')}</Text>
              <Text style={styles.balanceValue}>
                {getAvailableBalance('tournament_balance').toFixed(2)} USDT
              </Text>
            </View>
          </View>

          <View style={styles.infoBox}>
            <IconSymbol 
              ios_icon_name="info.circle.fill" 
              android_material_icon_name="info" 
              size={20} 
              color={colors.info} 
            />
            <Text style={styles.infoText}>{t('withdrawalSourceInfo')}</Text>
          </View>
        </View>

        {/* Withdrawal Request Form */}
        <View style={commonStyles.card}>
          <Text style={styles.sectionTitle}>
            <IconSymbol 
              ios_icon_name="paperplane.fill" 
              android_material_icon_name="send" 
              size={20} 
              color={colors.primary} 
            />
            {' '}{t('requestWithdrawal')}
          </Text>

          {/* Wallet Address */}
          <Text style={styles.inputLabel}>{t('walletAddress')}</Text>
          <TextInput
            style={styles.input}
            placeholder={t('enterWalletAddress')}
            placeholderTextColor={colors.textSecondary}
            value={walletAddress}
            onChangeText={setWalletAddress}
            editable={!loading}
            autoCapitalize="none"
            autoCorrect={false}
          />

          {/* Withdrawal Source */}
          <Text style={styles.inputLabel}>{t('withdrawalSource')}</Text>
          <View style={styles.sourceButtons}>
            <TouchableOpacity
              style={[
                styles.sourceButton,
                selectedSource === 'referral_balance' && styles.sourceButtonActive
              ]}
              onPress={() => setSelectedSource('referral_balance')}
              disabled={loading}
            >
              <Text style={[
                styles.sourceButtonText,
                selectedSource === 'referral_balance' && styles.sourceButtonTextActive
              ]}>
                {t('referralBalance')}
              </Text>
              <Text style={[
                styles.sourceButtonAmount,
                selectedSource === 'referral_balance' && styles.sourceButtonAmountActive
              ]}>
                {getAvailableBalance('referral_balance').toFixed(2)} USDT
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.sourceButton,
                selectedSource === 'commission_balance' && styles.sourceButtonActive
              ]}
              onPress={() => setSelectedSource('commission_balance')}
              disabled={loading}
            >
              <Text style={[
                styles.sourceButtonText,
                selectedSource === 'commission_balance' && styles.sourceButtonTextActive
              ]}>
                {t('commissionBalance')}
              </Text>
              <Text style={[
                styles.sourceButtonAmount,
                selectedSource === 'commission_balance' && styles.sourceButtonAmountActive
              ]}>
                {getAvailableBalance('commission_balance').toFixed(2)} USDT
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.sourceButton,
                selectedSource === 'tournament_balance' && styles.sourceButtonActive
              ]}
              onPress={() => setSelectedSource('tournament_balance')}
              disabled={loading}
            >
              <Text style={[
                styles.sourceButtonText,
                selectedSource === 'tournament_balance' && styles.sourceButtonTextActive
              ]}>
                {t('tournamentBalance')}
              </Text>
              <Text style={[
                styles.sourceButtonAmount,
                selectedSource === 'tournament_balance' && styles.sourceButtonAmountActive
              ]}>
                {getAvailableBalance('tournament_balance').toFixed(2)} USDT
              </Text>
            </TouchableOpacity>
          </View>

          {/* Amount */}
          <Text style={styles.inputLabel}>{t('withdrawalAmount')}</Text>
          <TextInput
            style={styles.input}
            placeholder={t('enterWithdrawalAmount')}
            placeholderTextColor={colors.textSecondary}
            value={amount}
            onChangeText={setAmount}
            keyboardType="decimal-pad"
            editable={!loading}
          />

          <View style={styles.limitsRow}>
            <View style={styles.limitBox}>
              <Text style={styles.limitLabel}>{t('minimumWithdrawal')}</Text>
              <Text style={styles.limitValue}>20 USDT</Text>
            </View>
            <View style={styles.limitBox}>
              <Text style={styles.limitLabel}>{t('maximumWithdrawal')}</Text>
              <Text style={styles.limitValue}>10,000 USDT</Text>
            </View>
          </View>

          {/* Notes */}
          <Text style={styles.inputLabel}>{t('withdrawalNotes')}</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder={t('enterWithdrawalNotes')}
            placeholderTextColor={colors.textSecondary}
            value={notes}
            onChangeText={setNotes}
            multiline
            numberOfLines={3}
            editable={!loading}
          />

          {/* Processing Time Info */}
          <View style={[styles.infoBox, { marginTop: 16 }]}>
            <IconSymbol 
              ios_icon_name="clock.fill" 
              android_material_icon_name="schedule" 
              size={20} 
              color={colors.warning} 
            />
            <View style={{ flex: 1 }}>
              <Text style={styles.infoText}>
                <Text style={{ fontWeight: '700' }}>{t('processingTime')}: </Text>
                {t('hours24to48')}
              </Text>
            </View>
          </View>

          {/* Submit Button */}
          <TouchableOpacity
            style={[
              styles.submitButton,
              (loading || !walletAddress || !selectedSource || !amount) && styles.submitButtonDisabled
            ]}
            onPress={handleSubmitWithdrawal}
            disabled={loading || !walletAddress || !selectedSource || !amount}
          >
            {loading ? (
              <ActivityIndicator color={colors.card} size="small" />
            ) : (
              <React.Fragment>
                <IconSymbol 
                  ios_icon_name="paperplane.fill" 
                  android_material_icon_name="send" 
                  size={20} 
                  color={colors.card} 
                />
                <Text style={styles.submitButtonText}>{t('submitWithdrawal')}</Text>
              </React.Fragment>
            )}
          </TouchableOpacity>
        </View>

        {/* Withdrawal History */}
        <View style={commonStyles.card}>
          <Text style={styles.sectionTitle}>
            <IconSymbol 
              ios_icon_name="clock.fill" 
              android_material_icon_name="history" 
              size={20} 
              color={colors.highlight} 
            />
            {' '}{t('withdrawalHistory')}
          </Text>

          {withdrawals.length > 0 ? (
            withdrawals.map((withdrawal) => (
              <View key={withdrawal.id} style={styles.withdrawalCard}>
                <View style={styles.withdrawalHeader}>
                  <View style={styles.withdrawalAmount}>
                    <Text style={styles.withdrawalAmountText}>
                      {withdrawal.amount.toFixed(2)} USDT
                    </Text>
                    <Text style={styles.withdrawalSource}>
                      {getSourceLabel(withdrawal.withdrawal_source)}
                    </Text>
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
                      {t('requestedOn')}: {new Date(withdrawal.created_at).toLocaleDateString()}
                    </Text>
                  </View>

                  {withdrawal.processed_at && (
                    <View style={styles.withdrawalDetailRow}>
                      <IconSymbol 
                        ios_icon_name="checkmark.circle" 
                        android_material_icon_name="check_circle" 
                        size={16} 
                        color={colors.success} 
                      />
                      <Text style={styles.withdrawalDetailText}>
                        {t('processedOn')}: {new Date(withdrawal.processed_at).toLocaleDateString()}
                      </Text>
                    </View>
                  )}

                  {withdrawal.notes && (
                    <View style={styles.notesBox}>
                      <Text style={styles.notesLabel}>{t('withdrawalNotes')}:</Text>
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
              <Text style={styles.emptyStateText}>{t('noWithdrawalsYet')}</Text>
            </View>
          )}
        </View>
      </ScrollView>
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
  balanceGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 16,
  },
  balanceBox: {
    flex: 1,
    minWidth: '30%',
    backgroundColor: colors.background,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  balanceLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 8,
    textAlign: 'center',
  },
  balanceValue: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
  infoBox: {
    flexDirection: 'row',
    gap: 12,
    backgroundColor: `${colors.info}10`,
    padding: 14,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: colors.info,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: colors.text,
    lineHeight: 20,
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
  sourceButtons: {
    gap: 10,
  },
  sourceButton: {
    backgroundColor: colors.background,
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sourceButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  sourceButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
  },
  sourceButtonTextActive: {
    color: colors.card,
  },
  sourceButtonAmount: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textSecondary,
  },
  sourceButtonAmountActive: {
    color: colors.card,
  },
  limitsRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 12,
  },
  limitBox: {
    flex: 1,
    backgroundColor: colors.background,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  limitLabel: {
    fontSize: 11,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  limitValue: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text,
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: colors.primary,
    padding: 16,
    borderRadius: 12,
    marginTop: 24,
  },
  submitButtonDisabled: {
    opacity: 0.5,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '700',
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
    alignItems: 'center',
    marginBottom: 12,
  },
  withdrawalAmount: {
    flex: 1,
  },
  withdrawalAmountText: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
  },
  withdrawalSource: {
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
  emptyState: {
    alignItems: 'center',
    padding: 40,
  },
  emptyStateText: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 12,
  },
});
