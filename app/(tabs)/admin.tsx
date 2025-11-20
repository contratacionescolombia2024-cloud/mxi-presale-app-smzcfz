
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
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { Redirect, useRouter } from 'expo-router';
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
  account_blocked: boolean;
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
  const { t } = useLanguage();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'metrics' | 'users' | 'kyc' | 'messages' | 'settings' | 'link-referral'>('metrics');
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
  const [referralLevel, setReferralLevel] = useState('1');
  const [referralAmount, setReferralAmount] = useState('');
  const [messageResponse, setMessageResponse] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Link Referral states
  const [linkReferralEmail, setLinkReferralEmail] = useState('');
  const [linkReferralCode, setLinkReferralCode] = useState('');

  // User edit states
  const [editName, setEditName] = useState('');
  const [editIdentification, setEditIdentification] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editAddress, setEditAddress] = useState('');
  const [editReferredBy, setEditReferredBy] = useState('');

  const loadMetrics = useCallback(async () => {
    try {
      console.log('📈 Loading metrics...');
      
      const { data: rpcData, error: rpcError } = await supabase.rpc('get_admin_metrics');
      
      if (rpcError) {
        console.error('⚠️ RPC error, falling back to manual queries:', rpcError);
        
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
  }, []);

  const loadUsers = useCallback(async () => {
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
  }, []);

  const loadKYCSubmissions = useCallback(async () => {
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
  }, []);

  const loadMessages = useCallback(async () => {
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
  }, []);

  const loadPlatformSettings = useCallback(async () => {
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
  }, []);

  const loadAllData = useCallback(async () => {
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
      Alert.alert(t('error'), t('adminDataLoadFailed'));
    } finally {
      setRefreshing(false);
    }
  }, [loadMetrics, loadUsers, loadKYCSubmissions, loadMessages, loadPlatformSettings, t]);

  useEffect(() => {
    console.log('🔐 Admin Panel - isAdmin:', isAdmin);
    if (isAdmin) {
      loadAllData();
    }
  }, [isAdmin, loadAllData]);

  const loadUserDetails = async (userId: string) => {
    setLoading(true);
    try {
      console.log(`📋 Loading details for user ${userId}`);
      
      const { data, error } = await supabase.rpc('admin_get_user_details', {
        p_user_id: userId,
      });

      if (error) {
        console.error('❌ RPC Error loading user details:', error);
        Alert.alert(t('error'), `${t('failedToLoadUserDetails')}: ${error.message}`);
        throw error;
      }

      console.log('📦 RPC Response:', data);

      if (data && data.success) {
        console.log('✅ User details loaded successfully');
        
        // Set edit form values
        setEditName(data.profile.name || '');
        setEditIdentification(data.profile.identification || '');
        setEditEmail(data.profile.email || '');
        setEditAddress(data.profile.address || '');
        setEditReferredBy(data.profile.referred_by || '');
      } else {
        const errorMsg = data?.error || t('failedToLoadUserDetails');
        console.error('❌ User details load failed:', errorMsg);
        Alert.alert(t('error'), errorMsg);
      }
    } catch (error: any) {
      console.error('❌ Exception in loadUserDetails:', error);
      Alert.alert(t('error'), error.message || t('failedToLoadUserDetails'));
    } finally {
      setLoading(false);
    }
  };

  const handleLinkReferral = async () => {
    if (!linkReferralEmail.trim() || !linkReferralCode.trim()) {
      Alert.alert(t('error'), t('pleaseEnterBothUserEmailAndReferralCode'));
      return;
    }

    setLoading(true);
    try {
      console.log(`🔗 Linking user ${linkReferralEmail} to referral code ${linkReferralCode}`);
      
      const { data, error } = await supabase.rpc('admin_link_referral', {
        p_referred_email: linkReferralEmail.trim(),
        p_referrer_code: linkReferralCode.trim().toUpperCase(),
      });

      if (error) {
        console.error('❌ RPC Error linking referral:', error);
        Alert.alert(t('error'), `${t('failedToLinkReferral')}: ${error.message}`);
        throw error;
      }

      console.log('📦 Referral link response:', data);

      if (data && data.success) {
        const commissionsMsg = data.total_commissions_distributed 
          ? `\n\n${t('totalCommissionsDistributed')}: ${data.total_commissions_distributed.toFixed(2)} MXI`
          : '';
        
        Alert.alert(
          t('success'),
          `${data.message}${commissionsMsg}`,
          [
            {
              text: t('ok'),
              onPress: () => {
                setLinkReferralEmail('');
                setLinkReferralCode('');
                loadUsers();
                loadMetrics();
              }
            }
          ]
        );
      } else {
        const errorMsg = data?.error || t('failedToLinkReferral');
        console.error('❌ Referral link failed:', errorMsg);
        Alert.alert(t('error'), errorMsg);
      }
    } catch (error: any) {
      console.error('❌ Exception in handleLinkReferral:', error);
      Alert.alert(t('error'), error.message || t('failedToLinkReferral'));
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

      if (error) {
        console.error('❌ Error updating settings:', error);
        Alert.alert(t('error'), `${t('failedToUpdateSettings')}: ${error.message}`);
        throw error;
      }

      console.log('✅ Platform settings updated successfully');
      Alert.alert(t('success'), t('platformSettingsUpdatedSuccessfully'));
      await loadPlatformSettings();
    } catch (error: any) {
      console.error('❌ Exception in handleUpdatePlatformSettings:', error);
      Alert.alert(t('error'), error.message || t('failedToUpdateSettings'));
    } finally {
      setLoading(false);
    }
  };

  if (!isAdmin) {
    console.log('⚠️ User is not admin, redirecting...');
    return <Redirect href="/(tabs)/(home)/" />;
  }

  const tabs = [
    { id: 'metrics', label: t('metrics'), iosIcon: 'chart.bar.fill', androidIcon: 'bar_chart' },
    { id: 'users', label: t('users'), iosIcon: 'person.3.fill', androidIcon: 'group' },
    { id: 'link-referral', label: t('linkReferral'), iosIcon: 'link.circle.fill', androidIcon: 'link' },
    { id: 'kyc', label: 'KYC', iosIcon: 'checkmark.shield.fill', androidIcon: 'verified_user' },
    { id: 'messages', label: t('messages'), iosIcon: 'message.fill', androidIcon: 'message' },
    { id: 'settings', label: t('settings'), iosIcon: 'gearshape.fill', androidIcon: 'settings' },
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
        <Text style={styles.title}>{t('adminPanel')}</Text>
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

      {/* Quick Access Buttons */}
      <View style={styles.quickAccessContainer}>
        <TouchableOpacity 
          style={styles.quickAccessButton}
          onPress={() => router.push('/admin-users-table')}
        >
          <IconSymbol 
            ios_icon_name="tablecells.fill" 
            android_material_icon_name="table_chart" 
            size={24} 
            color={colors.card} 
          />
          <Text style={styles.quickAccessButtonText}>{t('completeUserTable')}</Text>
          <IconSymbol 
            ios_icon_name="chevron.right" 
            android_material_icon_name="chevron_right" 
            size={20} 
            color={colors.card} 
          />
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.quickAccessButton, { backgroundColor: colors.secondary }]}
          onPress={() => router.push('/balance-management')}
        >
          <IconSymbol 
            ios_icon_name="dollarsign.circle.fill" 
            android_material_icon_name="account_balance_wallet" 
            size={24} 
            color={colors.card} 
          />
          <Text style={styles.quickAccessButtonText}>{t('balanceManagement')}</Text>
          <IconSymbol 
            ios_icon_name="chevron.right" 
            android_material_icon_name="chevron_right" 
            size={20} 
            color={colors.card} 
          />
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.quickAccessButton, { backgroundColor: colors.success }]}
          onPress={() => router.push('/admin-withdrawals')}
        >
          <IconSymbol 
            ios_icon_name="banknote" 
            android_material_icon_name="account_balance_wallet" 
            size={24} 
            color={colors.card} 
          />
          <Text style={styles.quickAccessButtonText}>Withdrawal Management</Text>
          <IconSymbol 
            ios_icon_name="chevron.right" 
            android_material_icon_name="chevron_right" 
            size={20} 
            color={colors.card} 
          />
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
          <React.Fragment>
            {metrics ? (
              <React.Fragment>
                <View style={styles.metricsGrid}>
                  <View style={[commonStyles.card, styles.metricCard]}>
                    <IconSymbol 
                      ios_icon_name="person.3.fill" 
                      android_material_icon_name="group" 
                      size={32} 
                      color={colors.primary} 
                    />
                    <Text style={styles.metricValue}>{metrics.totalUsers.toLocaleString()}</Text>
                    <Text style={styles.metricLabel}>{t('totalUsers')}</Text>
                  </View>

                  <View style={[commonStyles.card, styles.metricCard]}>
                    <IconSymbol 
                      ios_icon_name="bitcoinsign.circle.fill" 
                      android_material_icon_name="currency_bitcoin" 
                      size={32} 
                      color={colors.secondary} 
                    />
                    <Text style={styles.metricValue}>{metrics.totalMXISold.toLocaleString()}</Text>
                    <Text style={styles.metricLabel}>{t('mxiSold')}</Text>
                  </View>

                  <View style={[commonStyles.card, styles.metricCard]}>
                    <IconSymbol 
                      ios_icon_name="dollarsign.circle.fill" 
                      android_material_icon_name="attach_money" 
                      size={32} 
                      color={colors.success} 
                    />
                    <Text style={styles.metricValue}>${metrics.totalRevenue.toLocaleString()}</Text>
                    <Text style={styles.metricLabel}>{t('totalRevenue')}</Text>
                  </View>

                  <View style={[commonStyles.card, styles.metricCard]}>
                    <IconSymbol 
                      ios_icon_name="clock.fill" 
                      android_material_icon_name="schedule" 
                      size={32} 
                      color={colors.warning} 
                    />
                    <Text style={styles.metricValue}>{metrics.pendingKYC}</Text>
                    <Text style={styles.metricLabel}>{t('pendingKYC')}</Text>
                  </View>
                </View>

                <View style={commonStyles.card}>
                  <Text style={styles.cardTitle}>{t('stageBreakdown')}</Text>
                  {metrics.stageBreakdown.stage1 !== undefined && (
                    <View style={styles.stageItem}>
                      <Text style={styles.stageLabel}>{t('stage')} 1 ($0.40)</Text>
                      <Text style={styles.stageValue}>{metrics.stageBreakdown.stage1.toLocaleString()} MXI</Text>
                    </View>
                  )}
                  {metrics.stageBreakdown.stage2 !== undefined && (
                    <View style={styles.stageItem}>
                      <Text style={styles.stageLabel}>{t('stage')} 2 ($0.70)</Text>
                      <Text style={styles.stageValue}>{metrics.stageBreakdown.stage2.toLocaleString()} MXI</Text>
                    </View>
                  )}
                  {metrics.stageBreakdown.stage3 !== undefined && (
                    <View style={styles.stageItem}>
                      <Text style={styles.stageLabel}>{t('stage')} 3 ($1.00)</Text>
                      <Text style={styles.stageValue}>{metrics.stageBreakdown.stage3.toLocaleString()} MXI</Text>
                    </View>
                  )}
                  <View style={styles.totalRow}>
                    <Text style={styles.totalLabel}>{t('totalSold')}</Text>
                    <Text style={styles.totalValue}>{metrics.totalMXISold.toLocaleString()} MXI</Text>
                  </View>
                  <View style={styles.progressBar}>
                    <View 
                      style={[styles.progressFill, { width: `${Math.min(100, (metrics.totalMXISold / 25000000) * 100)}%` }]} 
                    />
                  </View>
                  <Text style={styles.progressText}>
                    {((metrics.totalMXISold / 25000000) * 100).toFixed(2)}% {t('of')} 25M {t('total')}
                  </Text>
                </View>
              </React.Fragment>
            ) : (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={colors.primary} />
                <Text style={styles.loadingText}>{t('loadingMetrics')}</Text>
              </View>
            )}
          </React.Fragment>
        )}

        {/* USERS TAB */}
        {activeTab === 'users' && (
          <React.Fragment>
            <View style={commonStyles.card}>
              <Text style={styles.cardTitle}>{t('userManagement')} ({users.length} {t('users')})</Text>
              <TextInput
                style={styles.searchInput}
                placeholder={t('searchUsersByNameOrEmail')}
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
                    loadUserDetails(u.id);
                    setShowUserModal(true);
                  }}
                >
                  <View style={styles.userInfo}>
                    <View style={styles.userNameRow}>
                      <Text style={styles.userName}>{u.name}</Text>
                      {u.account_blocked && (
                        <View style={styles.blockedBadge}>
                          <IconSymbol 
                            ios_icon_name="lock.fill" 
                            android_material_icon_name="lock" 
                            size={12} 
                            color={colors.card} 
                          />
                          <Text style={styles.blockedBadgeText}>{t('blocked')}</Text>
                        </View>
                      )}
                    </View>
                    <Text style={styles.userEmail}>{u.email}</Text>
                    <Text style={styles.userDetail}>KYC: {t(u.kyc_status)}</Text>
                    <Text style={styles.userDetail}>{t('referralCode')}: {u.referral_code}</Text>
                    {u.referred_by && (
                      <Text style={styles.userDetail}>{t('referredBy')}: {u.referred_by}</Text>
                    )}
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
                  {searchQuery ? t('noUsersFound') : t('noUsersRegisteredYet')}
                </Text>
              </View>
            )}
          </React.Fragment>
        )}

        {/* LINK REFERRAL TAB */}
        {activeTab === 'link-referral' && (
          <View style={commonStyles.card}>
            <View style={styles.linkReferralHeader}>
              <IconSymbol 
                ios_icon_name="link.circle.fill" 
                android_material_icon_name="link" 
                size={48} 
                color={colors.primary} 
              />
              <Text style={styles.cardTitle}>{t('linkUserToReferralCode')}</Text>
            </View>
            
            <Text style={styles.linkReferralDescription}>
              {t('manuallyLinkUserDescription')}
            </Text>
            <View style={styles.featureList}>
              <Text style={styles.featureItem}>- {t('establishReferralRelationship')}</Text>
              <Text style={styles.featureItem}>- {t('calculateCommissionsForPurchases')}</Text>
              <Text style={styles.featureItem}>- {t('distributeMultiLevelCommissions')}</Text>
              <Text style={styles.featureItem}>- {t('updateAllReferrersVestingBalances')}</Text>
            </View>

            <Text style={styles.inputLabel}>{t('userEmail')}</Text>
            <TextInput
              style={styles.input}
              placeholder={t('enterUserEmailAddress')}
              placeholderTextColor={colors.textSecondary}
              value={linkReferralEmail}
              onChangeText={setLinkReferralEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />

            <Text style={styles.inputLabel}>{t('referralCode')}</Text>
            <TextInput
              style={styles.input}
              placeholder={t('enterReferrerCode')}
              placeholderTextColor={colors.textSecondary}
              value={linkReferralCode}
              onChangeText={(text) => setLinkReferralCode(text.toUpperCase())}
              autoCapitalize="characters"
              autoCorrect={false}
            />

            <View style={styles.warningBox}>
              <IconSymbol 
                ios_icon_name="exclamationmark.triangle.fill" 
                android_material_icon_name="warning" 
                size={24} 
                color={colors.warning} 
              />
              <Text style={styles.warningText}>
                {t('actionCannotBeUndone')}
              </Text>
            </View>

            <TouchableOpacity 
              style={[styles.linkButton, loading && styles.linkButtonDisabled]}
              onPress={handleLinkReferral}
              disabled={loading || !linkReferralEmail.trim() || !linkReferralCode.trim()}
            >
              {loading ? (
                <ActivityIndicator color={colors.card} />
              ) : (
                <React.Fragment>
                  <IconSymbol 
                    ios_icon_name="link.circle.fill" 
                    android_material_icon_name="link" 
                    size={24} 
                    color={colors.card} 
                  />
                  <Text style={styles.linkButtonText}>{t('linkReferral')}</Text>
                </React.Fragment>
              )}
            </TouchableOpacity>
          </View>
        )}

        {/* KYC TAB */}
        {activeTab === 'kyc' && (
          <React.Fragment>
            <View style={commonStyles.card}>
              <Text style={styles.cardTitle}>{t('kycVerification')}</Text>
              <View style={styles.kycStats}>
                <View style={styles.kycStat}>
                  <Text style={styles.kycStatValue}>{kycSubmissions.length}</Text>
                  <Text style={styles.kycStatLabel}>{t('pending')}</Text>
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
                    <Text style={styles.kycDetail}>{t('documents')}: {kyc.kyc_documents?.length || 0}</Text>
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
                <Text style={styles.emptyText}>{t('noPendingKYCSubmissions')}</Text>
              </View>
            )}
          </React.Fragment>
        )}

        {/* MESSAGES TAB */}
        {activeTab === 'messages' && (
          <React.Fragment>
            <View style={commonStyles.card}>
              <Text style={styles.cardTitle}>{t('userMessages')} ({messages.length} {t('total')})</Text>
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
                  <Text style={styles.messageStatLabel}>{t('pending')}</Text>
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
                  <Text style={styles.messageStatLabel}>{t('answered')}</Text>
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
                        {msg.status === 'pending' ? t('pending') : t('answered')}
                      </Text>
                    </View>
                  </View>
                  <Text style={styles.messageText} numberOfLines={2}>{msg.message}</Text>
                  {msg.response && (
                    <Text style={styles.messageResponse} numberOfLines={1}>
                      {t('response')}: {msg.response}
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
                <Text style={styles.emptyText}>{t('noMessagesYet')}</Text>
              </View>
            )}
          </React.Fragment>
        )}

        {/* SETTINGS TAB */}
        {activeTab === 'settings' && (
          <React.Fragment>
            {platformSettings ? (
              <View style={commonStyles.card}>
                <Text style={styles.cardTitle}>{t('preSaleSettings')}</Text>
                
                <Text style={styles.inputLabel}>{t('minimumPurchaseUSD')}</Text>
                <TextInput
                  style={styles.input}
                  value={platformSettings.min_purchase_usd.toString()}
                  onChangeText={(text) => setPlatformSettings({
                    ...platformSettings,
                    min_purchase_usd: parseFloat(text) || 0
                  })}
                  keyboardType="decimal-pad"
                  placeholder={t('minimumPurchaseAmount')}
                  placeholderTextColor={colors.textSecondary}
                />

                <Text style={styles.inputLabel}>{t('maximumPurchaseUSD')}</Text>
                <TextInput
                  style={styles.input}
                  value={platformSettings.max_purchase_usd.toString()}
                  onChangeText={(text) => setPlatformSettings({
                    ...platformSettings,
                    max_purchase_usd: parseFloat(text) || 0
                  })}
                  keyboardType="decimal-pad"
                  placeholder={t('maximumPurchaseAmount')}
                  placeholderTextColor={colors.textSecondary}
                />

                <Text style={styles.inputLabel}>{t('monthlyVestingRatePercent')}</Text>
                <TextInput
                  style={styles.input}
                  value={(platformSettings.monthly_vesting_rate * 100).toString()}
                  onChangeText={(text) => setPlatformSettings({
                    ...platformSettings,
                    monthly_vesting_rate: (parseFloat(text) || 0) / 100
                  })}
                  keyboardType="decimal-pad"
                  placeholder={t('monthlyVestingPercentage')}
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
                    <Text style={styles.saveButtonText}>{t('saveChanges')}</Text>
                  )}
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={colors.primary} />
                <Text style={styles.loadingText}>{t('loadingSettings')}</Text>
              </View>
            )}
          </React.Fragment>
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
  title: {
    flex: 1,
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
  },
  quickAccessContainer: {
    paddingHorizontal: 20,
    marginBottom: 12,
    gap: 8,
  },
  quickAccessButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: colors.primary,
    padding: 16,
    borderRadius: 12,
  },
  quickAccessButtonText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '700',
    color: colors.card,
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
  userNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  blockedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.error,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  blockedBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.card,
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
  linkReferralHeader: {
    alignItems: 'center',
    marginBottom: 16,
  },
  linkReferralDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 12,
    lineHeight: 20,
  },
  featureList: {
    backgroundColor: `${colors.primary}10`,
    padding: 16,
    borderRadius: 8,
    marginBottom: 24,
  },
  featureItem: {
    fontSize: 13,
    color: colors.text,
    marginBottom: 8,
    lineHeight: 18,
  },
  warningBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: `${colors.warning}15`,
    padding: 16,
    borderRadius: 8,
    marginBottom: 24,
    borderLeftWidth: 4,
    borderLeftColor: colors.warning,
  },
  warningText: {
    flex: 1,
    fontSize: 13,
    color: colors.text,
    lineHeight: 18,
  },
  linkButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    backgroundColor: colors.primary,
    padding: 18,
    borderRadius: 12,
    marginTop: 8,
  },
  linkButtonDisabled: {
    opacity: 0.5,
  },
  linkButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.card,
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
});
