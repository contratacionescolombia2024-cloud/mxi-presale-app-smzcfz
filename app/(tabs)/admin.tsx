
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
  Modal,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '@/contexts/AuthContext';
import { Redirect } from 'expo-router';
import { colors, commonStyles } from '@/styles/commonStyles';
import { IconSymbol } from '@/components/IconSymbol';
import { supabase } from '@/app/integrations/supabase/client';

interface UserProfile {
  id: string;
  name: string;
  email: string;
  identification: string;
  address: string;
  kyc_status: string;
  kyc_documents: string[];
  referral_code: string;
  referred_by: string;
  is_admin: boolean;
  created_at: string;
}

interface MessageData {
  id: string;
  user_id: string;
  user_name: string;
  message: string;
  response: string | null;
  status: string;
  created_at: string;
  updated_at: string;
}

interface PlatformSettings {
  id: string;
  min_purchase_usd: number;
  max_purchase_usd: number;
  monthly_vesting_rate: number;
}

interface AdminMetrics {
  totalUsers: number;
  totalMXISold: number;
  totalRevenue: number;
  pendingKYC: number;
  pendingMessages: number;
  stageBreakdown: {
    stage1?: number;
    stage2?: number;
    stage3?: number;
  };
}

export default function AdminScreen() {
  const { isAdmin, user } = useAuth();
  const [activeTab, setActiveTab] = useState<'metrics' | 'users' | 'kyc' | 'messages' | 'settings'>('metrics');
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Data states
  const [metrics, setMetrics] = useState<AdminMetrics | null>(null);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [kycSubmissions, setKycSubmissions] = useState<UserProfile[]>([]);
  const [messages, setMessages] = useState<MessageData[]>([]);
  const [platformSettings, setPlatformSettings] = useState<PlatformSettings | null>(null);

  // Modal states
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [selectedMessage, setSelectedMessage] = useState<MessageData | null>(null);
  const [selectedKYC, setSelectedKYC] = useState<UserProfile | null>(null);
  const [showUserModal, setShowUserModal] = useState(false);
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [showKYCModal, setShowKYCModal] = useState(false);

  // Form states
  const [balanceAmount, setBalanceAmount] = useState('');
  const [referralLevel, setReferralLevel] = useState('1');
  const [referralAmount, setReferralAmount] = useState('');
  const [messageResponse, setMessageResponse] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    console.log('🔐 Admin Panel - isAdmin:', isAdmin);
    if (isAdmin) {
      loadAllData();
    }
  }, [isAdmin]);

  const loadAllData = async () => {
    console.log('📊 Loading all admin data...');
    setRefreshing(true);
    try {
      await Promise.all([
        loadMetrics(),
        loadUsers(),
        loadKYCSubmissions(),
        loadMessages(),
        loadPlatformSettings(),
      ]);
      console.log('✅ All admin data loaded successfully');
    } catch (error) {
      console.error('❌ Error loading admin data:', error);
      Alert.alert('Error', 'Failed to load admin data. Please try again.');
    } finally {
      setRefreshing(false);
    }
  };

  const loadMetrics = async () => {
    try {
      console.log('📈 Loading metrics...');
      
      // Try using the RPC function first
      const { data: rpcData, error: rpcError } = await supabase.rpc('get_admin_metrics');
      
      if (rpcError) {
        console.error('⚠️ RPC error, falling back to manual queries:', rpcError);
        
        // Fallback to manual queries
        const [usersResult, purchasesResult, kycResult, messagesResult, stagesResult] = await Promise.all([
          supabase.from('users_profiles').select('id', { count: 'exact', head: true }),
          supabase.from('purchases').select('amount_usd').eq('status', 'completed'),
          supabase.from('users_profiles').select('id', { count: 'exact', head: true }).eq('kyc_status', 'pending'),
          supabase.from('messages').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
          supabase.from('presale_stages').select('stage, sold_mxi'),
        ]);

        const totalUsers = usersResult.count || 0;
        const totalRevenue = purchasesResult.data?.reduce((sum, p) => sum + (parseFloat(p.amount_usd?.toString() || '0')), 0) || 0;
        const pendingKYC = kycResult.count || 0;
        const pendingMessages = messagesResult.count || 0;
        
        const stageBreakdown: any = {};
        stagesResult.data?.forEach(stage => {
          stageBreakdown[`stage${stage.stage}`] = parseFloat(stage.sold_mxi?.toString() || '0');
        });

        const totalMXISold = Object.values(stageBreakdown).reduce((sum: number, val: any) => sum + val, 0);

        setMetrics({
          totalUsers,
          totalMXISold,
          totalRevenue,
          pendingKYC,
          pendingMessages,
          stageBreakdown,
        });

        console.log('✅ Metrics loaded (fallback):', { totalUsers, totalMXISold, totalRevenue, pendingKYC, pendingMessages });
      } else {
        console.log('✅ Metrics loaded (RPC):', rpcData);
        setMetrics(rpcData);
      }
    } catch (error) {
      console.error('❌ Error in loadMetrics:', error);
    }
  };

  const loadUsers = async () => {
    try {
      console.log('👥 Loading users...');
      const { data, error } = await supabase
        .from('users_profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ Error loading users:', error);
        throw error;
      }

      console.log(`✅ Loaded ${data?.length || 0} users`);
      setUsers(data || []);
    } catch (error) {
      console.error('❌ Error in loadUsers:', error);
    }
  };

  const loadKYCSubmissions = async () => {
    try {
      console.log('🔍 Loading KYC submissions...');
      const { data, error } = await supabase
        .from('users_profiles')
        .select('*')
        .eq('kyc_status', 'pending')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ Error loading KYC submissions:', error);
        throw error;
      }

      console.log(`✅ Loaded ${data?.length || 0} KYC submissions`);
      setKycSubmissions(data || []);
    } catch (error) {
      console.error('❌ Error in loadKYCSubmissions:', error);
    }
  };

  const loadMessages = async () => {
    try {
      console.log('💬 Loading messages...');
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ Error loading messages:', error);
        throw error;
      }

      console.log(`✅ Loaded ${data?.length || 0} messages`);
      setMessages(data || []);
    } catch (error) {
      console.error('❌ Error in loadMessages:', error);
    }
  };

  const loadPlatformSettings = async () => {
    try {
      console.log('⚙️ Loading platform settings...');
      const { data, error } = await supabase
        .from('platform_settings')
        .select('*')
        .limit(1)
        .maybeSingle();

      if (error) {
        console.error('❌ Error loading platform settings:', error);
        throw error;
      }

      console.log('✅ Platform settings loaded:', data);
      setPlatformSettings(data);
    } catch (error) {
      console.error('❌ Error in loadPlatformSettings:', error);
    }
  };

  const handleAddBalance = async () => {
    if (!selectedUser || !balanceAmount) {
      Alert.alert('Error', 'Please enter a valid amount');
      return;
    }

    const amount = parseFloat(balanceAmount);
    if (isNaN(amount) || amount <= 0) {
      Alert.alert('Error', 'Please enter a valid positive number');
      return;
    }

    setLoading(true);
    try {
      console.log(`💰 Adding ${amount} MXI to user ${selectedUser.id}`);
      
      // Get current vesting data
      const { data: vestingData, error: vestingError } = await supabase
        .from('vesting')
        .select('*')
        .eq('user_id', selectedUser.id)
        .maybeSingle();

      if (vestingError && vestingError.code !== 'PGRST116') {
        throw vestingError;
      }

      if (vestingData) {
        // Update existing vesting
        const newTotal = parseFloat(vestingData.total_mxi) + amount;
        const { error: updateError } = await supabase
          .from('vesting')
          .update({
            total_mxi: newTotal,
            last_update: new Date().toISOString(),
          })
          .eq('user_id', selectedUser.id);

        if (updateError) throw updateError;
        console.log(`✅ Updated balance to ${newTotal} MXI`);
      } else {
        // Create new vesting record
        const { error: insertError } = await supabase
          .from('vesting')
          .insert({
            user_id: selectedUser.id,
            total_mxi: amount,
            current_rewards: 0,
            monthly_rate: 0.03,
            last_update: new Date().toISOString(),
          });

        if (insertError) throw insertError;
        console.log(`✅ Created vesting record with ${amount} MXI`);
      }

      Alert.alert('Success', `Added ${amount} MXI to ${selectedUser.name}'s balance`);
      setBalanceAmount('');
      setShowUserModal(false);
      await loadUsers();
    } catch (error: any) {
      console.error('❌ Error adding balance:', error);
      Alert.alert('Error', error.message || 'Failed to add balance');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveBalance = async () => {
    if (!selectedUser || !balanceAmount) {
      Alert.alert('Error', 'Please enter a valid amount');
      return;
    }

    const amount = parseFloat(balanceAmount);
    if (isNaN(amount) || amount <= 0) {
      Alert.alert('Error', 'Please enter a valid positive number');
      return;
    }

    setLoading(true);
    try {
      console.log(`💸 Removing ${amount} MXI from user ${selectedUser.id}`);
      
      const { data: vestingData, error: vestingError } = await supabase
        .from('vesting')
        .select('*')
        .eq('user_id', selectedUser.id)
        .single();

      if (vestingError) {
        Alert.alert('Error', 'User has no balance to remove');
        return;
      }

      const newTotal = Math.max(0, parseFloat(vestingData.total_mxi) - amount);

      const { error: updateError } = await supabase
        .from('vesting')
        .update({
          total_mxi: newTotal,
          last_update: new Date().toISOString(),
        })
        .eq('user_id', selectedUser.id);

      if (updateError) throw updateError;

      console.log(`✅ Removed ${amount} MXI, new balance: ${newTotal} MXI`);
      Alert.alert('Success', `Removed ${amount} MXI from ${selectedUser.name}'s balance`);
      setBalanceAmount('');
      setShowUserModal(false);
      await loadUsers();
    } catch (error: any) {
      console.error('❌ Error removing balance:', error);
      Alert.alert('Error', error.message || 'Failed to remove balance');
    } finally {
      setLoading(false);
    }
  };

  const handleAddReferral = async () => {
    if (!selectedUser || !referralAmount) {
      Alert.alert('Error', 'Please enter valid referral details');
      return;
    }

    const amount = parseFloat(referralAmount);
    const level = parseInt(referralLevel);

    if (isNaN(amount) || amount <= 0) {
      Alert.alert('Error', 'Please enter a valid positive amount');
      return;
    }

    if (isNaN(level) || level < 1 || level > 3) {
      Alert.alert('Error', 'Referral level must be between 1 and 3');
      return;
    }

    setLoading(true);
    try {
      console.log(`🔗 Adding referral: ${amount} MXI at level ${level} for user ${selectedUser.id}`);

      // Create a referral record
      const { error: referralError } = await supabase
        .from('referrals')
        .insert({
          referrer_id: selectedUser.id,
          referred_id: user?.id, // Using admin as placeholder
          level: level,
          mxi_earned: amount,
          commission_mxi: amount,
        });

      if (referralError) throw referralError;

      // Update vesting with referral earnings
      const { data: vestingData, error: vestingError } = await supabase
        .from('vesting')
        .select('*')
        .eq('user_id', selectedUser.id)
        .maybeSingle();

      if (vestingError && vestingError.code !== 'PGRST116') {
        throw vestingError;
      }

      if (vestingData) {
        const newTotal = parseFloat(vestingData.total_mxi) + amount;
        const { error: updateError } = await supabase
          .from('vesting')
          .update({
            total_mxi: newTotal,
            last_update: new Date().toISOString(),
          })
          .eq('user_id', selectedUser.id);

        if (updateError) throw updateError;
      } else {
        const { error: insertError } = await supabase
          .from('vesting')
          .insert({
            user_id: selectedUser.id,
            total_mxi: amount,
            current_rewards: 0,
            monthly_rate: 0.03,
            last_update: new Date().toISOString(),
          });

        if (insertError) throw insertError;
      }

      console.log(`✅ Added referral earning of ${amount} MXI at level ${level}`);
      Alert.alert(
        'Success', 
        `Added ${amount} MXI referral earnings (Level ${level}) to ${selectedUser.name}'s account`
      );
      setReferralAmount('');
      setReferralLevel('1');
      setShowUserModal(false);
      await loadUsers();
    } catch (error: any) {
      console.error('❌ Error adding referral:', error);
      Alert.alert('Error', error.message || 'Failed to add referral');
    } finally {
      setLoading(false);
    }
  };

  const handleRespondToMessage = async () => {
    if (!selectedMessage || !messageResponse.trim()) {
      Alert.alert('Error', 'Please enter a response');
      return;
    }

    setLoading(true);
    try {
      console.log(`💬 Responding to message ${selectedMessage.id}`);
      
      const { error } = await supabase
        .from('messages')
        .update({
          response: messageResponse.trim(),
          status: 'answered',
          updated_at: new Date().toISOString(),
        })
        .eq('id', selectedMessage.id);

      if (error) throw error;

      console.log('✅ Response sent successfully');
      Alert.alert('Success', 'Response sent successfully');
      setMessageResponse('');
      setShowMessageModal(false);
      await loadMessages();
      await loadMetrics();
    } catch (error: any) {
      console.error('❌ Error responding to message:', error);
      Alert.alert('Error', error.message || 'Failed to send response');
    } finally {
      setLoading(false);
    }
  };

  const handleKYCDecision = async (decision: 'approved' | 'rejected') => {
    if (!selectedKYC) return;

    setLoading(true);
    try {
      console.log(`✅ ${decision === 'approved' ? 'Approving' : 'Rejecting'} KYC for ${selectedKYC.id}`);
      
      const { error } = await supabase
        .from('users_profiles')
        .update({
          kyc_status: decision,
          updated_at: new Date().toISOString(),
        })
        .eq('id', selectedKYC.id);

      if (error) throw error;

      console.log(`✅ KYC ${decision} successfully`);
      Alert.alert('Success', `KYC ${decision} for ${selectedKYC.name}`);
      setShowKYCModal(false);
      await loadKYCSubmissions();
      await loadMetrics();
    } catch (error: any) {
      console.error('❌ Error updating KYC:', error);
      Alert.alert('Error', error.message || 'Failed to update KYC status');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePlatformSettings = async () => {
    if (!platformSettings) return;

    setLoading(true);
    try {
      console.log('⚙️ Updating platform settings...');
      
      const { error } = await supabase
        .from('platform_settings')
        .update({
          min_purchase_usd: platformSettings.min_purchase_usd,
          max_purchase_usd: platformSettings.max_purchase_usd,
          monthly_vesting_rate: platformSettings.monthly_vesting_rate,
          updated_at: new Date().toISOString(),
        })
        .eq('id', platformSettings.id);

      if (error) throw error;

      console.log('✅ Platform settings updated successfully');
      Alert.alert('Success', 'Platform settings updated successfully');
      await loadPlatformSettings();
    } catch (error: any) {
      console.error('❌ Error updating settings:', error);
      Alert.alert('Error', error.message || 'Failed to update settings');
    } finally {
      setLoading(false);
    }
  };

  if (!isAdmin) {
    console.log('⚠️ User is not admin, redirecting...');
    return <Redirect href="/(tabs)/(home)/" />;
  }

  const tabs = [
    { id: 'metrics', label: 'Metrics', iosIcon: 'chart.bar.fill', androidIcon: 'bar_chart' },
    { id: 'users', label: 'Users', iosIcon: 'person.3.fill', androidIcon: 'group' },
    { id: 'kyc', label: 'KYC', iosIcon: 'checkmark.shield.fill', androidIcon: 'verified_user' },
    { id: 'messages', label: 'Messages', iosIcon: 'message.fill', androidIcon: 'message' },
    { id: 'settings', label: 'Settings', iosIcon: 'gearshape.fill', androidIcon: 'settings' },
  ];

  const filteredUsers = users.filter(u => 
    u.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <IconSymbol 
          ios_icon_name="shield.fill" 
          android_material_icon_name="security" 
          size={40} 
          color={colors.error} 
        />
        <Text style={styles.title}>Admin Panel</Text>
        <TouchableOpacity onPress={loadAllData} disabled={refreshing}>
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

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabBar}>
        {tabs.map((tab) => (
          <TouchableOpacity
            key={tab.id}
            style={[styles.tab, activeTab === tab.id && styles.tabActive]}
            onPress={() => setActiveTab(tab.id as any)}
          >
            <IconSymbol 
              ios_icon_name={tab.iosIcon as any} 
              android_material_icon_name={tab.androidIcon as any} 
              size={20} 
              color={activeTab === tab.id ? colors.card : colors.text} 
            />
            <Text style={[styles.tabText, activeTab === tab.id && styles.tabTextActive]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={loadAllData} />
        }
      >
        {/* METRICS TAB */}
        {activeTab === 'metrics' && (
          <>
            {metrics ? (
              <>
                <View style={styles.metricsGrid}>
                  <View style={[commonStyles.card, styles.metricCard]}>
                    <IconSymbol 
                      ios_icon_name="person.3.fill" 
                      android_material_icon_name="group" 
                      size={32} 
                      color={colors.primary} 
                    />
                    <Text style={styles.metricValue}>{metrics.totalUsers.toLocaleString()}</Text>
                    <Text style={styles.metricLabel}>Total Users</Text>
                  </View>

                  <View style={[commonStyles.card, styles.metricCard]}>
                    <IconSymbol 
                      ios_icon_name="bitcoinsign.circle.fill" 
                      android_material_icon_name="currency_bitcoin" 
                      size={32} 
                      color={colors.secondary} 
                    />
                    <Text style={styles.metricValue}>{metrics.totalMXISold.toLocaleString()}</Text>
                    <Text style={styles.metricLabel}>MXI Sold</Text>
                  </View>

                  <View style={[commonStyles.card, styles.metricCard]}>
                    <IconSymbol 
                      ios_icon_name="dollarsign.circle.fill" 
                      android_material_icon_name="attach_money" 
                      size={32} 
                      color={colors.success} 
                    />
                    <Text style={styles.metricValue}>${metrics.totalRevenue.toLocaleString()}</Text>
                    <Text style={styles.metricLabel}>Total Revenue</Text>
                  </View>

                  <View style={[commonStyles.card, styles.metricCard]}>
                    <IconSymbol 
                      ios_icon_name="clock.fill" 
                      android_material_icon_name="schedule" 
                      size={32} 
                      color={colors.warning} 
                    />
                    <Text style={styles.metricValue}>{metrics.pendingKYC}</Text>
                    <Text style={styles.metricLabel}>Pending KYC</Text>
                  </View>
                </View>

                <View style={commonStyles.card}>
                  <Text style={styles.cardTitle}>Stage Breakdown</Text>
                  {metrics.stageBreakdown.stage1 !== undefined && (
                    <View style={styles.stageItem}>
                      <Text style={styles.stageLabel}>Stage 1 ($0.40)</Text>
                      <Text style={styles.stageValue}>{metrics.stageBreakdown.stage1.toLocaleString()} MXI</Text>
                    </View>
                  )}
                  {metrics.stageBreakdown.stage2 !== undefined && (
                    <View style={styles.stageItem}>
                      <Text style={styles.stageLabel}>Stage 2 ($0.70)</Text>
                      <Text style={styles.stageValue}>{metrics.stageBreakdown.stage2.toLocaleString()} MXI</Text>
                    </View>
                  )}
                  {metrics.stageBreakdown.stage3 !== undefined && (
                    <View style={styles.stageItem}>
                      <Text style={styles.stageLabel}>Stage 3 ($1.00)</Text>
                      <Text style={styles.stageValue}>{metrics.stageBreakdown.stage3.toLocaleString()} MXI</Text>
                    </View>
                  )}
                  <View style={styles.totalRow}>
                    <Text style={styles.totalLabel}>Total Sold</Text>
                    <Text style={styles.totalValue}>{metrics.totalMXISold.toLocaleString()} MXI</Text>
                  </View>
                  <View style={styles.progressBar}>
                    <View 
                      style={[styles.progressFill, { width: `${Math.min(100, (metrics.totalMXISold / 25000000) * 100)}%` }]} 
                    />
                  </View>
                  <Text style={styles.progressText}>
                    {((metrics.totalMXISold / 25000000) * 100).toFixed(2)}% of 25M total
                  </Text>
                </View>
              </>
            ) : (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={colors.primary} />
                <Text style={styles.loadingText}>Loading metrics...</Text>
              </View>
            )}
          </>
        )}

        {/* USERS TAB */}
        {activeTab === 'users' && (
          <>
            <View style={commonStyles.card}>
              <Text style={styles.cardTitle}>User Management ({users.length} users)</Text>
              <TextInput
                style={styles.searchInput}
                placeholder="Search users by name or email..."
                placeholderTextColor={colors.textSecondary}
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
            </View>

            {filteredUsers.length > 0 ? (
              filteredUsers.map((u) => (
                <TouchableOpacity
                  key={u.id}
                  style={styles.userCard}
                  onPress={() => {
                    setSelectedUser(u);
                    setShowUserModal(true);
                  }}
                >
                  <View style={styles.userInfo}>
                    <Text style={styles.userName}>{u.name}</Text>
                    <Text style={styles.userEmail}>{u.email}</Text>
                    <Text style={styles.userDetail}>KYC: {u.kyc_status}</Text>
                    <Text style={styles.userDetail}>Referral Code: {u.referral_code}</Text>
                  </View>
                  <IconSymbol 
                    ios_icon_name="chevron.right" 
                    android_material_icon_name="chevron_right" 
                    size={24} 
                    color={colors.textSecondary} 
                  />
                </TouchableOpacity>
              ))
            ) : (
              <View style={styles.emptyState}>
                <Text style={styles.emptyText}>
                  {searchQuery ? 'No users found' : 'No users registered yet'}
                </Text>
              </View>
            )}
          </>
        )}

        {/* KYC TAB */}
        {activeTab === 'kyc' && (
          <>
            <View style={commonStyles.card}>
              <Text style={styles.cardTitle}>KYC Verification</Text>
              <View style={styles.kycStats}>
                <View style={styles.kycStat}>
                  <Text style={styles.kycStatValue}>{kycSubmissions.length}</Text>
                  <Text style={styles.kycStatLabel}>Pending</Text>
                </View>
              </View>
            </View>

            {kycSubmissions.length > 0 ? (
              kycSubmissions.map((kyc) => (
                <TouchableOpacity
                  key={kyc.id}
                  style={styles.kycCard}
                  onPress={() => {
                    setSelectedKYC(kyc);
                    setShowKYCModal(true);
                  }}
                >
                  <View style={styles.kycInfo}>
                    <Text style={styles.kycName}>{kyc.name}</Text>
                    <Text style={styles.kycEmail}>{kyc.email}</Text>
                    <Text style={styles.kycDetail}>ID: {kyc.identification}</Text>
                    <Text style={styles.kycDetail}>Documents: {kyc.kyc_documents?.length || 0}</Text>
                  </View>
                  <IconSymbol 
                    ios_icon_name="chevron.right" 
                    android_material_icon_name="chevron_right" 
                    size={24} 
                    color={colors.textSecondary} 
                  />
                </TouchableOpacity>
              ))
            ) : (
              <View style={styles.emptyState}>
                <IconSymbol 
                  ios_icon_name="checkmark.circle.fill" 
                  android_material_icon_name="check_circle" 
                  size={64} 
                  color={colors.success} 
                />
                <Text style={styles.emptyText}>No pending KYC submissions</Text>
              </View>
            )}
          </>
        )}

        {/* MESSAGES TAB */}
        {activeTab === 'messages' && (
          <>
            <View style={commonStyles.card}>
              <Text style={styles.cardTitle}>User Messages ({messages.length} total)</Text>
              <View style={styles.messageStats}>
                <View style={styles.messageStat}>
                  <IconSymbol 
                    ios_icon_name="envelope.fill" 
                    android_material_icon_name="email" 
                    size={32} 
                    color={colors.warning} 
                  />
                  <Text style={styles.messageStatValue}>
                    {messages.filter(m => m.status === 'pending').length}
                  </Text>
                  <Text style={styles.messageStatLabel}>Pending</Text>
                </View>
                <View style={styles.messageStat}>
                  <IconSymbol 
                    ios_icon_name="checkmark.circle.fill" 
                    android_material_icon_name="check_circle" 
                    size={32} 
                    color={colors.success} 
                  />
                  <Text style={styles.messageStatValue}>
                    {messages.filter(m => m.status === 'answered').length}
                  </Text>
                  <Text style={styles.messageStatLabel}>Answered</Text>
                </View>
              </View>
            </View>

            {messages.length > 0 ? (
              messages.map((msg) => (
                <TouchableOpacity
                  key={msg.id}
                  style={[
                    styles.messageCard,
                    msg.status === 'pending' && styles.messageCardPending
                  ]}
                  onPress={() => {
                    setSelectedMessage(msg);
                    setMessageResponse(msg.response || '');
                    setShowMessageModal(true);
                  }}
                >
                  <View style={styles.messageHeader}>
                    <Text style={styles.messageName}>{msg.user_name}</Text>
                    <View
                      style={[
                        styles.statusBadge,
                        msg.status === 'pending'
                          ? styles.statusBadgePending
                          : styles.statusBadgeAnswered,
                      ]}
                    >
                      <Text
                        style={[
                          styles.statusText,
                          msg.status === 'pending'
                            ? styles.statusTextPending
                            : styles.statusTextAnswered,
                        ]}
                      >
                        {msg.status === 'pending' ? 'Pending' : 'Answered'}
                      </Text>
                    </View>
                  </View>
                  <Text style={styles.messageText} numberOfLines={2}>{msg.message}</Text>
                  {msg.response && (
                    <Text style={styles.messageResponse} numberOfLines={1}>
                      Response: {msg.response}
                    </Text>
                  )}
                  <Text style={styles.messageDate}>
                    {new Date(msg.created_at).toLocaleDateString()} {new Date(msg.created_at).toLocaleTimeString()}
                  </Text>
                </TouchableOpacity>
              ))
            ) : (
              <View style={styles.emptyState}>
                <IconSymbol 
                  ios_icon_name="message.fill" 
                  android_material_icon_name="message" 
                  size={64} 
                  color={colors.textSecondary} 
                />
                <Text style={styles.emptyText}>No messages yet</Text>
              </View>
            )}
          </>
        )}

        {/* SETTINGS TAB */}
        {activeTab === 'settings' && (
          <>
            {platformSettings ? (
              <View style={commonStyles.card}>
                <Text style={styles.cardTitle}>Pre-Sale Settings</Text>
                
                <Text style={styles.inputLabel}>Minimum Purchase (USD)</Text>
                <TextInput
                  style={styles.input}
                  value={platformSettings.min_purchase_usd.toString()}
                  onChangeText={(text) => setPlatformSettings({
                    ...platformSettings,
                    min_purchase_usd: parseFloat(text) || 0
                  })}
                  keyboardType="decimal-pad"
                  placeholder="Minimum purchase amount"
                  placeholderTextColor={colors.textSecondary}
                />

                <Text style={styles.inputLabel}>Maximum Purchase (USD)</Text>
                <TextInput
                  style={styles.input}
                  value={platformSettings.max_purchase_usd.toString()}
                  onChangeText={(text) => setPlatformSettings({
                    ...platformSettings,
                    max_purchase_usd: parseFloat(text) || 0
                  })}
                  keyboardType="decimal-pad"
                  placeholder="Maximum purchase amount"
                  placeholderTextColor={colors.textSecondary}
                />

                <Text style={styles.inputLabel}>Monthly Vesting Rate (%)</Text>
                <TextInput
                  style={styles.input}
                  value={(platformSettings.monthly_vesting_rate * 100).toString()}
                  onChangeText={(text) => setPlatformSettings({
                    ...platformSettings,
                    monthly_vesting_rate: (parseFloat(text) || 0) / 100
                  })}
                  keyboardType="decimal-pad"
                  placeholder="Monthly vesting percentage"
                  placeholderTextColor={colors.textSecondary}
                />

                <TouchableOpacity 
                  style={styles.saveButton}
                  onPress={handleUpdatePlatformSettings}
                  disabled={loading}
                >
                  {loading ? (
                    <ActivityIndicator color={colors.card} />
                  ) : (
                    <Text style={styles.saveButtonText}>Save Changes</Text>
                  )}
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={colors.primary} />
                <Text style={styles.loadingText}>Loading settings...</Text>
              </View>
            )}
          </>
        )}
      </ScrollView>

      {/* User Management Modal */}
      <Modal
        visible={showUserModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowUserModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Manage User</Text>
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
                <Text style={styles.modalUserName}>{selectedUser.name}</Text>
                <Text style={styles.modalUserEmail}>{selectedUser.email}</Text>
                <Text style={styles.modalUserDetail}>ID: {selectedUser.identification}</Text>
                <Text style={styles.modalUserDetail}>Address: {selectedUser.address}</Text>
                <Text style={styles.modalUserDetail}>KYC Status: {selectedUser.kyc_status}</Text>

                <View style={styles.modalSection}>
                  <Text style={styles.modalSectionTitle}>Balance Management</Text>
                  <Text style={styles.modalSectionDescription}>
                    Add or remove MXI tokens from user&apos;s balance
                  </Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Amount (MXI)"
                    placeholderTextColor={colors.textSecondary}
                    value={balanceAmount}
                    onChangeText={setBalanceAmount}
                    keyboardType="decimal-pad"
                  />
                  <View style={styles.buttonRow}>
                    <TouchableOpacity 
                      style={[styles.modalButton, styles.modalButtonSuccess]}
                      onPress={handleAddBalance}
                      disabled={loading}
                    >
                      {loading ? (
                        <ActivityIndicator color={colors.card} size="small" />
                      ) : (
                        <Text style={styles.modalButtonText}>Add Balance</Text>
                      )}
                    </TouchableOpacity>
                    <TouchableOpacity 
                      style={[styles.modalButton, styles.modalButtonDanger]}
                      onPress={handleRemoveBalance}
                      disabled={loading}
                    >
                      {loading ? (
                        <ActivityIndicator color={colors.card} size="small" />
                      ) : (
                        <Text style={styles.modalButtonText}>Remove Balance</Text>
                      )}
                    </TouchableOpacity>
                  </View>
                </View>

                <View style={styles.modalSection}>
                  <Text style={styles.modalSectionTitle}>Referral Earnings Management</Text>
                  <Text style={styles.modalSectionDescription}>
                    Add MXI earned from referrals to user&apos;s account
                  </Text>
                  <Text style={styles.inputLabel}>Referral Level (1-3)</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Level (1-3)"
                    placeholderTextColor={colors.textSecondary}
                    value={referralLevel}
                    onChangeText={setReferralLevel}
                    keyboardType="number-pad"
                  />
                  <View style={styles.levelInfo}>
                    <Text style={styles.levelInfoText}>• Level 1: 5% commission</Text>
                    <Text style={styles.levelInfoText}>• Level 2: 2% commission</Text>
                    <Text style={styles.levelInfoText}>• Level 3: 1% commission</Text>
                  </View>
                  <Text style={styles.inputLabel}>Referral Earnings (MXI)</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Amount (MXI)"
                    placeholderTextColor={colors.textSecondary}
                    value={referralAmount}
                    onChangeText={setReferralAmount}
                    keyboardType="decimal-pad"
                  />
                  <TouchableOpacity 
                    style={[styles.modalButton, styles.modalButtonPrimary]}
                    onPress={handleAddReferral}
                    disabled={loading}
                  >
                    {loading ? (
                      <ActivityIndicator color={colors.card} size="small" />
                    ) : (
                      <>
                        <IconSymbol 
                          ios_icon_name="link.circle.fill" 
                          android_material_icon_name="link" 
                          size={20} 
                          color={colors.card} 
                        />
                        <Text style={styles.modalButtonText}>Add Referral Earnings</Text>
                      </>
                    )}
                  </TouchableOpacity>
                </View>
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>

      {/* Message Response Modal */}
      <Modal
        visible={showMessageModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowMessageModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Respond to Message</Text>
              <TouchableOpacity onPress={() => setShowMessageModal(false)}>
                <IconSymbol 
                  ios_icon_name="xmark.circle.fill" 
                  android_material_icon_name="cancel" 
                  size={28} 
                  color={colors.textSecondary} 
                />
              </TouchableOpacity>
            </View>

            {selectedMessage && (
              <ScrollView>
                <Text style={styles.modalUserName}>{selectedMessage.user_name}</Text>
                <View style={styles.messageBox}>
                  <Text style={styles.messageBoxLabel}>User Message:</Text>
                  <Text style={styles.messageBoxText}>{selectedMessage.message}</Text>
                </View>

                {selectedMessage.response && (
                  <View style={styles.messageBox}>
                    <Text style={styles.messageBoxLabel}>Previous Response:</Text>
                    <Text style={styles.messageBoxText}>{selectedMessage.response}</Text>
                  </View>
                )}

                <Text style={styles.inputLabel}>Your Response:</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  placeholder="Type your response..."
                  placeholderTextColor={colors.textSecondary}
                  value={messageResponse}
                  onChangeText={setMessageResponse}
                  multiline
                  numberOfLines={6}
                />

                <TouchableOpacity 
                  style={[styles.modalButton, styles.modalButtonPrimary]}
                  onPress={handleRespondToMessage}
                  disabled={loading}
                >
                  {loading ? (
                    <ActivityIndicator color={colors.card} />
                  ) : (
                    <Text style={styles.modalButtonText}>Send Response</Text>
                  )}
                </TouchableOpacity>
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>

      {/* KYC Review Modal */}
      <Modal
        visible={showKYCModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowKYCModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Review KYC</Text>
              <TouchableOpacity onPress={() => setShowKYCModal(false)}>
                <IconSymbol 
                  ios_icon_name="xmark.circle.fill" 
                  android_material_icon_name="cancel" 
                  size={28} 
                  color={colors.textSecondary} 
                />
              </TouchableOpacity>
            </View>

            {selectedKYC && (
              <ScrollView>
                <Text style={styles.modalUserName}>{selectedKYC.name}</Text>
                <Text style={styles.modalUserEmail}>{selectedKYC.email}</Text>

                <View style={styles.kycDetailBox}>
                  <Text style={styles.kycDetailLabel}>Identification:</Text>
                  <Text style={styles.kycDetailText}>{selectedKYC.identification}</Text>
                </View>

                <View style={styles.kycDetailBox}>
                  <Text style={styles.kycDetailLabel}>Address:</Text>
                  <Text style={styles.kycDetailText}>{selectedKYC.address}</Text>
                </View>

                <View style={styles.kycDetailBox}>
                  <Text style={styles.kycDetailLabel}>Documents:</Text>
                  <Text style={styles.kycDetailText}>
                    {selectedKYC.kyc_documents?.length || 0} document(s) uploaded
                  </Text>
                  {selectedKYC.kyc_documents && selectedKYC.kyc_documents.length > 0 && (
                    <View style={styles.documentsList}>
                      {selectedKYC.kyc_documents.map((doc, index) => (
                        <Text key={index} style={styles.documentItem}>
                          • Document {index + 1}
                        </Text>
                      ))}
                    </View>
                  )}
                </View>

                <View style={styles.buttonRow}>
                  <TouchableOpacity 
                    style={[styles.modalButton, styles.modalButtonSuccess]}
                    onPress={() => handleKYCDecision('approved')}
                    disabled={loading}
                  >
                    {loading ? (
                      <ActivityIndicator color={colors.card} />
                    ) : (
                      <>
                        <IconSymbol 
                          ios_icon_name="checkmark.circle.fill" 
                          android_material_icon_name="check_circle" 
                          size={20} 
                          color={colors.card} 
                        />
                        <Text style={styles.modalButtonText}>Approve</Text>
                      </>
                    )}
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={[styles.modalButton, styles.modalButtonDanger]}
                    onPress={() => handleKYCDecision('rejected')}
                    disabled={loading}
                  >
                    {loading ? (
                      <ActivityIndicator color={colors.card} />
                    ) : (
                      <>
                        <IconSymbol 
                          ios_icon_name="xmark.circle.fill" 
                          android_material_icon_name="cancel" 
                          size={20} 
                          color={colors.card} 
                        />
                        <Text style={styles.modalButtonText}>Reject</Text>
                      </>
                    )}
                  </TouchableOpacity>
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
  tabBar: {
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    marginRight: 8,
    backgroundColor: colors.card,
  },
  tabActive: {
    backgroundColor: colors.primary,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  tabTextActive: {
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
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 16,
  },
  metricCard: {
    width: '48%',
    alignItems: 'center',
    padding: 16,
  },
  metricValue: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    marginTop: 8,
  },
  metricLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 4,
    textAlign: 'center',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 16,
  },
  stageItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  stageLabel: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  stageValue: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 16,
    marginTop: 8,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  totalValue: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.primary,
  },
  progressBar: {
    height: 8,
    backgroundColor: colors.border,
    borderRadius: 4,
    overflow: 'hidden',
    marginTop: 12,
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.secondary,
  },
  progressText: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 8,
  },
  searchInput: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: 14,
    fontSize: 16,
    color: colors.text,
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
    marginBottom: 4,
  },
  userDetail: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  kycStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 8,
  },
  kycStat: {
    alignItems: 'center',
  },
  kycStatValue: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.warning,
  },
  kycStatLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 4,
  },
  kycCard: {
    ...commonStyles.card,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    marginBottom: 12,
  },
  kycInfo: {
    flex: 1,
  },
  kycName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  kycEmail: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  kycDetail: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  messageStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 8,
  },
  messageStat: {
    alignItems: 'center',
  },
  messageStatValue: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    marginTop: 8,
  },
  messageStatLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 4,
  },
  messageCard: {
    ...commonStyles.card,
    padding: 16,
    marginBottom: 12,
  },
  messageCardPending: {
    borderLeftWidth: 4,
    borderLeftColor: colors.warning,
  },
  messageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  messageName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusBadgePending: {
    backgroundColor: `${colors.warning}20`,
  },
  statusBadgeAnswered: {
    backgroundColor: `${colors.success}20`,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  statusTextPending: {
    color: colors.warning,
  },
  statusTextAnswered: {
    color: colors.success,
  },
  messageText: {
    fontSize: 14,
    color: colors.text,
    marginBottom: 8,
  },
  messageResponse: {
    fontSize: 12,
    color: colors.textSecondary,
    fontStyle: 'italic',
    marginBottom: 8,
  },
  messageDate: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
    marginTop: 8,
  },
  input: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: 14,
    fontSize: 16,
    color: colors.text,
    marginBottom: 16,
  },
  textArea: {
    minHeight: 120,
    textAlignVertical: 'top',
  },
  saveButton: {
    backgroundColor: colors.primary,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.card,
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
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
  modalUserName: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  modalUserEmail: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 8,
  },
  modalUserDetail: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  modalSection: {
    marginTop: 24,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  modalSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  modalSectionDescription: {
    fontSize: 13,
    color: colors.textSecondary,
    marginBottom: 12,
    lineHeight: 18,
  },
  levelInfo: {
    backgroundColor: `${colors.primary}10`,
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  levelInfoText: {
    fontSize: 12,
    color: colors.text,
    marginBottom: 4,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
  },
  modalButton: {
    flex: 1,
    flexDirection: 'row',
    gap: 8,
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalButtonPrimary: {
    backgroundColor: colors.primary,
  },
  modalButtonSuccess: {
    backgroundColor: colors.success,
  },
  modalButtonDanger: {
    backgroundColor: colors.error,
  },
  modalButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.card,
  },
  messageBox: {
    backgroundColor: colors.background,
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  messageBoxLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: 8,
  },
  messageBoxText: {
    fontSize: 14,
    color: colors.text,
    lineHeight: 20,
  },
  kycDetailBox: {
    backgroundColor: colors.background,
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  kycDetailLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: 4,
  },
  kycDetailText: {
    fontSize: 14,
    color: colors.text,
  },
  documentsList: {
    marginTop: 8,
  },
  documentItem: {
    fontSize: 12,
    color: colors.text,
    marginTop: 4,
  },
});
