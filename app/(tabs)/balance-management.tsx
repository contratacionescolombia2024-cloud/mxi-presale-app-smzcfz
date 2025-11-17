
import React, { useState, useEffect } from 'react';
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
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '@/contexts/AuthContext';
import { Redirect, useRouter } from 'expo-router';
import { colors, commonStyles } from '@/styles/commonStyles';
import { IconSymbol } from '@/components/IconSymbol';
import { supabase } from '@/app/integrations/supabase/client';

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

  useEffect(() => {
    console.log('🔐 Balance Management - isAdmin:', isAdmin);
    if (isAdmin) {
      loadUsers();
    }
  }, [isAdmin]);

  useEffect(() => {
    if (selectedUser) {
      console.log('👤 Selected user changed:', selectedUser.email);
      loadUserVesting(selectedUser.id);
    }
  }, [selectedUser]);

  const loadUsers = async () => {
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
  };

  const loadUserVesting = async (userId: string) => {
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
  };

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

  const handleAddBalanceNoCommission = async () => {
    console.log('🔘 ADD BALANCE NO COMMISSION BUTTON PRESSED');
    console.log('   Selected User:', selectedUser?.email);
    console.log('   Amount:', amount);

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

    console.log('✅ Validation passed, showing confirmation dialog');

    Alert.alert(
      'Confirm Operation',
      `Add ${amountNum} MXI to ${selectedUser.name}'s balance?\n\n⚠️ This will NOT generate referral commissions.`,
      [
        { 
          text: 'Cancel', 
          style: 'cancel',
          onPress: () => console.log('❌ User cancelled operation')
        },
        {
          text: 'Confirm',
          onPress: async () => {
            console.log('✅ User confirmed operation');
            setLoading(true);
            console.log('💰 ========================================');
            console.log('💰 ADD BALANCE (NO COMMISSION) - EXECUTING');
            console.log('💰 User:', selectedUser.name, '(', selectedUser.id, ')');
            console.log('💰 Amount:', amountNum, 'MXI');
            console.log('💰 ========================================');

            try {
              const oldBalance = vestingData?.total_mxi || 0;
              console.log('📊 Old balance:', oldBalance);

              console.log('📡 Calling RPC function: admin_add_balance_without_commissions');
              console.log('   Parameters:', {
                p_user_id: selectedUser.id,
                p_mxi_amount: amountNum,
              });

              const { data, error } = await supabase.rpc('admin_add_balance_without_commissions', {
                p_user_id: selectedUser.id,
                p_mxi_amount: amountNum,
              });

              console.log('📦 RPC Response received');
              console.log('   Data:', JSON.stringify(data, null, 2));
              console.log('   Error:', error);

              if (error) {
                console.error('❌ RPC Error:', error);
                throw new Error(`RPC error: ${error.message}`);
              }

              if (data && data.success) {
                console.log('✅ Operation successful!');
                console.log('   New total MXI:', data.new_total_mxi);
                console.log('   New purchased MXI:', data.new_purchased_mxi);

                addToHistory({
                  user_name: selectedUser.name,
                  user_email: selectedUser.email,
                  operation: 'add_no_commission',
                  amount: amountNum,
                  old_balance: oldBalance,
                  new_balance: data.new_total_mxi,
                  status: 'success',
                });

                Alert.alert(
                  'Success! ✅',
                  `Added ${amountNum} MXI to ${selectedUser.name}'s balance\n\n` +
                  `📊 Updated Balance:\n` +
                  `• Total MXI: ${data.new_total_mxi.toFixed(2)}\n` +
                  `• Purchased MXI: ${data.new_purchased_mxi.toFixed(2)}`,
                  [
                    {
                      text: 'OK',
                      onPress: () => {
                        console.log('✅ Clearing form and reloading data');
                        setAmount('');
                        loadUserVesting(selectedUser.id);
                      }
                    }
                  ]
                );
              } else {
                const errorMsg = data?.error || 'Failed to add balance';
                console.error('❌ Operation failed:', errorMsg);
                throw new Error(errorMsg);
              }
            } catch (error: any) {
              console.error('❌ EXCEPTION:', error);
              console.error('   Stack:', error.stack);
              addToHistory({
                user_name: selectedUser.name,
                user_email: selectedUser.email,
                operation: 'add_no_commission',
                amount: amountNum,
                old_balance: vestingData?.total_mxi || 0,
                new_balance: vestingData?.total_mxi || 0,
                status: 'error',
                error_message: error.message,
              });
              Alert.alert('Error', `Failed to add balance:\n\n${error.message}`);
            } finally {
              setLoading(false);
              console.log('💰 ========================================');
            }
          }
        }
      ]
    );
  };

  const handleAddBalanceWithCommission = async () => {
    console.log('🔘 ADD BALANCE WITH COMMISSION BUTTON PRESSED');
    console.log('   Selected User:', selectedUser?.email);
    console.log('   Amount:', amount);

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

    console.log('✅ Validation passed, showing confirmation dialog');

    Alert.alert(
      'Confirm Operation',
      `Add ${amountNum} MXI to ${selectedUser.name}'s balance?\n\n✅ This WILL generate referral commissions for their upline.`,
      [
        { 
          text: 'Cancel', 
          style: 'cancel',
          onPress: () => console.log('❌ User cancelled operation')
        },
        {
          text: 'Confirm',
          onPress: async () => {
            console.log('✅ User confirmed operation');
            setLoading(true);
            console.log('💰 ========================================');
            console.log('💰 ADD BALANCE (WITH COMMISSION) - EXECUTING');
            console.log('💰 User:', selectedUser.name, '(', selectedUser.id, ')');
            console.log('💰 Amount:', amountNum, 'MXI');
            console.log('💰 ========================================');

            try {
              const oldBalance = vestingData?.total_mxi || 0;
              console.log('📊 Old balance:', oldBalance);

              console.log('📡 Calling RPC function: admin_add_balance_with_commissions');
              console.log('   Parameters:', {
                p_user_id: selectedUser.id,
                p_amount: amountNum,
              });

              const { data, error } = await supabase.rpc('admin_add_balance_with_commissions', {
                p_user_id: selectedUser.id,
                p_amount: amountNum,
              });

              console.log('📦 RPC Response received');
              console.log('   Data:', JSON.stringify(data, null, 2));
              console.log('   Error:', error);

              if (error) {
                console.error('❌ RPC Error:', error);
                throw new Error(`RPC error: ${error.message}`);
              }

              if (data && data.success) {
                console.log('✅ Operation successful!');
                console.log('   New total MXI:', data.new_total_mxi);
                console.log('   Total commissions:', data.total_commissions);
                console.log('   Referrers paid:', data.referrers_paid);

                addToHistory({
                  user_name: selectedUser.name,
                  user_email: selectedUser.email,
                  operation: 'add_with_commission',
                  amount: amountNum,
                  old_balance: oldBalance,
                  new_balance: data.new_total_mxi,
                  commissions_paid: data.total_commissions,
                  referrers_paid: data.referrers_paid,
                  status: 'success',
                });

                const commissionsMsg = data.total_commissions 
                  ? `\n\n💰 Commissions Distributed:\n${data.total_commissions.toFixed(2)} MXI to ${data.referrers_paid || 0} referrer(s)`
                  : '\n\n(No referrers to pay commissions to)';

                Alert.alert(
                  'Success! ✅',
                  `Added ${amountNum} MXI to ${selectedUser.name}'s balance${commissionsMsg}`,
                  [
                    {
                      text: 'OK',
                      onPress: () => {
                        console.log('✅ Clearing form and reloading data');
                        setAmount('');
                        loadUserVesting(selectedUser.id);
                      }
                    }
                  ]
                );
              } else {
                const errorMsg = data?.error || 'Failed to add balance with commissions';
                console.error('❌ Operation failed:', errorMsg);
                throw new Error(errorMsg);
              }
            } catch (error: any) {
              console.error('❌ EXCEPTION:', error);
              console.error('   Stack:', error.stack);
              addToHistory({
                user_name: selectedUser.name,
                user_email: selectedUser.email,
                operation: 'add_with_commission',
                amount: amountNum,
                old_balance: vestingData?.total_mxi || 0,
                new_balance: vestingData?.total_mxi || 0,
                status: 'error',
                error_message: error.message,
              });
              Alert.alert('Error', `Failed to add balance with commissions:\n\n${error.message}`);
            } finally {
              setLoading(false);
              console.log('💰 ========================================');
            }
          }
        }
      ]
    );
  };

  const handleRemoveBalance = async () => {
    console.log('🔘 REMOVE BALANCE BUTTON PRESSED');
    console.log('   Selected User:', selectedUser?.email);
    console.log('   Amount:', amount);

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

    console.log('✅ Validation passed, showing confirmation dialog');

    Alert.alert(
      'Confirm Removal',
      `Remove ${amountNum} MXI from ${selectedUser.name}'s balance?\n\n⚠️ This action cannot be undone.`,
      [
        { 
          text: 'Cancel', 
          style: 'cancel',
          onPress: () => console.log('❌ User cancelled operation')
        },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            console.log('✅ User confirmed operation');
            setLoading(true);
            console.log('💸 ========================================');
            console.log('💸 REMOVE BALANCE - EXECUTING');
            console.log('💸 User:', selectedUser.name, '(', selectedUser.id, ')');
            console.log('💸 Amount:', amountNum, 'MXI');
            console.log('💸 ========================================');

            try {
              const oldBalance = vestingData?.total_mxi || 0;
              console.log('📊 Old balance:', oldBalance);

              console.log('📡 Calling RPC function: admin_remove_balance');
              console.log('   Parameters:', {
                p_user_id: selectedUser.id,
                p_amount: amountNum,
              });

              const { data, error } = await supabase.rpc('admin_remove_balance', {
                p_user_id: selectedUser.id,
                p_amount: amountNum,
              });

              console.log('📦 RPC Response received');
              console.log('   Data:', JSON.stringify(data, null, 2));
              console.log('   Error:', error);

              if (error) {
                console.error('❌ RPC Error:', error);
                throw new Error(`RPC error: ${error.message}`);
              }

              if (data && data.success) {
                console.log('✅ Operation successful!');
                console.log('   New total MXI:', data.new_total_mxi);
                console.log('   New purchased MXI:', data.new_purchased_mxi);

                addToHistory({
                  user_name: selectedUser.name,
                  user_email: selectedUser.email,
                  operation: 'remove',
                  amount: amountNum,
                  old_balance: oldBalance,
                  new_balance: data.new_total_mxi,
                  status: 'success',
                });

                Alert.alert(
                  'Success! ✅',
                  `Removed ${amountNum} MXI from ${selectedUser.name}'s balance\n\n` +
                  `📊 Updated Balance:\n` +
                  `• Total MXI: ${data.new_total_mxi.toFixed(2)}\n` +
                  `• Purchased MXI: ${data.new_purchased_mxi.toFixed(2)}`,
                  [
                    {
                      text: 'OK',
                      onPress: () => {
                        console.log('✅ Clearing form and reloading data');
                        setAmount('');
                        loadUserVesting(selectedUser.id);
                      }
                    }
                  ]
                );
              } else {
                const errorMsg = data?.error || 'Failed to remove balance';
                console.error('❌ Operation failed:', errorMsg);
                throw new Error(errorMsg);
              }
            } catch (error: any) {
              console.error('❌ EXCEPTION:', error);
              console.error('   Stack:', error.stack);
              addToHistory({
                user_name: selectedUser.name,
                user_email: selectedUser.email,
                operation: 'remove',
                amount: amountNum,
                old_balance: vestingData?.total_mxi || 0,
                new_balance: vestingData?.total_mxi || 0,
                status: 'error',
                error_message: error.message,
              });
              Alert.alert('Error', `Failed to remove balance:\n\n${error.message}`);
            } finally {
              setLoading(false);
              console.log('💸 ========================================');
            }
          }
        }
      ]
    );
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
            />

            <View style={styles.operationButtons}>
              <TouchableOpacity 
                style={[styles.operationButton, styles.operationButtonNoCommission]}
                onPress={handleAddBalanceNoCommission}
                disabled={loading || !amount}
              >
                {loading ? (
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
                style={[styles.operationButton, styles.operationButtonWithCommission]}
                onPress={handleAddBalanceWithCommission}
                disabled={loading || !amount}
              >
                {loading ? (
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
                style={[styles.operationButton, styles.operationButtonRemove]}
                onPress={handleRemoveBalance}
                disabled={loading || !amount}
              >
                {loading ? (
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
});
