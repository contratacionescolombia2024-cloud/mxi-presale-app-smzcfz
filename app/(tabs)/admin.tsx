
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '@/contexts/AuthContext';
import { Redirect } from 'expo-router';
import { colors, commonStyles } from '@/styles/commonStyles';
import { IconSymbol } from '@/components/IconSymbol';
import { AdminMetrics } from '@/types';

export default function AdminScreen() {
  const { isAdmin } = useAuth();
  const [activeTab, setActiveTab] = useState<'metrics' | 'users' | 'kyc' | 'messages' | 'settings'>('metrics');

  const [metrics] = useState<AdminMetrics>({
    totalUsers: 1247,
    totalMXISold: 5678900,
    totalRevenue: 2839450,
    currentStage: 1,
    pendingKYC: 23,
    pendingMessages: 8,
    stageBreakdown: {
      stage1: 2500000,
      stage2: 1800000,
      stage3: 1378900,
    },
  });

  if (!isAdmin) {
    return <Redirect href="/(tabs)/(home)/" />;
  }

  const tabs = [
    { id: 'metrics', label: 'Metrics', iosIcon: 'chart.bar.fill', androidIcon: 'bar_chart' },
    { id: 'users', label: 'Users', iosIcon: 'person.3.fill', androidIcon: 'people' },
    { id: 'kyc', label: 'KYC', iosIcon: 'checkmark.shield.fill', androidIcon: 'verified_user' },
    { id: 'messages', label: 'Messages', iosIcon: 'message.fill', androidIcon: 'message' },
    { id: 'settings', label: 'Settings', iosIcon: 'gearshape.fill', androidIcon: 'settings' },
  ];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <IconSymbol 
          ios_icon_name="shield.lefthalf.filled" 
          android_material_icon_name="admin_panel_settings" 
          size={40} 
          color={colors.error} 
        />
        <Text style={styles.title}>Admin Panel</Text>
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
              android_material_icon_name={tab.androidIcon} 
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
        {activeTab === 'metrics' && (
          <>
            <View style={styles.metricsGrid}>
              <View style={[commonStyles.card, styles.metricCard]}>
                <IconSymbol 
                  ios_icon_name="person.3.fill" 
                  android_material_icon_name="people" 
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
                  ios_icon_name="clock.badge.checkmark.fill" 
                  android_material_icon_name="pending_actions" 
                  size={32} 
                  color={colors.warning} 
                />
                <Text style={styles.metricValue}>{metrics.pendingKYC}</Text>
                <Text style={styles.metricLabel}>Pending KYC</Text>
              </View>
            </View>

            <View style={commonStyles.card}>
              <Text style={styles.cardTitle}>Stage Breakdown</Text>
              <View style={styles.stageItem}>
                <Text style={styles.stageLabel}>Stage 1 ($0.40)</Text>
                <Text style={styles.stageValue}>{metrics.stageBreakdown.stage1.toLocaleString()} MXI</Text>
              </View>
              <View style={styles.stageItem}>
                <Text style={styles.stageLabel}>Stage 2 ($0.70)</Text>
                <Text style={styles.stageValue}>{metrics.stageBreakdown.stage2.toLocaleString()} MXI</Text>
              </View>
              <View style={styles.stageItem}>
                <Text style={styles.stageLabel}>Stage 3 ($1.00)</Text>
                <Text style={styles.stageValue}>{metrics.stageBreakdown.stage3.toLocaleString()} MXI</Text>
              </View>
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
          <View style={commonStyles.card}>
            <Text style={styles.cardTitle}>User Management</Text>
            <Text style={styles.cardText}>
              Manage user accounts, balances, and referrals
            </Text>
            <TouchableOpacity style={styles.actionButton}>
              <IconSymbol 
                ios_icon_name="magnifyingglass" 
                android_material_icon_name="search" 
                size={20} 
                color={colors.primary} 
              />
              <Text style={styles.actionButtonText}>Search Users</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton}>
              <IconSymbol 
                ios_icon_name="person.badge.plus.fill" 
                android_material_icon_name="person_add" 
                size={20} 
                color={colors.secondary} 
              />
              <Text style={styles.actionButtonText}>Add User</Text>
            </TouchableOpacity>
          </View>
        )}

        {activeTab === 'kyc' && (
          <View style={commonStyles.card}>
            <Text style={styles.cardTitle}>KYC Verification</Text>
            <View style={styles.kycStats}>
              <View style={styles.kycStat}>
                <Text style={styles.kycStatValue}>{metrics.pendingKYC}</Text>
                <Text style={styles.kycStatLabel}>Pending</Text>
              </View>
              <View style={styles.kycStat}>
                <Text style={[styles.kycStatValue, { color: colors.success }]}>156</Text>
                <Text style={styles.kycStatLabel}>Approved</Text>
              </View>
              <View style={styles.kycStat}>
                <Text style={[styles.kycStatValue, { color: colors.error }]}>12</Text>
                <Text style={styles.kycStatLabel}>Rejected</Text>
              </View>
            </View>
            <TouchableOpacity style={styles.actionButton}>
              <IconSymbol 
                ios_icon_name="doc.text.magnifyingglass" 
                android_material_icon_name="find_in_page" 
                size={20} 
                color={colors.primary} 
              />
              <Text style={styles.actionButtonText}>Review Pending KYC</Text>
            </TouchableOpacity>
          </View>
        )}

        {activeTab === 'messages' && (
          <View style={commonStyles.card}>
            <Text style={styles.cardTitle}>User Messages</Text>
            <View style={styles.messageStats}>
              <View style={styles.messageStat}>
                <IconSymbol 
                  ios_icon_name="envelope.badge.fill" 
                  android_material_icon_name="mark_email_unread" 
                  size={32} 
                  color={colors.warning} 
                />
                <Text style={styles.messageStatValue}>{metrics.pendingMessages}</Text>
                <Text style={styles.messageStatLabel}>Pending</Text>
              </View>
              <View style={styles.messageStat}>
                <IconSymbol 
                  ios_icon_name="checkmark.circle.fill" 
                  android_material_icon_name="check_circle" 
                  size={32} 
                  color={colors.success} 
                />
                <Text style={styles.messageStatValue}>142</Text>
                <Text style={styles.messageStatLabel}>Answered</Text>
              </View>
            </View>
            <TouchableOpacity style={styles.actionButton}>
              <IconSymbol 
                ios_icon_name="message.fill" 
                android_material_icon_name="message" 
                size={20} 
                color={colors.primary} 
              />
              <Text style={styles.actionButtonText}>View All Messages</Text>
            </TouchableOpacity>
          </View>
        )}

        {activeTab === 'settings' && (
          <>
            <View style={commonStyles.card}>
              <Text style={styles.cardTitle}>Pre-Sale Settings</Text>
              
              <Text style={styles.inputLabel}>Current Stage</Text>
              <TextInput
                style={styles.input}
                value={metrics.currentStage.toString()}
                keyboardType="number-pad"
                placeholder="Stage number"
                placeholderTextColor={colors.textSecondary}
              />

              <Text style={styles.inputLabel}>Vesting Rate (%)</Text>
              <TextInput
                style={styles.input}
                value="3"
                keyboardType="decimal-pad"
                placeholder="Monthly percentage"
                placeholderTextColor={colors.textSecondary}
              />

              <TouchableOpacity 
                style={styles.saveButton}
                onPress={() => Alert.alert('Success', 'Settings updated')}
              >
                <Text style={styles.saveButtonText}>Save Changes</Text>
              </TouchableOpacity>
            </View>

            <View style={commonStyles.card}>
              <Text style={styles.cardTitle}>Danger Zone</Text>
              <TouchableOpacity 
                style={styles.dangerButton}
                onPress={() => Alert.alert('Warning', 'This action requires confirmation')}
              >
                <IconSymbol 
                  ios_icon_name="exclamationmark.triangle.fill" 
                  android_material_icon_name="warning" 
                  size={20} 
                  color={colors.error} 
                />
                <Text style={styles.dangerButtonText}>Reset All Data</Text>
              </TouchableOpacity>
            </View>
          </>
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
    paddingBottom: 12,
  },
  title: {
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
  cardText: {
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
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 16,
    backgroundColor: colors.background,
    borderRadius: 8,
    marginBottom: 8,
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
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
  dangerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 16,
    backgroundColor: colors.background,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: colors.error,
  },
  dangerButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.error,
  },
});
