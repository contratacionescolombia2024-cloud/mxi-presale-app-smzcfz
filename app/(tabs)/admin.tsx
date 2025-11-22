
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
  Modal,
  RefreshControl,
  KeyboardAvoidingView,
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

interface UserDetails {
  profile: UserProfile;
  vesting: {
    total_mxi: number;
    current_rewards: number;
    monthly_rate: number;
  };
  purchases: {
    total_purchases: number;
    total_mxi_purchased: number;
    total_spent_usd: number;
  };
  referrals: {
    total_referrals: number;
    total_referral_earnings: number;
  };
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
  const [selectedUserDetails, setSelectedUserDetails] = useState<UserDetails | null>(null);
  const [selectedMessage, setSelectedMessage] = useState<MessageData | null>(null);
  const [selectedKYC, setSelectedKYC] = useState<UserProfile | null>(null);
  const [showUserModal, setShowUserModal] = useState(false);
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [showKYCModal, setShowKYCModal] = useState(false);
  const [resettingPresaleDay, setResettingPresaleDay] = useState(false);

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

  // Settings edit states
  const [editMinPurchase, setEditMinPurchase] = useState('');
  const [editMaxPurchase, setEditMaxPurchase] = useState('');
  const [editVestingRate, setEditVestingRate] = useState('');

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
      if (data) {
        setEditMinPurchase(data.min_purchase_usd.toString());
        setEditMaxPurchase(data.max_purchase_usd.toString());
        setEditVestingRate((data.monthly_vesting_rate * 100).toString());
      }
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
      Alert.alert(t('error'), 'Failed to load admin data. Please try again.');
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
        Alert.alert(t('error'), `Failed to load user details: ${error.message}`);
        throw error;
      }

      console.log('📦 RPC Response:', data);

      if (data && data.success) {
        console.log('✅ User details loaded successfully');
        setSelectedUserDetails(data as any);
        
        // Set edit form values
        setEditName(data.profile.name || '');
        setEditIdentification(data.profile.identification || '');
        setEditEmail(data.profile.email || '');
        setEditAddress(data.profile.address || '');
        setEditReferredBy(data.profile.referred_by || '');
      } else {
        const errorMsg = data?.error || 'Failed to load user details';
        console.error('❌ User details load failed:', errorMsg);
        Alert.alert(t('error'), errorMsg);
      }
    } catch (error: any) {
      console.error('❌ Exception in loadUserDetails:', error);
      Alert.alert(t('error'), error.message || 'Failed to load user details');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleAccountBlock = async (blocked: boolean) => {
    if (!selectedUser) return;

    const action = blocked ? 'block' : 'unblock';
    Alert.alert(
      `${blocked ? 'Block' : 'Unblock'} Account`,
      `Are you sure you want to ${action} ${selectedUser.name}'s account?\n\n${blocked ? '⚠️ The user will not be able to log in or access the application.' : '✅ The user will regain access to the application.'}`,
      [
        { text: t('cancel'), style: 'cancel' },
        {
          text: blocked ? 'Block' : 'Unblock',
          style: blocked ? 'destructive' : 'default',
          onPress: async () => {
            setLoading(true);
            try {
              console.log(`🔒 ${blocked ? 'Blocking' : 'Unblocking'} account for user ${selectedUser.id}`);
              
              const { data, error } = await supabase.rpc('admin_toggle_account_block', {
                p_user_id: selectedUser.id,
                p_blocked: blocked,
              });

              if (error) {
                console.error('❌ RPC Error toggling account block:', error);
                Alert.alert(t('error'), `Failed to ${action} account: ${error.message}`);
                throw error;
              }

              console.log('📦 Response:', data);

              if (data && data.success) {
                console.log(`✅ Account ${blocked ? 'blocked' : 'unblocked'} successfully`);
                Alert.alert(t('success'), data.message);
                await loadUsers();
                await loadUserDetails(selectedUser.id);
                
                // Update selected user state
                setSelectedUser({
                  ...selectedUser,
                  account_blocked: blocked,
                });
              } else {
                const errorMsg = data?.error || `Failed to ${action} account`;
                console.error('❌ Operation failed:', errorMsg);
                Alert.alert(t('error'), errorMsg);
              }
            } catch (error: any) {
              console.error('❌ Exception in handleToggleAccountBlock:', error);
              Alert.alert(t('error'), error.message || `Failed to ${action} account`);
            } finally {
              setLoading(false);
            }
          }
        }
      ]
    );
  };

  const handleUpdateUserProfile = async () => {
    if (!selectedUser) return;

    setLoading(true);
    try {
      console.log(`✏️ Updating profile for user ${selectedUser.id}`);
      console.log('📤 Update data:', { editName, editIdentification, editEmail, editAddress });
      
      const { data, error } = await supabase.rpc('admin_update_user_profile', {
        p_user_id: selectedUser.id,
        p_name: editName || null,
        p_identification: editIdentification || null,
        p_email: editEmail || null,
        p_address: editAddress || null,
      });

      if (error) {
        console.error('❌ RPC Error updating user profile:', error);
        Alert.alert(t('error'), `Failed to update profile: ${error.message}`);
        throw error;
      }

      console.log('📦 Update response:', data);

      if (data && data.success) {
        console.log('✅ User profile updated successfully');
        Alert.alert(t('success'), 'User profile updated successfully');
        await loadUsers();
        await loadUserDetails(selectedUser.id);
      } else {
        const errorMsg = data?.error || 'Failed to update user profile';
        console.error('❌ Profile update failed:', errorMsg);
        Alert.alert(t('error'), errorMsg);
      }
    } catch (error: any) {
      console.error('❌ Exception in handleUpdateUserProfile:', error);
      Alert.alert(t('error'), error.message || 'Failed to update user profile');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateReferredBy = async () => {
    if (!selectedUser) return;

    Alert.alert(
      'Update Referral',
      `Change referral code for ${selectedUser.name} to: ${editReferredBy || 'None'}?`,
      [
        { text: t('cancel'), style: 'cancel' },
        {
          text: 'Update',
          onPress: async () => {
            setLoading(true);
            try {
              console.log(`🔗 Updating referred_by for user ${selectedUser.id} to: ${editReferredBy}`);
              
              const { error } = await supabase
                .from('users_profiles')
                .update({
                  referred_by: editReferredBy || null,
                  updated_at: new Date().toISOString(),
                })
                .eq('id', selectedUser.id);

              if (error) {
                console.error('❌ Error updating referred_by:', error);
                Alert.alert(t('error'), `Failed to update: ${error.message}`);
                throw error;
              }

              console.log('✅ Referred_by updated successfully');
              Alert.alert(t('success'), 'Referral code updated successfully');
              await loadUsers();
              await loadUserDetails(selectedUser.id);
            } catch (error: any) {
              console.error('❌ Exception in handleUpdateReferredBy:', error);
              Alert.alert(t('error'), error.message || 'Failed to update referral code');
            } finally {
              setLoading(false);
            }
          }
        }
      ]
    );
  };

  const handleLinkReferral = async () => {
    if (!linkReferralEmail.trim() || !linkReferralCode.trim()) {
      Alert.alert(t('error'), 'Please enter both user email and referral code');
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
        Alert.alert(t('error'), `Failed to link referral: ${error.message}`);
        throw error;
      }

      console.log('📦 Referral link response:', data);

      if (data && data.success) {
        const commissionsMsg = data.total_commissions_distributed 
          ? `\n\nTotal commissions distributed: ${data.total_commissions_distributed.toFixed(2)} MXI`
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
        const errorMsg = data?.error || 'Failed to link referral';
        console.error('❌ Referral link failed:', errorMsg);
        Alert.alert(t('error'), errorMsg);
      }
    } catch (error: any) {
      console.error('❌ Exception in handleLinkReferral:', error);
      Alert.alert(t('error'), error.message || 'Failed to link referral');
    } finally {
      setLoading(false);
    }
  };

  const handleAddReferral = async () => {
    if (!selectedUser || !referralAmount) {
      Alert.alert(t('error'), 'Please enter valid referral details');
      return;
    }

    const amount = parseFloat(referralAmount);
    const level = parseInt(referralLevel);

    if (isNaN(amount) || amount <= 0) {
      Alert.alert(t('error'), 'Please enter a valid positive amount');
      return;
    }

    if (isNaN(level) || level < 1 || level > 3) {
      Alert.alert(t('error'), 'Referral level must be between 1 and 3');
      return;
    }

    setLoading(true);
    try {
      console.log(`🔗 Adding referral: ${amount} MXI at level ${level} for user ${selectedUser.id}`);

      const { error: referralError } = await supabase
        .from('referrals')
        .insert({
          referrer_id: selectedUser.id,
          referred_id: user?.id,
          level: level,
          mxi_earned: amount,
          commission_mxi: amount,
        });

      if (referralError) {
        console.error('❌ Error inserting referral:', referralError);
        Alert.alert(t('error'), `Failed to add referral: ${referralError.message}`);
        throw referralError;
      }

      const { data: vestingData, error: vestingError } = await supabase
        .from('vesting')
        .select('*')
        .eq('user_id', selectedUser.id)
        .maybeSingle();

      if (vestingError && vestingError.code !== 'PGRST116') {
        console.error('❌ Error fetching vesting:', vestingError);
        throw vestingError;
      }

      if (vestingData) {
        const newTotal = parseFloat(vestingData.total_mxi) + amount;
        console.log(`📊 Updating vesting: ${vestingData.total_mxi} + ${amount} = ${newTotal}`);
        
        const { error: updateError } = await supabase
          .from('vesting')
          .update({
            total_mxi: newTotal,
            last_update: new Date().toISOString(),
          })
          .eq('user_id', selectedUser.id);

        if (updateError) {
          console.error('❌ Error updating vesting:', updateError);
          throw updateError;
        }
      } else {
        console.log(`📊 Creating new vesting record with ${amount} MXI`);
        
        const { error: insertError } = await supabase
          .from('vesting')
          .insert({
            user_id: selectedUser.id,
            total_mxi: amount,
            current_rewards: 0,
            monthly_rate: 0.03,
            last_update: new Date().toISOString(),
          });

        if (insertError) {
          console.error('❌ Error inserting vesting:', insertError);
          throw insertError;
        }
      }

      console.log(`✅ Added referral earning of ${amount} MXI at level ${level}`);
      Alert.alert(
        t('success'), 
        `Added ${amount} MXI referral earnings (Level ${level}) to ${selectedUser.name}'s account`
      );
      setReferralAmount('');
      setReferralLevel('1');
      await loadUsers();
      await loadMetrics();
      await loadUserDetails(selectedUser.id);
    } catch (error: any) {
      console.error('❌ Exception in handleAddReferral:', error);
      Alert.alert(t('error'), error.message || 'Failed to add referral');
    } finally {
      setLoading(false);
    }
  };

  const handleRespondToMessage = async () => {
    if (!selectedMessage || !messageResponse.trim()) {
      Alert.alert(t('error'), 'Please enter a response');
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

      if (error) {
        console.error('❌ Error responding to message:', error);
        Alert.alert(t('error'), `Failed to send response: ${error.message}`);
        throw error;
      }

      console.log('✅ Response sent successfully');
      Alert.alert(t('success'), 'Response sent successfully');
      setMessageResponse('');
      setShowMessageModal(false);
      await loadMessages();
      await loadMetrics();
    } catch (error: any) {
      console.error('❌ Exception in handleRespondToMessage:', error);
      Alert.alert(t('error'), error.message || 'Failed to send response');
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

      if (error) {
        console.error('❌ Error updating KYC:', error);
        Alert.alert(t('error'), `Failed to update KYC: ${error.message}`);
        throw error;
      }

      console.log(`✅ KYC ${decision} successfully`);
      Alert.alert(t('success'), `KYC ${decision} for ${selectedKYC.name}`);
      setShowKYCModal(false);
      await loadKYCSubmissions();
      await loadMetrics();
    } catch (error: any) {
      console.error('❌ Exception in handleKYCDecision:', error);
      Alert.alert(t('error'), error.message || 'Failed to update KYC status');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePlatformSettings = async () => {
    if (!platformSettings) return;

    const minPurchase = parseFloat(editMinPurchase);
    const maxPurchase = parseFloat(editMaxPurchase);
    const vestingRate = parseFloat(editVestingRate) / 100;

    if (isNaN(minPurchase) || isNaN(maxPurchase) || isNaN(vestingRate)) {
      Alert.alert(t('error'), 'Please enter valid numbers');
      return;
    }

    if (minPurchase <= 0 || maxPurchase <= 0 || vestingRate <= 0) {
      Alert.alert(t('error'), 'All values must be positive');
      return;
    }

    if (minPurchase >= maxPurchase) {
      Alert.alert(t('error'), 'Minimum purchase must be less than maximum purchase');
      return;
    }

    setLoading(true);
    try {
      console.log('⚙️ Updating platform settings...');
      
      const { error } = await supabase
        .from('platform_settings')
        .update({
          min_purchase_usd: minPurchase,
          max_purchase_usd: maxPurchase,
          monthly_vesting_rate: vestingRate,
          updated_at: new Date().toISOString(),
        })
        .eq('id', platformSettings.id);

      if (error) {
        console.error('❌ Error updating settings:', error);
        Alert.alert(t('error'), `Failed to update settings: ${error.message}`);
        throw error;
      }

      console.log('✅ Platform settings updated successfully');
      Alert.alert(t('success'), 'Platform settings updated successfully');
      await loadPlatformSettings();
    } catch (error: any) {
      console.error('❌ Exception in handleUpdatePlatformSettings:', error);
      Alert.alert(t('error'), error.message || 'Failed to update settings');
    } finally {
      setLoading(false);
    }
  };

  const executeResetPresaleDay = async () => {
    console.log('🔴 ========== RESET PRESALE DAY EXECUTION STARTED ==========');
    console.log('🔴 Step 1: Setting resettingPresaleDay state to true');
    
    try {
      console.log('🔴 Step 2: Verifying Supabase client');
      if (!supabase) {
        throw new Error('Supabase client is not initialized');
      }

      console.log('🔴 Step 3: Calling supabase.rpc("admin_reset_presale_day")');
      const { data, error } = await supabase.rpc('admin_reset_presale_day');

      console.log('🔴 Step 4: RPC call completed');
      console.log('🔴 Response data:', JSON.stringify(data, null, 2));
      console.log('🔴 Response error:', JSON.stringify(error, null, 2));

      if (error) {
        console.error('❌ RPC Error:', error);
        throw new Error(`RPC Error: ${error.message}`);
      }

      console.log('🔴 Step 5: Validating response data');
      if (!data) {
        throw new Error('No data returned from RPC function');
      }

      console.log('🔴 Step 6: Checking success status');
      if (data.success === true) {
        console.log('✅ ========== RESET COMPLETED SUCCESSFULLY ==========');
        console.log('✅ Users affected:', data.affected_vesting_users || 0);
        console.log('✅ Total rewards reset:', data.total_rewards_reset || 0);
        console.log('✅ Stages affected:', data.affected_stages || 0);
        console.log('✅ Total sold reset:', data.total_sold_reset || 0);
        
        const message = `${t('presaleDayResetSuccess')}\n\n` +
          `Vesting users affected: ${data.affected_vesting_users}\n` +
          `Total rewards reset: ${parseFloat(data.total_rewards_reset || '0').toFixed(4)} MXI\n` +
          `Stages affected: ${data.affected_stages}\n` +
          `Total sold reset: ${parseFloat(data.total_sold_reset || '0').toFixed(2)} MXI`;
        
        Alert.alert(
          t('success'),
          message,
          [
            {
              text: t('ok'),
              onPress: async () => {
                console.log('🔄 Reloading all data after reset');
                await loadAllData();
              }
            }
          ]
        );
      } else {
        const errorMsg = data?.error || t('presaleDayResetFailed');
        console.error('❌ Reset failed:', errorMsg);
        throw new Error(errorMsg);
      }
    } catch (error: any) {
      console.error('❌ Exception in executeResetPresaleDay:', error);
      Alert.alert(t('error'), error.message || t('presaleDayResetFailed'));
    }
  };

  const handleResetPresaleDay = () => {
    console.log('🔴 ========== RESET PRESALE DAY BUTTON PRESSED ==========');
    console.log('🔴 handleResetPresaleDay function called');
    
    Alert.alert(
      t('resetPresaleDay'),
      `${t('presaleDayResetConfirm')}\n\n${t('resetVestingRewardsToZero')}\n${t('resetSoldMXIToZero')}\n\n${t('thisActionCannotBeUndone')}`,
      [
        {
          text: t('no'),
          style: 'cancel',
          onPress: () => {
            console.log('🔴 User cancelled reset');
          }
        },
        {
          text: t('yes'),
          style: 'destructive',
          onPress: async () => {
            console.log('🔴 User confirmed reset, executing...');
            setResettingPresaleDay(true);
            try {
              await executeResetPresaleDay();
            } finally {
              setResettingPresaleDay(false);
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

  const tabs = [
    { id: 'metrics', label: t('metrics'), iosIcon: 'chart.bar.fill', androidIcon: 'bar_chart' },
    { id: 'users', label: t('users'), iosIcon: 'person.3.fill', androidIcon: 'group' },
    { id: 'link-referral', label: 'Link Referral', iosIcon: 'link.circle.fill', androidIcon: 'link' },
    { id: 'kyc', label: 'KYC', iosIcon: 'checkmark.shield.fill', androidIcon: 'verified_user' },
    { id: 'messages', label: 'Messages', iosIcon: 'message.fill', androidIcon: 'message' },
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

      <View style={styles.quickAccessContainer}>
        <TouchableOpacity 
          style={styles.quickAccessButton}
          onPress={() => {
            console.log('📊 Navigating to admin-users-table');
            router.push('/admin-users-table');
          }}
        >
          <IconSymbol 
            ios_icon_name="tablecells.fill" 
            android_material_icon_name="table_chart" 
            size={24} 
            color={colors.card} 
          />
          <Text style={styles.quickAccessButtonText}>Complete User Table</Text>
          <IconSymbol 
            ios_icon_name="chevron.right" 
            android_material_icon_name="chevron_right" 
            size={20} 
            color={colors.card} 
          />
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.quickAccessButton, { backgroundColor: colors.secondary }]}
          onPress={() => {
            console.log('💰 Navigating to balance-management');
            router.push('/balance-management');
          }}
        >
          <IconSymbol 
            ios_icon_name="dollarsign.circle.fill" 
            android_material_icon_name="account_balance_wallet" 
            size={24} 
            color={colors.card} 
          />
          <Text style={styles.quickAccessButtonText}>Balance Management</Text>
          <IconSymbol 
            ios_icon_name="chevron.right" 
            android_material_icon_name="chevron_right" 
            size={20} 
            color={colors.card} 
          />
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.quickAccessButton, { backgroundColor: colors.accent }]}
          onPress={() => {
            console.log('🎮 Navigating to phase-control-admin');
            router.push('/phase-control-admin');
          }}
        >
          <IconSymbol 
            ios_icon_name="slider.horizontal.3" 
            android_material_icon_name="tune" 
            size={24} 
            color={colors.card} 
          />
          <Text style={styles.quickAccessButtonText}>{t('phaseControl')}</Text>
          <IconSymbol 
            ios_icon_name="chevron.right" 
            android_material_icon_name="chevron_right" 
            size={20} 
            color={colors.card} 
          />
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.quickAccessButton, { backgroundColor: colors.error }]}
          onPress={handleResetPresaleDay}
          disabled={resettingPresaleDay}
          activeOpacity={0.7}
        >
          {resettingPresaleDay ? (
            <React.Fragment>
              <ActivityIndicator size="small" color={colors.card} />
              <Text style={styles.quickAccessButtonText}>{t('loading')}</Text>
            </React.Fragment>
          ) : (
            <React.Fragment>
              <IconSymbol 
                ios_icon_name="arrow.counterclockwise.circle.fill" 
                android_material_icon_name="restart_alt" 
                size={24} 
                color={colors.card} 
              />
              <Text style={styles.quickAccessButtonText}>{t('resetPresaleDay')}</Text>
              <IconSymbol 
                ios_icon_name="chevron.right" 
                android_material_icon_name="chevron_right" 
                size={20} 
                color={colors.card} 
              />
            </React.Fragment>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabBar}>
        {tabs.map((tab) => (
          <TouchableOpacity
            key={tab.id}
            style={[styles.tab, activeTab === tab.id && styles.tabActive]}
            onPress={() => {
              console.log('🔥 TAB CLICKED:', tab.id);
              setActiveTab(tab.id as any);
            }}
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
        {activeTab === 'metrics' && (
          <View>
            {metrics ? (
              <View>
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
              </View>
            ) : (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={colors.primary} />
                <Text style={styles.loadingText}>Loading metrics...</Text>
              </View>
            )}
          </View>
        )}

        {activeTab === 'users' && (
          <View>
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

            {filteredUsers.map((u, index) => (
              <TouchableOpacity
                key={index}
                style={commonStyles.card}
                onPress={() => {
                  setSelectedUser(u);
                  loadUserDetails(u.id);
                  setShowUserModal(true);
                }}
              >
                <View style={styles.userCardHeader}>
                  <View>
                    <Text style={styles.userName}>{u.name}</Text>
                    <Text style={styles.userEmail}>{u.email}</Text>
                  </View>
                  <IconSymbol 
                    ios_icon_name="chevron.right" 
                    android_material_icon_name="chevron_right" 
                    size={24} 
                    color={colors.textSecondary} 
                  />
                </View>
                <View style={styles.userCardFooter}>
                  <Text style={styles.userDetail}>Code: {u.referral_code}</Text>
                  <Text style={[styles.userDetail, { color: u.kyc_status === 'approved' ? colors.success : colors.warning }]}>
                    KYC: {u.kyc_status}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {activeTab === 'link-referral' && (
          <View style={commonStyles.card}>
            <Text style={styles.cardTitle}>Link User to Referrer</Text>
            <Text style={styles.cardDescription}>
              Manually link a user to a referrer by entering their email and the referrer's code.
            </Text>

            <Text style={styles.inputLabel}>User Email</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter user email..."
              placeholderTextColor={colors.textSecondary}
              value={linkReferralEmail}
              onChangeText={setLinkReferralEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              editable={!loading}
            />

            <Text style={styles.inputLabel}>Referrer Code</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter referrer code..."
              placeholderTextColor={colors.textSecondary}
              value={linkReferralCode}
              onChangeText={setLinkReferralCode}
              autoCapitalize="characters"
              editable={!loading}
            />

            <TouchableOpacity
              style={[commonStyles.button, loading && styles.buttonDisabled]}
              onPress={handleLinkReferral}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color={colors.card} />
              ) : (
                <Text style={styles.buttonText}>Link Referral</Text>
              )}
            </TouchableOpacity>
          </View>
        )}

        {activeTab === 'kyc' && (
          <View>
            <View style={commonStyles.card}>
              <Text style={styles.cardTitle}>Pending KYC Submissions ({kycSubmissions.length})</Text>
            </View>

            {kycSubmissions.length > 0 ? (
              kycSubmissions.map((kyc, index) => (
                <TouchableOpacity
                  key={index}
                  style={commonStyles.card}
                  onPress={() => {
                    setSelectedKYC(kyc);
                    setShowKYCModal(true);
                  }}
                >
                  <View style={styles.kycCardHeader}>
                    <View>
                      <Text style={styles.userName}>{kyc.name}</Text>
                      <Text style={styles.userEmail}>{kyc.email}</Text>
                    </View>
                    <IconSymbol 
                      ios_icon_name="chevron.right" 
                      android_material_icon_name="chevron_right" 
                      size={24} 
                      color={colors.textSecondary} 
                    />
                  </View>
                  <Text style={styles.kycDate}>
                    Submitted: {new Date(kyc.created_at).toLocaleDateString()}
                  </Text>
                </TouchableOpacity>
              ))
            ) : (
              <View style={commonStyles.card}>
                <Text style={styles.emptyText}>No pending KYC submissions</Text>
              </View>
            )}
          </View>
        )}

        {activeTab === 'messages' && (
          <View>
            <View style={commonStyles.card}>
              <Text style={styles.cardTitle}>User Messages ({messages.length})</Text>
            </View>

            {messages.length > 0 ? (
              messages.map((msg, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    commonStyles.card,
                    msg.status === 'pending' && styles.messageCardPending
                  ]}
                  onPress={() => {
                    setSelectedMessage(msg);
                    setMessageResponse(msg.response || '');
                    setShowMessageModal(true);
                  }}
                >
                  <View style={styles.messageCardHeader}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.userName}>{msg.user_name}</Text>
                      <Text style={styles.messageDate}>
                        {new Date(msg.created_at).toLocaleString()}
                      </Text>
                    </View>
                    <View style={[
                      styles.messageStatusBadge,
                      msg.status === 'answered' && styles.messageStatusAnswered
                    ]}>
                      <Text style={styles.messageStatusText}>
                        {msg.status === 'pending' ? 'Pending' : 'Answered'}
                      </Text>
                    </View>
                  </View>
                  <Text style={styles.messageText} numberOfLines={3}>
                    {msg.message}
                  </Text>
                  {msg.response && (
                    <View style={styles.messageResponse}>
                      <Text style={styles.messageResponseLabel}>Response:</Text>
                      <Text style={styles.messageResponseText} numberOfLines={2}>
                        {msg.response}
                      </Text>
                    </View>
                  )}
                </TouchableOpacity>
              ))
            ) : (
              <View style={commonStyles.card}>
                <Text style={styles.emptyText}>No messages</Text>
              </View>
            )}
          </View>
        )}

        {activeTab === 'settings' && platformSettings && (
          <View style={commonStyles.card}>
            <Text style={styles.cardTitle}>Platform Settings</Text>

            <Text style={styles.inputLabel}>Minimum Purchase (USD)</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter minimum purchase..."
              placeholderTextColor={colors.textSecondary}
              value={editMinPurchase}
              onChangeText={setEditMinPurchase}
              keyboardType="decimal-pad"
              editable={!loading}
            />

            <Text style={styles.inputLabel}>Maximum Purchase (USD)</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter maximum purchase..."
              placeholderTextColor={colors.textSecondary}
              value={editMaxPurchase}
              onChangeText={setEditMaxPurchase}
              keyboardType="decimal-pad"
              editable={!loading}
            />

            <Text style={styles.inputLabel}>Monthly Vesting Rate (%)</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter vesting rate..."
              placeholderTextColor={colors.textSecondary}
              value={editVestingRate}
              onChangeText={setEditVestingRate}
              keyboardType="decimal-pad"
              editable={!loading}
            />

            <TouchableOpacity
              style={[commonStyles.button, loading && styles.buttonDisabled]}
              onPress={handleUpdatePlatformSettings}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color={colors.card} />
              ) : (
                <Text style={styles.buttonText}>Update Settings</Text>
              )}
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

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

            {selectedUser && selectedUserDetails && (
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
                      <Text style={styles.balanceItemValue}>
                        {selectedUserDetails.vesting.total_mxi.toFixed(2)}
                      </Text>
                    </View>
                    <View style={styles.balanceItem}>
                      <Text style={styles.balanceItemLabel}>Vesting Rewards</Text>
                      <Text style={styles.balanceItemValue}>
                        {selectedUserDetails.vesting.current_rewards.toFixed(4)}
                      </Text>
                    </View>
                  </View>
                </View>

                <View style={styles.modalSection}>
                  <Text style={styles.modalSectionTitle}>Account Actions</Text>
                  <TouchableOpacity
                    style={[
                      commonStyles.button,
                      selectedUser.account_blocked ? styles.buttonSuccess : styles.buttonError
                    ]}
                    onPress={() => handleToggleAccountBlock(!selectedUser.account_blocked)}
                  >
                    <Text style={styles.buttonText}>
                      {selectedUser.account_blocked ? 'Unblock Account' : 'Block Account'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>

      <Modal
        visible={showKYCModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowKYCModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>KYC Review</Text>
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
                <View style={styles.modalSection}>
                  <Text style={styles.modalUserName}>{selectedKYC.name}</Text>
                  <Text style={styles.modalUserEmail}>{selectedKYC.email}</Text>
                </View>

                <View style={styles.modalSection}>
                  <Text style={styles.modalSectionTitle}>KYC Information</Text>
                  <Text style={styles.kycInfo}>ID: {selectedKYC.identification}</Text>
                  <Text style={styles.kycInfo}>Address: {selectedKYC.address}</Text>
                  <Text style={styles.kycInfo}>
                    Documents: {selectedKYC.kyc_documents?.length || 0} uploaded
                  </Text>
                </View>

                <View style={styles.modalSection}>
                  <View style={styles.kycActions}>
                    <TouchableOpacity
                      style={[commonStyles.button, styles.buttonSuccess]}
                      onPress={() => handleKYCDecision('approved')}
                      disabled={loading}
                    >
                      {loading ? (
                        <ActivityIndicator color={colors.card} />
                      ) : (
                        <Text style={styles.buttonText}>Approve</Text>
                      )}
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[commonStyles.button, styles.buttonError]}
                      onPress={() => handleKYCDecision('rejected')}
                      disabled={loading}
                    >
                      {loading ? (
                        <ActivityIndicator color={colors.card} />
                      ) : (
                        <Text style={styles.buttonText}>Reject</Text>
                      )}
                    </TouchableOpacity>
                  </View>
                </View>
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>

      <Modal
        visible={showMessageModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowMessageModal(false)}
      >
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{ flex: 1 }}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Message Details</Text>
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
                  <View style={styles.modalSection}>
                    <Text style={styles.modalUserName}>{selectedMessage.user_name}</Text>
                    <Text style={styles.messageDate}>
                      {new Date(selectedMessage.created_at).toLocaleString()}
                    </Text>
                  </View>

                  <View style={styles.modalSection}>
                    <Text style={styles.modalSectionTitle}>User Message</Text>
                    <Text style={styles.messageFullText}>{selectedMessage.message}</Text>
                  </View>

                  <View style={styles.modalSection}>
                    <Text style={styles.modalSectionTitle}>Your Response</Text>
                    <TextInput
                      style={[styles.input, styles.textArea]}
                      placeholder="Enter your response..."
                      placeholderTextColor={colors.textSecondary}
                      value={messageResponse}
                      onChangeText={setMessageResponse}
                      multiline
                      numberOfLines={4}
                      editable={!loading}
                    />
                    <TouchableOpacity
                      style={[commonStyles.button, loading && styles.buttonDisabled]}
                      onPress={handleRespondToMessage}
                      disabled={loading}
                    >
                      {loading ? (
                        <ActivityIndicator color={colors.card} />
                      ) : (
                        <Text style={styles.buttonText}>Send Response</Text>
                      )}
                    </TouchableOpacity>
                  </View>
                </ScrollView>
              )}
            </View>
          </View>
        </KeyboardAvoidingView>
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
  cardDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 16,
    lineHeight: 20,
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
  userCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  userName: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  userCardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  userDetail: {
    fontSize: 12,
    color: colors.textSecondary,
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
    height: 100,
    textAlignVertical: 'top',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.card,
  },
  buttonSuccess: {
    backgroundColor: colors.success,
  },
  buttonError: {
    backgroundColor: colors.error,
  },
  kycCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  kycDate: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  messageCardPending: {
    borderLeftWidth: 4,
    borderLeftColor: colors.warning,
  },
  messageCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  messageDate: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 4,
  },
  messageStatusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: colors.warning,
  },
  messageStatusAnswered: {
    backgroundColor: colors.success,
  },
  messageStatusText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.card,
  },
  messageText: {
    fontSize: 14,
    color: colors.text,
    lineHeight: 20,
  },
  messageResponse: {
    marginTop: 12,
    padding: 12,
    backgroundColor: colors.background,
    borderRadius: 8,
  },
  messageResponseLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: 4,
  },
  messageResponseText: {
    fontSize: 13,
    color: colors.text,
    lineHeight: 18,
  },
  emptyText: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    padding: 20,
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
  kycInfo: {
    fontSize: 14,
    color: colors.text,
    marginBottom: 8,
  },
  kycActions: {
    flexDirection: 'row',
    gap: 12,
  },
  messageFullText: {
    fontSize: 15,
    color: colors.text,
    lineHeight: 22,
  },
});
