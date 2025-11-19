
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '@/contexts/AuthContext';
import { colors, commonStyles } from '@/styles/commonStyles';
import { IconSymbol } from '@/components/IconSymbol';
import { supabase } from '@/app/integrations/supabase/client';
import { updateAllVestingRewards } from '@/utils/vestingBackgroundService';
import { useRouter } from 'expo-router';

interface VestingStatus {
  user_id: string;
  user_name: string;
  email: string;
  purchased_mxi: number;
  total_mxi: number;
  current_rewards: number;
  monthly_rate: number;
  last_update: string;
  seconds_since_update: number;
  calculated_current_rewards: number;
  monthly_earnings_potential: number;
}

export default function VestingAdminScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const [vestingStatuses, setVestingStatuses] = useState<VestingStatus[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  // Check if user is admin
  useEffect(() => {
    const checkAdmin = async () => {
      if (!user?.id) return;

      const { data, error } = await supabase
        .from('users_profiles')
        .select('is_admin')
        .eq('id', user.id)
        .single();

      if (error) {
        console.error('Error checking admin status:', error);
        return;
      }

      if (!data?.is_admin) {
        Alert.alert('Access Denied', 'You do not have permission to access this page.');
        router.back();
        return;
      }

      setIsAdmin(true);
    };

    checkAdmin();
  }, [user?.id, router]);

  // Load vesting statuses
  const loadVestingStatuses = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('vesting_status')
        .select('*')
        .order('purchased_mxi', { ascending: false });

      if (error) {
        console.error('Error loading vesting statuses:', error);
        Alert.alert('Error', 'Failed to load vesting statuses');
        return;
      }

      setVestingStatuses(data || []);
    } catch (error) {
      console.error('Failed to load vesting statuses:', error);
      Alert.alert('Error', 'Failed to load vesting statuses');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      loadVestingStatuses();
    }
  }, [isAdmin]);

  // Manual update all vesting rewards
  const handleUpdateAll = async () => {
    try {
      setIsUpdating(true);
      const result = await updateAllVestingRewards();

      if (result.success) {
        Alert.alert('Success', 'All vesting rewards updated successfully');
        await loadVestingStatuses();
      } else {
        Alert.alert('Error', result.error || 'Failed to update vesting rewards');
      }
    } catch (error) {
      console.error('Failed to update vesting rewards:', error);
      Alert.alert('Error', 'Failed to update vesting rewards');
    } finally {
      setIsUpdating(false);
    }
  };

  if (!isAdmin) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Checking permissions...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Loading vesting statuses...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const totalPurchasedMXI = vestingStatuses.reduce((sum, status) => sum + status.purchased_mxi, 0);
  const totalRewards = vestingStatuses.reduce((sum, status) => sum + status.current_rewards, 0);
  const totalMonthlyPotential = vestingStatuses.reduce((sum, status) => sum + status.monthly_earnings_potential, 0);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <IconSymbol 
            ios_icon_name="chart.bar.fill" 
            android_material_icon_name="bar_chart" 
            size={60} 
            color={colors.primary} 
          />
          <Text style={styles.title}>Vesting Admin Panel</Text>
          <Text style={styles.subtitle}>Monitor and manage vesting rewards</Text>
        </View>

        {/* Summary Card */}
        <View style={[commonStyles.card, styles.summaryCard]}>
          <Text style={styles.cardTitle}>Global Vesting Summary</Text>
          
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Total Users with Vesting</Text>
            <Text style={styles.summaryValue}>{vestingStatuses.length}</Text>
          </View>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Total Purchased MXI</Text>
            <Text style={styles.summaryValue}>{totalPurchasedMXI.toFixed(2)} MXI</Text>
          </View>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Total Vesting Rewards</Text>
            <Text style={styles.summaryValue}>{totalRewards.toFixed(4)} MXI</Text>
          </View>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Monthly Potential</Text>
            <Text style={styles.summaryValue}>{totalMonthlyPotential.toFixed(2)} MXI</Text>
          </View>
        </View>

        {/* Update Button */}
        <TouchableOpacity
          style={[commonStyles.button, styles.updateButton, isUpdating && styles.buttonDisabled]}
          onPress={handleUpdateAll}
          disabled={isUpdating}
        >
          {isUpdating ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <React.Fragment>
              <IconSymbol 
                ios_icon_name="arrow.clockwise" 
                android_material_icon_name="refresh" 
                size={24} 
                color="#fff" 
              />
              <Text style={styles.buttonText}>Update All Vesting Rewards</Text>
            </React.Fragment>
          )}
        </TouchableOpacity>

        {/* User List */}
        <Text style={styles.sectionTitle}>User Vesting Status</Text>
        {vestingStatuses.map((status, index) => (
          <View key={index} style={[commonStyles.card, styles.userCard]}>
            <View style={styles.userHeader}>
              <Text style={styles.userName}>{status.user_name || 'Unknown'}</Text>
              <Text style={styles.userEmail}>{status.email || 'No email'}</Text>
            </View>

            <View style={styles.userStats}>
              <View style={styles.statRow}>
                <Text style={styles.statLabel}>Purchased MXI</Text>
                <Text style={styles.statValue}>{status.purchased_mxi.toFixed(2)}</Text>
              </View>

              <View style={styles.statRow}>
                <Text style={styles.statLabel}>Total MXI</Text>
                <Text style={styles.statValue}>{status.total_mxi.toFixed(2)}</Text>
              </View>

              <View style={styles.statRow}>
                <Text style={styles.statLabel}>Current Rewards</Text>
                <Text style={[styles.statValue, { color: colors.success }]}>
                  {status.current_rewards.toFixed(6)}
                </Text>
              </View>

              <View style={styles.statRow}>
                <Text style={styles.statLabel}>Calculated Rewards</Text>
                <Text style={[styles.statValue, { color: colors.info }]}>
                  {status.calculated_current_rewards.toFixed(6)}
                </Text>
              </View>

              <View style={styles.statRow}>
                <Text style={styles.statLabel}>Monthly Potential</Text>
                <Text style={styles.statValue}>{status.monthly_earnings_potential.toFixed(4)}</Text>
              </View>

              <View style={styles.statRow}>
                <Text style={styles.statLabel}>Last Update</Text>
                <Text style={styles.statValue}>
                  {Math.floor(status.seconds_since_update / 60)} min ago
                </Text>
              </View>

              <View style={styles.statRow}>
                <Text style={styles.statLabel}>Monthly Rate</Text>
                <Text style={styles.statValue}>{(status.monthly_rate * 100).toFixed(1)}%</Text>
              </View>
            </View>

            {status.seconds_since_update > 3600 && (
              <View style={styles.warningBanner}>
                <IconSymbol 
                  ios_icon_name="exclamationmark.triangle.fill" 
                  android_material_icon_name="warning" 
                  size={16} 
                  color={colors.accent} 
                />
                <Text style={styles.warningText}>
                  Outdated calculation (over 1 hour)
                </Text>
              </View>
            )}
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 100,
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
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.text,
    marginTop: 16,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    marginTop: 8,
    textAlign: 'center',
  },
  summaryCard: {
    marginBottom: 20,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  summaryLabel: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  updateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 24,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 16,
  },
  userCard: {
    marginBottom: 16,
  },
  userHeader: {
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  userStats: {
    gap: 8,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  statValue: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  warningBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 12,
    padding: 8,
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: colors.accent,
  },
  warningText: {
    fontSize: 12,
    color: colors.accent,
    fontWeight: '600',
  },
});
