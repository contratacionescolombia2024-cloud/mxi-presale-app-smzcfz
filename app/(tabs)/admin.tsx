
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

  // Form states
  const [balanceAmount, setBalanceAmount] = useState('');
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

  const loadUserDetails = async (userId: string) => {
    setLoading(true);
    try {
      console.log(`📋 Loading details for user ${userId}`);
      
      const { data, error } = await supabase.rpc('admin_get_user_details', {
        p_user_id: userId,
      });

      if (error) {
        console.error('❌ RPC Error loading user details:', error);
        Alert.alert('Error', `Failed to load user details: ${error.message}`);
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
        Alert.alert('Error', errorMsg);
      }
    } catch (error: any) {
      console.error('❌ Exception in loadUserDetails:', error);
      Alert.alert('Error', error.message || 'Failed to load user details');
    } finally {
      setLoading(false);
    }
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
        Alert.alert('Error', `Failed to update profile: ${error.message}`);
        throw error;
      }

      console.log('📦 Update response:', data);

      if (data && data.success) {
        console.log('✅ User profile updated successfully');
        Alert.alert('Success', 'User profile updated successfully');
        await loadUsers();
        await loadUserDetails(selectedUser.id);
      } else {
        const errorMsg = data?.error || 'Failed to update user profile';
        console.error('❌ Profile update failed:', errorMsg);
        Alert.alert('Error', errorMsg);
      }
    } catch (error: any) {
      console.error('❌ Exception in handleUpdateUserProfile:', error);
      Alert.alert('Error', error.message || 'Failed to update user profile');
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
        { text: 'Cancel', style: 'cancel' },
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
                Alert.alert('Error', `Failed to update: ${error.message}`);
                throw error;
              }

              console.log('✅ Referred_by updated successfully');
              Alert.alert('Success', 'Referral code updated successfully');
              await loadUsers();
              await loadUserDetails(selectedUser.id);
            } catch (error: any) {
              console.error('❌ Exception in handleUpdateReferredBy:', error);
              Alert.alert('Error', error.message || 'Failed to update referral code');
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
      Alert.alert('Error', 'Please enter both user email and referral code');
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
        Alert.alert('Error', `Failed to link referral: ${error.message}`);
        throw error;
      }

      console.log('📦 Referral link response:', data);

      if (data && data.success) {
        const commissionsMsg = data.total_commissions_distributed 
          ? `\n\nTotal commissions distributed: ${data.total_commissions_distributed.toFixed(2)} MXI`
          : '';
        
        Alert.alert(
          'Success',
          `${data.message}${commissionsMsg}`,
          [
            {
              text: 'OK',
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
        Alert.alert('Error', errorMsg);
      }
    } catch (error: any) {
      console.error('❌ Exception in handleLinkReferral:', error);
      Alert.alert('Error', error.message || 'Failed to link referral');
    } finally {
      setLoading(false);
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

    Alert.alert(
      'Confirm Action',
      `Add ${amount} MXI to ${selectedUser.name}'s balance?\n\nThis will add the balance directly without generating referral commissions.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm',
          onPress: async () => {
            setLoading(true);
            try {
              console.log('💰 ========================================');
              console.log('💰 AGGRESSIVE APPROACH: Direct database update');
              console.log('💰 User ID:', selectedUser.id);
              console.log('💰 Amount:', amount);
              console.log('💰 ========================================');
              
              // First, check if vesting record exists
              const { data: existingVesting, error: fetchError } = await supabase
                .from('vesting')
                .select('*')
                .eq('user_id', selectedUser.id)
                .maybeSingle();

              if (fetchError) {
                console.error('❌ Error fetching vesting:', fetchError);
                Alert.alert('Error', `Failed to fetch vesting data: ${fetchError.message}`);
                return;
              }

              console.log('📊 Existing vesting:', existingVesting);

              let updateError;
              
              if (existingVesting) {
                // Update existing record
                const oldTotal = parseFloat(existingVesting.total_mxi || '0');
                const oldPurchased = parseFloat(existingVesting.purchased_mxi || '0');
                const newTotal = oldTotal + amount;
                const newPurchased = oldPurchased + amount;

                console.log('📝 Updating existing vesting:');
                console.log('   Old total:', oldTotal);
                console.log('   Old purchased:', oldPurchased);
                console.log('   New total:', newTotal);
                console.log('   New purchased:', newPurchased);

                const { error } = await supabase
                  .from('vesting')
                  .update({
                    total_mxi: newTotal,
                    purchased_mxi: newPurchased,
                    last_update: new Date().toISOString(),
                  })
                  .eq('user_id', selectedUser.id);

                updateError = error;
              } else {
                // Create new record
                console.log('📝 Creating new vesting record');

                const { error } = await supabase
                  .from('vesting')
                  .insert({
                    user_id: selectedUser.id,
                    total_mxi: amount,
                    purchased_mxi: amount,
                    current_rewards: 0,
                    monthly_rate: 0.03,
                    last_update: new Date().toISOString(),
                  });

                updateError = error;
              }

              if (updateError) {
                console.error('❌ Database error:', updateError);
                Alert.alert(
                  'Error',
                  `Failed to update balance: ${updateError.message}\n\nDetails: ${updateError.details || 'No details'}\n\nHint: ${updateError.hint || 'No hint'}`
                );
                return;
              }

              console.log('✅ Balance updated successfully in database');

              // Verify the update
              const { data: verifyData, error: verifyError } = await supabase
                .from('vesting')
                .select('*')
                .eq('user_id', selectedUser.id)
                .single();

              if (verifyError) {
                console.error('⚠️ Could not verify update:', verifyError);
              } else {
                console.log('✅ Verified new balance:', verifyData);
              }

              Alert.alert(
                'Success',
                `✅ Successfully added ${amount} MXI to ${selectedUser.name}'s balance\n\n📊 New Balance:\n• Total MXI: ${verifyData?.total_mxi || 'N/A'}\n• Purchased MXI: ${verifyData?.purchased_mxi || 'N/A'}`,
                [
                  {
                    text: 'OK',
                    onPress: async () => {
                      setBalanceAmount('');
                      console.log('🔄 Refreshing data after balance addition...');
                      await loadUsers();
                      await loadMetrics();
                      await loadUserDetails(selectedUser.id);
                      console.log('✅ Data refresh complete');
                    }
                  }
                ]
              );
            } catch (error: any) {
              console.error('❌ Exception in handleAddBalance:', error);
              Alert.alert('Error', `Exception: ${error.message || 'Unknown error'}\n\nPlease check the console logs.`);
            } finally {
              setLoading(false);
            }
          }
        }
      ]
    );
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

    Alert.alert(
      'Confirm Removal',
      `Remove ${amount} MXI from ${selectedUser.name}'s balance?\n\nThis action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            setLoading(true);
            try {
              console.log(`💸 Removing ${amount} MXI from user ${selectedUser.id}`);
              
              const { data: vestingData, error: vestingError } = await supabase
                .from('vesting')
                .select('*')
                .eq('user_id', selectedUser.id)
                .single();

              if (vestingError) {
                console.error('❌ Error fetching vesting data:', vestingError);
                Alert.alert('Error', 'User has no balance to remove');
                return;
              }

              const currentBalance = parseFloat(vestingData.total_mxi);
              console.log(`📊 Current balance: ${currentBalance} MXI`);

              if (currentBalance < amount) {
                Alert.alert('Error', `User only has ${currentBalance.toFixed(2)} MXI. Cannot remove ${amount} MXI.`);
                return;
              }

              const newTotal = Math.max(0, currentBalance - amount);
              const currentPurchased = parseFloat(vestingData.purchased_mxi || '0');
              const newPurchased = Math.max(0, currentPurchased - amount);
              
              console.log(`📊 New balance will be: ${newTotal} MXI`);
              console.log(`📊 New purchased will be: ${newPurchased} MXI`);

              const { error: updateError } = await supabase
                .from('vesting')
                .update({
                  total_mxi: newTotal,
                  purchased_mxi: newPurchased,
                  last_update: new Date().toISOString(),
                })
                .eq('user_id', selectedUser.id);

              if (updateError) {
                console.error('❌ Error updating vesting:', updateError);
                Alert.alert('Error', `Failed to remove balance: ${updateError.message}`);
                throw updateError;
              }

              console.log(`✅ Removed ${amount} MXI, new balance: ${newTotal} MXI`);
              Alert.alert('Success', `Removed ${amount} MXI from ${selectedUser.name}'s balance\n\nNew balance: ${newTotal.toFixed(2)} MXI`);
              setBalanceAmount('');
              await loadUsers();
              await loadMetrics();
              await loadUserDetails(selectedUser.id);
            } catch (error: any) {
              console.error('❌ Exception in handleRemoveBalance:', error);
              Alert.alert('Error', error.message || 'Failed to remove balance');
            } finally {
              setLoading(false);
            }
          }
        }
      ]
    );
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
        Alert.alert('Error', `Failed to add referral: ${referralError.message}`);
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
        'Success', 
        `Added ${amount} MXI referral earnings (Level ${level}) to ${selectedUser.name}'s account`
      );
      setReferralAmount('');
      setReferralLevel('1');
      await loadUsers();
      await loadMetrics();
      await loadUserDetails(selectedUser.id);
    } catch (error: any) {
      console.error('❌ Exception in handleAddReferral:', error);
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

      if (error) {
        console.error('❌ Error responding to message:', error);
        Alert.alert('Error', `Failed to send response: ${error.message}`);
        throw error;
      }

      console.log('✅ Response sent successfully');
      Alert.alert('Success', 'Response sent successfully');
      setMessageResponse('');
      setShowMessageModal(false);
      await loadMessages();
      await loadMetrics();
    } catch (error: any) {
      console.error('❌ Exception in handleRespondToMessage:', error);
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

      if (error) {
        console.error('❌ Error updating KYC:', error);
        Alert.alert('Error', `Failed to update KYC: ${error.message}`);
        throw error;
      }

      console.log(`✅ KYC ${decision} successfully`);
      Alert.alert('Success', `KYC ${decision} for ${selectedKYC.name}`);
      setShowKYCModal(false);
      await loadKYCSubmissions();
      await loadMetrics();
    } catch (error: any) {
      console.error('❌ Exception in handleKYCDecision:', error);
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

      if (error) {
        console.error('❌ Error updating settings:', error);
        Alert.alert('Error', `Failed to update settings: ${error.message}`);
        throw error;
      }

      console.log('✅ Platform settings updated successfully');
      Alert.alert('Success', 'Platform settings updated successfully');
      await loadPlatformSettings();
    } catch (error: any) {
      console.error('❌ Exception in handleUpdatePlatformSettings:', error);
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
    { id: 'link-referral', label: 'Link Referral', iosIcon: 'link.circle.fill', androidIcon: 'link' },
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
                    loadUserDetails(u.id);
                    setShowUserModal(true);
                  }}
                >
                  <View style={styles.userInfo}>
                    <Text style={styles.userName}>{u.name}</Text>
                    <Text style={styles.userEmail}>{u.email}</Text>
                    <Text style={styles.userDetail}>KYC: {u.kyc_status}</Text>
                    <Text style={styles.userDetail}>Referral Code: {u.referral_code}</Text>
                    {u.referred_by && (
                      <Text style={styles.userDetail}>Referred By: {u.referred_by}</Text>
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
                  {searchQuery ? 'No users found' : 'No users registered yet'}
                </Text>
              </View>
            )}
          </>
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
              <Text style={styles.cardTitle}>Link User to Referral Code</Text>
            </View>
            
            <Text style={styles.linkReferralDescription}>
              Manually link a user to a referral code. The system will automatically:
            </Text>
            <View style={styles.featureList}>
              <Text style={styles.featureItem}>- Establish the referral relationship</Text>
              <Text style={styles.featureItem}>- Calculate commissions for all existing purchases</Text>
              <Text style={styles.featureItem}>- Distribute multi-level commissions (5%, 2%, 1%)</Text>
              <Text style={styles.featureItem}>- Update all referrers&apos; vesting balances</Text>
            </View>

            <Text style={styles.inputLabel}>User Email</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter user's email address"
              placeholderTextColor={colors.textSecondary}
              value={linkReferralEmail}
              onChangeText={setLinkReferralEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />

            <Text style={styles.inputLabel}>Referral Code</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter referrer's code (e.g., MXI123456)"
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
                This action cannot be undone. Make sure the email and referral code are correct before proceeding.
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
                <>
                  <IconSymbol 
                    ios_icon_name="link.circle.fill" 
                    android_material_icon_name="link" 
                    size={24} 
                    color={colors.card} 
                  />
                  <Text style={styles.linkButtonText}>Link Referral</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
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

      {/* Enhanced User Management Modal */}
      <Modal
        visible={showUserModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowUserModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>User Management</Text>
              <TouchableOpacity onPress={() => setShowUserModal(false)}>
                <IconSymbol 
                  ios_icon_name="xmark.circle.fill" 
                  android_material_icon_name="cancel" 
                  size={28} 
                  color={colors.textSecondary} 
                />
              </TouchableOpacity>
            </View>

            {selectedUser && selectedUserDetails ? (
              <ScrollView showsVerticalScrollIndicator={false}>
                {/* User Overview */}
                <View style={styles.userOverview}>
                  <View style={styles.userAvatarContainer}>
                    <IconSymbol 
                      ios_icon_name="person.circle.fill" 
                      android_material_icon_name="account_circle" 
                      size={64} 
                      color={colors.primary} 
                    />
                  </View>
                  <Text style={styles.modalUserName}>{selectedUser.name}</Text>
                  <Text style={styles.modalUserEmail}>{selectedUser.email}</Text>
                  <View style={styles.userBadges}>
                    <View style={[styles.badge, selectedUser.is_admin && styles.badgeAdmin]}>
                      <Text style={styles.badgeText}>
                        {selectedUser.is_admin ? 'Admin' : 'User'}
                      </Text>
                    </View>
                    <View style={[
                      styles.badge,
                      selectedUser.kyc_status === 'approved' && styles.badgeSuccess,
                      selectedUser.kyc_status === 'rejected' && styles.badgeError,
                      selectedUser.kyc_status === 'pending' && styles.badgeWarning,
                    ]}>
                      <Text style={styles.badgeText}>
                        KYC: {selectedUser.kyc_status}
                      </Text>
                    </View>
                  </View>
                </View>

                {/* Balance Summary */}
                <View style={styles.balanceSummary}>
                  <Text style={styles.sectionTitle}>Balance Summary</Text>
                  <View style={styles.balanceGrid}>
                    <View style={styles.balanceItem}>
                      <IconSymbol 
                        ios_icon_name="bitcoinsign.circle.fill" 
                        android_material_icon_name="currency_bitcoin" 
                        size={24} 
                        color={colors.primary} 
                      />
                      <Text style={styles.balanceValue}>
                        {selectedUserDetails.vesting.total_mxi.toFixed(2)}
                      </Text>
                      <Text style={styles.balanceLabel}>Total MXI</Text>
                    </View>
                    <View style={styles.balanceItem}>
                      <IconSymbol 
                        ios_icon_name="chart.line.uptrend.xyaxis" 
                        android_material_icon_name="trending_up" 
                        size={24} 
                        color={colors.secondary} 
                      />
                      <Text style={styles.balanceValue}>
                        {selectedUserDetails.vesting.current_rewards.toFixed(2)}
                      </Text>
                      <Text style={styles.balanceLabel}>Vesting Rewards</Text>
                    </View>
                    <View style={styles.balanceItem}>
                      <IconSymbol 
                        ios_icon_name="cart.fill" 
                        android_material_icon_name="shopping_cart" 
                        size={24} 
                        color={colors.accent} 
                      />
                      <Text style={styles.balanceValue}>
                        {selectedUserDetails.purchases.total_mxi_purchased.toFixed(2)}
                      </Text>
                      <Text style={styles.balanceLabel}>Purchased</Text>
                    </View>
                    <View style={styles.balanceItem}>
                      <IconSymbol 
                        ios_icon_name="person.3.fill" 
                        android_material_icon_name="group" 
                        size={24} 
                        color={colors.highlight} 
                      />
                      <Text style={styles.balanceValue}>
                        {selectedUserDetails.referrals.total_referral_earnings.toFixed(2)}
                      </Text>
                      <Text style={styles.balanceLabel}>Referral Earnings</Text>
                    </View>
                  </View>
                </View>

                {/* Profile Information Section */}
                <View style={styles.modalSection}>
                  <Text style={styles.modalSectionTitle}>
                    <IconSymbol 
                      ios_icon_name="person.text.rectangle.fill" 
                      android_material_icon_name="badge" 
                      size={20} 
                      color={colors.primary} 
                    />
                    {' '}Profile Information
                  </Text>
                  
                  <Text style={styles.inputLabel}>Full Name</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Enter full name"
                    placeholderTextColor={colors.textSecondary}
                    value={editName}
                    onChangeText={setEditName}
                  />

                  <Text style={styles.inputLabel}>Identification Number</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Enter identification number"
                    placeholderTextColor={colors.textSecondary}
                    value={editIdentification}
                    onChangeText={setEditIdentification}
                  />

                  <Text style={styles.inputLabel}>Email Address</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Enter email address"
                    placeholderTextColor={colors.textSecondary}
                    value={editEmail}
                    onChangeText={setEditEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />

                  <Text style={styles.inputLabel}>Residential Address</Text>
                  <TextInput
                    style={[styles.input, styles.textArea]}
                    placeholder="Enter residential address"
                    placeholderTextColor={colors.textSecondary}
                    value={editAddress}
                    onChangeText={setEditAddress}
                    multiline
                    numberOfLines={3}
                  />

                  <TouchableOpacity 
                    style={[styles.modalButton, styles.modalButtonPrimary]}
                    onPress={handleUpdateUserProfile}
                    disabled={loading}
                  >
                    {loading ? (
                      <ActivityIndicator color={colors.card} size="small" />
                    ) : (
                      <>
                        <IconSymbol 
                          ios_icon_name="checkmark.circle.fill" 
                          android_material_icon_name="check_circle" 
                          size={20} 
                          color={colors.card} 
                        />
                        <Text style={styles.modalButtonText}>Update Profile</Text>
                      </>
                    )}
                  </TouchableOpacity>
                </View>

                {/* Referral Management Section */}
                <View style={styles.modalSection}>
                  <Text style={styles.modalSectionTitle}>
                    <IconSymbol 
                      ios_icon_name="link.circle.fill" 
                      android_material_icon_name="link" 
                      size={20} 
                      color={colors.secondary} 
                    />
                    {' '}Referral Management
                  </Text>
                  
                  <View style={styles.infoBox}>
                    <Text style={styles.infoBoxLabel}>User&apos;s Referral Code:</Text>
                    <Text style={styles.infoBoxValue}>{selectedUser.referral_code}</Text>
                  </View>

                  <View style={styles.infoBox}>
                    <Text style={styles.infoBoxLabel}>Total Referrals:</Text>
                    <Text style={styles.infoBoxValue}>
                      {selectedUserDetails.referrals.total_referrals}
                    </Text>
                  </View>

                  <Text style={styles.inputLabel}>Referred By (Referral Code)</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Enter referrer's code or leave empty"
                    placeholderTextColor={colors.textSecondary}
                    value={editReferredBy}
                    onChangeText={(text) => setEditReferredBy(text.toUpperCase())}
                    autoCapitalize="characters"
                  />

                  <TouchableOpacity 
                    style={[styles.modalButton, styles.modalButtonSecondary]}
                    onPress={handleUpdateReferredBy}
                    disabled={loading}
                  >
                    {loading ? (
                      <ActivityIndicator color={colors.card} size="small" />
                    ) : (
                      <>
                        <IconSymbol 
                          ios_icon_name="arrow.triangle.branch" 
                          android_material_icon_name="call_split" 
                          size={20} 
                          color={colors.card} 
                        />
                        <Text style={styles.modalButtonText}>Update Referrer</Text>
                      </>
                    )}
                  </TouchableOpacity>
                </View>

                {/* Balance Management Section - SIMPLIFIED */}
                <View style={styles.modalSection}>
                  <Text style={styles.modalSectionTitle}>
                    <IconSymbol 
                      ios_icon_name="dollarsign.circle.fill" 
                      android_material_icon_name="attach_money" 
                      size={20} 
                      color={colors.success} 
                    />
                    {' '}Balance Management
                  </Text>
                  <Text style={styles.modalSectionDescription}>
                    Add or remove MXI tokens from user&apos;s balance. Balance changes do not trigger referral commissions.
                  </Text>

                  <Text style={styles.inputLabel}>Amount (MXI)</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Enter amount in MXI"
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
                        <>
                          <IconSymbol 
                            ios_icon_name="plus.circle.fill" 
                            android_material_icon_name="add_circle" 
                            size={20} 
                            color={colors.card} 
                          />
                          <Text style={styles.modalButtonText}>Add Amount</Text>
                        </>
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
                        <>
                          <IconSymbol 
                            ios_icon_name="minus.circle.fill" 
                            android_material_icon_name="remove_circle" 
                            size={20} 
                            color={colors.card} 
                          />
                          <Text style={styles.modalButtonText}>Remove Amount</Text>
                        </>
                      )}
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Referral Earnings Section */}
                <View style={styles.modalSection}>
                  <Text style={styles.modalSectionTitle}>
                    <IconSymbol 
                      ios_icon_name="gift.fill" 
                      android_material_icon_name="card_giftcard" 
                      size={20} 
                      color={colors.accent} 
                    />
                    {' '}Add Referral Earnings
                  </Text>
                  <Text style={styles.modalSectionDescription}>
                    Manually add MXI earned from referrals
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
                    <Text style={styles.levelInfoText}>- Level 1: 5% commission</Text>
                    <Text style={styles.levelInfoText}>- Level 2: 2% commission</Text>
                    <Text style={styles.levelInfoText}>- Level 3: 1% commission</Text>
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
                    style={[styles.modalButton, styles.modalButtonAccent]}
                    onPress={handleAddReferral}
                    disabled={loading}
                  >
                    {loading ? (
                      <ActivityIndicator color={colors.card} size="small" />
                    ) : (
                      <>
                        <IconSymbol 
                          ios_icon_name="gift.fill" 
                          android_material_icon_name="card_giftcard" 
                          size={20} 
                          color={colors.card} 
                        />
                        <Text style={styles.modalButtonText}>Add Referral Earnings</Text>
                      </>
                    )}
                  </TouchableOpacity>
                </View>
              </ScrollView>
            ) : (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={colors.primary} />
                <Text style={styles.loadingText}>Loading user details...</Text>
              </View>
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
                          - Document {index + 1}
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
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.card,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '90%',
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
  userOverview: {
    alignItems: 'center',
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    marginBottom: 20,
  },
  userAvatarContainer: {
    marginBottom: 12,
  },
  modalUserName: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
    textAlign: 'center',
  },
  modalUserEmail: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 12,
    textAlign: 'center',
  },
  userBadges: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: colors.border,
  },
  badgeAdmin: {
    backgroundColor: colors.error,
  },
  badgeSuccess: {
    backgroundColor: colors.success,
  },
  badgeError: {
    backgroundColor: colors.error,
  },
  badgeWarning: {
    backgroundColor: colors.warning,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.card,
  },
  balanceSummary: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
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
  balanceValue: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    marginTop: 8,
  },
  balanceLabel: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 4,
    textAlign: 'center',
  },
  modalSection: {
    marginTop: 24,
    paddingTop: 20,
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
    marginBottom: 16,
    lineHeight: 18,
  },
  infoBox: {
    backgroundColor: colors.background,
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  infoBoxLabel: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  infoBoxValue: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
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
  modalButtonSecondary: {
    backgroundColor: colors.secondary,
  },
  modalButtonSuccess: {
    backgroundColor: colors.success,
  },
  modalButtonDanger: {
    backgroundColor: colors.error,
  },
  modalButtonAccent: {
    backgroundColor: colors.accent,
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
