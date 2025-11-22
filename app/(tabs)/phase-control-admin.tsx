
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { colors, commonStyles } from '@/styles/commonStyles';
import { IconSymbol } from '@/components/IconSymbol';
import { supabase } from '@/app/integrations/supabase/client';
import { Redirect, useRouter } from 'expo-router';

interface PresaleStageStatus {
  stage: number;
  price: string;
  total_mxi: string;
  sold_mxi: string;
  is_active: boolean;
  percentage_sold: number;
  remaining_mxi: string;
  start_date: string;
  end_date: string;
}

interface VestingStats {
  total_users: number;
  total_rewards: string;
  total_purchased_mxi: string;
  total_commission_balance: string;
}

export default function PhaseControlAdminScreen() {
  const { user, isAdmin } = useAuth();
  const { t } = useLanguage();
  const router = useRouter();
  
  const [loading, setLoading] = useState(true);
  const [resetting, setResetting] = useState(false);
  const [stages, setStages] = useState<PresaleStageStatus[]>([]);
  const [vestingStats, setVestingStats] = useState<VestingStats | null>(null);

  useEffect(() => {
    if (isAdmin) {
      loadData();
    }
  }, [isAdmin]);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Load presale stage status
      const { data: stagesData, error: stagesError } = await supabase
        .from('presale_stage_status')
        .select('*')
        .order('stage');

      if (stagesError) {
        console.error('Error loading stages:', stagesError);
        throw stagesError;
      }

      setStages(stagesData || []);

      // Load vesting statistics
      const { data: vestingData, error: vestingError } = await supabase
        .from('vesting')
        .select('current_rewards, purchased_mxi, commission_balance');

      if (vestingError) {
        console.error('Error loading vesting stats:', vestingError);
        throw vestingError;
      }

      if (vestingData) {
        const stats: VestingStats = {
          total_users: vestingData.length,
          total_rewards: vestingData.reduce((sum, v) => sum + parseFloat(v.current_rewards || '0'), 0).toFixed(4),
          total_purchased_mxi: vestingData.reduce((sum, v) => sum + parseFloat(v.purchased_mxi || '0'), 0).toFixed(2),
          total_commission_balance: vestingData.reduce((sum, v) => sum + parseFloat(v.commission_balance || '0'), 0).toFixed(2),
        };
        setVestingStats(stats);
      }
    } catch (error) {
      console.error('Error loading data:', error);
      Alert.alert(t('error'), 'Failed to load phase control data');
    } finally {
      setLoading(false);
    }
  };

  const executeResetVestingRewards = async () => {
    console.log('🚀 ========== DRASTIC RESET APPROACH STARTED ==========');
    console.log('🚀 Step 1: Verify Supabase client is initialized');
    console.log('🚀 Supabase client:', supabase ? 'INITIALIZED' : 'NOT INITIALIZED');
    
    if (!supabase) {
      console.error('❌ CRITICAL: Supabase client is not initialized!');
      throw new Error('Supabase client is not initialized');
    }

    console.log('🚀 Step 2: Get current session');
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    console.log('🚀 Session data:', sessionData);
    console.log('🚀 Session error:', sessionError);
    
    if (sessionError) {
      console.error('❌ Session error:', sessionError);
      throw new Error(`Session error: ${sessionError.message}`);
    }
    
    if (!sessionData?.session) {
      console.error('❌ No active session found!');
      throw new Error('No active session. Please log in again.');
    }

    console.log('🚀 Step 3: Verify user is authenticated');
    console.log('🚀 User ID:', sessionData.session.user.id);
    console.log('🚀 User email:', sessionData.session.user.email);

    console.log('🚀 Step 4: Calling RPC function admin_reset_global_vesting_rewards');
    console.log('🚀 RPC call parameters: NONE (function takes no parameters)');
    
    try {
      // DRASTIC APPROACH: Call the RPC function with explicit error handling
      const rpcResult = await supabase.rpc('admin_reset_global_vesting_rewards');
      
      console.log('🚀 Step 5: RPC call completed');
      console.log('🚀 RPC Result:', JSON.stringify(rpcResult, null, 2));
      console.log('🚀 RPC Data:', rpcResult.data);
      console.log('🚀 RPC Error:', rpcResult.error);
      console.log('🚀 RPC Status:', rpcResult.status);
      console.log('🚀 RPC StatusText:', rpcResult.statusText);

      if (rpcResult.error) {
        console.error('❌ RPC Error detected:', rpcResult.error);
        console.error('❌ Error code:', rpcResult.error.code);
        console.error('❌ Error message:', rpcResult.error.message);
        console.error('❌ Error details:', rpcResult.error.details);
        console.error('❌ Error hint:', rpcResult.error.hint);
        throw new Error(`RPC Error: ${rpcResult.error.message || 'Unknown RPC error'}`);
      }

      console.log('🚀 Step 6: Validate response data');
      const responseData = rpcResult.data;
      console.log('🚀 Response data type:', typeof responseData);
      console.log('🚀 Response data:', responseData);

      if (!responseData) {
        console.error('❌ No data returned from RPC function');
        throw new Error('No data returned from RPC function');
      }

      if (typeof responseData !== 'object') {
        console.error('❌ Response data is not an object:', responseData);
        throw new Error('Invalid response format from RPC function');
      }

      console.log('🚀 Step 7: Check success status');
      console.log('🚀 Success field:', responseData.success);
      console.log('🚀 Affected users:', responseData.affected_users);
      console.log('🚀 Total rewards reset:', responseData.total_rewards_reset);

      if (responseData.success === true) {
        console.log('✅ ========== RESET COMPLETED SUCCESSFULLY ==========');
        console.log('✅ Users affected:', responseData.affected_users || 0);
        console.log('✅ Total rewards reset:', responseData.total_rewards_reset || 0);
        
        return {
          success: true,
          affected_users: responseData.affected_users || 0,
          total_rewards_reset: responseData.total_rewards_reset || 0,
          message: responseData.message || 'Vesting rewards reset successfully'
        };
      } else {
        console.error('❌ Function returned success: false');
        console.error('❌ Error from function:', responseData.error || responseData.message);
        throw new Error(responseData.error || responseData.message || 'Failed to reset vesting rewards');
      }
    } catch (rpcError: any) {
      console.error('❌ Exception during RPC call:', rpcError);
      console.error('❌ Exception message:', rpcError.message);
      console.error('❌ Exception stack:', rpcError.stack);
      throw rpcError;
    }
  };

  const handleResetVestingRewards = () => {
    console.log('🔘 Reset button pressed');
    
    Alert.alert(
      t('resetVestingRewards') || 'Reset Vesting Rewards',
      t('resetVestingConfirm') || 'Are you sure you want to reset all vesting rewards? This action cannot be undone.',
      [
        {
          text: t('cancel') || 'Cancel',
          style: 'cancel',
          onPress: () => {
            console.log('🔘 User cancelled reset');
          }
        },
        {
          text: t('confirm') || 'Confirm',
          style: 'destructive',
          onPress: async () => {
            console.log('🔘 User confirmed reset');
            setResetting(true);
            
            try {
              const result = await executeResetVestingRewards();
              
              console.log('✅ Reset successful, showing success alert');
              Alert.alert(
                t('success') || 'Success',
                `${t('vestingResetSuccess') || 'Vesting rewards reset successfully'}\n\n` +
                `Users affected: ${result.affected_users}\n` +
                `Total rewards reset: ${parseFloat(result.total_rewards_reset.toString()).toFixed(4)} MXI`,
                [
                  {
                    text: 'OK',
                    onPress: async () => {
                      console.log('✅ Reloading data after successful reset');
                      await loadData();
                    }
                  }
                ]
              );
            } catch (error: any) {
              console.error('❌ Reset failed with error:', error);
              Alert.alert(
                t('error') || 'Error',
                error.message || t('vestingResetFailed') || 'Failed to reset vesting rewards. Please try again.',
                [
                  {
                    text: 'OK',
                    onPress: () => {
                      console.log('❌ User acknowledged error');
                    }
                  }
                ]
              );
            } finally {
              console.log('🔘 Resetting state to false');
              setResetting(false);
            }
          },
        },
      ]
    );
  };

  if (!isAdmin) {
    return <Redirect href="/(tabs)/(home)/" />;
  }

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>{t('loading')}</Text>
        </View>
      </SafeAreaView>
    );
  }

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
        <View style={styles.headerContent}>
          <IconSymbol 
            ios_icon_name="slider.horizontal.3" 
            android_material_icon_name="tune" 
            size={40} 
            color={colors.primary} 
          />
          <Text style={styles.title}>{t('phaseControl')}</Text>
        </View>
        <TouchableOpacity onPress={loadData}>
          <IconSymbol 
            ios_icon_name="arrow.clockwise" 
            android_material_icon_name="refresh" 
            size={24} 
            color={colors.primary} 
          />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Presale Stages Status */}
        <View style={commonStyles.card}>
          <Text style={styles.cardTitle}>Presale Stages Status</Text>
          {stages.map((stage) => (
            <View key={stage.stage} style={styles.stageCard}>
              <View style={styles.stageHeader}>
                <View style={styles.stageHeaderLeft}>
                  <Text style={styles.stageName}>Stage {stage.stage}</Text>
                  {stage.is_active && (
                    <View style={styles.activeBadge}>
                      <Text style={styles.activeBadgeText}>ACTIVE</Text>
                    </View>
                  )}
                </View>
                <Text style={styles.stagePrice}>${stage.price} / MXI</Text>
              </View>

              <View style={styles.stageStats}>
                <View style={styles.statItem}>
                  <Text style={styles.statLabel}>Total MXI</Text>
                  <Text style={styles.statValue}>{parseFloat(stage.total_mxi).toLocaleString()}</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statLabel}>Sold MXI</Text>
                  <Text style={styles.statValue}>{parseFloat(stage.sold_mxi).toLocaleString()}</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statLabel}>Remaining</Text>
                  <Text style={styles.statValue}>{parseFloat(stage.remaining_mxi).toLocaleString()}</Text>
                </View>
              </View>

              <View style={styles.progressBar}>
                <View 
                  style={[
                    styles.progressFill, 
                    { width: `${Math.min(100, stage.percentage_sold)}%` }
                  ]} 
                />
              </View>
              <Text style={styles.progressText}>
                {stage.percentage_sold.toFixed(2)}% sold
              </Text>
            </View>
          ))}
        </View>

        {/* Vesting Statistics */}
        {vestingStats && (
          <View style={commonStyles.card}>
            <Text style={styles.cardTitle}>Global Vesting Statistics</Text>
            
            <View style={styles.vestingStatsGrid}>
              <View style={styles.vestingStatCard}>
                <IconSymbol 
                  ios_icon_name="person.3.fill" 
                  android_material_icon_name="group" 
                  size={32} 
                  color={colors.primary} 
                />
                <Text style={styles.vestingStatValue}>{vestingStats.total_users}</Text>
                <Text style={styles.vestingStatLabel}>Users with Vesting</Text>
              </View>

              <View style={styles.vestingStatCard}>
                <IconSymbol 
                  ios_icon_name="chart.line.uptrend.xyaxis" 
                  android_material_icon_name="trending_up" 
                  size={32} 
                  color={colors.success} 
                />
                <Text style={styles.vestingStatValue}>{vestingStats.total_rewards}</Text>
                <Text style={styles.vestingStatLabel}>Total Rewards (MXI)</Text>
              </View>

              <View style={styles.vestingStatCard}>
                <IconSymbol 
                  ios_icon_name="cart.fill" 
                  android_material_icon_name="shopping_cart" 
                  size={32} 
                  color={colors.secondary} 
                />
                <Text style={styles.vestingStatValue}>{parseFloat(vestingStats.total_purchased_mxi).toLocaleString()}</Text>
                <Text style={styles.vestingStatLabel}>Total Purchased (MXI)</Text>
              </View>

              <View style={styles.vestingStatCard}>
                <IconSymbol 
                  ios_icon_name="gift.fill" 
                  android_material_icon_name="card_giftcard" 
                  size={32} 
                  color={colors.accent} 
                />
                <Text style={styles.vestingStatValue}>{parseFloat(vestingStats.total_commission_balance).toLocaleString()}</Text>
                <Text style={styles.vestingStatLabel}>Total Commissions (MXI)</Text>
              </View>
            </View>
          </View>
        )}

        {/* Vesting Control */}
        <View style={commonStyles.card}>
          <Text style={styles.cardTitle}>Vesting Rewards Control</Text>
          <Text style={styles.cardDescription}>
            Reset all vesting rewards to 0 and restart the vesting counter for all users. 
            This action cannot be undone.
          </Text>

          <View style={styles.warningBox}>
            <IconSymbol 
              ios_icon_name="exclamationmark.triangle.fill" 
              android_material_icon_name="warning" 
              size={32} 
              color={colors.warning} 
            />
            <Text style={styles.warningText}>
              This will reset all accumulated vesting rewards for all users. 
              Use this feature carefully and only when necessary.
            </Text>
          </View>

          <TouchableOpacity
            style={[styles.resetButton, resetting && styles.resetButtonDisabled]}
            onPress={handleResetVestingRewards}
            disabled={resetting}
            activeOpacity={0.7}
          >
            {resetting ? (
              <React.Fragment>
                <ActivityIndicator color={colors.card} />
                <Text style={styles.resetButtonText}>Resetting...</Text>
              </React.Fragment>
            ) : (
              <React.Fragment>
                <IconSymbol 
                  ios_icon_name="arrow.counterclockwise.circle.fill" 
                  android_material_icon_name="restart_alt" 
                  size={24} 
                  color={colors.card} 
                />
                <Text style={styles.resetButtonText}>{t('resetVestingRewards') || 'Reset Vesting Rewards'}</Text>
              </React.Fragment>
            )}
          </TouchableOpacity>
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
    justifyContent: 'space-between',
    padding: 20,
    paddingTop: Platform.OS === 'android' ? 48 : 20,
    paddingBottom: 12,
  },
  backButton: {
    padding: 8,
  },
  headerContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginLeft: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    fontSize: 16,
    color: colors.textSecondary,
    marginTop: 16,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 100,
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
  stageCard: {
    backgroundColor: colors.background,
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  stageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  stageHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  stageName: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
  },
  activeBadge: {
    backgroundColor: colors.success,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  activeBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.card,
  },
  stagePrice: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.primary,
  },
  stageStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  statValue: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text,
  },
  progressBar: {
    height: 8,
    backgroundColor: colors.border,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.secondary,
  },
  progressText: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  vestingStatsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  vestingStatCard: {
    width: '48%',
    backgroundColor: colors.background,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  vestingStatValue: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    marginTop: 8,
  },
  vestingStatLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 4,
    textAlign: 'center',
  },
  warningBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: `${colors.warning}15`,
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: colors.warning,
  },
  warningText: {
    flex: 1,
    fontSize: 13,
    color: colors.text,
    lineHeight: 18,
  },
  resetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    backgroundColor: colors.error,
    padding: 18,
    borderRadius: 12,
    minHeight: 56,
  },
  resetButtonDisabled: {
    opacity: 0.5,
  },
  resetButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.card,
  },
});
