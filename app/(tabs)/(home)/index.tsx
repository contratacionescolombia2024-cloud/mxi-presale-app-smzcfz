
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { usePreSale } from '@/contexts/PreSaleContext';
import { colors, commonStyles } from '@/styles/commonStyles';
import { IconSymbol } from '@/components/IconSymbol';

export default function HomeScreen() {
  const router = useRouter();
  const { user, isAdmin } = useAuth();
  const { currentStage, vestingData, referralStats, refreshData } = usePreSale();
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = () => {
    setRefreshing(true);
    refreshData();
    setTimeout(() => setRefreshing(false), 1000);
  };

  const totalMXI = vestingData.totalMXI + referralStats.totalMXIEarned;

  const menuItems = [
    { 
      title: 'Buy MXI', 
      icon: 'shopping_cart', 
      route: '/(tabs)/purchase',
      color: colors.primary,
    },
    { 
      title: 'Vesting', 
      icon: 'trending_up', 
      route: '/(tabs)/vesting',
      color: colors.secondary,
    },
    { 
      title: 'Referrals', 
      icon: 'people', 
      route: '/(tabs)/referrals',
      color: colors.accent,
    },
    { 
      title: 'KYC Verification', 
      icon: 'verified_user', 
      route: '/(tabs)/kyc',
      color: colors.highlight,
    },
    { 
      title: 'Messages', 
      icon: 'message', 
      route: '/(tabs)/messages',
      color: colors.primary,
    },
    { 
      title: 'Profile', 
      icon: 'person', 
      route: '/(tabs)/profile',
      color: colors.secondary,
    },
  ];

  if (isAdmin) {
    menuItems.push({
      title: 'Admin Panel',
      icon: 'admin_panel_settings',
      route: '/(tabs)/admin',
      color: colors.error,
    });
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Welcome back,</Text>
            <Text style={styles.userName}>{user?.name}</Text>
          </View>
          <IconSymbol 
            ios_icon_name="bitcoinsign.circle.fill" 
            android_material_icon_name="currency_bitcoin" 
            size={50} 
            color={colors.primary} 
          />
        </View>

        <View style={styles.balanceCard}>
          <Text style={styles.balanceLabel}>Total MXI Balance</Text>
          <Text style={styles.balanceAmount}>{totalMXI.toFixed(4)}</Text>
          
          <View style={styles.balanceBreakdown}>
            <View style={styles.balanceItem}>
              <IconSymbol 
                ios_icon_name="cart.fill" 
                android_material_icon_name="shopping_bag" 
                size={20} 
                color={colors.primary} 
              />
              <View style={styles.balanceItemText}>
                <Text style={styles.balanceItemLabel}>Purchased</Text>
                <Text style={styles.balanceItemValue}>{vestingData.totalMXI.toFixed(2)}</Text>
              </View>
            </View>

            <View style={styles.balanceItem}>
              <IconSymbol 
                ios_icon_name="chart.line.uptrend.xyaxis" 
                android_material_icon_name="trending_up" 
                size={20} 
                color={colors.secondary} 
              />
              <View style={styles.balanceItemText}>
                <Text style={styles.balanceItemLabel}>Vesting Rewards</Text>
                <Text style={styles.balanceItemValue}>{vestingData.currentRewards.toFixed(4)}</Text>
              </View>
            </View>

            <View style={styles.balanceItem}>
              <IconSymbol 
                ios_icon_name="person.2.fill" 
                android_material_icon_name="group" 
                size={20} 
                color={colors.accent} 
              />
              <View style={styles.balanceItemText}>
                <Text style={styles.balanceItemLabel}>Referral Earnings</Text>
                <Text style={styles.balanceItemValue}>{referralStats.totalMXIEarned.toFixed(2)}</Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.stageCard}>
          <View style={styles.stageHeader}>
            <Text style={styles.stageTitle}>Current Pre-Sale Stage</Text>
            <View style={styles.stageBadge}>
              <Text style={styles.stageBadgeText}>Stage {currentStage.stage}</Text>
            </View>
          </View>
          
          <View style={styles.stageInfo}>
            <View style={styles.stageInfoItem}>
              <Text style={styles.stageInfoLabel}>Price per MXI</Text>
              <Text style={styles.stageInfoValue}>${currentStage.price} USD</Text>
            </View>
            <View style={styles.stageInfoItem}>
              <Text style={styles.stageInfoLabel}>Sold</Text>
              <Text style={styles.stageInfoValue}>
                {((currentStage.soldMXI / currentStage.totalMXI) * 100).toFixed(1)}%
              </Text>
            </View>
          </View>

          <View style={styles.progressBar}>
            <View 
              style={[
                styles.progressFill, 
                { width: `${(currentStage.soldMXI / currentStage.totalMXI) * 100}%` }
              ]} 
            />
          </View>

          <Text style={styles.stageEndDate}>
            Ends: {new Date(currentStage.endDate).toLocaleDateString()}
          </Text>
        </View>

        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.menuGrid}>
          {menuItems.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={[styles.menuItem, { borderLeftColor: item.color }]}
              onPress={() => router.push(item.route as any)}
            >
              <IconSymbol 
                ios_icon_name={item.icon as any} 
                android_material_icon_name={item.icon} 
                size={32} 
                color={item.color} 
              />
              <Text style={styles.menuItemText}>{item.title}</Text>
            </TouchableOpacity>
          ))}
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
  scrollContent: {
    padding: 20,
    paddingBottom: 100,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  greeting: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  userName: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    marginTop: 4,
  },
  balanceCard: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.1)',
    elevation: 4,
  },
  balanceLabel: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 8,
  },
  balanceAmount: {
    fontSize: 36,
    fontWeight: '700',
    color: colors.primary,
    marginBottom: 20,
  },
  balanceBreakdown: {
    gap: 12,
  },
  balanceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  balanceItemText: {
    flex: 1,
  },
  balanceItemLabel: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  balanceItemValue: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  stageCard: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.1)',
    elevation: 4,
  },
  stageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  stageTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
  },
  stageBadge: {
    backgroundColor: colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  stageBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.card,
  },
  stageInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  stageInfoItem: {
    flex: 1,
  },
  stageInfoLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  stageInfoValue: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
  },
  progressBar: {
    height: 8,
    backgroundColor: colors.border,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 12,
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.secondary,
  },
  stageEndDate: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 16,
  },
  menuGrid: {
    gap: 12,
  },
  menuItem: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    borderLeftWidth: 4,
    boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.08)',
    elevation: 2,
  },
  menuItemText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
});
