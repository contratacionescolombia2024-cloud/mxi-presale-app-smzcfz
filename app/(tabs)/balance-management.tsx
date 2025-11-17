
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

interface UserProfile {
  id: string;
  name: string;
  email: string;
  referral_code: string;
  referred_by: string;
}

interface VestingData {
  user_id: string;
  total_mxi: number;
  purchased_mxi: number;
  current_rewards: number;
}

interface BalanceOperation {
  id: string;
  timestamp: string;
  user_name: string;
  user_email: string;
  operation: 'add_no_commission' | 'add_with_commission' | 'remove';
  amount: number;
  old_balance: number;
  new_balance: number;
  commissions_paid?: number;
  referrers_paid?: number;
  status: 'success' | 'error';
  error_message?: string;
}

export default function BalanceManagementScreen() {
  const { isAdmin, user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [vestingData, setVestingData] = useState<VestingData | null>(null);
  const [amount, setAmount] = useState('');
  const [operationHistory, setOperationHistory] = useState<BalanceOperation[]>([]);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [pendingOperation, setPendingOperation] = useState<'add_no_commission' | 'add_with_commission' | 'remove' | null>(null);

  const loadUsers = useCallback(async () => {
    try {
      console.log('👥 Loading users for balance management...');
      const { data, error } = await supabase
        .from('users_profiles')
        .select('id, name, email, referral_code, referred_by')
        .order('name', { ascending: true });

      if (error) {
        console.error('❌ Error loading users:', error);
        throw error;
      }

      console.log(`✅ Loaded ${data?.length || 0} users`);
      setUsers(data || []);
    } catch (error: any) {
      console.error('❌ Exception in loadUsers:', error);
      Alert.alert('Error', 'Failed to load users');
    }
  }, []);

  const loadUserVesting = useCallback(async (userId: string) => {
    try {
      console.log('📊 Loading vesting data for user:', userId);
      const { data, error } = await supabase
        .from('vesting')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        console.error('❌ Error loading vesting:', error);
        throw error;
      }

      console.log('✅ Vesting data loaded:', data);
      setVestingData(data);
    } catch (error: any) {
      console.error('❌ Exception in loadUserVesting:', error);
      Alert.alert('Error', 'Failed to load user balance');
    }
  }, []);

  useEffect(() => {
    console.log('🔐 Balance Management - isAdmin:', isAdmin);
    console.log('🔐 Balance Management - user:', user?.email);
    if (isAdmin) {
      loadUsers();
    }
  }, [isAdmin, user?.email, loadUsers]);

  useEffect(() => {
    if (selectedUser) {
      console.log('👤 Selected user changed:', selectedUser.email);
      loadUserVesting(selectedUser.id);
    }
  }, [selectedUser, loadUserVesting]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadUsers();
    if (selectedUser) {
      await loadUserVesting(selectedUser.id);
    }
    setRefreshing(false);
  };

  const addToHistory = (operation: Omit<BalanceOperation, 'id' | 'timestamp'>) => {
    const newOperation: BalanceOperation = {
      ...operation,
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
    };
    setOperationHistory(prev => [newOperation, ...prev]);
  };

  // ============================================================================
  // BUTTON CLICK HANDLERS - SHOW CONFIRMATION FIRST
  // ============================================================================

  const handleAddBalanceNoCommissionClick = () => {
    console.log('🔥🔥🔥 ADD NO COMMISSION BUTTON CLICKED 🔥🔥🔥');
    console.log('   Selected User:', selectedUser?.email);
    console.log('   Amount:', amount);
    console.log('   Loading:', loading);
    
    if (!selectedUser || !amount) {
      console.log('❌ Validation failed: missing user or amount');
      Alert.alert('Error', 'Please select a user and enter an amount');
      return;
    }

    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      console.log('❌ Validation failed: invalid amount');
      Alert.alert('Error', 'Please enter a valid positive number');
      return;
    }

    console.log('✅ Validation passed, showing confirmation');
    setPendingOperation('add_no_commission');
    setShowConfirmDialog(true);
  };

  const handleAddBalanceWithCommissionClick = () => {
    console.log('🔥🔥🔥 ADD WITH COMMISSION BUTTON CLICKED 🔥🔥🔥');
    console.log('   Selected User:', selectedUser?.email);
    console.log('   Amount:', amount);
    console.log('   Loading:', loading);
    
    if (!selectedUser || !amount) {
      console.log('❌ Validation failed: missing user or amount');
      Alert.alert('Error', 'Please select a user and enter an amount');
      return;
    }

    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      console.log('❌ Validation failed: invalid amount');
      Alert.alert('Error', 'Please enter a valid positive number');
      return;
    }

    console.log('✅ Validation passed, showing confirmation');
    setPendingOperation('add_with_commission');
    setShowConfirmDialog(true);
  };

  const handleRemoveBalanceClick = () => {
    console.log('🔥🔥🔥 REMOVE BALANCE BUTTON CLICKED 🔥🔥🔥');
    console.log('   Selected User:', selectedUser?.email);
    console.log('   Amount:', amount);
    console.log('   Loading:', loading);
    
    if (!selectedUser || !amount) {
      console.log('❌ Validation failed: missing user or amount');
      Alert.alert('Error', 'Please select a user and enter an amount');
      return;
    }

    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      console.log('❌ Validation failed: invalid amount');
      Alert.alert('Error', 'Please enter a valid positive number');
      return;
    }

    const currentBalance = vestingData?.total_mxi || 0;
    if (currentBalance < amountNum) {
      console.log('❌ Insufficient balance');
      Alert.alert(
        'Insufficient Balance',
        `User only has ${currentBalance.toFixed(2)} MXI. Cannot remove ${amountNum} MXI.`
      );
      return;
    }

    console.log('✅ Validation passed, showing confirmation');
    setPendingOperation('remove');
    setShowConfirmDialog(true);
  };

  // ============================================================================
  // ACTUAL OPERATION EXECUTION
  // ============================================================================

  const executeOperation = async () => {
    console.log('🚀 EXECUTING OPERATION:', pendingOperation);
    setShowConfirmDialog(false);
    
    if (!selectedUser || !amount || !pendingOperation) {
      console.log('❌ Missing required data');
      return;
    }

    const amountNum = parseFloat(amount);
    const oldBalance = vestingData?.total_mxi || 0;

    setLoading(true);

    try {
      console.log('🔥 STEP 1: Verify Supabase connection');
      const { data: testData, error: testError } = await supabase
        .from('users_profiles')
        .select('id')
        .eq('id', selectedUser.id)
        .single();
      
      if (testError) {
        console.error('❌ Supabase connection test failed:', testError);
        throw new Error(`Connection test failed: ${testError.message}`);
      }
      console.log('✅ Supabase connection OK');

      let rpcFunction = '';
      let rpcParams: any = {};

      if (pendingOperation === 'add_no_commission') {
        rpcFunction = 'admin_add_balance_without_commissions';
        rpcParams = {
          p_user_id: selectedUser.id,
          p_mxi_amount: amountNum,
        };
      } else if (pendingOperation === 'add_with_commission') {
        rpcFunction = 'admin_add_balance_with_commissions';
        rpcParams = {
          p_user_id: selectedUser.id,
          p_amount: amountNum,
        };
      } else if (pendingOperation === 'remove') {
        rpcFunction = 'admin_remove_balance';
        rpcParams = {
          p_user_id: selectedUser.id,
          p_amount: amountNum,
        };
      }

      console.log('🔥 STEP 2: Calling RPC function');
      console.log('   Function:', rpcFunction);
      console.log('   Parameters:', JSON.stringify(rpcParams, null, 2));

      const { data: rpcData, error: rpcError } = await supabase.rpc(
        rpcFunction,
        rpcParams
      );

      console.log('🔥 STEP 3: RPC Response received');
      console.log('   Data:', JSON.stringify(rpcData, null, 2));
      console.log('   Error:', rpcError);

      if (rpcError) {
        console.error('❌ RPC Error:', rpcError);
        throw new Error(`RPC error: ${rpcError.message}`);
      }

      // Handle both direct object and array-wrapped responses
      let responseData = rpcData;
      if (Array.isArray(rpcData) && rpcData.length > 0) {
        console.log('⚠️ Response is array-wrapped, extracting first element');
        responseData = rpcData[0];
      }

      console.log('🔥 STEP 4: Process response');
      console.log('   Processed data:', responseData);

      if (responseData && responseData.success) {
        console.log('✅ Operation successful!');
        
        const historyEntry: Omit<BalanceOperation, 'id' | 'timestamp'> = {
          user_name: selectedUser.name,
          user_email: selectedUser.email,
          operation: pendingOperation,
          amount: amountNum,
          old_balance: oldBalance,
          new_balance: responseData.new_total_mxi,
          status: 'success',
        };

        if (pendingOperation === 'add_with_commission') {
          historyEntry.commissions_paid = responseData.total_commissions;
          historyEntry.referrers_paid = responseData.referrers_paid;
        }

        addToHistory(historyEntry);

        let successMessage = '';
        if (pendingOperation === 'add_no_commission') {
          successMessage = `Added ${amountNum} MXI to ${selectedUser.name}'s balance\n\n` +
            `📊 Updated Balance:\n` +
            `• Total MXI: ${responseData.new_total_mxi.toFixed(2)}\n` +
            `• Purchased MXI: ${responseData.new_purchased_mxi.toFixed(2)}`;
        } else if (pendingOperation === 'add_with_commission') {
          const commissionsMsg = responseData.total_commissions 
            ? `\n\n💰 Commissions Distributed:\n${responseData.total_commissions.toFixed(2)} MXI to ${responseData.referrers_paid || 0} referrer(s)`
            : '\n\n(No referrers to pay commissions to)';
          successMessage = `Added ${amountNum} MXI to ${selectedUser.name}'s balance${commissionsMsg}`;
        } else if (pendingOperation === 'remove') {
          successMessage = `Removed ${amountNum} MXI from ${selectedUser.name}'s balance\n\n` +
            `📊 Updated Balance:\n` +
            `• Total MXI: ${responseData.new_total_mxi.toFixed(2)}\n` +
            `• Purchased MXI: ${responseData.new_purchased_mxi.toFixed(2)}`;
        }

        Alert.alert('Success! ✅', successMessage, [
          {
            text: 'OK',
            onPress: () => {
              setAmount('');
              loadUserVesting(selectedUser.id);
            }
          }
        ]);
      } else {
        const errorMsg = responseData?.error || 'Operation failed';
        console.error('❌ Operation failed:', errorMsg);
        throw new Error(errorMsg);
      }
    } catch (error: any) {
      console.error('❌ EXCEPTION:', error);
      console.error('   Message:', error.message);
      console.error('   Stack:', error.stack);
      
      addToHistory({
        user_name: selectedUser.name,
        user_email: selectedUser.email,
        operation: pendingOperation,
        amount: amountNum,
        old_balance: oldBalance,
        new_balance: oldBalance,
        status: 'error',
        error_message: error.message,
      });
      
      Alert.alert(
        'Error',
        `Operation failed:\n\n${error.message}\n\nCheck console logs for details.`
      );
    } finally {
      setLoading(false);
      setPendingOperation(null);
      console.log('🔥🔥🔥 ========================================');
    }
  };

  if (!isAdmin) {
    console.log('⚠️ User is not admin, redirecting...');
    return <Redirect href="/(tabs)/(home)/" />;
  }

  const filteredUsers = users.filter(u => 
    u.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.referral_code?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getOperationIcon = (operation: string) => {
    switch (operation) {
      case 'add_no_commission':
        return { ios: 'plus.circle', android: 'add_circle_outline', color: colors.primary };
      case 'add_with_commission':
        return { ios: 'plus.circle.fill', android: 'add_circle', color: colors.secondary };
      case 'remove':
        return { ios: 'minus.circle.fill', android: 'remove_circle', color: colors.error };
      default:
        return { ios: 'circle', android: 'circle', color: colors.text };
    }
  };

  const getOperationLabel = (operation: string) => {
    switch (operation) {
      case 'add_no_commission':
        return 'Add (No Commission)';
      case 'add_with_commission':
        return 'Add (With Commission)';
      case 'remove':
        return 'Remove Balance';
      default:
        return operation;
    }
  };

  const getConfirmationMessage = () => {
    if (!selectedUser || !amount || !pendingOperation) return '';
    
    const amountNum = parseFloat(amount);
    
    if (pendingOperation === 'add_no_commission') {
      return `Add ${amountNum} MXI to ${selectedUser.name}'s balance?\n\n⚠️ This will NOT generate referral commissions.`;
    } else if (pendingOperation === 'add_with_commission') {
      return `Add ${amountNum} MXI to ${selectedUser.name}'s balance?\n\n✅ This WILL generate referral commissions for their upline.`;
    } else if (pendingOperation === 'remove') {
      return `Remove ${amountNum} MXI from ${selectedUser.name}'s balance?\n\n⚠️ This action cannot be undone.`;
    }
    
    return '';
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
            ios_icon_name="dollarsign.circle.fill" 
            android_material_icon_name="account_balance_wallet" 
            size={32} 
            color={colors.primary} 
          />
          <Text style={styles.title}>Balance Management</Text>
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
        {/* User Selection */}
        <View style={commonStyles.card}>
          <Text style={styles.sectionTitle}>
            <IconSymbol 
              ios_icon_name="person.circle.fill" 
              android_material_icon_name="account_circle" 
              size={20} 
              color={colors.primary} 
            />
            {' '}Select User
          </Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Search by name, email, or referral code..."
            placeholderTextColor={colors.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          
          {selectedUser ? (
            <View style={styles.selectedUserCard}>
              <View style={styles.selectedUserInfo}>
                <Text style={styles.selectedUserName}>{selectedUser.name}</Text>
                <Text style={styles.selectedUserEmail}>{selectedUser.email}</Text>
                <Text style={styles.selectedUserDetail}>Code: {selectedUser.referral_code}</Text>
                {selectedUser.referred_by && (
                  <Text style={styles.selectedUserDetail}>Referred by: {selectedUser.referred_by}</Text>
                )}
              </View>
              <TouchableOpacity onPress={() => setSelectedUser(null)}>
                <IconSymbol 
                  ios_icon_name="xmark.circle.fill" 
                  android_material_icon_name="cancel" 
                  size={28} 
                  color={colors.error} 
                />
              </TouchableOpacity>
            </View>
          ) : (
            <ScrollView style={styles.userList} nestedScrollEnabled>
              {filteredUsers.length > 0 ? (
                filteredUsers.slice(0, 10).map((u) => (
                  <TouchableOpacity
                    key={u.id}
                    style={styles.userItem}
                    onPress={() => setSelectedUser(u)}
                  >
                    <View style={styles.userItemInfo}>
                      <Text style={styles.userItemName}>{u.name}</Text>
                      <Text style={styles.userItemEmail}>{u.email}</Text>
                    </View>
                    <IconSymbol 
                      ios_icon_name="chevron.right" 
                      android_material_icon_name="chevron_right" 
                      size={20} 
                      color={colors.textSecondary} 
                    />
                  </TouchableOpacity>
                ))
              ) : (
                <Text style={styles.emptyText}>
                  {searchQuery ? 'No users found' : 'No users available'}
                </Text>
              )}
              {filteredUsers.length > 10 && (
                <Text style={styles.moreUsersText}>
                  +{filteredUsers.length - 10} more users. Refine your search.
                </Text>
              )}
            </ScrollView>
          )}
        </View>

        {/* Current Balance Display */}
        {selectedUser && vestingData && (
          <View style={commonStyles.card}>
            <Text style={styles.sectionTitle}>
              <IconSymbol 
                ios_icon_name="chart.bar.fill" 
                android_material_icon_name="bar_chart" 
                size={20} 
                color={colors.secondary} 
              />
              {' '}Current Balance
            </Text>
            <View style={styles.balanceGrid}>
              <View style={styles.balanceBox}>
                <Text style={styles.balanceLabel}>Total MXI</Text>
                <Text style={styles.balanceValue}>{vestingData.total_mxi.toFixed(2)}</Text>
              </View>
              <View style={styles.balanceBox}>
                <Text style={styles.balanceLabel}>Purchased MXI</Text>
                <Text style={styles.balanceValue}>{vestingData.purchased_mxi.toFixed(2)}</Text>
              </View>
              <View style={styles.balanceBox}>
                <Text style={styles.balanceLabel}>Vesting Rewards</Text>
                <Text style={styles.balanceValue}>{vestingData.current_rewards.toFixed(2)}</Text>
              </View>
            </View>
          </View>
        )}

        {/* Balance Operations */}
        {selectedUser && (
          <View style={commonStyles.card}>
            <Text style={styles.sectionTitle}>
              <IconSymbol 
                ios_icon_name="slider.horizontal.3" 
                android_material_icon_name="tune" 
                size={20} 
                color={colors.accent} 
              />
              {' '}Balance Operations
            </Text>
            
            <Text style={styles.inputLabel}>Amount (MXI)</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter amount in MXI"
              placeholderTextColor={colors.textSecondary}
              value={amount}
              onChangeText={setAmount}
              keyboardType="decimal-pad"
              editable={!loading}
            />

            <View style={styles.operationButtons}>
              <TouchableOpacity 
                style={[
                  styles.operationButton, 
                  styles.operationButtonNoCommission,
                  (loading || !amount) && styles.operationButtonDisabled
                ]}
                onPress={handleAddBalanceNoCommissionClick}
                disabled={loading || !amount}
                activeOpacity={0.7}
              >
                {loading && pendingOperation === 'add_no_commission' ? (
                  <ActivityIndicator color={colors.card} size="small" />
                ) : (
                  <React.Fragment>
                    <IconSymbol 
                      ios_icon_name="plus.circle" 
                      android_material_icon_name="add_circle_outline" 
                      size={24} 
                      color={colors.card} 
                    />
                    <View style={styles.operationButtonTextContainer}>
                      <Text style={styles.operationButtonTitle}>Add Balance</Text>
                      <Text style={styles.operationButtonSubtitle}>No Commission</Text>
                    </View>
                  </React.Fragment>
                )}
              </TouchableOpacity>

              <TouchableOpacity 
                style={[
                  styles.operationButton, 
                  styles.operationButtonWithCommission,
                  (loading || !amount) && styles.operationButtonDisabled
                ]}
                onPress={handleAddBalanceWithCommissionClick}
                disabled={loading || !amount}
                activeOpacity={0.7}
              >
                {loading && pendingOperation === 'add_with_commission' ? (
                  <ActivityIndicator color={colors.card} size="small" />
                ) : (
                  <React.Fragment>
                    <IconSymbol 
                      ios_icon_name="plus.circle.fill" 
                      android_material_icon_name="add_circle" 
                      size={24} 
                      color={colors.card} 
                    />
                    <View style={styles.operationButtonTextContainer}>
                      <Text style={styles.operationButtonTitle}>Add Balance</Text>
                      <Text style={styles.operationButtonSubtitle}>With Commission</Text>
                    </View>
                  </React.Fragment>
                )}
              </TouchableOpacity>

              <TouchableOpacity 
                style={[
                  styles.operationButton, 
                  styles.operationButtonRemove,
                  (loading || !amount) && styles.operationButtonDisabled
                ]}
                onPress={handleRemoveBalanceClick}
                disabled={loading || !amount}
                activeOpacity={0.7}
              >
                {loading && pendingOperation === 'remove' ? (
                  <ActivityIndicator color={colors.card} size="small" />
                ) : (
                  <React.Fragment>
                    <IconSymbol 
                      ios_icon_name="minus.circle.fill" 
                      android_material_icon_name="remove_circle" 
                      size={24} 
                      color={colors.card} 
                    />
                    <View style={styles.operationButtonTextContainer}>
                      <Text style={styles.operationButtonTitle}>Remove Balance</Text>
                      <Text style={styles.operationButtonSubtitle}>Deduct from total</Text>
                    </View>
                  </React.Fragment>
                )}
              </TouchableOpacity>
            </View>

            <View style={styles.infoBox}>
              <IconSymbol 
                ios_icon_name="info.circle.fill" 
                android_material_icon_name="info" 
                size={20} 
                color={colors.primary} 
              />
              <View style={styles.infoBoxContent}>
                <Text style={styles.infoBoxTitle}>Commission Rates:</Text>
                <Text style={styles.infoBoxText}>- Level 1: 5%</Text>
                <Text style={styles.infoBoxText}>- Level 2: 2%</Text>
                <Text style={styles.infoBoxText}>- Level 3: 1%</Text>
              </View>
            </View>
          </View>
        )}

        {/* Operation History */}
        {operationHistory.length > 0 && (
          <View style={commonStyles.card}>
            <Text style={styles.sectionTitle}>
              <IconSymbol 
                ios_icon_name="clock.fill" 
                android_material_icon_name="history" 
                size={20} 
                color={colors.highlight} 
              />
              {' '}Operation History (Session)
            </Text>
            {operationHistory.map((op) => {
              const icon = getOperationIcon(op.operation);
              return (
                <View 
                  key={op.id} 
                  style={[
                    styles.historyItem,
                    op.status === 'error' && styles.historyItemError
                  ]}
                >
                  <IconSymbol 
                    ios_icon_name={icon.ios as any} 
                    android_material_icon_name={icon.android as any} 
                    size={24} 
                    color={op.status === 'error' ? colors.error : icon.color} 
                  />
                  <View style={styles.historyItemContent}>
                    <Text style={styles.historyItemTitle}>
                      {getOperationLabel(op.operation)}
                    </Text>
                    <Text style={styles.historyItemUser}>
                      {op.user_name} ({op.user_email})
                    </Text>
                    <Text style={styles.historyItemAmount}>
                      Amount: {op.amount.toFixed(2)} MXI
                    </Text>
                    <Text style={styles.historyItemBalance}>
                      Balance: {op.old_balance.toFixed(2)} → {op.new_balance.toFixed(2)} MXI
                    </Text>
                    {op.commissions_paid !== undefined && op.commissions_paid > 0 && (
                      <Text style={styles.historyItemCommission}>
                        Commissions: {op.commissions_paid.toFixed(2)} MXI to {op.referrers_paid} referrer(s)
                      </Text>
                    )}
                    {op.status === 'error' && op.error_message && (
                      <Text style={styles.historyItemErrorText}>
                        Error: {op.error_message}
                      </Text>
                    )}
                    <Text style={styles.historyItemTime}>
                      {new Date(op.timestamp).toLocaleString()}
                    </Text>
                  </View>
                  <View style={[
                    styles.historyItemStatus,
                    op.status === 'success' ? styles.historyItemStatusSuccess : styles.historyItemStatusError
                  ]}>
                    <Text style={styles.historyItemStatusText}>
                      {op.status === 'success' ? '✓' : '✗'}
                    </Text>
                  </View>
                </View>
              );
            })}
          </View>
        )}
      </ScrollView>

      {/* Custom Confirmation Dialog */}
      {showConfirmDialog && (
        <View style={styles.dialogOverlay}>
          <View style={styles.dialogContainer}>
            <Text style={styles.dialogTitle}>Confirm Operation</Text>
            <Text style={styles.dialogMessage}>{getConfirmationMessage()}</Text>
            <View style={styles.dialogButtons}>
              <TouchableOpacity 
                style={[styles.dialogButton, styles.dialogButtonCancel]}
                onPress={() => {
                  console.log('❌ Operation cancelled by user');
                  setShowConfirmDialog(false);
                  setPendingOperation(null);
                }}
              >
                <Text style={styles.dialogButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.dialogButton, styles.dialogButtonConfirm]}
                onPress={executeOperation}
              >
                <Text style={[styles.dialogButtonText, styles.dialogButtonTextConfirm]}>
                  {pendingOperation === 'remove' ? 'Remove' : 'Confirm'}
                </Text>
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
  selectedUserCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: `${colors.primary}15`,
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.primary,
  },
  selectedUserInfo: {
    flex: 1,
  },
  selectedUserName: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
  },
  selectedUserEmail: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  selectedUserDetail: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  userList: {
    maxHeight: 300,
  },
  userItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  userItemInfo: {
    flex: 1,
  },
  userItemName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 2,
  },
  userItemEmail: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  emptyText: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    padding: 20,
  },
  moreUsersText: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'center',
    padding: 12,
    fontStyle: 'italic',
  },
  balanceGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
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
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  input: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: 14,
    fontSize: 16,
    color: colors.text,
    marginBottom: 20,
  },
  operationButtons: {
    gap: 12,
    marginBottom: 20,
  },
  operationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 18,
    borderRadius: 12,
  },
  operationButtonDisabled: {
    opacity: 0.5,
  },
  operationButtonNoCommission: {
    backgroundColor: colors.primary,
  },
  operationButtonWithCommission: {
    backgroundColor: colors.secondary,
  },
  operationButtonRemove: {
    backgroundColor: colors.error,
  },
  operationButtonTextContainer: {
    flex: 1,
  },
  operationButtonTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.card,
    marginBottom: 2,
  },
  operationButtonSubtitle: {
    fontSize: 12,
    color: colors.card,
    opacity: 0.9,
  },
  infoBox: {
    flexDirection: 'row',
    gap: 12,
    backgroundColor: `${colors.primary}10`,
    padding: 16,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
  },
  infoBoxContent: {
    flex: 1,
  },
  infoBoxTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  infoBoxText: {
    fontSize: 13,
    color: colors.text,
    marginBottom: 4,
  },
  historyItem: {
    flexDirection: 'row',
    gap: 12,
    padding: 16,
    backgroundColor: colors.background,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  historyItemError: {
    borderColor: colors.error,
    backgroundColor: `${colors.error}05`,
  },
  historyItemContent: {
    flex: 1,
  },
  historyItemTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  historyItemUser: {
    fontSize: 13,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  historyItemAmount: {
    fontSize: 13,
    color: colors.text,
    marginBottom: 2,
  },
  historyItemBalance: {
    fontSize: 13,
    color: colors.text,
    marginBottom: 2,
  },
  historyItemCommission: {
    fontSize: 12,
    color: colors.secondary,
    marginBottom: 2,
  },
  historyItemErrorText: {
    fontSize: 12,
    color: colors.error,
    marginTop: 4,
  },
  historyItemTime: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 4,
  },
  historyItemStatus: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  historyItemStatusSuccess: {
    backgroundColor: colors.success,
  },
  historyItemStatusError: {
    backgroundColor: colors.error,
  },
  historyItemStatusText: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.card,
  },
  dialogOverlay: {
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
  dialogContainer: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 400,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  dialogTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 12,
    textAlign: 'center',
  },
  dialogMessage: {
    fontSize: 16,
    color: colors.text,
    marginBottom: 24,
    textAlign: 'center',
    lineHeight: 24,
  },
  dialogButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  dialogButton: {
    flex: 1,
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  dialogButtonCancel: {
    backgroundColor: colors.border,
  },
  dialogButtonConfirm: {
    backgroundColor: colors.primary,
  },
  dialogButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  dialogButtonTextConfirm: {
    color: colors.card,
  },
});
