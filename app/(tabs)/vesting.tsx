
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { usePreSale } from '@/contexts/PreSaleContext';
import { colors, commonStyles } from '@/styles/commonStyles';
import { IconSymbol } from '@/components/IconSymbol';

export default function VestingScreen() {
  const { vestingData, isLoading } = usePreSale();

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Loading vesting data...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!vestingData) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.emptyContainer}>
          <IconSymbol 
            ios_icon_name="chart.line.uptrend.xyaxis" 
            android_material_icon_name="trending_up" 
            size={80} 
            color={colors.textSecondary} 
          />
          <Text style={styles.emptyTitle}>No Vesting Data</Text>
          <Text style={styles.emptyText}>
            Purchase MXI tokens to start earning vesting rewards
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  const projectionPeriods = [
    { label: '7 Days', value: vestingData.projections?.days7 || 0, days: 7 },
    { label: '15 Days', value: vestingData.projections?.days15 || 0, days: 15 },
    { label: '30 Days', value: vestingData.projections?.days30 || 0, days: 30 },
  ];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <IconSymbol 
            ios_icon_name="chart.line.uptrend.xyaxis" 
            android_material_icon_name="trending_up" 
            size={60} 
            color={colors.secondary} 
          />
          <Text style={styles.title}>Vesting Rewards</Text>
          <Text style={styles.subtitle}>3% Monthly Returns</Text>
        </View>

        <View style={[commonStyles.card, styles.currentCard]}>
          <Text style={styles.cardLabel}>Current Vesting Rewards</Text>
          <Text style={styles.currentAmount}>
            {(vestingData.currentRewards || 0).toFixed(6)} MXI
          </Text>
          <Text style={styles.updateText}>
            Updated in real-time • Last: {new Date(vestingData.lastUpdate).toLocaleTimeString()}
          </Text>
        </View>

        <View style={commonStyles.card}>
          <Text style={styles.cardTitle}>Your Investment</Text>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Total MXI Purchased</Text>
            <Text style={styles.infoValue}>
              {(vestingData.totalMXI || 0).toFixed(2)} MXI
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Monthly Rate</Text>
            <Text style={styles.infoValue}>
              {((vestingData.monthlyRate || 0.03) * 100).toFixed(1)}%
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Monthly Earnings</Text>
            <Text style={styles.infoValue}>
              {((vestingData.totalMXI || 0) * (vestingData.monthlyRate || 0.03)).toFixed(4)} MXI
            </Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Projected Earnings</Text>
        {projectionPeriods.map((period, index) => (
          <View key={index} style={[commonStyles.card, styles.projectionCard]}>
            <View style={styles.projectionHeader}>
              <IconSymbol 
                ios_icon_name="calendar" 
                android_material_icon_name="event" 
                size={24} 
                color={colors.primary} 
              />
              <Text style={styles.projectionLabel}>{period.label}</Text>
            </View>
            <Text style={styles.projectionValue}>+{period.value.toFixed(4)} MXI</Text>
            <Text style={styles.projectionSubtext}>
              Total: {((vestingData.totalMXI || 0) + period.value).toFixed(4)} MXI
            </Text>
          </View>
        ))}

        <View style={styles.infoCard}>
          <IconSymbol 
            ios_icon_name="lightbulb.fill" 
            android_material_icon_name="lightbulb" 
            size={24} 
            color={colors.highlight} 
          />
          <View style={styles.infoContent}>
            <Text style={styles.infoTitle}>How Vesting Works</Text>
            <Text style={styles.infoText}>
              - Earn 3% monthly on your total MXI holdings{'\n'}
              - Rewards calculated per second{'\n'}
              - Updates in real-time{'\n'}
              - Automatically added to your balance{'\n'}
              - Compound interest on total holdings
            </Text>
          </View>
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
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    marginTop: 24,
    marginBottom: 12,
  },
  emptyText: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
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
  },
  currentCard: {
    alignItems: 'center',
    backgroundColor: colors.secondary,
    marginBottom: 20,
  },
  cardLabel: {
    fontSize: 14,
    color: colors.card,
    opacity: 0.9,
    marginBottom: 12,
  },
  currentAmount: {
    fontSize: 36,
    fontWeight: '700',
    color: colors.card,
    marginBottom: 8,
  },
  updateText: {
    fontSize: 12,
    color: colors.card,
    opacity: 0.8,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  infoLabel: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.text,
    marginTop: 8,
    marginBottom: 16,
  },
  projectionCard: {
    marginBottom: 12,
  },
  projectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  projectionLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  projectionValue: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.secondary,
    marginBottom: 4,
  },
  projectionSubtext: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  infoCard: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: colors.card,
    borderRadius: 12,
    gap: 12,
    marginTop: 8,
    borderLeftWidth: 4,
    borderLeftColor: colors.highlight,
  },
  infoContent: {
    flex: 1,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
});
