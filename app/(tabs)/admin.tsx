
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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '@/contexts/AuthContext';
import { Redirect } from 'expo-router';
import { colors, commonStyles } from '@/styles/commonStyles';
import { IconSymbol } from '@/components/IconSymbol';
import { AdminMetrics, User, Message } from '@/types';
import { supabase } from '@/app/integrations/supabase/client';

interface KYCSubmission {
  id: string;
  name: string;
  email: string;
  identification: string;
  address: string;
  kycStatus: string;
  kycDocuments: string[];
}

interface PlatformSettings {
  id: string;
  min_purchase_usd: number;
  max_purchase_usd: number;
  monthly_vesting_rate: number;
}

export default function AdminScreen() {
  const { isAdmin, user } = useAuth();
  const [activeTab, setActiveTab] = useState<'metrics' | 'users' | 'kyc' | 'messages' | 'settings'>('metrics');
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Data states
  const [metrics, setMetrics] = useState<AdminMetrics | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [kycSubmissions, setKycSubmissions] = useState<KYCSubmission[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [platformSettings, setPlatformSettings] = useState<PlatformSettings | null>(null);

  // Modal states
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [selectedKYC, setSelectedKYC] = useState<KYCSubmission | null>(null);
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
    if (isAdmin) {
      loadAllData();
    }
  }, [isAdmin]);

  const loadAllData = async () => {
    setRefreshing(true);
    try {
      await Promise.all([
        loadMetrics(),
        loadUsers(),
        loadKYCSubmissions(),
        loadMessages(),
        loadPlatformSettings(),
      ]);
    } catch (error) {
      console.error('Error loading admin data:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const loadMetrics = async () => {
    try {
      const { data, error } = await supabase.rpc('get_admin_metrics');
      
      if (error) {
        console.error('Error loading metrics:', error);
        return;
      }

      if (data) {
        setMetrics({
          totalUsers: data.totalUsers || 0,
          totalMXISold: data.totalMXISold || 0,
          totalRevenue: data.totalRevenue || 0,
          currentStage: 1,
          pendingKYC: data.pendingKYC || 0,
          pendingMessages: data.pendingMessages || 0,
          stageBreakdown: data.stageBreakdown || { stage1: 0, stage2: 0, stage3: 0 },
        });
      }
    } catch (error) {
      console.error('Error in loadMetrics:', error);
    }
  };

  const loadUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('users_profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error loading users:', error);
        return;
      }

      if (data) {
        setUsers(data.map(u => ({
          id: u.id,
          email: u.email,
          name: u.name,
          identification: u.identification,
          address: u.address,
          kycStatus: u.kyc_status,
          kycDocuments: u.kyc_documents || [],
          referralCode: u.referral_code,
          referredBy: u.referred_by,
          isAdmin: u.is_admin,
        })));
      }
    } catch (error) {
      console.error('Error in loadUsers:', error);
    }
  };

  const loadKYCSubmissions = async () => {
    try {
      const { data, error } = await supabase
        .from('users_profiles')
        .select('*')
        .eq('kyc_status', 'pending')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error loading KYC submissions:', error);
        return;
      }

      if (data) {
        setKycSubmissions(data.map(u => ({
          id: u.id,
          name: u.name,
          email: u.email,
          identification: u.identification,
          address: u.address,
          kycStatus: u.kyc_status,
          kycDocuments: u.kyc_documents || [],
        })));
      }
    } catch (error) {
      console.error('Error in loadKYCSubmissions:', error);
    }
  };

  const loadMessages = async () => {
    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error loading messages:', error);
        return;
      }

      if (data) {
        setMessages(data.map(m => ({
          id: m.id,
          userId: m.user_id,
          userName: m.user_name,
          message: m.message,
          response: m.response,
          status: m.status,
          createdAt: m.created_at,
        })));
      }
    } catch (error) {
      console.error('Error in loadMessages:', error);
    }
  };

  const loadPlatformSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('platform_settings')
        .select('*')
        .limit(1)
        .single();

      if (error) {
        console.error('Error loading platform settings:', error);
        return;
      }

      if (data) {
        setPlatformSettings(data);
      }
    } catch (error) {
      console.error('Error in loadPlatformSettings:', error);
    }
  };

  const handleAddBalance = async () => {
    if (!selectedUser || !balanceAmount) {
      Alert.alert('Error', 'Please enter a valid amount');
      return;
    }

    setLoading(true);
    try {
      const amount = parseFloat(balanceAmount);
      
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
        const { error: updateError } = await supabase
          .from('vesting')
          .update({
            total_mxi: (parseFloat(vestingData.total_mxi) + amount).toString(),
            last_update: new Date().toISOString(),
          })
          .eq('user_id', selectedUser.id);

        if (updateError) throw updateError;
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
      }

      Alert.alert('Success', `Added ${amount} MXI to ${selectedUser.name}'s balance`);
      setBalanceAmount('');
      setShowUserModal(false);
      await loadUsers();
    } catch (error: any) {
      console.error('Error adding balance:', error);
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

    setLoading(true);
    try {
      const amount = parseFloat(balanceAmount);
      
      const { data: vestingData, error: vestingError } = await supabase
        .from('vesting')
        .select('*')
        .eq('user_id', selectedUser.id)
        .single();

      if (vestingError) throw vestingError;

      const newTotal = Math.max(0, parseFloat(vestingData.total_mxi) - amount);

      const { error: updateError } = await supabase
        .from('vesting')
        .update({
          total_mxi: newTotal.toString(),
          last_update: new Date().toISOString(),
        })
        .eq('user_id', selectedUser.id);

      if (updateError) throw updateError;

      Alert.alert('Success', `Removed ${amount} MXI from ${selectedUser.name}'s balance`);
      setBalanceAmount('');
      setShowUserModal(false);
      await loadUsers();
    } catch (error: any) {
      console.error('Error removing balance:', error);
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

    setLoading(true);
    try {
      const amount = parseFloat(referralAmount);
      const level = parseInt(referralLevel);

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
        const { error: updateError } = await supabase
          .from('vesting')
          .update({
            total_mxi: (parseFloat(vestingData.total_mxi) + amount).toString(),
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

      Alert.alert('Success', `Added referral earning of ${amount} MXI to ${selectedUser.name}`);
      setReferralAmount('');
      setShowUserModal(false);
      await loadUsers();
    } catch (error: any) {
      console.error('Error adding referral:', error);
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
      const { error } = await supabase
        .from('messages')
        .update({
          response: messageResponse.trim(),
          status: 'answered',
          updated_at: new Date().toISOString(),
        })
        .eq('id', selectedMessage.id);

      if (error) throw error;

      Alert.alert('Success', 'Response sent successfully');
      setMessageResponse('');
      setShowMessageModal(false);
      await loadMessages();
      await loadMetrics();
    } catch (error: any) {
      console.error('Error responding to message:', error);
      Alert.alert('Error', error.message || 'Failed to send response');
    } finally {
      setLoading(false);
    }
  };

  const handleKYCDecision = async (decision: 'approved' | 'rejected') => {
    if (!selectedKYC) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('users_profiles')
        .update({
          kyc_status: decision,
          updated_at: new Date().toISOString(),
        })
        .eq('id', selectedKYC.id);

      if (error) throw error;

      Alert.alert('Success', `KYC ${decision} for ${selectedKYC.name}`);
      setShowKYCModal(false);
      await loadKYCSubmissions();
      await loadMetrics();
    } catch (error: any) {
      console.error('Error updating KYC:', error);
      Alert.alert('Error', error.message || 'Failed to update KYC status');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePlatformSettings = async () => {
    if (!platformSettings) return;

    setLoading(true);
    try {
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

      Alert.alert('Success', 'Platform settings updated successfully');
      await loadPlatformSettings();
    } catch (error: any) {
      console.error('Error updating settings:', error);
      Alert.alert('Error', error.message || 'Failed to update settings');
    } finally {
      setLoading(false);
    }
  };

  if (!isAdmin) {
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
    u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.email.toLowerCase().includes(searchQuery.toLowerCase())
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

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {activeTab === 'metrics' && metrics && (
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
                  style={[styles.progressFill, { width: `${(metrics.totalMXISold / 25000000) * 100}%` }]} 
                />
              </View>
              <Text style={styles.progressText}>
                {((metrics.totalMXISold / 25000000) * 100).toFixed(2)}% of 25M total
              </Text>
            </View>
          </>
        )}

        {activeTab === 'users' && (
          <>
            <View style={commonStyles.card}>
              <Text style={styles.cardTitle}>User Management</Text>
              <TextInput
                style={styles.searchInput}
                placeholder="Search users by name or email..."
                placeholderTextColor={colors.textSecondary}
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
            </View>

            {filteredUsers.map((u) => (
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
                  <Text style={styles.userDetail}>KYC: {u.kycStatus}</Text>
                </View>
                <IconSymbol 
                  ios_icon_name="chevron.right" 
                  android_material_icon_name="chevron_right" 
                  size={24} 
                  color={colors.textSecondary} 
                />
              </TouchableOpacity>
            ))}
          </>
        )}

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

            {kycSubmissions.map((kyc) => (
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
                  <Text style={styles.kycDetail}>Documents: {kyc.kycDocuments.length}</Text>
                </View>
                <IconSymbol 
                  ios_icon_name="chevron.right" 
                  android_material_icon_name="chevron_right" 
                  size={24} 
                  color={colors.textSecondary} 
                />
              </TouchableOpacity>
            ))}

            {kycSubmissions.length === 0 && (
              <View style={styles.emptyState}>
                <Text style={styles.emptyText}>No pending KYC submissions</Text>
              </View>
            )}
          </>
        )}

        {activeTab === 'messages' && (
          <>
            <View style={commonStyles.card}>
              <Text style={styles.cardTitle}>User Messages</Text>
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

            {messages.map((msg) => (
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
                  <Text style={styles.messageName}>{msg.userName}</Text>
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
                <Text style={styles.messageDate}>
                  {new Date(msg.createdAt).toLocaleDateString()}
                </Text>
              </TouchableOpacity>
            ))}

            {messages.length === 0 && (
              <View style={styles.emptyState}>
                <Text style={styles.emptyText}>No messages</Text>
              </View>
            )}
          </>
        )}

        {activeTab === 'settings' && platformSettings && (
          <>
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

                <View style={styles.modalSection}>
                  <Text style={styles.modalSectionTitle}>Balance Management</Text>
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
                      <Text style={styles.modalButtonText}>Add Balance</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                      style={[styles.modalButton, styles.modalButtonDanger]}
                      onPress={handleRemoveBalance}
                      disabled={loading}
                    >
                      <Text style={styles.modalButtonText}>Remove Balance</Text>
                    </TouchableOpacity>
                  </View>
                </View>

                <View style={styles.modalSection}>
                  <Text style={styles.modalSectionTitle}>Referral Management</Text>
                  <Text style={styles.inputLabel}>Referral Level</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Level (1-3)"
                    placeholderTextColor={colors.textSecondary}
                    value={referralLevel}
                    onChangeText={setReferralLevel}
                    keyboardType="number-pad"
                  />
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
                    <Text style={styles.modalButtonText}>Add Referral Earnings</Text>
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
                <Text style={styles.modalUserName}>{selectedMessage.userName}</Text>
                <View style={styles.messageBox}>
                  <Text style={styles.messageBoxLabel}>User Message:</Text>
                  <Text style={styles.messageBoxText}>{selectedMessage.message}</Text>
                </View>

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
                    {selectedKYC.kycDocuments.length} document(s) uploaded
                  </Text>
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
                      <Text style={styles.modalButtonText}>Approve</Text>
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
                      <Text style={styles.modalButtonText}>Reject</Text>
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
  },
  kycStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
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
  },
  messageStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
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
  modalUserName: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  modalUserEmail: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 20,
  },
  modalSection: {
    marginBottom: 24,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  modalSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 12,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
  },
  modalButton: {
    flex: 1,
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
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
});
