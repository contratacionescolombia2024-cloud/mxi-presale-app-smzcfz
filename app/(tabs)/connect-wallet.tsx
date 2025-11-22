
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Platform,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { IconSymbol } from '@/components/IconSymbol';
import { colors, commonStyles } from '@/styles/commonStyles';
import { useLanguage } from '@/contexts/LanguageContext';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    padding: 20,
    paddingTop: Platform.OS === 'android' ? 48 : 20,
    paddingBottom: 100,
  },
  header: {
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    lineHeight: 24,
  },
  infoCard: {
    ...commonStyles.card,
    padding: 20,
    marginBottom: 24,
    backgroundColor: colors.card,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 12,
  },
  infoText: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 22,
    marginBottom: 8,
  },
  warningCard: {
    ...commonStyles.card,
    padding: 20,
    marginBottom: 24,
    borderWidth: 2,
    borderColor: colors.warning,
  },
  warningTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.warning,
    marginBottom: 12,
  },
  warningText: {
    fontSize: 14,
    color: colors.text,
    lineHeight: 22,
  },
  iconContainer: {
    alignItems: 'center',
    marginVertical: 32,
  },
});

export default function ConnectWalletScreen() {
  const router = useRouter();
  const { t } = useLanguage();

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>{t('connectWallet')}</Text>
          <Text style={styles.subtitle}>
            Wallet integration feature
          </Text>
        </View>

        <View style={styles.warningCard}>
          <Text style={styles.warningTitle}>⚠️ Feature Unavailable</Text>
          <Text style={styles.warningText}>
            The wallet integration feature has been temporarily removed after a system reversion. 
            This feature will be re-implemented in a future update.
          </Text>
        </View>

        <View style={styles.iconContainer}>
          <IconSymbol
            ios_icon_name="wallet.pass"
            android_material_icon_name="account_balance_wallet"
            size={80}
            color={colors.textSecondary}
          />
        </View>

        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>ℹ️ Alternative Payment Methods</Text>
          <Text style={styles.infoText}>
            • Contact our support team for manual payment processing
          </Text>
          <Text style={styles.infoText}>
            • Use the purchase screen to submit a purchase request
          </Text>
          <Text style={styles.infoText}>
            • Our team will provide payment instructions via email
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
